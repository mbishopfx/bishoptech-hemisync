import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const BRAIN_STATE_ORDER = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
import * as pipeline from '../lib/audio/engine/pipeline.js';
import * as backgroundLayer from '../lib/audio/background-layer.js';
import * as breathModule from '../lib/audio/breath.js';

const { buildSessionBed, encodeOutputs } = pipeline;
const { buildBackgroundLayer } = backgroundLayer.default || backgroundLayer;
const { generateBreathEnvelope } = breathModule.default || breathModule;

const BUCKET_NAME = 'agentic-tones';
const SAMPLE_RATE = Number(process.env.LIB_SAMPLE_RATE || 44100);
const DURATION_SCALE = Number(process.env.LIB_DURATION_SCALE || 1);
const NO_WEBM = Boolean(process.env.LIB_NO_WEBM === '1');

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
      if (key && process.env[key] == null) process.env[key] = value;
    }
  }
}

loadLocalEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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
  const durationSec = Math.max(30, Math.round((variant.durationSec || template.durationSec || 180) * DURATION_SCALE));
  const carrierHz = clamp((template.baseFreqHz || 220) + (variant.carrierOffsetHz || 0), 60, 520);
  const deltaCurve = makeCurve(variant.deltaCurve || template.deltaCurve || [[0, 8], [1, 6]], durationSec);
  const targetHz = Number((variant.targetHz ?? deltaCurve[deltaCurve.length - 1]?.hz ?? 6).toFixed(2));
  const modes = variant.modes || template.modes || { binaural: true, monaural: false, isochronic: false };

  return {
    id: randomUUID(),
    name: `${template.name}: ${variant.label}`,
    slug: slugify(`${template.id}-${variant.slug}`),
    state: variant.state || template.state,
    baseFreqHz: Number(carrierHz.toFixed(2)),
    targetHz,
    noise: variant.noise || template.noise || null,
    background: variant.background || template.background || null,
    breath: variant.breath || template.breath || null,
    modes,
    durationSec,
    description: variant.description || template.description,
    summary: variant.summary || template.summary,
    masteringProfile: buildMasteringProfile(variant.masteringStyle || template.masteringStyle),
    focusPreset: {
      carriers: { leftHz: Number(carrierHz.toFixed(2)), rightHzOffsetHz: 0 },
      deltaHzPath: deltaCurve,
      noise: variant.noise || template.noise || null,
      modes
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

const TEMPLATES = [
  {
    id: 'delta-tide-chamber',
    name: 'Tide Chamber',
    state: 'delta',
    role: 'recovery',
    baseFreqHz: 108,
    durationSec: 240,
    noise: { type: 'brown', mixDb: -31 },
    background: { type: 'ocean', mixDb: -26 },
    breath: { pattern: '4-7-8', bpm: 6, depth: 0.08 },
    modes: { binaural: true, monaural: true, isochronic: false },
    masteringStyle: 'gentle',
    summary: 'A deep restoration field for slow downshifting, release, and sleep prep.',
    description: 'Warm delta descent with ocean motion, brown noise, and long exhale bias.',
    tags: ['delta', 'recovery', 'sleep'],
    deltaCurve: [[0, 4.2], [0.35, 3.4], [0.7, 2.8], [1, 2.3]],
    variants: [
      {
        slug: 'slow-ebb',
        label: 'Slow Ebb',
        targetHz: 2.1,
        carrierOffsetHz: -4,
        summary: 'A gentle ebb into deep delta for release and sleep onset.',
        description: 'The softest delta lane in the set, designed to relax into stillness.',
        tags: ['ebb', 'sleep-onset'],
        deltaCurve: [[0, 4.0], [0.4, 3.2], [0.75, 2.7], [1, 2.1]]
      },
      {
        slug: 'deep-drift',
        label: 'Deep Drift',
        targetHz: 2.6,
        carrierOffsetHz: 2,
        background: { type: 'ocean', mixDb: -24 },
        masteringStyle: 'warm',
        summary: 'A steadier delta drift for recovery and body-level rest.',
        description: 'A slightly brighter delta bed with a grounded restorative feel.',
        tags: ['drift', 'repair'],
        deltaCurve: [[0, 4.1], [0.35, 3.6], [0.8, 2.9], [1, 2.6]]
      },
      {
        slug: 'rest-tide',
        label: 'Rest Tide',
        targetHz: 2.3,
        carrierOffsetHz: -8,
        breath: { pattern: '4-7-8', bpm: 5.4, depth: 0.06 },
        summary: 'A tide-like delta slide for quiet recovery and nervous-system settling.',
        description: 'A slower, heavier tide that eases the system toward deep rest.',
        tags: ['rest', 'tide'],
        deltaCurve: [[0, 4.3], [0.4, 3.3], [0.75, 2.7], [1, 2.3]]
      },
      {
        slug: 'still-channel',
        label: 'Still Channel',
        targetHz: 2.0,
        carrierOffsetHz: -2,
        noise: { type: 'brown', mixDb: -31 },
        background: { type: 'ocean', mixDb: -25 },
        breath: { pattern: '4-7-8', bpm: 5.6, depth: 0.07 },
        summary: 'A quiet delta channel for deep release and sleep preparation.',
        description: 'A smooth, low-motion descent designed to settle the body into stillness.',
        tags: ['stillness', 'channel'],
        deltaCurve: [[0, 4.1], [0.35, 3.1], [0.72, 2.5], [1, 2.0]]
      },
      {
        slug: 'rest-anchor',
        label: 'Rest Anchor',
        targetHz: 2.5,
        carrierOffsetHz: 4,
        masteringStyle: 'warm',
        summary: 'An anchored delta bed for holding rest without drifting upward.',
        description: 'A grounded delta field with a little more warmth and structural hold.',
        tags: ['anchor', 'rest'],
        deltaCurve: [[0, 4.2], [0.4, 3.5], [0.78, 2.8], [1, 2.5]]
      },
      {
        slug: 'deep-hush',
        label: 'Deep Hush',
        targetHz: 2.2,
        carrierOffsetHz: 1,
        noise: { type: 'brown', mixDb: -30 },
        summary: 'A hushed delta bed for settling into deep rest.',
        description: 'A dark, minimal delta field that softens the nervous system into stillness.',
        tags: ['hush', 'rest'],
        deltaCurve: [[0, 4.0], [0.35, 3.2], [0.72, 2.6], [1, 2.2]]
      },
      {
        slug: 'harbor-sleep',
        label: 'Harbor Sleep',
        targetHz: 2.7,
        carrierOffsetHz: -6,
        background: { type: 'ocean', mixDb: -27 },
        breath: { pattern: '4-7-8', bpm: 5.2, depth: 0.05 },
        summary: 'A sheltered delta harbor for sleep and recovery.',
        description: 'A gently held delta descent with a protected, restorative feel.',
        tags: ['harbor', 'sleep'],
        deltaCurve: [[0, 4.3], [0.4, 3.6], [0.78, 2.9], [1, 2.7]]
      }
    ]
  },
  {
    id: 'theta-lantern-bay',
    name: 'Lantern Bay',
    state: 'theta',
    role: 'imagery',
    baseFreqHz: 186,
    durationSec: 210,
    noise: { type: 'pink', mixDb: -28 },
    background: { type: 'asset', assetId: 'lumina', mixDb: -25 },
    breath: { pattern: 'coherent-5.5', bpm: 5.6, depth: 0.1 },
    modes: { binaural: true, monaural: true, isochronic: false },
    masteringStyle: 'immersive',
    summary: 'A liminal theta architecture for imagery, meditation, and subconscious access.',
    description: 'Luminous theta with soft drift into the hypnagogic threshold.',
    tags: ['theta', 'imagery', 'meditation'],
    deltaCurve: [[0, 7.5], [0.35, 6.4], [0.7, 5.4], [1, 4.8]],
    variants: [
      {
        slug: 'veil-bloom',
        label: 'Veil Bloom',
        targetHz: 4.7,
        carrierOffsetHz: 0,
        summary: 'A clean theta threshold where imagery can bloom without strain.',
        description: 'The smoothest entry into threshold theta with a soft, luminous edge.',
        tags: ['veil', 'threshold'],
        deltaCurve: [[0, 7.2], [0.4, 6.2], [0.8, 5.3], [1, 4.7]]
      },
      {
        slug: 'lucid-hush',
        label: 'Lucid Hush',
        targetHz: 5.3,
        carrierOffsetHz: 6,
        background: { type: 'asset', assetId: 'nattkatt', mixDb: -27 },
        breath: { pattern: 'coherent-5.5', bpm: 5.8, depth: 0.08 },
        summary: 'A softer theta drift for lucid floating and creative daydreaming.',
        description: 'A quiet nocturnal theta that stays spacious and gently awake.',
        tags: ['lucid', 'hush'],
        deltaCurve: [[0, 7.4], [0.45, 6.3], [0.75, 5.5], [1, 5.3]]
      },
      {
        slug: 'dream-arc',
        label: 'Dream Arc',
        targetHz: 5.0,
        carrierOffsetHz: -2,
        noise: { type: 'brown', mixDb: -30 },
        summary: 'An arcing theta shape for inner cinema, insight, and recall.',
        description: 'A darker theta variant for inward-facing imagery and memory work.',
        tags: ['dream', 'arc'],
        deltaCurve: [[0, 7.3], [0.3, 6.1], [0.65, 5.1], [1, 5.0]]
      },
      {
        slug: 'dream-lantern',
        label: 'Dream Lantern',
        targetHz: 4.6,
        carrierOffsetHz: 2,
        background: { type: 'asset', assetId: 'lumina', mixDb: -24 },
        breath: { pattern: 'coherent-5.5', bpm: 5.4, depth: 0.09 },
        summary: 'A softly lit theta state for imagery, recall, and liminal drift.',
        description: 'A bright-but-gentle theta lantern that keeps the mind open and receptive.',
        tags: ['dream', 'lantern'],
        deltaCurve: [[0, 7.1], [0.35, 6.0], [0.75, 5.0], [1, 4.6]]
      },
      {
        slug: 'dream-loom',
        label: 'Dream Loom',
        targetHz: 4.4,
        carrierOffsetHz: 5,
        noise: { type: 'pink', mixDb: -29 },
        summary: 'A woven theta field for imagery, recall, and symbolic drift.',
        description: 'A textured theta design that feels like threads of thought moving together.',
        tags: ['dream', 'loom'],
        deltaCurve: [[0, 7.1], [0.35, 6.0], [0.72, 5.0], [1, 4.4]]
      },
      {
        slug: 'river-mirror',
        label: 'River Mirror',
        targetHz: 5.2,
        carrierOffsetHz: -4,
        background: { type: 'asset', assetId: 'nattkatt', mixDb: -28 },
        breath: { pattern: 'coherent-5.5', bpm: 5.7, depth: 0.08 },
        summary: 'A reflective theta drift for inner imagery and creative observation.',
        description: 'A quiet, reflective theta layer that supports intuition and soft awareness.',
        tags: ['river', 'mirror'],
        deltaCurve: [[0, 7.3], [0.4, 6.2], [0.75, 5.4], [1, 5.2]]
      },
      {
        slug: 'oracle-hush',
        label: 'Oracle Hush',
        targetHz: 5.7,
        carrierOffsetHz: -5,
        noise: { type: 'pink', mixDb: -29 },
        summary: 'A quiet theta lane for intuitive sensing and reflective access.',
        description: 'A slightly higher theta blend with a hushed, receptive center.',
        tags: ['oracle', 'hush'],
        deltaCurve: [[0, 7.5], [0.4, 6.5], [0.78, 5.8], [1, 5.7]]
      }
    ]
  },
  {
    id: 'alpha-still-atelier',
    name: 'Still Atelier',
    state: 'alpha',
    role: 'focus',
    baseFreqHz: 228,
    durationSec: 180,
    noise: { type: 'pink', mixDb: -26 },
    background: { type: 'asset', assetId: 'scatter', mixDb: -24 },
    breath: { pattern: 'coherent-5.5', bpm: 5.7, depth: 0.08 },
    modes: { binaural: true, monaural: false, isochronic: true },
    masteringStyle: 'clear',
    summary: 'A bright alpha corridor for calm productivity, reading, writing, and flow.',
    description: 'Stable alpha shaping that holds attention without overdriving the nervous system.',
    tags: ['alpha', 'focus', 'productivity'],
    deltaCurve: [[0, 10.8], [0.3, 9.8], [0.65, 8.9], [1, 8.1]],
    variants: [
      {
        slug: 'steady-canvas',
        label: 'Steady Canvas',
        targetHz: 8.3,
        carrierOffsetHz: 4,
        summary: 'A calm canvas for sustained attention and steady output.',
        description: 'Low-drama alpha ideal for long-form cognitive work and drafting.',
        tags: ['steady', 'canvas'],
        deltaCurve: [[0, 10.5], [0.35, 9.7], [0.75, 8.8], [1, 8.3]]
      },
      {
        slug: 'calm-interval',
        label: 'Calm Interval',
        targetHz: 9.0,
        carrierOffsetHz: -3,
        breath: { pattern: 'coherent-5.5', bpm: 5.9, depth: 0.06 },
        summary: 'A calmer alpha slope for making progress without pressure.',
        description: 'Relaxed alpha with a gentle build that keeps tension low.',
        tags: ['calm', 'interval'],
        deltaCurve: [[0, 10.9], [0.35, 9.9], [0.75, 9.1], [1, 9.0]]
      },
      {
        slug: 'focus-surface',
        label: 'Focus Surface',
        targetHz: 8.7,
        carrierOffsetHz: 7,
        masteringStyle: 'warm',
        summary: 'A brighter alpha plane for planning, reading, and capture.',
        description: 'A slightly more present alpha field that helps ideas stay organized.',
        tags: ['focus', 'surface'],
        deltaCurve: [[0, 10.7], [0.3, 9.8], [0.7, 9.0], [1, 8.7]]
      },
      {
        slug: 'clear-desk',
        label: 'Clear Desk',
        targetHz: 8.0,
        carrierOffsetHz: 2,
        background: { type: 'asset', assetId: 'scatter', mixDb: -25 },
        summary: 'A tidy alpha corridor for clean focus and organized work.',
        description: 'A minimal alpha design that supports attention without clutter.',
        tags: ['clear', 'desk'],
        deltaCurve: [[0, 10.4], [0.35, 9.5], [0.74, 8.6], [1, 8.0]]
      },
      {
        slug: 'open-horizon',
        label: 'Open Horizon',
        targetHz: 9.6,
        carrierOffsetHz: -6,
        noise: { type: 'pink', mixDb: -27 },
        masteringStyle: 'warm',
        summary: 'A broader alpha field for spacious thinking and low-pressure planning.',
        description: 'An expansive alpha state that keeps the mind open, calm, and navigable.',
        tags: ['open', 'horizon'],
        deltaCurve: [[0, 10.9], [0.35, 9.9], [0.78, 9.2], [1, 9.6]]
      },
      {
        slug: 'quiet-ledger',
        label: 'Quiet Ledger',
        targetHz: 8.3,
        carrierOffsetHz: 3,
        background: { type: 'asset', assetId: 'scatter', mixDb: -26 },
        summary: 'A tidy alpha workspace for organized attention and capture.',
        description: 'A neat, low-friction alpha lane that keeps thoughts orderly and calm.',
        tags: ['quiet', 'ledger'],
        deltaCurve: [[0, 10.6], [0.35, 9.6], [0.74, 8.8], [1, 8.3]]
      },
      {
        slug: 'bright-loam',
        label: 'Bright Loam',
        targetHz: 9.1,
        carrierOffsetHz: -5,
        breath: { pattern: 'coherent-5.5', bpm: 5.7, depth: 0.06 },
        masteringStyle: 'clear',
        summary: 'A grounded alpha field for calm growth and steady progress.',
        description: 'A lightly brightened alpha session that feels organic, stable, and easy to inhabit.',
        tags: ['bright', 'loam'],
        deltaCurve: [[0, 10.8], [0.35, 9.9], [0.78, 9.2], [1, 9.1]]
      }
    ]
  },
  {
    id: 'beta-logic-grid',
    name: 'Logic Grid',
    state: 'beta',
    role: 'analysis',
    baseFreqHz: 286,
    durationSec: 180,
    noise: { type: 'pink', mixDb: -28 },
    background: { type: 'asset', assetId: 'papa', mixDb: -25 },
    breath: null,
    modes: { binaural: true, monaural: false, isochronic: true },
    masteringStyle: 'clear',
    summary: 'A sharper beta field for logical work, modeling, and execution.',
    description: 'Structured beta tracks with clean carrier placement and an analytical edge.',
    tags: ['beta', 'analysis', 'execution'],
    deltaCurve: [[0, 15.2], [0.35, 17.0], [0.7, 18.4], [1, 16.8]],
    variants: [
      {
        slug: 'decision-lattice',
        label: 'Decision Lattice',
        targetHz: 16.4,
        carrierOffsetHz: 8,
        summary: 'A practical beta corridor for problem solving and choice-making.',
        description: 'A disciplined analysis layer with enough lift to stay engaged.',
        tags: ['decision', 'lattice'],
        deltaCurve: [[0, 15.0], [0.3, 16.4], [0.7, 17.7], [1, 16.4]]
      },
      {
        slug: 'execution-trace',
        label: 'Execution Trace',
        targetHz: 18.2,
        carrierOffsetHz: 12,
        background: { type: 'asset', assetId: 'scatter', mixDb: -26 },
        summary: 'A decisive beta lane for task completion and follow-through.',
        description: 'A tighter beta profile for moving from analysis into action.',
        tags: ['execution', 'trace'],
        deltaCurve: [[0, 15.6], [0.35, 17.4], [0.75, 19.0], [1, 18.2]]
      },
      {
        slug: 'audit-path',
        label: 'Audit Path',
        targetHz: 16.9,
        carrierOffsetHz: 0,
        masteringStyle: 'warm',
        summary: 'A crisp beta track for review, auditing, and detail work.',
        description: 'A slightly slower, more inspecting-oriented beta profile.',
        tags: ['audit', 'detail'],
        deltaCurve: [[0, 15.1], [0.3, 16.2], [0.7, 17.1], [1, 16.9]]
      },
      {
        slug: 'reason-rail',
        label: 'Reason Rail',
        targetHz: 17.1,
        carrierOffsetHz: 6,
        background: { type: 'asset', assetId: 'papa', mixDb: -24 },
        summary: 'A steady beta line for reasoning, comparison, and structured decisions.',
        description: 'A narrow, reliable beta channel that keeps logic moving forward.',
        tags: ['reason', 'rail'],
        deltaCurve: [[0, 15.3], [0.35, 16.6], [0.72, 17.6], [1, 17.1]]
      },
      {
        slug: 'task-vector',
        label: 'Task Vector',
        targetHz: 18.6,
        carrierOffsetHz: 10,
        masteringStyle: 'warm',
        summary: 'A forward-pushing beta vector for execution and completion.',
        description: 'A more decisive beta shape for moving tasks from thought to action.',
        tags: ['task', 'vector'],
        deltaCurve: [[0, 15.7], [0.35, 17.3], [0.75, 18.8], [1, 18.6]]
      },
      {
        slug: 'reason-spur',
        label: 'Reason Spur',
        targetHz: 16.5,
        carrierOffsetHz: 4,
        noise: { type: 'pink', mixDb: -29 },
        summary: 'A compact beta spur for structured reasoning and quick decisions.',
        description: 'A focused beta drive that nudges logic forward without getting harsh.',
        tags: ['reason', 'spur'],
        deltaCurve: [[0, 15.2], [0.35, 16.4], [0.72, 17.2], [1, 16.5]]
      },
      {
        slug: 'task-sprint',
        label: 'Task Sprint',
        targetHz: 19.4,
        carrierOffsetHz: 13,
        background: { type: 'asset', assetId: 'papa', mixDb: -26 },
        masteringStyle: 'clear',
        summary: 'A brisk beta lane for decisive follow-through and completion.',
        description: 'A faster beta contour built for momentum, action, and task closure.',
        tags: ['task', 'sprint'],
        deltaCurve: [[0, 15.9], [0.35, 17.5], [0.75, 19.1], [1, 19.4]]
      }
    ]
  },
  {
    id: 'gamma-prism-flare',
    name: 'Prism Flare',
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
        slug: 'aha-spark',
        label: 'Aha Spark',
        targetHz: 37.9,
        carrierOffsetHz: 10,
        background: { type: 'asset', assetId: 'papa', mixDb: -29 },
        summary: 'A faster insight burst for quick recognition and mental clarity.',
        description: 'A punchier gamma flash for aha moments and rapid comprehension.',
        tags: ['aha', 'spark'],
        deltaCurve: [[0, 32.5], [0.3, 35.8], [0.7, 37.0], [1, 37.9]]
      },
      {
        slug: 'synthesis-pulse',
        label: 'Synthesis Pulse',
        targetHz: 41.3,
        carrierOffsetHz: -6,
        masteringStyle: 'immersive',
        summary: 'Helps disparate ideas click into a single coherent whole.',
        description: 'A balanced gamma synthesis track for connecting patterns quickly.',
        tags: ['synthesis', 'pulse'],
        deltaCurve: [[0, 31.5], [0.35, 35.5], [0.7, 39.0], [1, 41.3]]
      },
      {
        slug: 'vector-crest',
        label: 'Vector Crest',
        targetHz: 39.8,
        carrierOffsetHz: 6,
        breath: { pattern: 'coherent-5.5', bpm: 5.5, depth: 0.04 },
        summary: 'A steadier gamma crest for precision and conscious awareness.',
        description: 'A softer gamma lane optimized for clarity without strain.',
        tags: ['vector', 'precision'],
        deltaCurve: [[0, 31.8], [0.3, 35.2], [0.7, 37.9], [1, 39.8]]
      },
      {
        slug: 'signal-crown',
        label: 'Signal Crown',
        targetHz: 40.4,
        carrierOffsetHz: -2,
        background: { type: 'asset', assetId: 'mindsEyes', mixDb: -28 },
        breath: { pattern: 'coherent-5.5', bpm: 5.6, depth: 0.05 },
        summary: 'A crowned gamma field for crisp signal, insight, and high coherence.',
        description: 'A bright, steady gamma architecture that keeps attention sharp and centered.',
        tags: ['signal', 'crown'],
        deltaCurve: [[0, 32.1], [0.32, 36.0], [0.7, 39.2], [1, 40.4]]
      },
      {
        slug: 'pattern-bloom',
        label: 'Pattern Bloom',
        targetHz: 38.8,
        carrierOffsetHz: 8,
        masteringStyle: 'immersive',
        summary: 'A blooming gamma field for pattern recognition and synthesis.',
        description: 'A dense but graceful gamma rise that helps connections emerge quickly.',
        tags: ['pattern', 'bloom'],
        deltaCurve: [[0, 31.9], [0.35, 35.0], [0.72, 37.8], [1, 38.8]]
      },
      {
        slug: 'crown-glint',
        label: 'Crown Glint',
        targetHz: 42.2,
        carrierOffsetHz: -7,
        background: { type: 'asset', assetId: 'mindsEyes', mixDb: -29 },
        breath: { pattern: 'coherent-5.5', bpm: 5.6, depth: 0.04 },
        summary: 'A crisp gamma crest for insight flashes and centered awareness.',
        description: 'A bright gamma design with a concentrated sheen and sharp signal.',
        tags: ['crown', 'glint'],
        deltaCurve: [[0, 32.0], [0.32, 36.1], [0.7, 39.4], [1, 42.2]]
      },
      {
        slug: 'prism-surge',
        label: 'Prism Surge',
        targetHz: 37.9,
        carrierOffsetHz: 4,
        noise: { type: 'white', mixDb: -33 },
        masteringStyle: 'warm',
        summary: 'A radiant gamma surge for synthesis, precision, and fast pattern matching.',
        description: 'A slightly softer surge that keeps the gamma field vivid without strain.',
        tags: ['prism', 'surge'],
        deltaCurve: [[0, 31.7], [0.35, 35.1], [0.7, 37.2], [1, 37.9]]
      }
    ]
  }
];

