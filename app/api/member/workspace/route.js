import { NextResponse } from 'next/server';
import { memberErrorResponse, serializeMemberProject, serializeMemberRender, MEMBER_CAPABILITY_ID, MEMBER_CAPABILITY_VERSION } from '@/lib/agentic/member-capability';
import { requirePlatformSubscriber } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { STUDIO_RENDER_BUCKET } from '@/lib/studio/render';
import { getPlatformAccessState } from '@/lib/billing/entitlements';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function serializeTone(tone) {
  return {
    id: tone.id,
    name: tone.name,
    description: tone.description || '',
    targetState: tone.target_state,
    durationSec: tone.duration_sec,
    baseFreqHz: tone.base_freq_hz,
    wavUrl: tone.wav_url,
    mp3Url: tone.mp3_url,
    createdAt: tone.created_at,
    updatedAt: tone.updated_at
  };
}

export async function GET(req) {
  const correlationId = crypto.randomUUID();
  try {
    const { user, profile, access } = await requirePlatformSubscriber(req);
    const supabase = getSupabaseAdmin();
    const [tonesResult, projectsResult, rendersResult] = await Promise.all([
      supabase
        .from('saved_tones')
        .select('id,name,description,target_state,duration_sec,base_freq_hz,wav_url,mp3_url,created_at,updated_at')
        .eq('user_id', user.id)
        .eq('is_serenity', false)
        .order('updated_at', { ascending: false })
        .limit(25),
      supabase
        .from('session_specs')
        .select('id,name,focus_level,spec,version,created_at,updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(25),
      supabase
        .from('renders')
        .select('id,session_id,status,phase,progress,export_formats,created_at,updated_at,bucket')
        .eq('user_id', user.id)
        .eq('bucket', STUDIO_RENDER_BUCKET)
        .order('created_at', { ascending: false })
        .limit(25)
    ]);

    if (tonesResult.error) throw tonesResult.error;
    if (projectsResult.error) throw projectsResult.error;
    if (rendersResult.error) throw rendersResult.error;

    const projects = (projectsResult.data || [])
      .filter((project) => project.spec?.kind === 'studio')
      .map(serializeMemberProject);

    return NextResponse.json({
      capabilityId: MEMBER_CAPABILITY_ID,
      version: MEMBER_CAPABILITY_VERSION,
      correlationId,
      status: 'completed',
      profile: {
        id: user.id,
        username: profile?.username || null,
        displayName: profile?.display_name || profile?.full_name || 'Member'
      },
      access: getPlatformAccessState(profile || access),
      counts: {
        savedTones: tonesResult.data?.length || 0,
        studioProjects: projects.length,
        renders: rendersResult.data?.length || 0
      },
      savedTones: (tonesResult.data || []).map(serializeTone),
      studioProjects: projects,
      renders: (rendersResult.data || []).map(serializeMemberRender)
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const result = memberErrorResponse(error, correlationId);
    return NextResponse.json(result.body, { status: result.status, headers: { 'cache-control': 'no-store' } });
  }
}
