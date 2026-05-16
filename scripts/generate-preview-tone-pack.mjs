import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { importStereoBed, overlayDualFrequency } from '../lib/audio/engine/pipeline.js';
import { buildSessionBed } from '../lib/audio/engine/pipeline.js';
import { encodeWavStereo } from '../lib/audio/engine/encode.js';
import { getFfmpegPath } from '../lib/audio/engine/ffmpeg.js';
import { pickPreset } from '../lib/audio/presets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'audiotemplates');
const OUTPUT_DIR = path.join(ROOT, 'public', 'audio', 'preview-tones', 'generated');
const GENERATED_MODULE = path.join(ROOT, 'lib', 'audio', 'generated-preview-tones.js');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const TARGET_SAMPLE_RATE = 44100;
const OVERLAY_GAIN_DB = -12;
const OUTPUT_KBPS = 320;

const SOURCE_TONES = [
  {
    id: 'deep-focus-alpha-bass-boost',
    name: 'Deep Focus Alpha',
    shortLabel: 'Bass Boost',
    fileName: 'Deep Focus Alpha (Bass Boost).mp3',
    summary: 'A warmer alpha preview with a stronger low-end bed for a grounded hemisync-style feel.'
  },
  {
    id: 'deep-focus-alpha-rhythmic-panning',
    name: 'Deep Focus Alpha',
    shortLabel: 'Rhythmic Panning',
    fileName: 'Deep Focus Alpha (Rhythmic Panning).mp3',
    summary: 'Stereo motion with rhythmic panning that highlights the left/right field and makes the preview feel alive.'
  },
  {
    id: 'escape',
    name: 'Escape',
    shortLabel: 'Escape',
    fileName: 'Escape.mp3',
    summary: 'A float-out style preview for deep relaxation, separation, and a softer late-stage descent.'
  },
  {
    id: 'focus-state',
    name: 'Focus State',
    shortLabel: 'Focus State',
    fileName: 'Focus State.mp3',
    summary: 'A clean attention bed for presence, concentration, and a crisp entry into work mode.'
  }
];

const STATE_VARIANTS = [
  {
    id: 'delta',
    label: 'Delta',
    targetState: 'delta',
    targetHz: 3.5,
    baseFreqHz: 196,
    focusLevel: 'F21',
    deltaHzFrom: 4,
    deltaHzTo: 2.8,
    noise: { type: 'brown', mixDb: -28 },
    modes: { binaural: true, monaural: false, isochronic: false },
    modeLabel: 'Hemisync preview • delta'
  },
  {
    id: 'theta',
    label: 'Theta',
    targetState: 'theta',
    targetHz: 6,
    baseFreqHz: 210,
    focusLevel: 'F15',
    deltaHzFrom: 7.2,
    deltaHzTo: 5.4,
    noise: { type: 'pink', mixDb: -26 },
    modes: { binaural: true, monaural: true, isochronic: false },
    modeLabel: 'Hemisync preview • theta'
  },
  {
    id: 'alpha',
    label: 'Alpha',
    targetState: 'alpha',
    targetHz: 10,
    baseFreqHz: 220,
    focusLevel: 'F10',
    deltaHzFrom: 10,
    deltaHzTo: 8,
    noise: { type: 'pink', mixDb: -24 },
    modes: { binaural: true, monaural: false, isochronic: true },
    modeLabel: 'Hemisync preview • alpha'
  },
  {
    id: 'beta',
    label: 'Beta',
    targetState: 'beta',
    targetHz: 16,
    baseFreqHz: 240,
    focusLevel: 'F12',
    deltaHzFrom: 16,
    deltaHzTo: 14,
    noise: { type: 'white', mixDb: -28 },
    modes: { binaural: true, monaural: true, isochronic: false },
    modeLabel: 'Hemisync preview • beta'
  }
];

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toPublicUrl(relativePath) {
  return `/audio/preview-tones/generated/${relativePath.replace(/\\/g, '/')}`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function encodeMp3Stereo({ left, right, sampleRate, kbps = OUTPUT_KBPS }) {
  const binaryPath = getFfmpegPath();
  if (!binaryPath) {
    throw new Error('ffmpeg binary not available');
  }

  const wavBuffer = encodeWavStereo({ left, right, sampleRate, bitDepthCode: '32f', dither: false });
  const chunks = [];
  const stderr = [];

  await new Promise((resolve, reject) => {
    const child = spawn(binaryPath, [
      '-hide_banner',
      '-loglevel',
      'error',
      '-f',
      'wav',
      '-i',
      'pipe:0',
      '-c:a',
      'libmp3lame',
      '-b:a',
      `${kbps}k`,
      '-f',
      'mp3',
      'pipe:1'
    ]);

    child.stdout.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    child.stderr.on('data', (chunk) => stderr.push(Buffer.from(chunk)));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      const details = Buffer.concat(stderr).toString('utf8').trim();
      reject(new Error(details || `ffmpeg mp3 encode failed with code ${code}`));
    });

    child.stdin.on('error', reject);
    child.stdin.end(wavBuffer);
  });

  return Buffer.concat(chunks);
}

