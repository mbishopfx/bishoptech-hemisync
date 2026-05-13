import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { matchMoodToTone } from '@/lib/ai/gemini-matcher';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getBearerToken } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const body = await req.json();
    const { mood } = body;

    if (!mood) {
      return NextResponse.json({ error: 'Mood is required' }, { status: 400 });
    }

    // Check authentication
    const token = req.headers.get('authorization')?.split(' ')[1];
    let user = null;
    
    if (token) {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase.auth.getUser(token);
      user = data?.user;
    }

    // If not logged in, check for free tier
    if (!user) {
      const cookieStore = await cookies();
      const freeGenUsed = cookieStore.get('free_gen_used');
      
      if (freeGenUsed) {
        return NextResponse.json({ 
          error: 'Free limit reached', 
          code: 'AUTH_REQUIRED',
          message: 'Please create an account to continue exploring your brain states.' 
        }, { status: 403 });
      }
    }

    // Match mood to tone
    const { trackId, response: agentMessage } = await matchMoodToTone(mood);

    // Fetch track details
    const supabase = getSupabaseAdmin();
    const { data: track, error: trackError } = await supabase
      .from('agentic_tones')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      throw new Error('Selected track not found in library');
    }

    const res = NextResponse.json({
      ok: true,
      agentMessage,
      track: {
        id: track.id,
        name: track.name,
        state: track.state,
        targetHz: track.target_hz,
        wavUrl: track.wav_url,
        webmUrl: track.webm_url
      }
    });

    // Mark free gen as used if not logged in
    if (!user) {
      const cookieStore = await cookies();
      cookieStore.set('free_gen_used', 'true', { 
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/' 
      });
    }

    return res;

  } catch (err) {
    console.error('Agent API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
