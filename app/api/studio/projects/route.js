import { NextResponse } from 'next/server';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { validateStudioSpec } from '@/lib/studio/spec';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('session_specs')
      .select('id,user_id,name,focus_level,spec,version,created_at,updated_at')
      .eq('user_id', user.id)
      .contains('spec', { kind: 'studio' })
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, projects: data || [] });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);
    const body = await req.json();
    const spec = validateStudioSpec(body.spec);
    const name = String(body.name || 'Untitled Studio Project').trim().slice(0, 120);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('session_specs')
      .insert({ user_id: user.id, name, focus_level: 'F12', spec, version: 1 })
      .select('id,user_id,name,focus_level,spec,version,created_at,updated_at')
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, project: data }, { status: 201 });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
