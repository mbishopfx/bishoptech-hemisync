import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);
    const { profileId } = await params;
    if (profileId === user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from('follows')
      .upsert({ follower_id: user.id, following_id: profileId });
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
    const { profileId } = await params;
    const { error } = await getSupabaseAdmin()
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', profileId);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
