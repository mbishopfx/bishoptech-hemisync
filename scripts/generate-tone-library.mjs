import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const engine = await import('../lib/audio/engine/pipeline.js');
const { buildSessionBed, encodeOutputs } = engine;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'agentic-tones';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const STATES = [
  { 
    name: 'delta', 
    min: 0.5, 
    max: 4, 
    baseFreqs: [100, 120, 150],
    descriptions: [
      "Deep restorative sleep and physical healing.",
      "Unconscious mind access and profound detachment.",
      "Immune system boost and cellular regeneration."
    ],
    summaries: [
      "Slowest brainwaves for dreamless sleep and total body reset.",
      "Ideal for recovery after extreme physical or mental exertion.",
      "Deeply grounding frequency for cellular-level restoration."
    ]
  },
  { 
    name: 'theta', 
    min: 4, 
    max: 8, 
    baseFreqs: [150, 180, 210],
    descriptions: [
      "Deep meditation and creative visualization.",
      "Hypnagogic state for memory consolidation and learning.",
      "Emotional release and internal processing."
    ],
    summaries: [
      "The gateway to the subconscious, perfect for creative breakthroughs.",
      "Deep relaxation that maintains a spark of conscious awareness.",
      "Vivid mental imagery and reduced anxiety via internal focus."
    ]
  },
  { 
    name: 'alpha', 
    min: 8, 
    max: 14, 
    baseFreqs: [200, 220, 250],
    descriptions: [
      "Relaxed alertness and light meditation.",
      "Stress reduction and improved mental coordination.",
      "Flow state entry and calm productivity."
    ],
    summaries: [
      "Calm, focused state for brainstorming and light cognitive tasks.",
      "Reduces cortisol and bridges the gap between active and deep rest.",
      "Optimal for reading, writing, and entering a productive 'flow'."
    ]
  },
  { 
    name: 'beta', 
    min: 14, 
    max: 30, 
    baseFreqs: [250, 300, 350],
    descriptions: [
      "Active concentration and analytical thinking.",
      "Problem solving and logical processing.",
      "High-level focus for complex data analysis."
    ],
    summaries: [
      "Sharpens the analytical mind for intensive work or study.",
      "Increases attention span and speeds up logical decision-making.",
      "High-alert frequency for mastering complex new information."
    ]
  },
  { 
    name: 'gamma', 
    min: 30, 
    max: 50, 
    baseFreqs: [350, 400, 440],
    descriptions: [
      "Peak mental performance and cognitive enhancement.",
      "Hyper-awareness and information synthesis.",
      "Spiritual insight and expanded consciousness."
    ],
    summaries: [
      "Highest level of cognitive processing for 'Aha!' moments.",
      "Unifies different parts of the brain for total mental clarity.",
      "Extreme focus and heightened sensory perception."
    ]
  }
];

const NOISE_TYPES = ['pink', 'brown', 'none'];

function generateCatalog() {
  const catalog = [];
  for (const state of STATES) {
    for (let i = 0; i < 20; i++) {
      const baseFreq = state.baseFreqs[i % state.baseFreqs.length];
      const targetHz = state.min + (Math.random() * (state.max - state.min));
      const noiseType = NOISE_TYPES[i % NOISE_TYPES.length];
      const metaIndex = i % state.descriptions.length;
      
      catalog.push({
        name: `${state.name.charAt(0).toUpperCase() + state.name.slice(1)} Node ${i + 1}`,
        state: state.name,
        baseFreqHz: baseFreq,
        targetHz: parseFloat(targetHz.toFixed(2)),
        noiseType: noiseType === 'none' ? null : noiseType,
        description: state.descriptions[metaIndex],
        summary: state.summaries[metaIndex],
        modes: {
          binaural: true,
          monaural: true,
          isochronic: i % 2 === 0
        },
        durationSec: 180
      });
    }
  }
  return catalog;
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

async function run() {
  console.log('Starting tone library generation...');
  await ensureBucket();

  const catalog = generateCatalog();
  console.log(`Generated catalog with ${catalog.length} track definitions.`);

  for (let i = 0; i < catalog.length; i++) {
    const spec = catalog[i];
    console.log(`[${i + 1}/100] Generating ${spec.name} (${spec.state} @ ${spec.targetHz}Hz)...`);

    try {
      const bed = await buildSessionBed({
        lengthSec: spec.durationSec,
        sampleRate: 44100,
        baseFreqHz: spec.baseFreqHz,
        deltaOverrides: { from: spec.targetHz, to: spec.targetHz },
        noise: spec.noiseType ? { type: spec.noiseType, mixDb: -26 } : null,
        modes: spec.modes
      });

      const { wavBuffer, webmBuffer } = await encodeOutputs({
        left: bed.left,
        right: bed.right,
        sampleRate: bed.sampleRate,
        wavBitDepthCode: '16',
        withWebm: true,
        kbps: 64
      });

      const trackId = randomUUID();
      const wavPath = `${trackId}/master.wav`;
      const webmPath = `${trackId}/master.webm`;

      console.log(`Uploading to storage...`);
      await Promise.all([
        supabase.storage.from(BUCKET_NAME).upload(wavPath, wavBuffer, { contentType: 'audio/wav' }),
        supabase.storage.from(BUCKET_NAME).upload(webmPath, webmBuffer, { contentType: 'audio/webm' })
      ]);

      const wavUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(wavPath).data.publicUrl;
      const webmUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(webmPath).data.publicUrl;

      console.log(`Saving metadata to database...`);
      const { error: dbError } = await supabase.from('agentic_tones').insert({
        id: trackId,
        name: spec.name,
        state: spec.state,
        base_freq_hz: spec.baseFreqHz,
        target_hz: spec.targetHz,
        noise_type: spec.noiseType,
        description: spec.description,
        summary: spec.summary,
        modes: spec.modes,
        duration_sec: spec.durationSec,
        wav_url: wavUrl,
        webm_url: webmUrl,
        metadata: {
          generation_date: new Date().toISOString(),
          sample_rate: 44100,
          quality: 'high-stereo'
        }
      });

      if (dbError) throw dbError;
      console.log(`Success: ${spec.name}`);

    } catch (err) {
      console.error(`Failed to generate ${spec.name}:`, err);
    }
  }

  console.log('Library generation complete.');
}

run();
