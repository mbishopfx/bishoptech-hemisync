import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { WaveFile } from 'wavefile';
import ffmpegPath from 'ffmpeg-static';
import { clamp } from './utils';

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
  if (!ffmpegPath) throw new Error('ffmpeg binary not available');
  const args = ['-hide_banner', '-loglevel', 'error', '-i', filePath, '-f', 'wav', 'pipe:1'];
  const chunks = [];
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args);
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
  wav.toBitDepth('16');
  const sampleRate = wav.fmt.sampleRate;
  const samples = wav.getSamples(true, Int16Array);
  const channels = wav.fmt.numChannels;
  const frames = samples.length / channels;
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);

  for (let i = 0; i < frames; i++) {
    const idx = i * channels;
    const l = samples[idx] / 32768;
    const r = channels > 1 ? samples[idx + 1] / 32768 : l;
    left[i] = clamp(l, -1, 1);
    right[i] = clamp(r, -1, 1);
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

export function trimToFrames(buffer, frames) {
  return buffer.length <= frames ? buffer : buffer.subarray(0, frames);
}


