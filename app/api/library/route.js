import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, requireAuthenticatedUser } from '@/lib/auth/session';
import { buildPreviewToneLibraryEntries } from '@/lib/audio/preview-tones';
import { groupLibraryTonesByState, normalizeLibraryTone, BRAIN_STATE_ORDER } from '@/lib/audio/library-groups';
import { savedToneSelect } from '@/lib/social/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);

    const { data, error } = await getSupabaseAdmin()
      .from('saved_tones')
      .select(savedToneSelect())
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const previewTones = buildPreviewToneLibraryEntries().map(normalizeLibraryTone);
    const savedTones = (data || []).map(normalizeLibraryTone);
    const tones = [...previewTones, ...savedTones];
    const tonesByState = groupLibraryTonesByState(tones);

    return NextResponse.json({ ok: true, tones, tonesByState, stateOrder: BRAIN_STATE_ORDER });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
