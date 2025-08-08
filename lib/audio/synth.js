import { WaveFile } from 'wavefile';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

function dbToGain(db) {
  return Math.pow(10, db / 20);
}

function applyLimiter(sample, threshold = 0.7071) {
  // Simple soft clipper around -3 dBFS
  if (sample > threshold) return threshold + (sample - threshold) * 0.1;
  if (sample < -threshold) return -threshold + (sample + threshold) * 0.1;
  return sample;
}

export function synthesizeBinaural({
  lengthSec,
  sampleRate = 44100,
  baseFreqHz = 220,
  deltaHzFrom = 10,
  deltaHzTo = 6,
  noise = { type: 'pink', mixDb: -24 },
  breath = null,
  modes = { binaural: true, monaural: false, isochronic: false },
  background = null
}) {
  const totalSamples = Math.floor(lengthSec * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  // noise seed
  let white = 0;
  let pink_b0 = 0, pink_b1 = 0, pink_b2 = 0, pink_b3 = 0, pink_b4 = 0, pink_b5 = 0, pink_b6 = 0;
  const noiseGain = noise ? dbToGain(noise.mixDb || -24) : 0;

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const deltaHz = deltaHzFrom + (deltaHzTo - deltaHzFrom) * (t / lengthSec);
    const leftHz = baseFreqHz;
    const rightHz = baseFreqHz + deltaHz;

    const l = Math.sin(2 * Math.PI * leftHz * t);
    const r = Math.sin(2 * Math.PI * rightHz * t);

    let lSample = modes.binaural ? l : 0;
    let rSample = modes.binaural ? r : 0;

    // optional monaural (sum and beat after slight phase difference via frequency offset)
    if (modes.monaural) {
      const mono = Math.sin(2 * Math.PI * baseFreqHz * t) + Math.sin(2 * Math.PI * (baseFreqHz + deltaHz) * t);
      lSample += 0.5 * mono;
      rSample += 0.5 * mono;
    }

    // isochronic: amplitude gate at beat frequency
    if (modes.isochronic) {
      const gate = 0.5 * (1 + Math.sin(2 * Math.PI * deltaHz * t));
      lSample *= gate;
      rSample *= gate;
    }

    // noise bed
    if (noise) {
      const whiteNoise = Math.random() * 2 - 1;
      // Voss-McCartney pink noise
      white = whiteNoise;
      pink_b0 = 0.99886 * pink_b0 + white * 0.0555179;
      pink_b1 = 0.99332 * pink_b1 + white * 0.0750759;
      pink_b2 = 0.96900 * pink_b2 + white * 0.1538520;
      pink_b3 = 0.86650 * pink_b3 + white * 0.3104856;
      pink_b4 = 0.55000 * pink_b4 + white * 0.5329522;
      pink_b5 = -0.7616 * pink_b5 - white * 0.0168980;
      let pink = pink_b0 + pink_b1 + pink_b2 + pink_b3 + pink_b4 + pink_b5 + pink_b6 + white * 0.5362;
      pink *= 0.11;
      pink_b6 = white * 0.115926;
      lSample += noiseGain * pink;
      rSample += noiseGain * pink;
    }

    // breath AM coupling
    if (breath) {
      const depth = breath.depth || 0.1;
      const env = breath.envelope[i] || 0.5;
      const am = 1 - depth + depth * env; // 0.9..1.0 typical
      lSample *= am;
      rSample *= am;
    }

    // background layer (e.g., ocean)
    if (background && background.left && background.right) {
      lSample += background.left[i] || 0;
      rSample += background.right[i] || 0;
    }

    // soft limiter and write
    left[i] = applyLimiter(lSample);
    right[i] = applyLimiter(rSample);
  }

  return { left, right, sampleRate };
}

export function encodeWavStereo({ left, right, sampleRate }) {
  const interleaved = new Int16Array(left.length * 2);
  for (let i = 0, j = 0; i < left.length; i += 1) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    interleaved[j++] = (l * 0x7fff) | 0;
    interleaved[j++] = (r * 0x7fff) | 0;
  }
  const wav = new WaveFile();
  wav.fromScratch(2, sampleRate, '16', interleaved);
  return Buffer.from(wav.toBuffer());
}

export function encodeMp3Stereo({ left, right, sampleRate, kbps = 128 }) {
  const Lame = require('lamejs');
  const encoder = new Lame.Mp3Encoder(2, sampleRate, kbps);
  const blockSize = 1152;
  const mp3Data = [];
  const leftI16 = new Int16Array(left.length);
  const rightI16 = new Int16Array(right.length);
  for (let i = 0; i < left.length; i++) {
    leftI16[i] = (Math.max(-1, Math.min(1, left[i])) * 0x7fff) | 0;
    rightI16[i] = (Math.max(-1, Math.min(1, right[i])) * 0x7fff) | 0;
  }
  for (let i = 0; i < leftI16.length; i += blockSize) {
    const leftChunk = leftI16.subarray(i, i + blockSize);
    const rightChunk = rightI16.subarray(i, i + blockSize);
    const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) mp3Data.push(Buffer.from(mp3buf));
  }
  const end = encoder.flush();
  if (end.length > 0) mp3Data.push(Buffer.from(end));
  return Buffer.concat(mp3Data);
}

