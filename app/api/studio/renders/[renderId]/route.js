import { NextResponse } from 'next/server';
import { jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { STUDIO_RENDER_BUCKET } from '@/lib/studio/render';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { renderId } = await params;
    const { data, error } = await getSupabaseAdmin()
      .from('renders')
      .select('id,session_id,user_id,bucket,wav_path,mp3_path,status,phase,progress,error,metadata,validation,export_formats,delivery_email_sent_at,delivery_email_error,created_at,updated_at,session_specs(name,version,spec)')
      .eq('id', renderId)
      .eq('user_id', user.id)
      .eq('bucket', STUDIO_RENDER_BUCKET)
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, render: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
