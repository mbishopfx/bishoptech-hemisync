import { NextResponse } from 'next/server';
import { jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { STUDIO_RENDER_BUCKET } from '@/lib/studio/render';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const RENDER_SELECT = 'id,session_id,user_id,bucket,wav_path,mp3_path,status,phase,progress,error,metadata,validation,export_formats,delivery_email_sent_at,delivery_email_error,created_at,updated_at,session_specs(name,version,spec)';

export async function GET(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { data, error } = await getSupabaseAdmin()
      .from('renders')
      .select(RENDER_SELECT)
      .eq('user_id', user.id)
      .eq('bucket', STUDIO_RENDER_BUCKET)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return NextResponse.json({ ok: true, renders: data || [] });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { projectId } = await req.json();
    const supabase = getSupabaseAdmin();
    const { data: project, error: projectError } = await supabase
      .from('session_specs')
      .select('id,spec')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    if (projectError) throw projectError;
    if (project.spec?.kind !== 'studio') {
      const error = new Error('Only Studio projects can use the Studio renderer');
      error.status = 400;
      throw error;
    }
    const { data, error } = await supabase
      .from('renders')
      .insert({
        session_id: project.id,
        user_id: user.id,
        bucket: STUDIO_RENDER_BUCKET,
        status: 'queued',
        phase: 'queued',
        progress: 0,
        export_formats: project.spec.exportFormats,
        metadata: { durationSec: project.spec.durationSec, exportProfile: 'premium' }
      })
      .select(RENDER_SELECT)
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, render: data }, { status: 201 });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
