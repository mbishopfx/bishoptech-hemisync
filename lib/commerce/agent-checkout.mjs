import Stripe from 'stripe';
import { z } from 'zod';
import { getTonePackBySlug, getTonePackPriceId } from '../audio/tone-packs.db.mjs';
import { getPublicTonePack } from '../agentic/pack-capability.js';
import { getSupabaseAdmin } from '../supabase/admin.js';
import { fulfillTonePackPurchase } from './tone-packs.mjs';
import {
  commerceError,
  hashValue,
  isMissingTableError,
  normalizeEmail,
  siteOrigin,
  stripeVerificationError,
  validateIdempotencyKey
} from './commerce-utils.mjs';
import { assertPaidTonePackSession } from './tone-packs.mjs';

export const TonePackCheckoutInputSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  email: z.string().trim().min(3).max(254),
  confirmed: z.boolean(),
  idempotencyKey: z.string().trim().min(8).max(80)
}).strict();

export const TonePackDeliveryInputSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  checkoutSessionId: z.string().trim().regex(/^cs_[A-Za-z0-9_]+$/)
}).strict();

function stripeClient(stripe) {
  if (stripe) return stripe;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw commerceError('STRIPE_NOT_CONFIGURED', 'Stripe checkout is not configured yet.', 503, true);
  return new Stripe(secret);
}

function checkoutParams({ pack, email, origin }) {
  const priceId = getTonePackPriceId(pack);

  return {
    priceId,
    params: {
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      customer_creation: 'always',
      customer_email: email,
      payment_intent_data: {
        receipt_email: email,
        metadata: {
          productType: 'tone-pack',
          packSlug: pack.slug,
          purchaserEmail: email
        }
      },
      success_url: `${origin}/packs/success?session_id={CHECKOUT_SESSION_ID}&pack=${encodeURIComponent(pack.slug)}`,
      cancel_url: `${origin}/packs?cancelled=1`,
      metadata: {
        productType: 'tone-pack',
        planId: pack.slug,
        packSlug: pack.slug,
        priceId,
        purchaserEmail: email,
        source: 'cognistration-public-mcp'
      }
    }
  };
}

function publicCheckoutResult({ session, pack, origin, replayed = false }) {
  return {
    status: 'checkout_required',
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
    packUrl: `${origin}/packs#${encodeURIComponent(pack.slug)}`,
    delivery: {
      verificationUrl: `${origin}/api/agent/commerce/tone-pack-delivery?slug=${encodeURIComponent(pack.slug)}&checkout_session_id=${encodeURIComponent(session.id)}`,
      webUrl: `${origin}/packs#${encodeURIComponent(pack.slug)}`,
      bundleAvailableAfterPayment: true,
      emailFallback: true
    },
    pack: getPublicTonePack(pack.slug),
    idempotentReplay: replayed
  };
}

async function existingRequest(supabase, idempotencyKey) {
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

function extractSessionId(session) {
  return typeof session === 'string' ? session : session?.id;
}

export async function createTonePackCheckout({ input, origin = siteOrigin(), supabase, stripe } = {}) {
  const parsed = TonePackCheckoutInputSchema.parse(input || {});
  if (parsed.confirmed !== true) {
    throw commerceError('CONFIRMATION_REQUIRED', 'Confirm the selected tone pack, its one-time price, and the email used for delivery before checkout begins.', 400);
  }

  const pack = getTonePackBySlug(parsed.slug);
  if (!pack) throw commerceError('NOT_FOUND', 'That tone pack is not in the approved public catalog.', 404);
  const email = normalizeEmail(parsed.email);
  const idempotencyKey = validateIdempotencyKey(parsed.idempotencyKey);
  const requestHash = hashValue(`tone-pack|${pack.slug}|${email}`);
  const client = stripeClient(stripe);

  let admin = supabase;
  if (admin === undefined) {
    try { admin = getSupabaseAdmin(); } catch { admin = null; }
  }

  const previous = await existingRequest(admin, idempotencyKey);
  if (previous) {
    if (previous.request_hash !== requestHash || previous.product_slug !== pack.slug) {
      throw commerceError('IDEMPOTENCY_CONFLICT', 'That idempotency key was already used for a different checkout request.', 409);
    }
    if (previous.stripe_session_id) {
      const previousSession = await client.checkout.sessions.retrieve(previous.stripe_session_id);
      return publicCheckoutResult({ session: previousSession, pack, origin, replayed: true });
    }
  }

  const { priceId, params } = checkoutParams({ pack, email, origin });
  const session = await client.checkout.sessions.create(params, {
    idempotencyKey: `cognistration-mcp-${idempotencyKey}`
  });
  if (!session?.id || !session?.url) {
    throw commerceError('CHECKOUT_UNAVAILABLE', 'Stripe did not return a hosted checkout URL.', 503, true);
  }

  await rememberRequest(admin, {
    idempotency_key: idempotencyKey,
    request_hash: requestHash,
    product_type: 'tone-pack',
    product_slug: pack.slug,
    purchaser_email_hash: hashValue(email),
    stripe_session_id: session.id,
    status: 'created'
  });

  return publicCheckoutResult({ session, pack, origin });
}

export async function getTonePackDelivery({ input, origin = siteOrigin(), supabase, stripe } = {}) {
  const parsed = TonePackDeliveryInputSchema.parse(input || {});
  const pack = getTonePackBySlug(parsed.slug);
  if (!pack) throw commerceError('NOT_FOUND', 'That tone pack is not in the approved public catalog.', 404);

  let admin = supabase;
  if (admin === undefined) admin = getSupabaseAdmin();
  const client = stripeClient(stripe);
  let session;
  try {
    session = await client.checkout.sessions.retrieve(parsed.checkoutSessionId);
  } catch (error) {
    throw stripeVerificationError(error, 'Tone-pack payment verification is temporarily unavailable.');
  }
  assertPaidTonePackSession({ stripeSession: session, expectedSlug: pack.slug });

  const protectedDeliveryUrl = `${origin}/api/packs/${encodeURIComponent(pack.slug)}/download?session_id=${encodeURIComponent(session.id)}`;
  const purchase = await fulfillTonePackPurchase({
    stripeSession: session,
    supabase: admin,
    fallbackDownloadUrl: protectedDeliveryUrl
  });
  return {
    status: 'paid',
    pack: getPublicTonePack(pack.slug),
    downloadUrl: purchase.downloadUrl || purchase.bundleUrl || protectedDeliveryUrl,
    protectedDeliveryUrl,
    webUrl: `${origin}/packs#${encodeURIComponent(pack.slug)}`,
    emailDelivery: {
      attempted: Boolean(purchase.emailResult),
      sent: Boolean(purchase.emailResult?.sent),
      fallbackUrl: protectedDeliveryUrl
    },
    purchaseId: purchase.purchaseId
  };
}

export function agentCheckoutPublicPolicy(origin = siteOrigin()) {
  return {
    confirmationRequired: true,
    hostedCheckoutOnly: true,
    paymentCredentialsAccepted: false,
    catalog: `${origin}/api/packs?agent=1`,
    terms: `${origin}/terms`,
    privacy: `${origin}/privacy`
  };
}
