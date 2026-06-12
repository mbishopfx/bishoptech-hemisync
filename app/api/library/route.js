import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { ensureProfile, jsonError, tryGetAuthenticatedUser } from '@/lib/auth/session';
import { groupLibraryTonesByState, normalizeLibraryTone, BRAIN_STATE_ORDER } from '@/lib/audio/library-groups';
import { savedToneSelect } from '@/lib/social/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { user } = await tryGetAuthenticatedUser(req);
    if (user) {
      await ensureProfile(user);
    }

    const supabase = getSupabaseAdmin();

    const queries = [
      supabase
        .from('agentic_tones')
        .select('id,name,state,target_hz,base_freq_hz,noise_type,duration_sec,wav_url,webm_url,created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('saved_tones')
        .select(savedToneSelect())
        .eq('is_serenity', true)
        .order('created_at', { ascending: false })
    ];

    if (user) {
      queries.push(
        supabase
          .from('saved_tones')
          .select(savedToneSelect())
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      );
    }

    const results = await Promise.all(queries);
    const generated = results[0].data;
    const generatedError = results[0].error;
    const serenity = results[1].data;
    const serenityError = results[1].error;
    const saved = user ? results[2].data : [];
    const savedError = user ? results[2].error : null;

    if (generatedError) throw generatedError;
    if (serenityError) throw serenityError;
    if (savedError) throw savedError;

    const generatedTones = (generated || []).map((tone) => ({
      ...normalizeLibraryTone({
        ...tone,
        sourceType: 'agentic-generated',
        source_type: 'agentic-generated',
        target_state: tone.state,
        targetState: tone.state,
        mp3_url: tone.webm_url || tone.wav_url || null,
        mp3Url: tone.webm_url || tone.wav_url || null
      }),
      visibility: 'public'
    }));

    const serenityTones = (serenity || []).map((tone) => ({
      ...normalizeLibraryTone(tone),
      sourceType: 'serenity',
      source_type: 'serenity'
    }));

    const savedTones = (saved || []).map((tone) => normalizeLibraryTone(tone));
    const tones = [...generatedTones, ...serenityTones, ...savedTones];
    const tonesByState = groupLibraryTonesByState(tones);

    return NextResponse.json({ ok: true, tones, tonesByState, stateOrder: BRAIN_STATE_ORDER });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
