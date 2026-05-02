import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);
    const { postId } = await params;
    const body = await req.json();
    const comment = String(body?.body || '').trim();
    if (!comment) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: user.id, body: comment })
      .select('id,post_id,user_id,body,created_at,profiles(id,username,display_name,avatar_url)')
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, comment: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
