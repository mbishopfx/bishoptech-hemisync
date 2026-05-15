import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import * as pipeline from '../lib/audio/engine/pipeline.js';
import * as backgroundLayer from '../lib/audio/background-layer.js';
import * as breathModule from '../lib/audio/breath.js';

const { buildSessionBed, encodeOutputs } = pipeline;
const { buildBackgroundLayer } = backgroundLayer.default || backgroundLayer;
const { generateBreathEnvelope } = breathModule.default || breathModule;

function loadLocalEnv() {
  const envFiles = ['.env.local', '.env.production.local', '.env.development.local', '.env'];
  for (const fileName of envFiles) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;

    const text = fs.readFileSync(filePath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const index = trimmed.indexOf('=');
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] == null) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

function parseCliOptions(argv = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--limit' && next) options.limit = Number(next);
    if (arg === '--sample-rate' && next) options.sampleRate = Number(next);
    if (arg === '--duration-scale' && next) options.durationScale = Number(next);
    if (arg === '--start' && next) options.start = Number(next);
    if (arg === '--no-upload') options.noUpload = true;
    if (arg === '--no-webm') options.noWebm = true;
    if (arg === '--dry-run') options.noUpload = true;
  }
  return options;
}

const CLI = parseCliOptions();
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'agentic-tones';
const SAMPLE_RATE = Number(CLI.sampleRate || process.env.LIB_SAMPLE_RATE || 44100);
const DURATION_SCALE = Number(CLI.durationScale || process.env.LIB_DURATION_SCALE || 1);
const LIMIT = Number.isFinite(CLI.limit) ? CLI.limit : Number(process.env.LIB_LIMIT || 0);
const START = Number.isFinite(CLI.start) ? CLI.start : Number(process.env.LIB_START || 0);
const NO_UPLOAD = Boolean(CLI.noUpload || process.env.LIB_NO_UPLOAD === '1');
const NO_WEBM = Boolean(CLI.noWebm || process.env.LIB_NO_WEBM === '1');

if (!NO_UPLOAD && (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY)) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = NO_UPLOAD ? null : createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeCurve(points, durationSec) {
  return points.map(([ratio, hz]) => ({
    at: Math.round(clamp(ratio, 0, 1) * durationSec),
    hz: Number(hz)
  }));
}

function buildMasteringProfile(style = 'balanced') {
  const styles = {
    warm: { ceilingDb: -1.2, dcBlockHz: 18, lookaheadMs: 6, attackMs: 2, releaseMs: 190 },
    clear: { ceilingDb: -1.0, dcBlockHz: 20, lookaheadMs: 5, attackMs: 2, releaseMs: 160 },
    immersive: { ceilingDb: -1.4, dcBlockHz: 16, lookaheadMs: 7, attackMs: 3, releaseMs: 210 },
    gentle: { ceilingDb: -1.5, dcBlockHz: 15, lookaheadMs: 8, attackMs: 3, releaseMs: 240 },
    balanced: { ceilingDb: -1.1, dcBlockHz: 18, lookaheadMs: 5, attackMs: 2, releaseMs: 180 }
  };

  return styles[style] || styles.balanced;
}

