import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FEATURED_STATE_ORDER = ['theta', 'alpha', 'delta', 'beta', 'gamma'];

function normalizeAgenticTone(tone) {
  const playUrl = tone.webm_url || tone.wav_url || tone.mp3_url || null;

  return {
    id: tone.id,
    name: tone.name,
    state: tone.state,
    target_state: tone.state,
    targetState: tone.state,
    target_hz: tone.target_hz,
    targetHz: tone.target_hz,
    base_freq_hz: tone.base_freq_hz,
    baseFreqHz: tone.base_freq_hz,
    duration_sec: tone.duration_sec,
    durationSec: tone.duration_sec,
    description: `${tone.state.charAt(0).toUpperCase() + tone.state.slice(1)} binaural session generated for ${tone.target_hz} Hz entrainment.`,
    summary: `${tone.state.charAt(0).toUpperCase() + tone.state.slice(1)} binaural session generated for ${tone.target_hz} Hz entrainment.`,
    noise_type: tone.noise_type,
    noiseType: tone.noise_type,
    wav_url: tone.wav_url,
    wavUrl: tone.wav_url,
    webm_url: tone.webm_url,
    webmUrl: tone.webm_url,
    playUrl,
    sourceType: 'agentic-generated',
    source_type: 'agentic-generated'
  };
}

function pickFeaturedTone(tones = []) {
  for (const state of FEATURED_STATE_ORDER) {
    const match = tones.find((tone) => tone.state === state);
    if (match) return match;
  }

  return tones[0] || null;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin unavailable' }, { status: 503 });
    }

    const { data, error } = await supabase
      .from('agentic_tones')
      .select('id,name,state,target_hz,base_freq_hz,noise_type,duration_sec,wav_url,webm_url,created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      throw error;
    }

    const featuredTone = pickFeaturedTone(data || []);
    if (!featuredTone) {
      return NextResponse.json({ ok: false, error: 'No generated tones are available yet' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      tone: normalizeAgenticTone(featuredTone),
      total: (data || []).length
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Preview tone unavailable' }, { status: 500 });
  }
}
