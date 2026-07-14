import { NextResponse } from 'next/server';
import { jsonError, requirePlatformSubscriber } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const { user } = await requirePlatformSubscriber(req);
    const { projectId } = await params;
    const body = await req.json().catch(() => ({}));
    const supabase = getSupabaseAdmin();
    const { data: source, error: sourceError } = await supabase
      .from('session_specs')
      .select('name,focus_level,spec,version')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    if (sourceError) throw sourceError;
    const isVersion = body.mode === 'version';
    const { data, error } = await supabase
      .from('session_specs')
      .insert({
        user_id: user.id,
        name: isVersion ? source.name : `${source.name} Copy`,
        focus_level: source.focus_level,
        spec: source.spec,
        version: isVersion ? Number(source.version || 1) + 1 : 1
      })
      .select('id,user_id,name,focus_level,spec,version,created_at,updated_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, project: data }, { status: 201 });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
