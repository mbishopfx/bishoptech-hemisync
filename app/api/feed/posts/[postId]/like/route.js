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
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('post_likes').upsert({ post_id: postId, user_id: user.id });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const { postId } = await params;
    const { error } = await getSupabaseAdmin()
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
