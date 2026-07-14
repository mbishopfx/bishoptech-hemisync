import { NextResponse } from 'next/server';
import { jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { renderStudioProject, STUDIO_RENDER_BUCKET, uploadStudioRender } from '@/lib/studio/render';
import { getRenderClaimDecision } from '@/lib/studio/lifecycle';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 900;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400'
};

function corsJson(body, init = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: { ...CORS_HEADERS, ...(init.headers || {}) }
  });
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req, { params }) {
  let renderId = null;
  let userId = null;
  const supabase = getSupabaseAdmin();
  try {
    const { user } = await requireAuthenticatedUser(req);
    userId = user.id;
    ({ renderId } = await params);
    const { data: record, error: recordError } = await supabase
      .from('renders')
      .select('id,session_id,status,phase,updated_at,session_specs(name,spec)')
      .eq('id', renderId)
      .eq('user_id', user.id)
      .eq('bucket', STUDIO_RENDER_BUCKET)
      .single();
    if (recordError) throw recordError;
    const claimDecision = getRenderClaimDecision(record);
    if (claimDecision === 'completed') {
      return corsJson({ ok: true, alreadyCompleted: true, renderId });
    }
    if (claimDecision === 'running') {
      return corsJson({ error: 'This render is already running' }, { status: 409 });
    }

    const claimedAt = new Date().toISOString();
    const { data: claim, error: claimError } = await supabase.from('renders').update({
      status: 'rendering', phase: 'rendering', progress: 15, error: null, updated_at: claimedAt
    })
      .eq('id', renderId)
      .eq('user_id', user.id)
      .eq('updated_at', record.updated_at)
      .select('id')
      .maybeSingle();
    if (claimError) throw claimError;
    if (!claim) {
      return corsJson({ error: 'This render was claimed by another worker' }, { status: 409 });
    }

    const output = await renderStudioProject(record.session_specs.spec);
    await supabase.from('renders').update({
      status: 'rendering', phase: 'uploading', progress: 75, updated_at: new Date().toISOString()
    }).eq('id', renderId).eq('user_id', user.id);

    const paths = await uploadStudioRender({
      supabase,
      userId: user.id,
      renderId,
      wavBuffer: output.wavBuffer,
      mp3Buffer: output.mp3Buffer
    });
    await supabase.from('renders').update({
      status: 'rendering', phase: 'validating', progress: 92, updated_at: new Date().toISOString()
    }).eq('id', renderId).eq('user_id', user.id);

    const metadata = {
      durationSec: output.spec.durationSec,
      sampleRate: output.validation.sampleRate,
      channels: 2,
      exportProfile: 'premium',
      mastering: output.mastering,
      journey: output.journey
    };
    const { data, error } = await supabase
      .from('renders')
      .update({
        wav_path: paths.wav,
        mp3_path: paths.mp3,
        status: 'completed',
        phase: 'completed',
        progress: 100,
        metadata,
        validation: output.validation,
        error: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', renderId)
      .eq('user_id', user.id)
      .select('id,status,phase,progress,wav_path,mp3_path,validation,metadata')
      .single();
    if (error) throw error;
    return corsJson({ ok: true, render: data });
  } catch (error) {
    if (renderId && userId && supabase) {
      await supabase.from('renders').update({
        status: 'failed',
        phase: 'failed',
        progress: 0,
        error: error.message || 'Render failed',
        validation: error.validation || {},
        updated_at: new Date().toISOString()
      }).eq('id', renderId).eq('user_id', userId);
    }
    const { body, status } = jsonError(error);
    return corsJson(body, { status });
  }
}
