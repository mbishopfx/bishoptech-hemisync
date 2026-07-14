import { NextResponse } from 'next/server';
import { jsonError, requirePlatformSubscriber } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { STUDIO_RENDER_BUCKET } from '@/lib/studio/render';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const { user } = await requirePlatformSubscriber(req);
    const { renderId } = await params;
    const supabase = getSupabaseAdmin();
    const { data: record, error } = await supabase
      .from('renders')
      .select('id,status,wav_path,mp3_path,session_specs(name)')
      .eq('id', renderId)
      .eq('user_id', user.id)
      .eq('bucket', STUDIO_RENDER_BUCKET)
      .single();
    if (error) throw error;
    if (record.status !== 'completed') {
      return NextResponse.json({ error: 'Render is not complete' }, { status: 409 });
    }
    const entries = await Promise.all(['wav', 'mp3'].map(async (format) => {
      const path = record[`${format}_path`];
      if (!path) return [format, null];
      const { data, error: signedError } = await supabase.storage
        .from(STUDIO_RENDER_BUCKET)
        .createSignedUrl(path, 60 * 60, { download: `${record.session_specs.name}.${format}` });
      if (signedError) throw signedError;
      return [format, data.signedUrl];
    }));
    return NextResponse.json({ ok: true, downloads: Object.fromEntries(entries) });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