async function main() {
  await ensureDir(OUTPUT_DIR);

  const generated = [];

  for (const sourceTone of SOURCE_TONES) {
    const sourcePath = path.join(SOURCE_DIR, sourceTone.fileName);
    const imported = await importStereoBed({
      filePath: sourcePath,
      sampleRate: TARGET_SAMPLE_RATE
    });

    const sourceLengthSec = imported.left.length / TARGET_SAMPLE_RATE;
    const sourceDurationSec = Math.round(sourceLengthSec);
    const sourceSlug = slugify(sourceTone.fileName.replace(/\.mp3$/i, ''));

    for (const state of STATE_VARIANTS) {
      const preset = pickPreset({ focusLevel: state.focusLevel });
      const render = await buildSessionBed({
        lengthSec: sourceLengthSec,
        sampleRate: TARGET_SAMPLE_RATE,
        focusPreset: {
          ...preset,
          carriers: {
            ...(preset.carriers || {}),
            leftHz: state.baseFreqHz
          },
          deltaHzPath: [
            { at: 0, hz: state.deltaHzFrom },
            { at: sourceLengthSec, hz: state.deltaHzTo }
          ]
        },
        baseFreqHz: state.baseFreqHz,
        deltaOverrides: { from: state.deltaHzFrom, to: state.deltaHzTo },
        noise: state.noise,
        modes: state.modes
      });

      const mixedLeft = Float32Array.from(imported.left);
      const mixedRight = Float32Array.from(imported.right);
      overlayDualFrequency({
        targetL: mixedLeft,
        targetR: mixedRight,
        overlay: render,
        gainDb: OVERLAY_GAIN_DB,
        channelGains: { left: 0, right: 0 }
      });

      const fileName = `${slugify(state.id)}-${sourceSlug}.mp3`;
      const outDir = path.join(OUTPUT_DIR, state.id);
      await ensureDir(outDir);
      const outPath = path.join(outDir, fileName);
      const mp3Buffer = await encodeMp3Stereo({
        left: mixedLeft,
        right: mixedRight,
        sampleRate: TARGET_SAMPLE_RATE
      });
      await fs.writeFile(outPath, mp3Buffer);

      const entry = {
        id: `${state.id}-${sourceTone.id}`,
        name: sourceTone.name,
        shortLabel: sourceTone.shortLabel,
        fileName: path.join(state.id, fileName).replace(/\\/g, '/'),
        summary: `${sourceTone.summary} Re-rendered for the ${state.label} state.`,
        state: state.targetState,
        targetState: state.targetState,
        targetHz: state.targetHz,
        baseFreqHz: state.baseFreqHz,
        durationSec: sourceDurationSec,
        modeLabel: state.modeLabel,
        sourceType: 'generated-pack',
        sourceToneId: sourceTone.id,
        sourceToneName: sourceTone.name,
        sourceToneLabel: sourceTone.shortLabel,
        packType: 'first-pack',
        packBillingType: 'one-time',
        mp3Url: toPublicUrl(path.join(state.id, fileName).replace(/\\/g, '/')),
        mp3_url: toPublicUrl(path.join(state.id, fileName).replace(/\\/g, '/')),
        wavUrl: null,
        wav_url: null,
        webmUrl: null,
        webm_url: null,
        target_hz: state.targetHz,
        target_state: state.targetState,
        base_freq_hz: state.baseFreqHz,
        duration_sec: sourceDurationSec
      };

      generated.push(entry);
      process.stdout.write(`Generated ${entry.id}\n`);
    }
  }

  const manifest = {
    version: 'v2',
    generatedAt: new Date().toISOString(),
    count: generated.length,
    tones: generated
  };

  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  const moduleSource = `export const GENERATED_PREVIEW_TONES = ${JSON.stringify(generated, null, 2)};\n`;
  await fs.writeFile(GENERATED_MODULE, moduleSource);

  process.stdout.write(`Wrote ${generated.length} generated preview tones.\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
