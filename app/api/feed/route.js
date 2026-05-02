import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { feedPostSelect } from '@/lib/social/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('feed_posts')
      .select(feedPostSelect())
      .in('visibility', ['public', 'followers'])
      .order('created_at', { ascending: false })
      .limit(80);

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, posts: data || [] });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
