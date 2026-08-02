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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function syncSubscriptionProfile(supabase, userId, subscription, email = null, options = {}) {
  if (!userId) return;
  const { data: current, error: readError } = await supabase
    .from('profiles')
    .select('entitlement_type,subscription_tier')
    .eq('id', userId)
    .maybeSingle();
  if (readError) throw readError;
  if (current?.entitlement_type === 'lifetime' || current?.subscription_tier === 'lifetime') return;

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...(email ? { email } : {}),
    ...subscriptionProfilePatch(subscription, options)
  }, { onConflict: 'id' });
  if (error) throw error;
}

async function syncLifetimeProfile(supabase, userId, checkoutSession, email = null) {
  if (!userId) return;
  const { data: current, error: readError } = await supabase
    .from('profiles')
    .select('entitlement_type,subscription_tier')
    .eq('id', userId)
    .maybeSingle();
  if (readError) throw readError;
  if (current?.entitlement_type === 'lifetime' || current?.subscription_tier === 'lifetime') return;

  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...(email ? { email } : {}),
    ...lifetimeProfilePatch(checkoutSession)
  }, { onConflict: 'id' });
  if (error) throw error;
}

export async function POST(req) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return NextResponse.json({ error: 'Stripe secret missing' }, { status: 503 });

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!endpointSecret) return NextResponse.json({ error: 'Stripe webhook secret missing' }, { status: 503 });

  const body = await req.text();
  const signature = req.headers.get('stripe-signature');
  let event;
  const stripe = new Stripe(stripeSecret);

  try {
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
        const planId = session.metadata?.planId;

        if (session.metadata?.productType === 'tone-pack' || session.metadata?.packSlug) {
          await fulfillTonePackPurchase({ stripeSession: session, supabase });
          break;
        }

        const userId = session.client_reference_id || session.metadata?.user_uuid;
        if (userId && lifetimeCheckoutGrantsAccess(session)) {
          await syncLifetimeProfile(
            supabase,
            userId,
            session,
            session.customer_details?.email || session.customer_email || null
          );
          break;
        }

        if (userId && ['monthly', 'premium'].includes(planId) && session.mode === 'subscription') {
          const subscriptionId = typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
              expand: ['default_payment_method', 'items.data.price']
            });
            if (checkoutGrantsAccess(session, subscription)) {
              await syncSubscriptionProfile(
                supabase,
                userId,
                subscription,
                session.customer_details?.email || session.customer_email || null,
                { paymentMethodAttached: true }
              );
            }
          }
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_uuid;
        await syncSubscriptionProfile(supabase, userId, subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_uuid;
        await syncSubscriptionProfile(supabase, userId, subscription);
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