function buildToneSpec(template, variant) {
  const durationSec = Math.max(30, Math.round((variant.durationSec || template.durationSec || 210) * DURATION_SCALE));
  const carrierHz = clamp((template.baseFreqHz || 220) + (variant.carrierOffsetHz || 0), 60, 520);
  const deltaCurve = makeCurve(variant.deltaCurve || template.deltaCurve || [[0, 8], [1, 6]], durationSec);
  const targetHz = Number((variant.targetHz ?? deltaCurve[deltaCurve.length - 1]?.hz ?? 6).toFixed(2));

  return {
    id: randomUUID(),
    name: `${template.name}: ${variant.label}`,
    slug: slugify(`${template.id}-${variant.slug}`),
    state: template.state,
    baseFreqHz: Number(carrierHz.toFixed(2)),
    targetHz,
    noise: variant.noise || template.noise || null,
    background: variant.background || template.background || null,
    breath: variant.breath || template.breath || null,
    modes: variant.modes || template.modes || { binaural: true, monaural: false, isochronic: false },
    durationSec,
    description: variant.description || template.description,
    summary: variant.summary || template.summary,
    masteringProfile: buildMasteringProfile(variant.masteringStyle || template.masteringStyle),
    focusPreset: {
      carriers: { leftHz: Number(carrierHz.toFixed(2)), rightHzOffsetHz: 0 },
      deltaHzPath: deltaCurve,
      noise: variant.noise || template.noise || null,
      modes: variant.modes || template.modes || { binaural: true, monaural: false, isochronic: false }
    },
    metadata: {
      libraryVersion: 'advanced-v1',
      familyId: template.id,
      familyName: template.name,
      variantId: variant.slug,
      variantLabel: variant.label,
      sessionRole: variant.role || template.role,
      tags: [...new Set([...(template.tags || []), ...(variant.tags || [])])],
      breathPattern: (variant.breath || template.breath)?.pattern || null,
      backgroundType: (variant.background || template.background)?.type || null,
      backgroundAsset: (variant.background || template.background)?.assetId || null,
      carrierHz: Number(carrierHz.toFixed(2)),
      deltaCurve
    }
  };
}

