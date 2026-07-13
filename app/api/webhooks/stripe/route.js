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
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe secret missing' }, { status: 503 });

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) return NextResponse.json({ error: 'Stripe webhook secret missing' }, { status: 503 });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  let event;

  try {
    const stripe = new Stripe(stripeSecret);
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (error) {
    console.error(`Webhook Error: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ error: 'Supabase admin unavailable' }, { status: 503 });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const planId = session.metadata?.planId || 'lifetime';

        if (session.metadata?.productType === 'tone-pack' || session.metadata?.packSlug) {
          await fulfillTonePackPurchase({ stripeSession: session, supabase });
          break;
        }

        const userId = session.client_reference_id || session.metadata?.user_uuid;
        if (userId) {
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
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_uuid;
        if (userId) {
          const planId = subscription.metadata?.planId || 'premium';
          const trialExpiresAt = subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null;

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
          await supabase.from('profiles').update({ subscription_tier: 'none' }).eq('id', userId);
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('Stripe webhook processing failed:', error);
    return NextResponse.json({ error: error?.message || 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
