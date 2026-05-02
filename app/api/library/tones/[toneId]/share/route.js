import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { feedPostSelect } from '@/lib/social/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { toneId } = await params;
    const body = await req.json().catch(() => ({}));
    const supabase = getSupabaseAdmin();

    const { data: tone, error: toneError } = await supabase
      .from('saved_tones')
      .update({ visibility: 'public', updated_at: new Date().toISOString() })
      .eq('id', toneId)
      .eq('user_id', user.id)
      .select('id,name,description')
      .single();

    if (toneError) throw toneError;

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        user_id: user.id,
        tone_id: tone.id,
        post_type: 'tone',
        body: String(body.body || tone.description || `Shared ${tone.name}`).trim(),
        visibility: 'public'
      })
      .select(feedPostSelect())
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, post: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
