import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'public', 'audio', 'homepage-state-tones');
const SAMPLE_RATE = 44100;
const AMPLITUDE = 0.18;
const FADE_SEC = 2;

const TONES = [
  { fileName: 'delta-rest.wav', baseFreqHz: 108, targetHz: 2.8, durationSec: 60 },
  { fileName: 'theta-drift.wav', baseFreqHz: 192, targetHz: 5.2, durationSec: 60 },
  { fileName: 'alpha-focus.wav', baseFreqHz: 220, targetHz: 10, durationSec: 60 },
  { fileName: 'beta-drive.wav', baseFreqHz: 286, targetHz: 17.2, durationSec: 60 },
  { fileName: 'gamma-clarity.wav', baseFreqHz: 392, targetHz: 39.5, durationSec: 60 }
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function writeWavStereo({ left, right, sampleRate }) {
  const frameCount = Math.min(left.length, right.length);
  const bytesPerSample = 2;
  const blockAlign = bytesPerSample * 2;
  const byteRate = sampleRate * blockAlign;
  const dataSize = frameCount * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(2, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < frameCount; i += 1) {
    const leftSample = Math.round(clamp(left[i], -1, 1) * 32767);
    const rightSample = Math.round(clamp(right[i], -1, 1) * 32767);
    buffer.writeInt16LE(leftSample, offset);
    buffer.writeInt16LE(rightSample, offset + 2);
    offset += 4;
  }

  return buffer;
}

function renderPureBinauralTone({ baseFreqHz, targetHz, durationSec, sampleRate }) {
  const totalSamples = Math.floor(durationSec * sampleRate);
  const fadeSamples = Math.floor(FADE_SEC * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i += 1) {
    const t = i / sampleRate;
    const progress = i / Math.max(totalSamples - 1, 1);
    const beatHz = targetHz * (0.92 + progress * 0.08);
    const envelopeIn = fadeSamples > 0 ? Math.min(1, i / fadeSamples) : 1;
    const envelopeOut = fadeSamples > 0 ? Math.min(1, (totalSamples - i) / fadeSamples) : 1;
    const envelope = Math.sin((Math.PI / 2) * Math.min(envelopeIn, envelopeOut));
    const leftWave = Math.sin(2 * Math.PI * baseFreqHz * t);
    const rightWave = Math.sin(2 * Math.PI * (baseFreqHz + beatHz) * t);

    left[i] = leftWave * AMPLITUDE * envelope;
    right[i] = rightWave * AMPLITUDE * envelope;
  }

  return { left, right };
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const tone of TONES) {
    const rendered = renderPureBinauralTone({
      baseFreqHz: tone.baseFreqHz,
      targetHz: tone.targetHz,
      durationSec: tone.durationSec,
      sampleRate: SAMPLE_RATE
    });
    const wavBuffer = writeWavStereo({
      left: rendered.left,
      right: rendered.right,
      sampleRate: SAMPLE_RATE
    });
    await writeFile(path.join(OUTPUT_DIR, tone.fileName), wavBuffer);
    process.stdout.write(`Generated ${tone.fileName}\n`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