const ADVANCED_LIBRARY = [
  {
    id: 'delta-recovery-matrix',
    name: 'Recovery Delta Matrix',
    state: 'delta',
    role: 'recovery',
    baseFreqHz: 108,
    durationSec: 240,
    noise: { type: 'brown', mixDb: -30 },
    background: { type: 'ocean', mixDb: -26 },
    breath: { pattern: '4-7-8', bpm: 6, depth: 0.08 },
    modes: { binaural: true, monaural: true, isochronic: false },
    masteringStyle: 'gentle',
    summary: 'A deep restoration field for post-exertion recovery, nervous-system downshift, and cellular rest.',
    description: 'Layered delta descent with warm brown noise, oceanic motion, and slow exhale bias for deep repair.',
    tags: ['recovery', 'sleep', 'delta'],
    deltaCurve: [[0, 4.2], [0.35, 3.4], [0.7, 2.8], [1, 2.3]],
    variants: [
      {
        slug: 'submerge',
        label: 'Submerge',
        targetHz: 2.3,
        carrierOffsetHz: -4,
        summary: 'Slowly submerges the system into deep restorative delta.',
        description: 'A warm, sinking delta design that feels like dropping into still water.',
        tags: ['submerge', 'repair'],
        deltaCurve: [[0, 4.0], [0.4, 3.2], [0.75, 2.7], [1, 2.3]]
      },
      {
        slug: 'cellular-reset',
        label: 'Cellular Reset',
        targetHz: 2.6,
        carrierOffsetHz: 0,
        background: { type: 'ocean', mixDb: -24 },
        masteringStyle: 'warm',
        summary: 'Supports a grounded delta reset after effort or stimulation.',
        description: 'A steadier low-delta shape with a little more presence and clarity.',
        tags: ['reset', 'grounding'],
        deltaCurve: [[0, 4.1], [0.35, 3.6], [0.8, 2.9], [1, 2.6]]
      },
      {
        slug: 'night-fall',
        label: 'Night Fall',
        targetHz: 2.1,
        carrierOffsetHz: 3,
        breath: { pattern: 'coherent-5.5', bpm: 5.2, depth: 0.06 },
        summary: 'A softer descent for sleep onset and quieting mental chatter.',
        description: 'Delta falloff with a gentle coherent breath guide for pre-sleep release.',
        tags: ['sleep-onset', 'night'],
        deltaCurve: [[0, 4.0], [0.25, 3.5], [0.65, 2.6], [1, 2.1]]
      },
      {
        slug: 'deep-repair',
        label: 'Deep Repair',
        targetHz: 2.4,
        carrierOffsetHz: -8,
        noise: { type: 'brown', mixDb: -32 },
        masteringStyle: 'immersive',
        summary: 'A denser delta field for slow system repair and full-body exhale.',
        description: 'Deeper carrier placement with richer low-frequency weight for recovery.',
        tags: ['repair', 'immersive'],
        deltaCurve: [[0, 4.3], [0.4, 3.1], [0.75, 2.7], [1, 2.4]]
      }
    ]
  },
  {
    id: 'theta-hypnagogia-field',
    name: 'Theta Hypnagogia Field',
    state: 'theta',
    role: 'liminal',
    baseFreqHz: 176,
    durationSec: 210,
    noise: { type: 'pink', mixDb: -28 },
    background: { type: 'asset', assetId: 'lumina', mixDb: -25 },
    breath: { pattern: 'coherent-5.5', bpm: 5.5, depth: 0.1 },
    modes: { binaural: true, monaural: true, isochronic: false },
    masteringStyle: 'immersive',
    summary: 'A liminal theta architecture for imagery, insight, meditation, and subconscious access.',
    description: 'Breath-synced theta with luminous ambience and soft drift into the hypnagogic threshold.',
    tags: ['theta', 'imagery', 'creativity'],
    deltaCurve: [[0, 7.5], [0.35, 6.4], [0.7, 5.4], [1, 4.8]],
    variants: [
      {
        slug: 'threshold',
        label: 'Threshold',
        targetHz: 4.8,
        carrierOffsetHz: 0,
        summary: 'Keeps awareness at the threshold where imagery begins to bloom.',
        description: 'The cleanest entry into the theta threshold with minimal friction.',
        tags: ['threshold', 'meditation'],
        deltaCurve: [[0, 7.2], [0.4, 6.2], [0.8, 5.3], [1, 4.8]]
      },
      {
        slug: 'lucid-drift',
        label: 'Lucid Drift',
        targetHz: 5.2,
        carrierOffsetHz: 6,
        breath: { pattern: 'coherent-5.5', bpm: 5.8, depth: 0.08 },
        background: { type: 'asset', assetId: 'nattkatt', mixDb: -27 },
        summary: 'A softer theta drift for lucid floating and creative daydreaming.',
        description: 'More buoyant and spacious with a gentle nocturnal texture.',
        tags: ['lucid', 'drift'],
        deltaCurve: [[0, 7.4], [0.45, 6.3], [0.75, 5.5], [1, 5.2]]
      },
      {
        slug: 'inner-cinema',
        label: 'Inner Cinema',
        targetHz: 4.9,
        carrierOffsetHz: -2,
        noise: { type: 'brown', mixDb: -30 },
        summary: 'Supports vivid internal imagery and emotional processing.',
        description: 'A darker theta variant with a cinematic, inward-facing field.',
        tags: ['imagery', 'processing'],
        deltaCurve: [[0, 7.3], [0.3, 6.1], [0.65, 5.0], [1, 4.9]]
      },
      {
        slug: 'creative-echo',
        label: 'Creative Echo',
        targetHz: 5.5,
        carrierOffsetHz: 10,
        masteringStyle: 'warm',
        summary: 'Keeps enough structure for idea capture while staying deeply relaxed.',
        description: 'Theta with a little more brightness for post-session recall and capture.',
        tags: ['creative', 'recall'],
        deltaCurve: [[0, 7.6], [0.4, 6.5], [0.8, 5.7], [1, 5.5]]
      }
    ]
  },
  {
    id: 'alpha-flow-stabilizer',
    name: 'Alpha Flow Stabilizer',
    state: 'alpha',
    role: 'focus',
    baseFreqHz: 228,
    durationSec: 180,
    noise: { type: 'pink', mixDb: -26 },
    background: { type: 'asset', assetId: 'scatter', mixDb: -24 },
    breath: { pattern: 'coherent-5.5', bpm: 5.6, depth: 0.08 },
    modes: { binaural: true, monaural: false, isochronic: true },
    masteringStyle: 'clear',
    summary: 'A bright alpha corridor for calm productivity, reading, writing, and sustained flow.',
    description: 'Smooth alpha shaping that holds attention without overdriving the nervous system.',
    tags: ['alpha', 'flow', 'productivity'],
    deltaCurve: [[0, 10.8], [0.3, 9.8], [0.65, 8.9], [1, 8.1]],
    variants: [
      {
        slug: 'flow-line',
        label: 'Flow Line',
        targetHz: 8.1,
        carrierOffsetHz: 4,
        summary: 'A straight-through flow channel for calm execution and momentum.',
        description: 'The cleanest route into a stable, low-friction alpha focus state.',
        tags: ['flow', 'execution'],
        deltaCurve: [[0, 10.5], [0.35, 9.7], [0.75, 8.8], [1, 8.1]]
      },
      {
        slug: 'calm-build',
        label: 'Calm Build',
        targetHz: 8.7,
        carrierOffsetHz: -3,
        breath: { pattern: 'coherent-5.5', bpm: 5.8, depth: 0.06 },
        summary: 'A calmer alpha slope for making progress without pressure.',
        description: 'Relaxed alpha with a gentle build that keeps tension low.',
        tags: ['calm', 'build'],
        deltaCurve: [[0, 10.9], [0.35, 9.9], [0.75, 9.0], [1, 8.7]]
      },
      {
        slug: 'decision-window',
        label: 'Decision Window',
        targetHz: 9.3,
        carrierOffsetHz: 7,
        masteringStyle: 'warm',
        summary: 'Balances alertness and ease for light strategy and decision-making.',
        description: 'A slightly brighter alpha track for light cognitive load and planning.',
        tags: ['decision', 'planning'],
        deltaCurve: [[0, 11.2], [0.3, 10.1], [0.7, 9.2], [1, 9.3]]
      },
      {
        slug: 'steady-focus',
        label: 'Steady Focus',
        targetHz: 8.4,
        carrierOffsetHz: 0,
        noise: { type: 'pink', mixDb: -28 },
        summary: 'A dependable background field for sustained attention and writing.',
        description: 'Low-drama alpha ideal for long-form cognitive work.',
        tags: ['steady', 'writing'],
        deltaCurve: [[0, 10.6], [0.35, 9.6], [0.7, 8.8], [1, 8.4]]
      }
    ]
  },
  {
    id: 'beta-analysis-engine',
    name: 'Beta Analysis Engine',
    state: 'beta',
    role: 'analysis',
    baseFreqHz: 282,
    durationSec: 180,
    noise: { type: 'pink', mixDb: -28 },
    background: { type: 'asset', assetId: 'papa', mixDb: -25 },
    breath: null,
    modes: { binaural: true, monaural: false, isochronic: true },
    masteringStyle: 'clear',
    summary: 'A sharper beta field for logical work, modeling, problem solving, and execution.',
    description: 'Structured beta tracks with clean carrier placement and a more analytical edge.',
    tags: ['beta', 'analysis', 'execution'],
    deltaCurve: [[0, 15.2], [0.35, 17.0], [0.7, 18.4], [1, 16.8]],
    variants: [
      {
        slug: 'solver',
        label: 'Solver',
        targetHz: 16.8,
        carrierOffsetHz: 8,
        summary: 'A practical beta corridor for solving problems without rushing.',
        description: 'A disciplined analysis layer with just enough lift to stay engaged.',
        tags: ['solver', 'logic'],
        deltaCurve: [[0, 15.0], [0.3, 16.5], [0.7, 17.8], [1, 16.8]]
      },
      {
        slug: 'model',
        label: 'Model',
        targetHz: 17.6,
        carrierOffsetHz: -4,
        background: { type: 'asset', assetId: 'scatter', mixDb: -26 },
        summary: 'Supports structured thinking, frameworks, and multi-step reasoning.',
        description: 'A more spacious beta design for architectural thinking and modeling.',
        tags: ['modeling', 'frameworks'],
        deltaCurve: [[0, 15.4], [0.3, 16.7], [0.7, 18.2], [1, 17.6]]
      },
      {
        slug: 'execution',
        label: 'Execution',
        targetHz: 18.8,
        carrierOffsetHz: 12,
        masteringStyle: 'warm',
        summary: 'A decisive beta lane for getting through tasks and taking action.',
        description: 'A tighter, more forward-moving beta state for execution and follow-through.',
        tags: ['execution', 'follow-through'],
        deltaCurve: [[0, 15.6], [0.35, 17.4], [0.75, 19.0], [1, 18.8]]
      },
      {
        slug: 'audit',
        label: 'Audit',
        targetHz: 16.2,
        carrierOffsetHz: 0,
        summary: 'A crisp beta track for review, auditing, and detail work.',
        description: 'A slightly slower and more inspecting-oriented beta profile.',
        tags: ['audit', 'detail'],
        deltaCurve: [[0, 15.1], [0.3, 16.2], [0.7, 17.1], [1, 16.2]]
      }
    ]
  },
  {
    id: 'gamma-insight-synthesizer',
    name: 'Gamma Insight Synthesizer',
    state: 'gamma',
    role: 'insight',
    baseFreqHz: 392,
    durationSec: 165,
    noise: { type: 'white', mixDb: -32 },
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -27 },
    breath: { pattern: 'coherent-5.5', bpm: 5.8, depth: 0.05 },
    modes: { binaural: true, monaural: false, isochronic: false },
    masteringStyle: 'clear',
    summary: 'A high-coherence gamma field for insight flashes, synthesis, and peak awareness.',
    description: 'Bright gamma work with a light touch so the state feels sharp rather than harsh.',
    tags: ['gamma', 'insight', 'synthesis'],
    deltaCurve: [[0, 32], [0.35, 35], [0.7, 38], [1, 41]],
    variants: [
      {
        slug: 'synthesis',
        label: 'Synthesis',
        targetHz: 41,
        carrierOffsetHz: -6,
        summary: 'Helps disparate ideas click into a single coherent whole.',
        description: 'A balanced gamma synthesis track for connecting patterns quickly.',
        tags: ['synthesis', 'pattern-matching'],
        deltaCurve: [[0, 31.5], [0.35, 35.5], [0.7, 39.0], [1, 41.0]]
      },
      {
        slug: 'flash',
        label: 'Flash',
        targetHz: 37.5,
        carrierOffsetHz: 10,
        background: { type: 'asset', assetId: 'papa', mixDb: -29 },
        summary: 'A faster insight burst for quick recognition and mental clarity.',
        description: 'A punchier gamma flash for aha moments and rapid comprehension.',
        tags: ['flash', 'clarity'],
        deltaCurve: [[0, 32.5], [0.3, 35.8], [0.7, 37.0], [1, 37.5]]
      },
      {
        slug: 'apex',
        label: 'Apex',
        targetHz: 43,
        carrierOffsetHz: 0,
        masteringStyle: 'immersive',
        summary: 'A peak-coherence field for deliberate cognitive sharpness.',
        description: 'Higher gamma with a little more density for intense focus and insight.',
        tags: ['peak', 'coherence'],
        deltaCurve: [[0, 32.0], [0.35, 36.5], [0.7, 40.5], [1, 43.0]]
      },
      {
        slug: 'lucid-peak',
        label: 'Lucid Peak',
        targetHz: 39.2,
        carrierOffsetHz: 6,
        breath: { pattern: 'coherent-5.5', bpm: 5.5, depth: 0.04 },
        summary: 'A lucid, steady gamma state for conscious precision and awareness.',
        description: 'The softest gamma lane in the set, optimized for clarity without strain.',
        tags: ['lucid', 'precision'],
        deltaCurve: [[0, 31.8], [0.3, 35.2], [0.7, 37.9], [1, 39.2]]
      }
    ]
  }
];

