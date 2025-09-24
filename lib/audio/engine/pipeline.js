import { renderBinauralBed, mixStereo, applyDucking } from './binaural';
import { decodeAudioFile, decodeAudioDataUrl, resampleLinear, trimToFrames, wavToFloat32Stereo } from './import';
import { encodeWavStereo, encodeMp3Stereo } from './encode';
import { dbToGain, clamp } from './utils';

const DEFAULT_SAMPLE_RATE = 44100;

export async function buildSessionBed({
  lengthSec,
  sampleRate = DEFAULT_SAMPLE_RATE,
  focusPreset,
  baseFreqHz,
  deltaOverrides,
  noise,
  breath,
  background,
  modes,
  onProgress
}) {
  const presetCarriers = focusPreset?.carriers || {};
  const presetNoise = noise ?? focusPreset?.noise;
  const presetModes = { ...focusPreset?.modes, ...modes };

  return renderBinauralBed({
    lengthSec,
    sampleRate,
    baseFreqHz: baseFreqHz ?? presetCarriers.leftHz ?? 220,
    carrierLeftHz: presetCarriers.leftHz,
    carrierRightHz: presetCarriers.rightHzOffsetHz ? (presetCarriers.leftHz || 220) + (presetCarriers.rightHzOffsetHz || 0) : undefined,
    deltaHzFrom: deltaOverrides?.from ?? focusPreset?.deltaHzPath?.[0]?.hz ?? 10,
    deltaHzTo: deltaOverrides?.to ?? focusPreset?.deltaHzPath?.slice(-1)?.[0]?.hz ?? 6,
    deltaCurve: focusPreset?.deltaHzPath,
    noise: presetNoise,
    breath,
    modes: presetModes,
    background,
    onProgress
  });
}

export async function importStereoBed({ filePath, dataUrl, sampleRate = DEFAULT_SAMPLE_RATE, targetLengthSec }) {
  const decoded = filePath ? await decodeAudioFile(filePath) : await decodeAudioDataUrl(dataUrl);
  let left = decoded.left;
  let right = decoded.right;
  if (decoded.sampleRate !== sampleRate) {
    left = resampleLinear(left, decoded.sampleRate, sampleRate);
    right = resampleLinear(right, decoded.sampleRate, sampleRate);
  }
  if (targetLengthSec) {
    const frames = Math.floor(targetLengthSec * sampleRate);
    left = trimToFrames(left, frames);
    right = trimToFrames(right, frames);
  }
  return { left, right, sampleRate };
}

export function overlayDualFrequency({
  targetL,
  targetR,
  overlay,
  gainDb = -10,
  channelGains = { left: 0, right: 0 }
}) {
  const gain = dbToGain(gainDb);
  const leftGain = dbToGain(channelGains.left || 0);
  const rightGain = dbToGain(channelGains.right || 0);
  const frames = targetL.length;
  for (let i = 0; i < frames; i++) {
    const l = targetL[i] + gain * (leftGain * (overlay.left[i] || 0));
    const r = targetR[i] + gain * (rightGain * (overlay.right[i] || 0));
    targetL[i] = clamp(l);
    targetR[i] = clamp(r);
  }
}

export async function encodeOutputs({
  left,
  right,
  sampleRate,
  withMp3 = true,
  kbps = 160
}) {
  const wavBuffer = encodeWavStereo({ left, right, sampleRate });
  let mp3Buffer = null;
  if (withMp3) {
    try {
      mp3Buffer = await encodeMp3Stereo({ left, right, sampleRate, kbps });
    } catch (err) {
      console.warn('MP3 encode failed', err);
    }
  }

  return { wavBuffer, mp3Buffer };
}

export async function renderAndMixVoice({
  stages,
  sampleRate,
  totalLengthSec,
  ttsClient,
  voiceOptions,
  onStageStart
}) {
  const totalFrames = Math.floor(totalLengthSec * sampleRate);
  const voiceL = new Float32Array(totalFrames);
  const voiceR = new Float32Array(totalFrames);

  for (const stage of stages) {
    const script = (stage.script || '').toString().slice(0, 4000);
    if (!script) continue;
    if (onStageStart) onStageStart(stage);
    const resp = await ttsClient.audio.speech.create({
      model: voiceOptions?.model || 'gpt-4o-mini-tts',
      voice: voiceOptions?.voice || 'alloy',
      input: script,
      response_format: 'wav'
    });
    const buf = Buffer.from(await resp.arrayBuffer());
    const decoded = wavToFloat32Stereo(buf);
    let { left, right, sampleRate: sr } = decoded;
    if (sr !== sampleRate) {
      left = resampleLinear(left, sr, sampleRate);
      right = resampleLinear(right, sr, sampleRate);
    }
    const startFrame = Math.min(totalFrames - 1, Math.max(0, Math.floor((stage.atSec || 0) * sampleRate)));
    const gain = dbToGain(typeof voiceOptions?.mixDb === 'number' ? voiceOptions.mixDb : -16);
    for (let i = 0; i < left.length && startFrame + i < totalFrames; i++) {
      voiceL[startFrame + i] += gain * left[i];
      voiceR[startFrame + i] += gain * right[i];
    }
  }

  return { voiceL, voiceR };
}

export function mixProgram({
  bed,
  voice,
  ducking,
  backgroundLayers = [],
  baseBedGain = 0.9
}) {
  const frames = bed.left.length;
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    left[i] = bed.left[i] * baseBedGain;
    right[i] = bed.right[i] * baseBedGain;
  }

  for (const layer of backgroundLayers) {
    if (!layer) continue;
    mixStereo({ targetL: left, targetR: right, addL: layer.left, addR: layer.right, gain: 1 });
  }

  const { voiceL, voiceR } = voice;
  const voiceCopyL = Float32Array.from(voiceL);
  const voiceCopyR = Float32Array.from(voiceR);
  const duckMeta = applyDucking({
    bedL: left,
    bedR: right,
    voiceL,
    voiceR,
    sampleRate: bed.sampleRate,
    duckPercent: ducking?.bedPercentWhileTalking ?? 0.75,
    attackMs: ducking?.attackMs ?? 40,
    releaseMs: ducking?.releaseMs ?? 220
  });

  const bedPostDuckL = Float32Array.from(left);
  const bedPostDuckR = Float32Array.from(right);

  mixStereo({ targetL: left, targetR: right, addL: voiceL, addR: voiceR, gain: 1 });

  return {
    left,
    right,
    sampleRate: bed.sampleRate,
    duckEnvSeries: duckMeta.duckEnvSeries,
    bedPostDuck: { left: bedPostDuckL, right: bedPostDuckR },
    voiceTracks: { left: voiceCopyL, right: voiceCopyR }
  };
}


