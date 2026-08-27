import { NextResponse } from 'next/server';
import { buildMemberSessionPlan, MemberPlanInputSchema, memberErrorResponse, serializeMemberProject, serializeMemberRender } from '@/lib/agentic/member-capability';
import { requirePlatformSubscriber } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { STUDIO_RENDER_BUCKET } from '@/lib/studio/render';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function confirmationError() {
  const error = new Error('Explicit confirmation is required before a private session is created');
  error.status = 400;
  error.code = 'CONFIRMATION_REQUIRED';
  return error;
}

function idempotencyError() {
  const error = new Error('Use a valid idempotency key');
  error.status = 400;
  error.code = 'INVALID_IDEMPOTENCY_KEY';
  return error;
}

async function findExistingRequest(supabase, userId, idempotencyKey) {
  if (!idempotencyKey) return null;
  const { data, error } = await supabase
    .from('session_specs')
    .select('id,name,focus_level,spec,version,created_at,updated_at')
    .eq('user_id', userId)
    .contains('spec', { agenticRequestId: idempotencyKey })
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

async function latestRenderForProject(supabase, userId, projectId) {
  const { data, error } = await supabase
    .from('renders')
    .select('id,session_id,status,phase,progress,export_formats,created_at,updated_at,bucket')
    .eq('user_id', userId)
    .eq('session_id', projectId)
    .eq('bucket', STUDIO_RENDER_BUCKET)
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
}

export async function POST(req) {
  const correlationId = crypto.randomUUID();
  try {
    const body = await req.json();
    if (body?.confirmed !== true) throw confirmationError();

    const input = MemberPlanInputSchema.parse({
      intention: body?.intention,
      durationSec: body?.durationSec,
      targetState: body?.targetState,
      name: body?.name,
      idempotencyKey: body?.idempotencyKey
    });
    if (input.idempotencyKey && !/^[A-Za-z0-9._:-]{8,80}$/.test(input.idempotencyKey)) throw idempotencyError();

    const { user } = await requirePlatformSubscriber(req);
    const supabase = getSupabaseAdmin();
    const existingProject = await findExistingRequest(supabase, user.id, input.idempotencyKey);
    if (existingProject) {
      const existingRender = await latestRenderForProject(supabase, user.id, existingProject.id);
      const plan = await buildMemberSessionPlan(input, { useAi: false });
      return NextResponse.json({
        ...plan,
        correlationId,
        idempotentReplay: true,
        project: serializeMemberProject(existingProject),
        render: serializeMemberRender(existingRender),
        nextAction: existingRender ? `/api/studio/renders/${existingRender.id}/run` : null
      }, { headers: { 'cache-control': 'no-store' } });
    }

    const plan = await buildMemberSessionPlan(input, { useAi: false });
    const spec = {
      ...plan.studioSpec,
      agenticRequestId: input.idempotencyKey || null,
      agenticSource: 'member_webmcp'
    };
    const { data: project, error: projectError } = await supabase
      .from('session_specs')
      .insert({
        user_id: user.id,
        name: plan.suggestedName,
        focus_level: 'F12',
        spec,
        version: 3
      })
      .select('id,name,focus_level,spec,version,created_at,updated_at')
      .single();
    if (projectError) throw projectError;

    const { data: render, error: renderError } = await supabase
      .from('renders')
      .insert({
        session_id: project.id,
        user_id: user.id,
        bucket: STUDIO_RENDER_BUCKET,
        status: 'queued',
        phase: 'queued',
        progress: 0,
        export_formats: ['mp3'],
        metadata: { durationSec: plan.studioSpec.durationSec, exportProfile: 'premium', source: 'member_webmcp' }
      })
      .select('id,session_id,status,phase,progress,export_formats,created_at,updated_at,bucket')
      .single();
    if (renderError) throw renderError;

    return NextResponse.json({
      ...plan,
      correlationId,
      project: serializeMemberProject(project),
      render: serializeMemberRender(render),
      nextAction: `/api/studio/renders/${render.id}/run`
    }, { status: 201, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const result = memberErrorResponse(error, correlationId);
    return NextResponse.json(result.body, { status: result.status, headers: { 'cache-control': 'no-store' } });
  }
}
