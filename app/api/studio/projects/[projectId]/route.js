import { NextResponse } from 'next/server';
import { jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { validateStudioSpec } from '@/lib/studio/spec';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { projectId } = await params;
    const { data, error } = await getSupabaseAdmin()
      .from('session_specs')
      .select('id,user_id,name,focus_level,spec,version,created_at,updated_at')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, project: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { projectId } = await params;
    const body = await req.json();
    const patch = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) patch.name = String(body.name).trim().slice(0, 120);
    if (body.spec !== undefined) patch.spec = validateStudioSpec(body.spec);
    const { data, error } = await getSupabaseAdmin()
      .from('session_specs')
      .update(patch)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .select('id,user_id,name,focus_level,spec,version,created_at,updated_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, project: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
