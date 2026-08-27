import Stripe from 'stripe';
import { z } from 'zod';
import { WORKSHOP_PLAN_ID, WORKSHOP_PRICE_ID, WORKSHOP_SESSION_DURATION_SEC } from '../billing/plans.js';
import { getSupabaseAdmin } from '../supabase/admin.js';
import {
  commerceError,
  hashValue,
  isMissingTableError,
  normalizeEmail,
  siteOrigin,
  validateIdempotencyKey
} from './commerce-utils.mjs';

export const WorkshopCheckoutInputSchema = z.object({
  email: z.string().trim().min(3).max(254),
  confirmed: z.boolean(),
  idempotencyKey: z.string().trim().min(8).max(80)
}).strict();

function stripeClient(stripe) {
  if (stripe) return stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw commerceError('STRIPE_NOT_CONFIGURED', 'Workshop checkout is not configured yet.', 503, true);
  return new Stripe(secret);
}

async function readRequest(supabase, idempotencyKey) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('agent_checkout_requests')
    .select('idempotency_key,request_hash,product_type,product_slug,stripe_session_id,status')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
  return data || null;
}

async function rememberRequest(supabase, record) {
  if (!supabase) return;
  const { error } = await supabase
    .from('agent_checkout_requests')
    .upsert(record, { onConflict: 'idempotency_key' });
  if (error && !isMissingTableError(error)) throw error;
}

function publicResult({ session, origin, replayed = false }) {
  return {
    status: 'checkout_required',
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
    workshop: {
      id: WORKSHOP_PLAN_ID,
      name: 'Cognistration 24-Hour Machine Workshop',
      price: '$2.99',
      duration: '24 hours',
      sessionDurationSec: WORKSHOP_SESSION_DURATION_SEC,
      sessionDurationLabel: 'Up to 60 minutes per machine workshop session'
    },
    accessDelivery: {
      returnUrl: `${origin}/machine?workshop_session_id=${encodeURIComponent(session.id)}`,
      verificationUrl: `${origin}/api/agent/commerce/workshop-access?checkout_session_id=${encodeURIComponent(session.id)}`,
      emailFallback: true,
      accessKeyIssuedAfterPayment: true
    },
    idempotentReplay: replayed
  };
}

export async function createWorkshopCheckout({ input, origin = siteOrigin(), supabase, stripe } = {}) {
  const parsed = WorkshopCheckoutInputSchema.parse(input || {});
  if (parsed.confirmed !== true) {
    throw commerceError('CONFIRMATION_REQUIRED', 'Confirm the $2.99 one-time workshop purchase and the email used for access delivery before checkout begins.', 400);
  }
  const email = normalizeEmail(parsed.email);
  const idempotencyKey = validateIdempotencyKey(parsed.idempotencyKey);
  const requestHash = hashValue(`workshop-24h|${email}`);
  const client = stripeClient(stripe);
  let admin = supabase;
  if (admin === undefined) {
    try { admin = getSupabaseAdmin(); } catch { admin = null; }
  }

  const previous = await readRequest(admin, idempotencyKey);
  if (previous) {
    if (previous.request_hash !== requestHash || previous.product_slug !== WORKSHOP_PLAN_ID) {
      throw commerceError('IDEMPOTENCY_CONFLICT', 'That idempotency key was already used for a different checkout request.', 409);
    }
    if (previous.stripe_session_id) {
      const previousSession = await client.checkout.sessions.retrieve(previous.stripe_session_id);
      return publicResult({ session: previousSession, origin, replayed: true });
    }
  }

  const session = await client.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: WORKSHOP_PRICE_ID, quantity: 1 }],
    mode: 'payment',
    customer_creation: 'always',
    customer_email: email,
    payment_intent_data: {
      receipt_email: email,
      metadata: {
        productType: 'workshop-24h',
        priceId: WORKSHOP_PRICE_ID,
        purchaserEmail: email,
        source: 'cognistration-public-mcp'
      }
    },
    success_url: `${origin}/machine?workshop_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing#machine-workshop`,
    metadata: {
      productType: 'workshop-24h',
      planId: WORKSHOP_PLAN_ID,
      priceId: WORKSHOP_PRICE_ID,
      purchaserEmail: email,
      source: 'cognistration-public-mcp'
    }
  }, {
    idempotencyKey: `cognistration-workshop-${idempotencyKey}`
  });

  if (!session?.id || !session?.url) {
    throw commerceError('CHECKOUT_UNAVAILABLE', 'Stripe did not return a hosted checkout URL.', 503, true);
  }

  await rememberRequest(admin, {
    idempotency_key: idempotencyKey,
    request_hash: requestHash,
    product_type: 'workshop-24h',
    product_slug: WORKSHOP_PLAN_ID,
    purchaser_email_hash: hashValue(email),
    stripe_session_id: session.id,
    status: 'created'
  });

  return publicResult({ session, origin });
}
