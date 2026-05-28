import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { savedToneSelect } from '@/lib/social/serializers';
import { scoreToneEffectiveness } from '@/lib/social/tone-effectiveness';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function cleanTonePayload(body = {}) {
  const frequencyPlan = body.frequency_plan || body.frequencyPlan || {};
  const deltaPath = body.delta_path || body.deltaPath || frequencyPlan.deltaPath || [];
  const targetState = body.target_state || body.targetState || null;
  const durationSec = body.duration_sec || body.durationSec || null;
  const baseFreqHz = body.base_freq_hz || body.baseFreqHz || null;
  const effectiveness = scoreToneEffectiveness({
    targetState,
    durationSec,
    baseFreqHz,
    deltaPath,
    stages: body.stages || frequencyPlan.stages,
    breathPattern: body.breathPattern || frequencyPlan.breathPattern
  });

  return {
    source_session_id: body.source_session_id || body.sourceSessionId || null,
    render_id: body.render_id || body.renderId || null,
    name: String(body.name || 'Untitled tone').trim().slice(0, 120),
    description: String(body.description || '').trim().slice(0, 1200),
    cover_image_url: body.cover_image_url || body.coverImageUrl || null,
    target_state: targetState || effectiveness.targetState,
    frequency_plan: { ...frequencyPlan, effectiveness },
    duration_sec: durationSec,
    base_freq_hz: baseFreqHz,
    delta_path: deltaPath,
    wav_url: body.wav_url || body.wavUrl || null,
    mp3_url: body.mp3_url || body.mp3Url || null,
    artifact_id: body.artifact_id || body.artifactId || null,
    visibility: body.visibility || 'private'
  };
}

export async function POST(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);
    const supabase = getSupabaseAdmin();
    const payload = cleanTonePayload(await req.json());

    // 1. Get user subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    const isFreeTrial = profile?.subscription_tier === 'none' || profile?.subscription_tier === 'free';

    // 2. Enforce 5-tone library limit on Free Trial users
    if (isFreeTrial) {
      // Force visibility to private for free tier
      payload.visibility = 'private';

      // Count user's active non-serenity tones
      const { count, error: countError } = await supabase
        .from('saved_tones')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_serenity', false);

      if (countError) throw countError;

      if (count >= 5) {
        return NextResponse.json({
          error: 'Limit Reached',
          code: 'LIBRARY_LIMIT_REACHED',
          message: 'Free trial members are limited to 5 saved tones in their library. Please upgrade to a paid subscription to save unlimited NeuroSync frequencies!'
        }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('saved_tones')
      .insert({ ...payload, user_id: user.id })
      .select(savedToneSelect())
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, tone: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
