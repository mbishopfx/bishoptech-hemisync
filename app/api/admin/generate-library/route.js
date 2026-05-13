import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { buildSessionBed, encodeOutputs } from '@/lib/audio/engine/pipeline';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes (adjust as needed)

const BUCKET_NAME = 'agentic-tones';

const STATES = [
  { name: 'delta', min: 0.5, max: 4, baseFreqs: [100, 120, 150] },
  { name: 'theta', min: 4, max: 8, baseFreqs: [150, 180, 210] },
  { name: 'alpha', min: 8, max: 14, baseFreqs: [200, 220, 250] },
  { name: 'beta', min: 14, max: 30, baseFreqs: [250, 300, 350] },
  { name: 'gamma', min: 30, max: 50, baseFreqs: [350, 400, 440] }
];

const NOISE_TYPES = ['pink', 'brown', 'none'];

function generateCatalog() {
  const catalog = [];
  for (const state of STATES) {
    for (let i = 0; i < 20; i++) {
      const baseFreq = state.baseFreqs[i % state.baseFreqs.length];
      const targetHz = state.min + (Math.random() * (state.max - state.min));
      const noiseType = NOISE_TYPES[i % NOISE_TYPES.length];
      
      catalog.push({
        name: `${state.name.charAt(0).toUpperCase() + state.name.slice(1)} Session ${i + 1}`,
        state: state.name,
        baseFreqHz: baseFreq,
        targetHz: parseFloat(targetHz.toFixed(2)),
        noiseType: noiseType === 'none' ? null : noiseType,
        modes: {
          binaural: true,
          monaural: i % 4 === 0,
          isochronic: i % 5 === 0
        },
        durationSec: 180
      });
    }
  }
  return catalog;
}

export async function GET(req) {
  // Simple check for local/admin access if possible, or just allow for now since it's an internal tool
  const supabase = getSupabaseAdmin();
  
  // Create bucket if not exists
  await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    allowedMimeTypes: ['audio/wav', 'audio/webm']
  }).catch(() => {}); // Ignore if exists

  const catalog = generateCatalog();
  const results = [];

  // To avoid timeout, we might only generate a few per request
  const searchParams = req.nextUrl.searchParams;
  const start = parseInt(searchParams.get('start') || '0');
  const count = parseInt(searchParams.get('count') || '5');
  const end = Math.min(start + count, catalog.length);

  for (let i = start; i < end; i++) {
    const spec = catalog[i];
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

      await Promise.all([
        supabase.storage.from(BUCKET_NAME).upload(wavPath, wavBuffer, { contentType: 'audio/wav' }),
        supabase.storage.from(BUCKET_NAME).upload(webmPath, webmBuffer, { contentType: 'audio/webm' })
      ]);

      const wavUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(wavPath).data.publicUrl;
      const webmUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(webmPath).data.publicUrl;

      await supabase.from('agentic_tones').insert({
        id: trackId,
        name: spec.name,
        state: spec.state,
        base_freq_hz: spec.baseFreqHz,
        target_hz: spec.targetHz,
        noise_type: spec.noiseType,
        modes: spec.modes,
        duration_sec: spec.durationSec,
        wav_url: wavUrl,
        webm_url: webmUrl,
        metadata: {
          generation_date: new Date().toISOString(),
          sample_rate: 44100
        }
      });

      results.push({ name: spec.name, id: trackId, ok: true });
    } catch (err) {
      results.push({ name: spec.name, ok: false, error: err.message });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
    nextStart: end < catalog.length ? end : null
  });
}
