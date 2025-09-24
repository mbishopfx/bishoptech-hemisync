import { WaveFile } from 'wavefile';
import { clamp } from './utils';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let lameModule = null;

function getLame() {
  if (!lameModule) {
    lameModule = require('lamejs');
  }
  return lameModule;
}

export function encodeWavStereo({ left, right, sampleRate }) {
  const frames = left.length;
  const interleaved = new Int16Array(frames * 2);
  for (let i = 0, j = 0; i < frames; i++) {
    const l = clamp(left[i] || 0);
    const r = clamp(right[i] || 0);
    interleaved[j++] = (l * 0x7fff) | 0;
    interleaved[j++] = (r * 0x7fff) | 0;
  }
  const wav = new WaveFile();
  wav.fromScratch(2, sampleRate, '16', interleaved);
  return Buffer.from(wav.toBuffer());
}

export function encodeMp3Stereo({ left, right, sampleRate, kbps = 160 }) {
  const Lame = getLame();
  const encoder = new Lame.Mp3Encoder(2, sampleRate, kbps);
  const blockSize = 1152;
  const mp3Data = [];
  const leftI16 = new Int16Array(left.length);
  const rightI16 = new Int16Array(right.length);

  for (let i = 0; i < left.length; i++) {
    leftI16[i] = (clamp(left[i]) * 0x7fff) | 0;
    rightI16[i] = (clamp(right[i]) * 0x7fff) | 0;
  }

  for (let i = 0; i < leftI16.length; i += blockSize) {
    const leftChunk = leftI16.subarray(i, i + blockSize);
    const rightChunk = rightI16.subarray(i, i + blockSize);
    const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
    if (mp3buf.length > 0) mp3Data.push(Buffer.from(mp3buf));
  }

  const finalBuf = encoder.flush();
  if (finalBuf.length > 0) mp3Data.push(Buffer.from(finalBuf));
  return Buffer.concat(mp3Data);
}


