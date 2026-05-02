#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import ffmpegPath from 'ffmpeg-static';
import wavefile from 'wavefile';

const { WaveFile } = wavefile;

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[index + 1]?.startsWith('--') ? true : argv[index + 1];
    args[key] = value;
    if (value !== true) index += 1;
  }
  return args;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

function dbToGain(db) {
  return Math.pow(10, Number(db) / 20);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parsePlan(args) {
  if (args.plan) {
    const plan = JSON.parse(args.plan);
    if (!Array.isArray(plan) || plan.length === 0) {
      fail('--plan must be a non-empty JSON array');
    }
    return plan.map((point) => ({
      at: clamp(Number(point.at ?? 0), 0, 1),
      hz: clamp(Number(point.hz), 0.5, 40)
    })).sort((a, b) => a.at - b.at);
  }

  const beat = clamp(Number(args.beat || 7), 0.5, 40);
  return [{ at: 0, hz: beat }, { at: 1, hz: beat }];
}

function interpolateBeat(plan, norm) {
  let current = plan[0];
  let next = plan[plan.length - 1];

  for (let index = 0; index < plan.length; index += 1) {
    if (plan[index].at <= norm) {
      current = plan[index];
      next = plan[Math.min(plan.length - 1, index + 1)];
    }
  }

  const span = Math.max(1e-6, next.at - current.at);
  const local = clamp((norm - current.at) / span, 0, 1);
  return current.hz + (next.hz - current.hz) * local;
}

function decodeToWave(input, tempDir) {
  const wavPath = path.join(tempDir, 'decoded.wav');
  const result = spawnSync(ffmpegPath, [
    '-y',
    '-i',
    input,
    '-ac',
    '2',
    '-ar',
    '48000',
    '-sample_fmt',
    's16',
    wavPath
  ], { stdio: 'pipe' });

  if (result.status !== 0) {
    fail(`ffmpeg decode failed: ${result.stderr.toString()}`);
  }

  return wavPath;
}

function normalize(samples, headroomDb) {
  let peak = 0;
  for (const sample of samples) {
    peak = Math.max(peak, Math.abs(sample));
  }
  const target = dbToGain(-Math.abs(Number(headroomDb || 1)));
  const gain = peak > target ? target / peak : 1;
  return samples.map((sample) => clamp(sample * gain, -1, 1));
}

const args = parseArgs(process.argv.slice(2));
if (!args.input) fail('Missing --input');
if (!args.output) fail('Missing --output');

const carrier = clamp(Number(args.carrier || 236), 80, 1000);
const mixGain = dbToGain(Number(args['mix-db'] || -18));
const headroomDb = Number(args['headroom-db'] || 1);
const plan = parsePlan(args);
const tempDir = mkdtempSync(path.join(tmpdir(), 'hemisync-'));

try {
  const decoded = decodeToWave(args.input, tempDir);
  const wav = new WaveFile(readFileSync(decoded));
  wav.toBitDepth('32f');
  const sampleRate = wav.fmt.sampleRate;
  const channels = wav.getSamples(true, Float32Array);
  const leftIn = channels[0];
  const rightIn = channels[1] || channels[0];
  const frameCount = leftIn.length;
  const leftOut = new Array(frameCount);
  const rightOut = new Array(frameCount);

  for (let index = 0; index < frameCount; index += 1) {
    const t = index / sampleRate;
    const norm = frameCount > 1 ? index / (frameCount - 1) : 0;
    const beat = interpolateBeat(plan, norm);
    const fadeIn = clamp(index / (sampleRate * 0.08), 0, 1);
    const fadeOut = clamp((frameCount - index) / (sampleRate * 0.2), 0, 1);
    const env = Math.min(fadeIn, fadeOut);
    const leftCarrier = Math.sin(2 * Math.PI * carrier * t);
    const rightCarrier = Math.sin(2 * Math.PI * (carrier + beat) * t);

    leftOut[index] = leftIn[index] * 0.94 + leftCarrier * mixGain * env;
    rightOut[index] = rightIn[index] * 0.94 + rightCarrier * mixGain * env;
  }

  const normalizedLeft = normalize(leftOut, headroomDb);
  const normalizedRight = normalize(rightOut, headroomDb);
  const out = new WaveFile();
  out.fromScratch(2, sampleRate, '32f', [normalizedLeft, normalizedRight]);
  out.toBitDepth('24');
  writeFileSync(args.output, out.toBuffer());

  const metadataPath = `${args.output}.json`;
  writeFileSync(metadataPath, JSON.stringify({
    version: 1,
    input: path.resolve(args.input),
    output: path.resolve(args.output),
    sampleRate,
    durationSec: Number((frameCount / sampleRate).toFixed(3)),
    carrierHz: carrier,
    plan,
    mixDb: Number(args['mix-db'] || -18),
    headroomDb,
    warnings: [
      'Use headphones at moderate volume.',
      'Do not use while driving or operating equipment.',
      'This output is wellness/focus support, not medical treatment.'
    ]
  }, null, 2));

  console.log(JSON.stringify({ ok: true, output: path.resolve(args.output), metadata: path.resolve(metadataPath) }, null, 2));
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
