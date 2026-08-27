import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import {
  IntentionInputSchema,
  MAX_INTENTION_LENGTH,
  PUBLIC_TONE_CATALOG,
  matchIntentionToTone,
  mergePublicToneRows
} from '@/lib/agentic/tone-capability';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { tryGetAuthenticatedUser } from '@/lib/auth/session';
import { hasPlatformAccess, isFreeSubscriptionTier } from '@/lib/billing/entitlements';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const FREE_TRIAL_LIMIT = 3;
const AgentRequestSchema = z
  .object({
    intention: z.string().trim().min(1).max(MAX_INTENTION_LENGTH).optional(),
    mood: z.string().trim().min(1).max(MAX_INTENTION_LENGTH).optional()
  })
  .strict()
  .refine((body) => Boolean(body.intention || body.mood), { message: 'Intention is required' });

function safeErrorMessage(error) {
  if (error?.status === 400) return error.message || 'Please provide a shorter intention.';
  if (error?.status === 403) return error.message || 'This action is not available for the current account.';
  return 'The tone agent could not complete that request. Please try again.';
}

function getOptionalAdminClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

async function getPublicTonePool(supabase) {
  if (!supabase) return PUBLIC_TONE_CATALOG;

  try {
    const { data, error } = await supabase
      .from('agentic_tones')
      .select('id,name,state,target_hz,base_freq_hz,duration_sec,description,summary,wav_url,webm_url,metadata,created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.length ? mergePublicToneRows(data) : PUBLIC_TONE_CATALOG;
  } catch (error) {
    console.warn('Public tone table unavailable; using the bundled catalog:', error?.message || 'query failed');
    return PUBLIC_TONE_CATALOG;
  }
}

export async function POST(req) {
  let intention;

  try {
    const body = AgentRequestSchema.parse(await req.json());
    intention = body.intention || body.mood;
  } catch (error) {
    return NextResponse.json({ error: error?.issues?.[0]?.message || 'A valid intention is required.' }, { status: 400 });
  }

  try {
    IntentionInputSchema.parse({ intention });

    const { user } = await tryGetAuthenticatedUser(req);
    const supabase = getOptionalAdminClient();
    let subscription = null;

    if (user) {
      if (!supabase) {
        return NextResponse.json({ error: 'Account access is temporarily unavailable. Please try again.' }, { status: 503 });
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('generation_count,subscription_tier,entitlement_type,billing_status,stripe_customer_id,stripe_subscription_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      subscription = profile;

      if (!hasPlatformAccess(subscription)) {
        const error = new Error('Complete the $20 one-time membership to use the full Cognistration platform.');
        error.status = 403;
        error.code = 'SUBSCRIPTION_REQUIRED';
        throw error;
      }
    }

    const cookieStore = await cookies();
    if (!user) {
      const generationCount = Number.parseInt(cookieStore.get('free_gen_count')?.value || '0', 10);
      if (Number.isFinite(generationCount) && generationCount >= FREE_TRIAL_LIMIT) {
        const error = new Error(`You have used your ${FREE_TRIAL_LIMIT} public preview generations. Create an account to continue.`);
        error.status = 403;
        error.code = 'AUTH_REQUIRED';
        throw error;
      }
    }

    const tonePool = await getPublicTonePool(supabase);
    const match = await matchIntentionToTone({ intention, tones: tonePool, useAi: true });
    const track = match.tone;

    let savedToneId = null;
    let usageRecorded = false;

    if (user) {
      const { error: usageError } = await supabase.rpc('increment_generation_count', { user_uuid: user.id });
      if (usageError) throw usageError;
      usageRecorded = true;

      const isFreeTrial = isFreeSubscriptionTier(subscription?.subscription_tier);
      let shouldSave = true;

      if (isFreeTrial) {
        const { count, error: countError } = await supabase
          .from('saved_tones')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_serenity', false);

        if (!countError && count >= 5) shouldSave = false;
      }

      if (shouldSave) {
        const { data: savedTone, error: saveError } = await supabase
          .from('saved_tones')
          .insert({
            user_id: user.id,
            name: track.name,
            description: `Matched by Cognistration Agent for intention: "${intention.slice(0, 80)}"`,
            target_state: track.state,
            base_freq_hz: track.baseFreqHz,
            duration_sec: track.durationSec,
            wav_url: track.wavUrl,
            mp3_url: track.mp3Url || track.wavUrl,
            visibility: 'private',
            frequency_plan: {
              sourceType: 'homepage-generated',
              isAgentic: true,
              isHomepagePreview: true,
              homepageToneId: track.id,
              matchedIntention: intention,
              targetHz: track.targetHz
            }
          })
          .select('id')
          .single();

        if (!saveError && savedTone) savedToneId = savedTone.id;
      }
    } else {
      const currentCount = Number.parseInt(cookieStore.get('free_gen_count')?.value || '0', 10);
      cookieStore.set('free_gen_count', String((Number.isFinite(currentCount) ? currentCount : 0) + 1), {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        sameSite: 'lax'
      });
    }

    return NextResponse.json({
      ok: true,
      capabilityId: match.capabilityId,
      version: match.version,
      correlationId: match.correlationId,
      agentMessage: match.response,
      matchMode: match.matchMode,
      usage: { recorded: usageRecorded, publicPreview: !user },
      track: {
        id: track.id,
        name: track.name,
        state: track.state,
        targetState: track.targetState || track.state,
        targetHz: track.targetHz,
        baseFreqHz: track.baseFreqHz,
        durationSec: track.durationSec,
        summary: track.summary,
        wavUrl: track.wavUrl,
        webmUrl: track.webmUrl,
        mp3Url: track.mp3Url,
        sourceType: track.sourceType,
        savedToneId
      }
    });
  } catch (error) {
    console.error('Agent API error:', error?.message || 'unknown failure');
    const response = NextResponse.json({
      error: safeErrorMessage(error),
      ...(error?.code ? { code: error.code } : {})
    }, { status: error?.status || 500 });

    if (error?.code === 'AUTH_REQUIRED') response.headers.set('Cache-Control', 'no-store');
    return response;
  }
}
