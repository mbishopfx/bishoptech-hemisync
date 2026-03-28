import { renderBinauralBed, mixStereo } from './binaural';
import { decodeAudioFile, decodeAudioDataUrl, resampleStereo, trimToFrames } from './import';
import { encodeWavStereo, encodeMp3Stereo } from './encode';
import { dbToGain } from './utils';
import { applyMasteringChain } from './mastering';

const DEFAULT_SAMPLE_RATE = 48000;

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
    const resampled = await resampleStereo({
      left,
      right,
      srcRate: decoded.sampleRate,
      dstRate: sampleRate
    });
    left = resampled.left;
    right = resampled.right;
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
    targetL[i] += gain * (leftGain * (overlay.left[i] || 0));
    targetR[i] += gain * (rightGain * (overlay.right[i] || 0));
  }
}

export async function encodeOutputs({
  left,
  right,
  sampleRate,
  wavBitDepthCode = '24',
  withMp3 = true,
  kbps = 160,
  masteringProfile = null
}) {
  const mastered = masteringProfile
    ? applyMasteringChain({ left, right, sampleRate, profile: masteringProfile })
    : { left: Float32Array.from(left), right: Float32Array.from(right), metadata: null };
  const wavBuffer = encodeWavStereo({
    left: mastered.left,
    right: mastered.right,
    sampleRate,
    bitDepthCode: wavBitDepthCode
  });
  let mp3Buffer = null;
  if (withMp3) {
    try {
      mp3Buffer = await encodeMp3Stereo({
        left: mastered.left,
        right: mastered.right,
        sampleRate,
        kbps
      });
    } catch (err) {
      console.warn('MP3 encode failed', err);
    }
  }

  return { wavBuffer, mp3Buffer, mastering: mastered.metadata };
}

export function mixProgram({
  bed,
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

  const bedPostDuckL = Float32Array.from(left);
  const bedPostDuckR = Float32Array.from(right);

  return {
    left,
    right,
    sampleRate: bed.sampleRate,
    bedPostDuck: { left: bedPostDuckL, right: bedPostDuckR }
  };
}
