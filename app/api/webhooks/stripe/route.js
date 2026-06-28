import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function getProfilePlan(planId) {
  if (planId === 'lifetime') return 'founder';
  if (planId === 'premium') return 'pro';
  return 'free';
}

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

        if (planId === 'tone-pack-foundations') {
          await supabase
            .from('tone_pack_purchases')
            .upsert(
              {
                user_id: userId,
                pack_slug: session.metadata?.packSlug || 'foundations-pack',
                pack_name: 'Foundations Pack',
                price_id: session.metadata?.priceId || 'pending',
                stripe_session_id: session.id,
                stripe_customer_id: session.customer || null,
                stripe_payment_intent_id: session.payment_intent || null,
                status: 'active',
                metadata: {
                  planId,
                  source: 'stripe-checkout'
                }
              },
              { onConflict: 'stripe_session_id' }
            );
        } else {
          await supabase
            .from('profiles')
            .upsert(
              {
                id: userId,
                email: session.customer_email || null,
                plan: getProfilePlan(planId),
                subscription_tier: planId,
                trial_expires_at: null
              },
              { onConflict: 'id' }
            );
        }
      }
      break;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_uuid;

      if (userId) {
        const planId = subscription.metadata?.planId || 'premium';
        let trialExpiresAt = null;

        if (subscription.trial_end) {
          trialExpiresAt = new Date(subscription.trial_end * 1000).toISOString();
        }

        await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              email: subscription.customer_email || null,
              plan: getProfilePlan(planId),
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