function buildCatalog() {
  return ADVANCED_LIBRARY.flatMap((template) => template.variants.map((variant) => buildToneSpec(template, variant)));
}

async function ensureBucket() {
  const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
  if (error || !data) {
    console.log(`Creating bucket: ${BUCKET_NAME}`);
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['audio/wav', 'audio/webm']
    });
  }
}

async function renderTrack(spec) {
  const breath = spec.breath?.pattern
    ? {
        envelope: generateBreathEnvelope(spec.breath.pattern, SAMPLE_RATE, spec.durationSec, spec.breath.bpm),
        depth: spec.breath.depth ?? 0.08
      }
    : null;

  const background = spec.background
    ? await buildBackgroundLayer({
        background: spec.background,
        sampleRate: SAMPLE_RATE,
        lengthSec: spec.durationSec
      })
    : null;

  const bed = await buildSessionBed({
    lengthSec: spec.durationSec,
    sampleRate: SAMPLE_RATE,
    focusPreset: spec.focusPreset,
    baseFreqHz: spec.baseFreqHz,
    breath,
    background,
    modes: spec.focusPreset.modes
  });

  return encodeOutputs({
    left: bed.left,
    right: bed.right,
    sampleRate: bed.sampleRate,
    wavBitDepthCode: '16',
    withWebm: !NO_WEBM,
    kbps: 64,
    masteringProfile: spec.masteringProfile
  });
}

