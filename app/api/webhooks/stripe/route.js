import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
      // Graceful exit for build-time evaluation
      if (process.env.NEXT_PHASE === 'phase-production-build') {
          return NextResponse.json({ ok: true });
      }
      return NextResponse.json({ error: 'Stripe secret missing' }, { status: 503 });
  }

  const stripe = new Stripe(stripeSecret);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) {
    return NextResponse.json({ error: 'Stripe webhook secret missing' }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_uuid;

      if (userId) {
        const planId = session.metadata?.planId || 'lifetime';

        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: session.customer_email || null,
              subscription_tier: planId,
              trial_expires_at: null
            },
            { onConflict: 'id' }
          );
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_uuid;

      if (userId) {
        let planId = subscription.metadata?.planId;
        let trialExpiresAt = null;

        if (!planId) {
          const priceId = subscription.items.data[0]?.price?.id;
          planId = priceId === 'price_1TWlb7DJtpuPVfuFfSVEXPYU' ? 'starter' : 'pro';
        }

        if (subscription.trial_end) {
          trialExpiresAt = new Date(subscription.trial_end * 1000).toISOString();
        }

        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: subscription.customer_email || null,
              subscription_tier: planId,
              trial_expires_at: trialExpiresAt
            },
            { onConflict: 'id' }
          );
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_uuid;
      if (userId) {
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'none' })
          .eq('id', userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