function buildCatalog() {
  return TEMPLATES.flatMap((template) => template.variants.map((variant) => buildToneSpec(template, variant)));
}

async function ensureBucket() {
  const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
  if (error || !data) {
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

async function getExistingFingerprints() {
  const { data, error } = await supabase.from('agentic_tones').select('id,name,state,metadata,created_at');
  if (error) throw error;
  const seen = {
    name: new Set(),
    variantId: new Set(),
    variantSlug: new Set()
  };
  for (const row of data || []) {
    if (row.name) seen.name.add(String(row.name));
    const meta = row.metadata || {};
    if (meta.variantId) seen.variantId.add(String(meta.variantId));
    if (meta.variantSlug) seen.variantSlug.add(String(meta.variantSlug));
  }
  return seen;
}

async function main() {
  console.log('Starting agentic tone batch generation...');
  await ensureBucket();

  const existing = await getExistingFingerprints();
  const catalog = buildCatalog();
  const chosen = [];
  const skipped = [];

  for (const state of BRAIN_STATE_ORDER) {
    const candidates = catalog.filter((spec) => spec.state === state);
    const pickedForState = [];
    for (const spec of candidates) {
      const duplicate = existing.name.has(spec.name)
        || existing.variantId.has(spec.metadata.variantId)
        || existing.variantSlug.has(spec.slug);
      if (duplicate) {
        skipped.push({ state, name: spec.name, reason: 'duplicate' });
        continue;
      }
      pickedForState.push(spec);
      existing.name.add(spec.name);
      existing.variantId.add(spec.metadata.variantId);
      existing.variantSlug.add(spec.slug);
      if (pickedForState.length === 2) break;
    }
    if (pickedForState.length !== 2) {
      throw new Error(`Unable to find 2 unique tones for ${state}`);
    }
    chosen.push(...pickedForState);
  }

  console.log(`Selected ${chosen.length} tones (${chosen.length / BRAIN_STATE_ORDER.length} per state).`);

  const results = [];
  for (const [index, spec] of chosen.entries()) {
    console.log(`[${index + 1}/${chosen.length}] Rendering ${spec.name} (${spec.state}, ${spec.targetHz}Hz)...`);
    const { wavBuffer, webmBuffer } = await renderTrack(spec);
    const trackId = spec.id;
    const wavPath = `${trackId}/master.wav`;
    const webmPath = `${trackId}/master.webm`;

    await supabase.storage.from(BUCKET_NAME).upload(wavPath, wavBuffer, { contentType: 'audio/wav', upsert: true });
    if (webmBuffer) {
      await supabase.storage.from(BUCKET_NAME).upload(webmPath, webmBuffer, { contentType: 'audio/webm', upsert: true });
    }

    const wavUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(wavPath).data.publicUrl;
    const webmUrl = webmBuffer ? supabase.storage.from(BUCKET_NAME).getPublicUrl(webmPath).data.publicUrl : null;

    const row = {
      id: trackId,
      name: spec.name,
      state: spec.state,
      base_freq_hz: spec.baseFreqHz,
      target_hz: spec.targetHz,
      noise_type: spec.noise?.type || null,
      description: spec.description,
      summary: spec.summary,
      modes: spec.modes,
      duration_sec: spec.durationSec,
      wav_url: wavUrl,
      webm_url: webmUrl,
      metadata: {
        ...spec.metadata,
        createdBy: 'scheduled-tone-run',
        source: 'himalaya-scheduled-run',
        sampleRate: SAMPLE_RATE,
        generatedAt: new Date().toISOString(),
        render: {
          mastering: spec.masteringProfile,
          hasBreath: Boolean(spec.breath),
          hasBackground: Boolean(spec.background),
          variantSlug: spec.slug,
          wavUrl,
          webmUrl
        }
      }
    };

    const { error: dbError } = await supabase.from('agentic_tones').upsert(row, { onConflict: 'id' });
    if (dbError) throw dbError;
    results.push({
      id: trackId,
      name: spec.name,
      state: spec.state,
      slug: spec.slug,
      targetHz: spec.targetHz,
      wavUrl,
      webmUrl
    });
    console.log(`Saved ${spec.name}`);
  }

  const ids = results.map((r) => r.id);
  const { data: verifyRows, error: verifyError } = await supabase
    .from('agentic_tones')
    .select('id,name,state,target_hz,metadata')
    .in('id', ids)
    .order('created_at', { ascending: false });
  if (verifyError) throw verifyError;

  const byState = Object.fromEntries(BRAIN_STATE_ORDER.map((state) => [state, 0]));
  for (const row of verifyRows || []) {
    byState[row.state] = (byState[row.state] || 0) + 1;
  }

  console.log(JSON.stringify({
    inserted: results.length,
    byState,
    skipped: skipped.slice(0, 20),
    ids: results.map((r) => ({ id: r.id, slug: r.slug, state: r.state, name: r.name }))
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
