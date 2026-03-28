import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { WaveFile } from 'wavefile';
import { clamp } from './utils';
import { encodeWavStereo } from './encode';
import { getFfmpegPath } from './ffmpeg';

export async function decodeAudioFile(filePath) {
  if (!filePath) throw new Error('decodeAudioFile: filePath is required');
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.wav') {
    const buf = await fs.readFile(filePath);
    return wavToFloat32Stereo(buf);
  }
  if (ext === '.mp3' || ext === '.m4a' || ext === '.aac') {
    return decodeWithFfmpeg(filePath);
  }
  throw new Error(`Unsupported audio format: ${ext}`);
}

export async function decodeWithFfmpeg(filePath) {
  const binaryPath = getFfmpegPath();
  if (!binaryPath) throw new Error('ffmpeg binary not available');
  const args = ['-hide_banner', '-loglevel', 'error', '-i', filePath, '-c:a', 'pcm_f32le', '-f', 'wav', 'pipe:1'];
  const chunks = [];
  await new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args);
    child.stdout.on('data', (d) => chunks.push(Buffer.from(d)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
  const wavBuffer = Buffer.concat(chunks);
  return wavToFloat32Stereo(wavBuffer);
}

export function wavToFloat32Stereo(buf) {
  const wav = new WaveFile(buf);
  const sampleRate = wav.fmt.sampleRate;
  const channels = wav.fmt.numChannels;
  const samples = wav.getSamples(false);
  const sourceLeft = channels > 1 ? samples[0] : samples;
  const sourceRight = channels > 1 ? samples[1] : samples;
  const frames = sourceLeft.length;
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);

  for (let i = 0; i < frames; i += 1) {
    left[i] = clamp(sourceLeft[i], -1, 1);
    right[i] = clamp(sourceRight[i], -1, 1);
  }

  return { left, right, sampleRate };
}

export function decodeAudioDataUrl(dataUrl) {
  if (!dataUrl) throw new Error('decodeAudioDataUrl: dataUrl is required');
  const match = /^data:(.*?);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error('Invalid audio data URL');
  const base64 = match[2];
  const buf = Buffer.from(base64, 'base64');
  return wavToFloat32Stereo(buf);
}

export function resampleLinear(source, srcRate, dstRate) {
  if (srcRate === dstRate) return source;
  const ratio = dstRate / srcRate;
  const dstLen = Math.round(source.length * ratio);
  const out = new Float32Array(dstLen);
  for (let i = 0; i < dstLen; i++) {
    const srcPos = i / ratio;
    const i0 = Math.floor(srcPos);
    const i1 = Math.min(source.length - 1, i0 + 1);
    const t = srcPos - i0;
    out[i] = source[i0] * (1 - t) + source[i1] * t;
  }
  return out;
}

async function transcodeWavWithFfmpeg({ wavBuffer, args }) {
  const binaryPath = getFfmpegPath();
  if (!binaryPath) throw new Error('ffmpeg binary not available');
  const chunks = [];
  const stderr = [];
  await new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args);
    child.stdout.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(Buffer.concat(stderr).toString('utf8').trim() || `ffmpeg exited with code ${code}`));
    });
    child.stdin.on('error', reject);
    child.stdin.end(wavBuffer);
  });
  return Buffer.concat(chunks);
}

export async function resampleStereo({ left, right, srcRate, dstRate }) {
  if (srcRate === dstRate) {
    return { left, right, sampleRate: dstRate };
  }

  try {
    const wavBuffer = encodeWavStereo({
      left,
      right,
      sampleRate: srcRate,
      bitDepthCode: '32f',
      dither: false
    });
    const resampledBuffer = await transcodeWavWithFfmpeg({
      wavBuffer,
      args: [
        '-hide_banner',
        '-loglevel',
        'error',
        '-f',
        'wav',
        '-i',
        'pipe:0',
        '-af',
        `aresample=${dstRate}:resampler=soxr:precision=28`,
        '-c:a',
        'pcm_f32le',
        '-f',
        'wav',
        'pipe:1'
      ]
    });
    return wavToFloat32Stereo(resampledBuffer);
  } catch (err) {
    return {
      left: resampleLinear(left, srcRate, dstRate),
      right: resampleLinear(right, srcRate, dstRate),
      sampleRate: dstRate
    };
  }
}

export function trimToFrames(buffer, frames) {
  return buffer.length <= frames ? buffer : buffer.subarray(0, frames);
}
