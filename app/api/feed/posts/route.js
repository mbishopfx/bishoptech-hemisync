import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { feedPostSelect } from '@/lib/social/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .single();

    if (profile?.subscription_tier === 'none' || profile?.subscription_tier === 'free') {
      return NextResponse.json({
        error: 'Subscription Required',
        code: 'BROADCAST_BLOCKED',
        message: 'Free trial members cannot broadcast posts or attach public waves to the global feed. Please upgrade to a paid plan to publish your frequencies!'
      }, { status: 403 });
    }

    const postType = body?.toneId ? 'tone' : 'text';
    const text = String(body?.body || '').trim();
    if (!text && postType === 'text') {
      return NextResponse.json({ error: 'Post body is required' }, { status: 400 });
    }

    if (body?.toneId) {
      const { error: toneError } = await supabase
        .from('saved_tones')
        .update({ visibility: 'public', updated_at: new Date().toISOString() })
        .eq('id', body.toneId)
        .eq('user_id', user.id);

      if (toneError) {
        throw toneError;
      }
    }

    const { data, error } = await supabase
      .from('feed_posts')
      .insert({
        user_id: user.id,
        tone_id: body?.toneId || null,
        post_type: postType,
        body: text,
        visibility: body?.visibility || 'public'
      })
      .select(feedPostSelect())
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, post: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
