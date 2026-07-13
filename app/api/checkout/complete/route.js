import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { fulfillTonePackPurchase } from '@/lib/commerce/tone-packs.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getProfilePlan(planId) {
  if (planId === 'lifetime') return 'founder';
  if (planId === 'premium') return 'pro';
  return 'free';
}

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

    const planId = checkoutSession.metadata?.planId || 'lifetime';
    const userId = checkoutSession.client_reference_id || checkoutSession.metadata?.user_uuid;
    if (!userId || userId !== authData.user.id) {
      return NextResponse.json({ error: 'Checkout session does not belong to this account' }, { status: 403 });
    }

    await supabase
      .from('profiles')
      .upsert(
        {
          id: userId,
          email: authData.user.email || checkoutSession.customer_email || null,
          plan: getProfilePlan(planId),
          subscription_tier: planId,
          trial_expires_at: null
        },
        { onConflict: 'id' }
      );

    return NextResponse.json({ ok: true, planId, sessionId });
  } catch (error) {
    console.error('Checkout completion sync failed:', error);
    return NextResponse.json({ error: error?.message || 'Checkout sync failed' }, { status: 500 });
  }
}
