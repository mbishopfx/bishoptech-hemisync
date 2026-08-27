import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { fulfillTonePackPurchase } from '@/lib/commerce/tone-packs.mjs';
import { fulfillHostedUcpCheckout } from '@/lib/commerce/ucp.mjs';
import { issueWorkshopAccessKey, revokeWorkshopAccessForPayment } from '@/lib/commerce/workshop-access.mjs';
import { revokeMachineSessionGrantForPayment } from '@/lib/commerce/machine-session-grants.mjs';
import { sendWorkshopAccessEmail } from '@/lib/email/workshop-access.mjs';
import { hashValue, isMissingTableError } from '@/lib/commerce/commerce-utils.mjs';
import { notifyUcpOrderEvent } from '@/lib/commerce/order-events.mjs';
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

async function claimWebhookEvent(supabase, event, body) {
  const record = {
    event_id: event.id,
    provider: 'stripe',
    event_type: event.type,
    payload_hash: hashValue(body),
    status: 'processing'
  };
  const { data: existing, error: readError } = await supabase
    .from('commerce_webhook_events')
    .select('event_id,status,received_at')
    .eq('event_id', event.id)
    .maybeSingle();
  if (readError) {
    if (isMissingTableError(readError)) return true;
    throw readError;
  }
  if (existing?.status === 'processed') return false;
  if (existing?.status === 'processing' && Date.now() - new Date(existing.received_at).getTime() < 10 * 60 * 1000) return false;
  if (existing) {
    const { data: claimed, error } = await supabase
      .from('commerce_webhook_events')
      .update(record)
      .eq('event_id', event.id)
      .eq('status', existing.status)
      .select('event_id')
      .maybeSingle();
    if (error && !isMissingTableError(error)) throw error;
    if (claimed) return true;
    const { data: current } = await supabase.from('commerce_webhook_events').select('status').eq('event_id', event.id).maybeSingle();
    return current?.status !== 'processed' && current?.status !== 'processing';
  }
  const { error } = await supabase.from('commerce_webhook_events').insert(record);
  if (error?.code === '23505') {
    const { data: raced } = await supabase.from('commerce_webhook_events').select('status').eq('event_id', event.id).maybeSingle();
    return raced?.status !== 'processed' && raced?.status !== 'processing';
  }
  if (error && !isMissingTableError(error)) throw error;
  return true;
}

async function finishWebhookEvent(supabase, eventId, status, errorMessage = null) {
  const { error } = await supabase.from('commerce_webhook_events').update({
    status,
    processed_at: status === 'processed' ? new Date().toISOString() : null,
    error: errorMessage ? String(errorMessage).slice(0, 500) : null
  }).eq('event_id', eventId);
  if (error && !isMissingTableError(error)) throw error;
}

async function markAgentCheckout(supabase, stripeSessionId, status) {
  if (!stripeSessionId) return;
  const { error } = await supabase.from('agent_checkout_requests').update({ status, updated_at: new Date().toISOString() }).eq('stripe_session_id', stripeSessionId);
  if (error && !isMissingTableError(error)) throw error;
}

