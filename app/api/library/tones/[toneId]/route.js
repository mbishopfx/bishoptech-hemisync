import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { savedToneSelect } from '@/lib/social/serializers';
import { scoreToneEffectiveness } from '@/lib/social/tone-effectiveness';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function cleanPatch(body = {}) {
  const allowed = [
    'name',
    'description',
    'cover_image_url',
    'target_state',
    'frequency_plan',
    'duration_sec',
    'base_freq_hz',
    'delta_path',
    'wav_url',
    'mp3_url',
    'visibility'
  ];
  const patch = {};

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      patch[key] = body[key];
    }
  }

  if (body.coverImageUrl) patch.cover_image_url = body.coverImageUrl;
  if (body.targetState) patch.target_state = body.targetState;
  if (body.frequencyPlan) patch.frequency_plan = body.frequencyPlan;
  if (body.deltaPath) patch.delta_path = body.deltaPath;

  if (patch.frequency_plan || patch.delta_path || patch.target_state || patch.duration_sec || patch.base_freq_hz) {
    patch.frequency_plan = {
      ...(patch.frequency_plan || body.frequencyPlan || {}),
      effectiveness: scoreToneEffectiveness({
        targetState: patch.target_state,
        durationSec: patch.duration_sec,
        baseFreqHz: patch.base_freq_hz,
        deltaPath: patch.delta_path
      })
    };
  }

  patch.updated_at = new Date().toISOString();
  return patch;
}

export async function PATCH(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { toneId } = await params;
    const { data, error } = await getSupabaseAdmin()
      .from('saved_tones')
      .update(cleanPatch(await req.json()))
      .eq('id', toneId)
      .eq('user_id', user.id)
      .select(savedToneSelect())
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, tone: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { toneId } = await params;
    const { error } = await getSupabaseAdmin()
      .from('saved_tones')
      .delete()
      .eq('id', toneId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
