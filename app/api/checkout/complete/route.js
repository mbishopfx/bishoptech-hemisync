import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function getProfilePlan(planId) {
  if (planId === 'lifetime') return 'founder';
  if (planId === 'premium') return 'pro';
  return 'free';
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe secret missing' }, { status: 503 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin unavailable' }, { status: 503 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const stripe = new Stripe(stripeSecret);
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    const planId = checkoutSession.metadata?.planId || 'lifetime';
    const userId = checkoutSession.client_reference_id || checkoutSession.metadata?.user_uuid;

    if (!userId || userId !== authData.user.id) {
      return NextResponse.json({ error: 'Checkout session does not belong to this account' }, { status: 403 });
    }

    if (planId === 'tone-pack-foundations') {
      await supabase
        .from('tone_pack_purchases')
        .upsert(
          {
            user_id: userId,
            pack_slug: checkoutSession.metadata?.packSlug || 'foundations-pack',
            pack_name: 'Foundations Pack',
            price_id: checkoutSession.metadata?.priceId || 'pending',
            stripe_session_id: checkoutSession.id,
            stripe_customer_id: checkoutSession.customer || null,
            stripe_payment_intent_id: checkoutSession.payment_intent || null,
            status: 'active',
            metadata: {
              planId,
              source: 'stripe-session-sync'
            }
          },
          { onConflict: 'stripe_session_id' }
        );
    } else {
      const trialExpiresAt = checkoutSession.subscription
        ? new Date((checkoutSession.expires_at || Math.floor(Date.now() / 1000)) * 1000).toISOString()
        : null;

      await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            email: authData.user.email || checkoutSession.customer_email || null,
            plan: getProfilePlan(planId),
            subscription_tier: planId,
            trial_expires_at: trialExpiresAt
          },
          { onConflict: 'id' }
        );
    }

    return NextResponse.json({ ok: true, planId, sessionId });
  } catch (error) {
    console.error('Checkout completion sync failed:', error);
    return NextResponse.json({ error: error?.message || 'Checkout sync failed' }, { status: 500 });
  }
}