async function readOrderByPaymentIntent(supabase, paymentIntentId) {
  if (!paymentIntentId) return null;
  const { data, error } = await supabase
    .from('commerce_orders')
    .select('id,checkout_id,status,payment')
    .eq('payment->>payment_intent_id', paymentIntentId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function readCheckoutForOrder(supabase, checkoutId) {
  if (!checkoutId) return null;
  const { data, error } = await supabase
    .from('commerce_checkouts')
    .select('id,status')
    .eq('id', checkoutId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

async function markPaymentState(supabase, paymentIntentId, state) {
  if (!paymentIntentId) return;
  const order = await readOrderByPaymentIntent(supabase, paymentIntentId);
  let updatedOrder = order;
  if (order) {
    const { data, error } = await supabase
      .from('commerce_orders')
      .update({ status: state, updated_at: new Date().toISOString() })
      .eq('id', order.id)
      .select('*')
      .single();
    if (error) throw error;
    updatedOrder = data;
  }

  const purchaseUpdate = { status: state, updated_at: new Date().toISOString() };
  const { error: purchaseError } = await supabase
    .from('tone_pack_purchases')
    .update(purchaseUpdate)
    .eq('stripe_payment_intent_id', paymentIntentId);
  if (purchaseError && !isMissingTableError(purchaseError)) throw purchaseError;

  if (state === 'refunded' || state === 'disputed') {
    await revokeWorkshopAccessForPayment({
      paymentIntentId,
      supabase,
      reason: state === 'refunded' ? 'payment_refunded' : 'payment_disputed'
    });
    await revokeMachineSessionGrantForPayment({
      paymentReference: paymentIntentId,
      supabase,
      reason: state === 'refunded' ? 'payment_refunded' : 'payment_disputed'
    });
  }

  if (updatedOrder) {
    try {
      await notifyUcpOrderEvent({
        event: 'order.updated',
        order: updatedOrder,
        checkout: await readCheckoutForOrder(supabase, updatedOrder.checkout_id)
      });
    } catch {
      // Order state and entitlement revocation are durable locally. A
      // downstream UCP notification can be retried from the provider event.
    }
  }
}

async function paymentIntentFromEventObject(stripe, object) {
  const direct = typeof object?.payment_intent === 'string'
    ? object.payment_intent
    : object?.payment_intent?.id;
  if (direct) return direct;
  const chargeId = typeof object?.charge === 'string' ? object.charge : object?.charge?.id;
  if (!chargeId) return null;
  const charge = await stripe.charges.retrieve(chargeId);
  return typeof charge?.payment_intent === 'string' ? charge.payment_intent : charge?.payment_intent?.id || null;
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

  const shouldProcess = await claimWebhookEvent(supabase, event, body);
  if (!shouldProcess) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const planId = session.metadata?.planId;

        if (session.metadata?.productType === 'tone-pack' || session.metadata?.packSlug) {
          const reconciled = await fulfillHostedUcpCheckout({ stripeSession: session, supabase });
          if (!reconciled) await fulfillTonePackPurchase({ stripeSession: session, supabase });
          await markAgentCheckout(supabase, session.id, 'paid');
          break;
        }

        if (session.metadata?.productType === 'workshop-24h') {
          const access = await issueWorkshopAccessKey({ stripeSession: session, supabase });
          const recipient = String(session.customer_details?.email || session.customer_email || session.metadata?.purchaserEmail || '').trim().toLowerCase();
          const { data: accessRow } = await supabase
            .from('workshop_access_keys')
            .select('id,email_sent_at')
            .eq('stripe_session_id', session.id)
            .maybeSingle();

          if (recipient && accessRow && !accessRow.email_sent_at) {
            const emailResult = await sendWorkshopAccessEmail({
              to: recipient,
              accessUrl: access.accessUrl,
              expiresAt: access.expiresAt
            });
            await supabase
              .from('workshop_access_keys')
              .update(emailResult.sent
                ? { email_sent_at: new Date().toISOString(), email_error: null }
                : { email_error: emailResult.reason || 'Workshop access email was not sent.' })
              .eq('id', accessRow.id);
          }
          await markAgentCheckout(supabase, session.id, 'paid');
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
      case 'charge.refunded': {
        const paymentIntentId = await paymentIntentFromEventObject(stripe, event.data.object);
        await markPaymentState(supabase, paymentIntentId, 'refunded');
        break;
      }
      case 'charge.dispute.created': {
        const paymentIntentId = await paymentIntentFromEventObject(stripe, event.data.object);
        await markPaymentState(supabase, paymentIntentId, 'disputed');
        break;
      }
      case 'charge.dispute.closed': {
        const paymentIntentId = await paymentIntentFromEventObject(stripe, event.data.object);
        await markPaymentState(supabase, paymentIntentId, 'disputed');
        break;
      }
      case 'shared_payment.granted_token.used':
      case 'shared_payment.granted_token.deactivated':
        break;
      default:
        break;
    }
    await finishWebhookEvent(supabase, event.id, 'processed');
  } catch (error) {
    try { await finishWebhookEvent(supabase, event.id, 'failed', error?.message); } catch {}
    console.error('Stripe webhook processing failed:', error);
    return NextResponse.json({ error: error?.message || 'Webhook processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