async function run() {
  console.log('Starting advanced tone library generation...');
  if (!NO_UPLOAD) {
    await ensureBucket();
  }

  const catalog = buildCatalog();
  const selectedCatalog = catalog.slice(START, LIMIT > 0 ? START + LIMIT : undefined);
  console.log(`Generated ${selectedCatalog.length} advanced tone definitions${START > 0 || LIMIT > 0 ? ` (window ${START}${LIMIT > 0 ? `..${START + LIMIT - 1}` : '+'} of ${catalog.length})` : ''}.`);

  let index = 0;
  for (const spec of selectedCatalog) {
    index += 1;
    console.log(`[${index}/${selectedCatalog.length}] Rendering ${spec.name} (${spec.state} @ ${spec.targetHz}Hz)...`);

    try {
      const { wavBuffer, webmBuffer } = await renderTrack(spec);
      const trackId = spec.id;
      const wavPath = `${trackId}/master.wav`;
      const webmPath = `${trackId}/master.webm`;

      if (NO_UPLOAD) {
        console.log(`Rendered ${spec.name} (dry run; not uploaded).`);
        continue;
      }

      console.log('Uploading to storage...');
      const uploads = [
        supabase.storage.from(BUCKET_NAME).upload(wavPath, wavBuffer, { contentType: 'audio/wav', upsert: true })
      ];
      if (webmBuffer) {
        uploads.push(
          supabase.storage.from(BUCKET_NAME).upload(webmPath, webmBuffer, { contentType: 'audio/webm', upsert: true })
        );
      }
      await Promise.all(uploads);

      const wavUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(wavPath).data.publicUrl;
      const webmUrl = webmBuffer ? supabase.storage.from(BUCKET_NAME).getPublicUrl(webmPath).data.publicUrl : null;

      console.log('Saving metadata to database...');
      const { error: dbError } = await supabase.from('agentic_tones').upsert(
        {
          id: trackId,
          name: spec.name,
          state: spec.state,
          base_freq_hz: spec.baseFreqHz,
          target_hz: spec.targetHz,
          noise_type: spec.noise?.type || null,
          description: spec.description,
          summary: spec.summary,
          modes: spec.focusPreset.modes,
          duration_sec: spec.durationSec,
          wav_url: wavUrl,
          webm_url: webmUrl,
          metadata: {
            ...spec.metadata,
            createdBy: 'advanced-tone-library-generator',
            sampleRate: SAMPLE_RATE,
            render: {
              mastering: spec.masteringProfile,
              hasBreath: Boolean(spec.breath),
              hasBackground: Boolean(spec.background),
              variantSlug: spec.slug
            }
          }
        },
        { onConflict: 'id' }
      );

      if (dbError) throw dbError;
      console.log(`Success: ${spec.name}`);
    } catch (err) {
      console.error(`Failed to generate ${spec.name}:`, err);
    }
  }

  console.log('Advanced library generation complete.');
}

run();
