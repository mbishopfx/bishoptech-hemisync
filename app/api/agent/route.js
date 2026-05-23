import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { matchMoodToTone } from '@/lib/ai/gemini-matcher';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const FREE_TRIAL_LIMIT = 3;

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
    let subscription = null;
    
    const supabase = getSupabaseAdmin();

    if (token) {
      const { data: userData } = await supabase.auth.getUser(token);
      user = userData?.user;
      
      if (user) {
          // Check profile for generation count and subscription status
          const { data: profile } = await supabase
            .from('profiles')
            .select('generation_count, subscription_tier, trial_expires_at')
            .eq('id', user.id)
            .single();
          
          subscription = profile;
      }
    }

    // Trial / Subscription logic
    const cookieStore = await cookies();
    
    if (!user) {
      // Unauthenticated Trial
      const genCount = parseInt(cookieStore.get('free_gen_count')?.value || '0');
      
      if (genCount >= FREE_TRIAL_LIMIT) {
        return NextResponse.json({ 
          error: 'Free limit reached', 
          code: 'AUTH_REQUIRED',
          message: 'You have used your 7 free trial generations. Please create an account to continue.' 
        }, { status: 403 });
      }
    } else {
      // Authenticated User Logic
      if (subscription.subscription_tier === 'none') {
          if (subscription.generation_count >= FREE_TRIAL_LIMIT) {
              return NextResponse.json({
                  error: 'Trial expired',
                  code: 'SUBSCRIPTION_REQUIRED',
                  message: 'Your 7-day trial has concluded. Upgrade to Basic ($9) or Full ($19) to continue.'
              }, { status: 403 });
          }
      }
    }

    // Match mood to tone
    const { trackId, response: agentMessage } = await matchMoodToTone(mood);

    // Fetch track details
    const { data: track, error: trackError } = await supabase
      .from('agentic_tones')
      .select('*')
      .eq('id', trackId)
      .single();

    if (trackError || !track) {
      throw new Error('Selected track not found in library');
    }

    // Update usage and Auto-Save matched tone to user library
    if (user) {
        await supabase.rpc('increment_generation_count', { user_uuid: user.id });

        const isFreeTrial = subscription?.subscription_tier === 'none' || subscription?.subscription_tier === 'free';

        let shouldSave = true;
        if (isFreeTrial) {
          // Count active non-serenity tones
          const { count, error: countError } = await supabase
            .from('saved_tones')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_serenity', false);

          if (!countError && count >= 5) {
            shouldSave = false; // Skip saving to library, user is at limit
          }
        }

        if (shouldSave) {
          // Save matched tone to user library
          await supabase
            .from('saved_tones')
            .insert({
              user_id: user.id,
              name: track.name,
              description: `Matched by HemiSync Agent for mood: "${mood.slice(0, 80)}"`,
              target_state: track.state,
              base_freq_hz: track.base_freq_hz || 220,
              duration_sec: track.duration_sec || 300,
              wav_url: track.wav_url,
              mp3_url: track.webm_url || track.wav_url || null,
              visibility: 'private',
              frequency_plan: {
                sourceType: 'agentic-matched',
                isAgentic: true,
                matchedMood: mood,
                targetHz: track.target_hz,
                noiseType: track.noise_type
              }
            });
        }
    } else {
        const currentCount = parseInt(cookieStore.get('free_gen_count')?.value || '0');
        cookieStore.set('free_gen_count', (currentCount + 1).toString(), { 
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/' 
        });
    }

    return NextResponse.json({
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

  } catch (err) {
    console.error('Agent API error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
