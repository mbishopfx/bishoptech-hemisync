import { WaveFile } from 'wavefile';
import { clamp } from './utils';
import { createRequire } from 'module';
import { spawn } from 'child_process';
import { getFfmpegPath } from './ffmpeg';

const require = createRequire(import.meta.url);
let lameModule = null;

function getLame() {
  if (!lameModule) {
    lameModule = require('lamejs');
  }
  return lameModule;
}

export function encodeWavStereo({ left, right, sampleRate, bitDepthCode = '24', dither = true }) {
  const frames = left.length;
  const wav = new WaveFile();

  if (bitDepthCode === '32f') {
    wav.fromScratch(2, sampleRate, '32f', [
      Float32Array.from(left, (sample) => clamp(sample || 0)),
      Float32Array.from(right, (sample) => clamp(sample || 0))
    ]);
    return Buffer.from(wav.toBuffer());
  }

  if (bitDepthCode === '24') {
    const maxInt = 0x7fffff;
    const minInt = -0x800000;
    const ditherScale = dither ? 1 / maxInt : 0;
    const left24 = new Int32Array(frames);
    const right24 = new Int32Array(frames);
    for (let i = 0; i < frames; i += 1) {
      const l = clamp((left[i] || 0) + ((Math.random() + Math.random() - 1) * ditherScale));
      const r = clamp((right[i] || 0) + ((Math.random() + Math.random() - 1) * ditherScale));
      left24[i] = Math.max(minInt, Math.min(maxInt, Math.round(l * maxInt)));
      right24[i] = Math.max(minInt, Math.min(maxInt, Math.round(r * maxInt)));
    }
    wav.fromScratch(2, sampleRate, '24', [left24, right24]);
    return Buffer.from(wav.toBuffer());
  }

  const left16 = new Int16Array(frames);
  const right16 = new Int16Array(frames);
  const ditherScale = dither ? 1 / 0x7fff : 0;
  for (let i = 0; i < frames; i += 1) {
    const l = clamp((left[i] || 0) + ((Math.random() + Math.random() - 1) * ditherScale));
    const r = clamp((right[i] || 0) + ((Math.random() + Math.random() - 1) * ditherScale));
    left16[i] = Math.round(l * 0x7fff);
    right16[i] = Math.round(r * 0x7fff);
  }
  wav.fromScratch(2, sampleRate, '16', [left16, right16]);
  return Buffer.from(wav.toBuffer());
}

async function encodeWebmWithFfmpeg({ wavBuffer, kbps = 64 }) {
  const binaryPath = getFfmpegPath();
  if (!binaryPath) {
    throw new Error('ffmpeg binary not available');
  }

  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];
    const child = spawn(binaryPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'wav',
      '-i',
      'pipe:0',
      '-c:a',
      'libopus',
      '-b:a',
      `${kbps}k`,
      '-f',
      'webm',
      'pipe:1'
    ]);

    child.stdout.on('data', (chunk) => stdout.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdout));
        return;
      }
      const details = Buffer.concat(stderr).toString('utf8').trim();
      reject(new Error(details || `ffmpeg webm encode failed with code ${code}`));
    });

    child.stdin.on('error', reject);
    child.stdin.end(wavBuffer);
  });
}

export async function encodeWebmStereo({ left, right, sampleRate, kbps = 64 }) {
  const wavBuffer = encodeWavStereo({ left, right, sampleRate, bitDepthCode: '32f', dither: false });
  return await encodeWebmWithFfmpeg({ wavBuffer, kbps });
}
