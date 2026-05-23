import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { profileSelect } from '@/lib/social/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function cleanProfilePatch(body = {}) {
  const allowed = [
    'username',
    'display_name',
    'bio',
    'avatar_url',
    'cover_url',
    'website_url',
    'x_url',
    'instagram_url',
    'youtube_url',
    'tiktok_url',
    'profile_visibility',
    'onboarding_complete'
  ];
  const patch = {};

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      patch[key] = typeof body[key] === 'string' ? body[key].trim() : body[key];
    }
  }

  if (patch.username) {
    patch.username = patch.username.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 32);
  }

  return patch;
}

export async function GET(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    const profile = await ensureProfile(user);

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}

export async function PATCH(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);

    const supabase = getSupabaseAdmin();
    const patch = cleanProfilePatch(await req.json());

    const { data, error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select(profileSelect())
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, profile: data });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
