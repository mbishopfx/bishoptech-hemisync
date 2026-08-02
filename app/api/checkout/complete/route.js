import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { fulfillTonePackPurchase } from '@/lib/commerce/tone-packs.mjs';
import {
  checkoutGrantsAccess,
  lifetimeCheckoutGrantsAccess,
  lifetimeProfilePatch,
  subscriptionProfilePatch
} from '@/lib/billing/stripe-subscription';
import { LIFETIME_PLAN_ID, LIFETIME_PRICE_ID } from '@/lib/billing/plans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: 'Stripe secret missing' }, { status: 503 });

    const { sessionId } = await req.json();
    if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });

    const stripe = new Stripe(stripeSecret);
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Supabase admin unavailable' }, { status: 503 });

    if (checkoutSession.metadata?.productType === 'tone-pack' || checkoutSession.metadata?.packSlug) {
      if (checkoutSession.payment_status !== 'paid') {
        return NextResponse.json({ error: 'Payment has not completed yet' }, { status: 409 });
      }

      const result = await fulfillTonePackPurchase({ stripeSession: checkoutSession, supabase });
      return NextResponse.json(result);
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const planId = checkoutSession.metadata?.planId;
    const userId = checkoutSession.client_reference_id || checkoutSession.metadata?.user_uuid;
    if (!userId || userId !== authData.user.id) {
      return NextResponse.json({ error: 'Checkout session does not belong to this account' }, { status: 403 });
    }

    if (planId === LIFETIME_PLAN_ID) {
      if (!LIFETIME_PRICE_ID) {
        return NextResponse.json({ error: 'Lifetime price is not configured' }, { status: 503 });
      }
      if (!lifetimeCheckoutGrantsAccess(checkoutSession)) {
        return NextResponse.json({ error: 'The lifetime payment has not completed' }, { status: 409 });
      }

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('entitlement_type,subscription_tier')
        .eq('id', userId)
        .maybeSingle();

      if (currentProfile?.entitlement_type === 'lifetime' || currentProfile?.subscription_tier === 'lifetime') {
        return NextResponse.json({ ok: true, planId: LIFETIME_PLAN_ID, sessionId });
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId,
            email: authData.user.email || checkoutSession.customer_email || null,
            ...lifetimeProfilePatch(checkoutSession)
          },
          { onConflict: 'id' }
        );
      if (profileError) throw profileError;

      return NextResponse.json({ ok: true, planId: LIFETIME_PLAN_ID, sessionId });
    }

    if (checkoutSession.mode !== 'subscription') {
      return NextResponse.json({ error: 'Checkout session is not a Cognistration membership' }, { status: 400 });
    }
    if (!['monthly', 'premium'].includes(planId)) {
      return NextResponse.json({ error: 'Checkout session is not a supported legacy membership' }, { status: 400 });
    }
    const subscriptionId = typeof checkoutSession.subscription === 'string'
      ? checkoutSession.subscription
      : checkoutSession.subscription?.id;
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Stripe subscription is not available yet' }, { status: 409 });
    }
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'items.data.price']
    });
    if (!checkoutGrantsAccess(checkoutSession, subscription)) {
      return NextResponse.json({ error: 'The first subscription payment has not completed' }, { status: 409 });
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: authData.user.email || checkoutSession.customer_email || null,
          ...subscriptionProfilePatch(subscription, { paymentMethodAttached: true })
        },
        { onConflict: 'id' }
      );
    if (profileError) throw profileError;

    return NextResponse.json({ ok: true, planId: 'legacy-monthly', sessionId });
  } catch (error) {
    console.error('Checkout completion sync failed:', error);
    return NextResponse.json({ error: error?.message || 'Checkout sync failed' }, { status: 500 });
  }
}
