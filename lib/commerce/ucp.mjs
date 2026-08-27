import Stripe from 'stripe';
import { z } from 'zod';
import { getTonePackBySlug, getTonePackPriceId } from '../audio/tone-packs.db.mjs';
import { getSupabaseAdmin } from '../supabase/admin.js';
import { createTonePackCheckout } from './agent-checkout.mjs';
import { fulfillTonePackPurchase } from './tone-packs.mjs';
import { consumeAutonomousMandate, reserveAutonomousMandate, verifyAutonomousMandate } from './ap2.mjs';
import { commerceError, createOpaqueId, hashValue, isMissingTableError, normalizeEmail, siteOrigin } from './commerce-utils.mjs';
import { notifyUcpOrderEvent, ucpOrderEventSigningConfigured } from './order-events.mjs';

export const UCP_VERSION = '2026-01-23';
export const UCP_OVERVIEW_URL = 'https://ucp.dev/2026-01-23/specification/overview';
export const UCP_CHECKOUT_SPEC_URL = 'https://ucp.dev/2026-01-23/specification/checkout';
export const UCP_CHECKOUT_SCHEMA_URL = 'https://ucp.dev/2026-01-23/schemas/shopping/checkout.json';
export const UCP_SHOPPING_OPENAPI_URL = 'https://ucp.dev/2026-01-23/services/shopping/openapi.json';
export const UCP_SHOPPING_OPENRPC_URL = 'https://ucp.dev/2026-01-23/services/shopping/openrpc.json';

const BuyerSchema = z.object({
  email: z.string().trim().max(254).optional(),
  first_name: z.string().trim().max(80).optional(),
  last_name: z.string().trim().max(80).optional(),
  phone_number: z.string().trim().max(40).optional()
}).partial().strict();

const LineItemSchema = z.object({
  item: z.object({ id: z.string().trim().min(1).max(120) }).passthrough(),
  quantity: z.coerce.number().int().min(1).max(1)
}).passthrough();

function enabledSharedPaymentToken() {
  return String(process.env.UCP_SHARED_PAYMENT_TOKEN_ENABLED || '').toLowerCase() === 'true'
    && Boolean(process.env.STRIPE_SECRET_KEY)
    && Boolean(process.env.STRIPE_NETWORK_ID);
}

function paymentHandlers(origin) {
  const handlers = {
    'com.cognistration.hosted_checkout': [{
      id: 'cognistration_hosted_checkout',
      version: UCP_VERSION,
      spec: `${origin}/ucp/handlers/hosted-checkout`,
      schema: `${origin}/ucp/schemas/hosted-checkout.json`,
      config: { type: 'HOSTED_CHECKOUT', merchant_of_record: 'Cognistration' }
    }]
  };

  if (enabledSharedPaymentToken()) {
    handlers['com.stripe.shared_payment_token'] = [{
      id: 'cognistration_stripe_shared_payment_token',
      version: UCP_VERSION,
      spec: 'https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens',
      schema: `${origin}/ucp/schemas/stripe-shared-payment-token.json`,
      config: {
        type: 'STRIPE_SHARED_PAYMENT_TOKEN',
        network_id: process.env.STRIPE_NETWORK_ID
      }
    }];
  }
  return handlers;
}

export function ucpProfile(origin = siteOrigin()) {
  const signingKeys = readSigningKeys();
  const orderEventsSigned = Boolean(signingKeys.length && ucpOrderEventSigningConfigured());
  const orderCapability = {
    version: UCP_VERSION,
    spec: 'https://ucp.dev/2026-01-23/specification/order',
    schema: 'https://ucp.dev/2026-01-23/schemas/shopping/order.json',
    ...(orderEventsSigned ? {
      config: {
        webhook_url: process.env.UCP_ORDER_WEBHOOK_URL
      }
    } : {})
  };
  return {
    ucp: {
      version: UCP_VERSION,
      services: {
        'dev.ucp.shopping': [
          {
            version: UCP_VERSION,
            spec: UCP_OVERVIEW_URL,
            transport: 'rest',
            endpoint: `${origin}/api/ucp`,
            schema: UCP_SHOPPING_OPENAPI_URL
          },
          {
            version: UCP_VERSION,
            spec: UCP_OVERVIEW_URL,
            transport: 'mcp',
            endpoint: `${origin}/api/ucp/mcp`,
            schema: UCP_SHOPPING_OPENRPC_URL
          }
        ]
      },
      capabilities: {
        'dev.ucp.shopping.checkout': [{
          version: UCP_VERSION,
          spec: UCP_CHECKOUT_SPEC_URL,
          schema: UCP_CHECKOUT_SCHEMA_URL
        }],
        'dev.ucp.shopping.order': [orderCapability]
      },
      payment_handlers: paymentHandlers(origin),
    },
    signing_keys: signingKeys
  };
}

function readSigningKeys() {
  const raw = String(process.env.UCP_SIGNING_PUBLIC_JWK || '').trim();
  if (!raw) return [];
  const privateFields = ['d', 'p', 'q', 'dp', 'dq', 'qi', 'oth', 'k'];
  const allowedFields = ['kty', 'kid', 'use', 'alg', 'key_ops', 'crv', 'x', 'y', 'n', 'e', 'x5c', 'x5t', 'x5t#S256'];
  const publicKey = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value) || privateFields.some((field) => field in value)) return null;
    const key = Object.fromEntries(allowedFields.filter((field) => value[field] !== undefined).map((field) => [field, value[field]]));
    return key.kty && key.kid ? key : null;
  };
  try {
    const parsed = JSON.parse(raw);
    const candidates = Array.isArray(parsed)
      ? parsed
      : (Array.isArray(parsed?.keys) ? parsed.keys : [parsed]);
    return candidates.map(publicKey).filter(Boolean);
  } catch {
    return [];
  }
}

function normalizeBuyer(value) {
  const parsed = BuyerSchema.parse(value || {});
  if (!parsed.email) return parsed;
  return { ...parsed, email: normalizeEmail(parsed.email) };
}

function getPackPriceCents(pack) {
  const amount = Math.round(Number(String(pack?.price || '').replace(/[^0-9.]/g, '')) * 100);
  if (!Number.isInteger(amount) || amount < 1) throw commerceError('PRICE_UNAVAILABLE', 'That tone pack does not have an authoritative price.', 503, true);
  return amount;
}

function normalizeLineItems(value) {
  if (!Array.isArray(value) || value.length !== 1) {
    throw commerceError('INVALID_LINE_ITEMS', 'Choose exactly one published Cognistration tone pack per checkout.', 400);
  }
  const parsed = LineItemSchema.parse(value[0]);
  const slug = parsed.item.id;
  const pack = getTonePackBySlug(slug);
  if (!pack) throw commerceError('OUT_OF_STOCK', 'That tone pack is not available in the published catalog.', 400);
  const amount = getPackPriceCents(pack);
  return {
    pack,
    lineItems: [{
      id: `line_${pack.slug}`,
      item: { id: pack.slug, title: pack.name, price: amount },
      quantity: 1,
      totals: [{ type: 'subtotal', amount }, { type: 'total', amount }]
    }],
    totals: [{ type: 'subtotal', amount }, { type: 'total', amount }]
  };
}

function resolveAdmin(supabase) {
  if (supabase !== undefined) return supabase;
  try { return getSupabaseAdmin(); } catch { return null; }
}

function assertAdmin(supabase) {
  if (!supabase) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Checkout storage is not available yet.', 503, true);
  return supabase;
}

function requestHash({ pack, buyer }) {
  return hashValue(JSON.stringify({ pack: pack.slug, email: buyer.email || null }));
}

function checkoutResource(row, origin = siteOrigin()) {
  const payment = row.payment || {};
  const status = row.status === 'expired' ? 'canceled' : row.status;
  const checkoutUrl = payment.continue_url || `${origin}/checkout/ucp/${encodeURIComponent(row.id)}`;
  const terminal = ['completed', 'canceled', 'expired'].includes(row.status);
  const publicPayment = {
    instruments: Array.isArray(payment.instruments) ? payment.instruments : [],
    ...(payment.handler_id ? { handler_id: payment.handler_id } : {}),
    ...(payment.provider ? { provider: payment.provider } : {}),
    ...(payment.payment_intent_id ? { payment_intent_id: payment.payment_intent_id } : {}),
    ...(payment.order ? { order: payment.order } : {})
  };
  return {
    ucp: {
      version: UCP_VERSION,
      capabilities: {
        'dev.ucp.shopping.checkout': [{ version: UCP_VERSION }],
        'dev.ucp.shopping.order': [{ version: UCP_VERSION }]
      },
      payment_handlers: paymentHandlers(origin)
    },
    id: row.id,
    status,
    ...(row.buyer && Object.keys(row.buyer).length ? { buyer: row.buyer } : {}),
    line_items: row.line_items || [],
    currency: String(row.currency || 'usd').toUpperCase(),
    totals: row.totals || [],
    messages: payment.messages || [],
    links: [
      { type: 'privacy_policy', url: `${origin}/privacy` },
      { type: 'terms_of_service', url: `${origin}/terms` },
      { type: 'refund_policy', url: `${origin}/terms#refunds` }
    ],
    expires_at: row.expires_at,
    ...(!terminal ? { continue_url: checkoutUrl } : {}),
    payment: publicPayment,
    ...(payment.order ? { order: payment.order } : {})
  };
}

async function getCheckoutRow(supabase, id) {
  const { data, error } = await assertAdmin(supabase)
    .from('commerce_checkouts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Checkout storage is not available yet.', 503, true);
    throw error;
  }
  if (!data) throw commerceError('NOT_FOUND', 'That checkout session was not found.', 404);
  return data;
}

async function getCheckoutByIdempotencyKey(supabase, idempotencyKey) {
  const { data, error } = await assertAdmin(supabase)
    .from('commerce_checkouts')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Checkout storage is not available yet.', 503, true);
    throw error;
  }
  return data;
}

async function getOrderByCheckout(admin, checkoutId) {
  const { data, error } = await assertAdmin(admin)
    .from('commerce_orders')
    .select('*')
    .eq('checkout_id', checkoutId)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Order storage is not available yet.', 503, true);
    throw error;
  }
  return data || null;
}

async function persistUcpOrder({ admin, checkout, payment, fulfillment, status = 'fulfilled' }) {
  const existing = await getOrderByCheckout(admin, checkout.id);
  const now = new Date().toISOString();
  const values = {
    checkout_id: checkout.id,
    status,
    currency: 'usd',
    line_items: checkout.line_items || [],
    totals: checkout.totals || [],
    payment,
    fulfillment,
    updated_at: now
  };

  if (existing) {
    const { data, error } = await admin
      .from('commerce_orders')
      .update(values)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return { order: data, created: false };
  }

  const row = { id: createOpaqueId('order'), ...values };
  const { data, error } = await admin.from('commerce_orders').insert(row).select('*').single();
  if (!error) return { order: data, created: true };
  if (error.code !== '23505') throw error;

  // A concurrent webhook/request won the checkout_id race. Re-read the
  // durable order and update it without ever generating a second order id.
  const raced = await getOrderByCheckout(admin, checkout.id);
  if (!raced) throw error;
  const { data: updated, error: updateError } = await admin
    .from('commerce_orders')
    .update(values)
    .eq('id', raced.id)
    .select('*')
    .single();
  if (updateError) throw updateError;
  return { order: updated, created: false };
}

function buildOrderConfirmation(order, origin) {
  return {
    id: order.id,
    permalink_url: `${origin}/api/ucp/orders/${encodeURIComponent(order.id)}`
  };
}

function packDeliveryUrl(packSlug, stripeSessionId, origin) {
  return `${origin}/api/packs/${encodeURIComponent(packSlug)}/download?session_id=${encodeURIComponent(stripeSessionId)}`;
}

function packPublicUrl(packSlug, origin) {
  return `${origin}/packs#${encodeURIComponent(packSlug)}`;
}

function ucpOrderFulfillmentUrl(orderId, origin) {
  return `${origin}/api/ucp/orders/${encodeURIComponent(orderId)}/fulfillment`;
}

async function ensureOrderDelivery({ admin, persisted, origin }) {
  if (persisted.order?.fulfillment?.download_url) return persisted;
  const fulfillment = {
    ...(persisted.order?.fulfillment || {}),
    download_url: ucpOrderFulfillmentUrl(persisted.order.id, origin)
  };
  const { data, error } = await admin
    .from('commerce_orders')
    .update({ fulfillment, updated_at: new Date().toISOString() })
    .eq('id', persisted.order.id)
    .select('*')
    .single();
  if (error) throw error;
  return { ...persisted, order: data };
}

export async function fulfillHostedUcpCheckout({ stripeSession, origin = siteOrigin(), supabase } = {}) {
  const admin = assertAdmin(resolveAdmin(supabase));
  const stripeSessionId = typeof stripeSession === 'string' ? stripeSession : stripeSession?.id;
  if (!stripeSessionId) return null;

  let { data: checkout, error } = await admin
    .from('commerce_checkouts')
    .select('*')
    .eq('stripe_checkout_session_id', stripeSessionId)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return null;
    throw error;
  }
  if (!checkout) return null;
  if (checkout.status === 'completed') return checkoutResource(checkout, origin);
  if (['canceled', 'expired'].includes(checkout.status)) {
    throw commerceError('CHECKOUT_IMMUTABLE', 'A canceled checkout cannot be fulfilled.', 409);
  }
  if (stripeSession?.payment_status && stripeSession.payment_status !== 'paid') {
    throw commerceError('PAYMENT_NOT_VERIFIED', 'The hosted payment is not marked paid yet.', 409, true);
  }

  const packSlug = checkout.line_items?.[0]?.item?.id;
  const sessionPack = stripeSession?.metadata?.packSlug || stripeSession?.metadata?.planId;
  if (!packSlug || sessionPack !== packSlug || !getTonePackBySlug(packSlug)) {
    throw commerceError('PAYMENT_MISMATCH', 'The hosted payment does not match this checkout.', 400);
  }

  if (['incomplete', 'ready_for_complete', 'requires_escalation'].includes(checkout.status)) {
    const { data: claimed, error: claimError } = await admin
      .from('commerce_checkouts')
      .update({ status: 'complete_in_progress', updated_at: new Date().toISOString() })
      .eq('id', checkout.id)
      .eq('status', checkout.status)
      .select('*')
      .maybeSingle();
    if (claimError) throw claimError;
    if (claimed) checkout = claimed;
    else checkout = await getCheckoutRow(admin, checkout.id);
    if (['canceled', 'expired'].includes(checkout.status)) {
      throw commerceError('CHECKOUT_IMMUTABLE', 'A canceled checkout cannot be fulfilled.', 409);
    }
    if (checkout.status === 'completed') return checkoutResource(checkout, origin);
  }

  const paymentIntentId = typeof stripeSession?.payment_intent === 'string'
    ? stripeSession.payment_intent
    : stripeSession?.payment_intent?.id || null;
  const protectedDeliveryUrl = packDeliveryUrl(packSlug, stripeSessionId, origin);
  const purchase = await fulfillTonePackPurchase({
    stripeSession,
    supabase: admin,
    fallbackDownloadUrl: protectedDeliveryUrl
  });
  const persisted = await ensureOrderDelivery({
    origin,
    ...(await persistUcpOrder({
      admin,
      checkout,
      payment: {
        provider: 'stripe',
        checkout_session_id: stripeSessionId,
        ...(paymentIntentId ? { payment_intent_id: paymentIntentId } : {})
      },
      fulfillment: {
        download_url: purchase.downloadUrl || purchase.bundleUrl || protectedDeliveryUrl,
        protected_delivery_url: protectedDeliveryUrl,
        web_url: packPublicUrl(packSlug, origin),
        email_fallback: true,
        email_sent: Boolean(purchase.emailResult?.sent),
        purchase_id: purchase.purchaseId
      }
    }))
  });
  const confirmation = buildOrderConfirmation(persisted.order, origin);
  const { data: updated, error: updateError } = await admin.from('commerce_checkouts').update({
    status: 'completed',
    ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
    order_id: persisted.order.id,
    payment: {
      provider: 'stripe',
      checkout_session_id: stripeSessionId,
      ...(paymentIntentId ? { payment_intent_id: paymentIntentId } : {}),
      order: confirmation
    },
    completed_at: checkout.completed_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', checkout.id).eq('status', 'complete_in_progress').select('*').maybeSingle();
  if (updateError) throw updateError;
  if (!updated) {
    const current = await getCheckoutRow(admin, checkout.id);
    if (current.status === 'completed') return checkoutResource(current, origin);
    throw commerceError('CHECKOUT_STATE_CHANGED', 'The hosted checkout changed while its payment was being reconciled. Retry the request.', 409, true);
  }

  if (persisted.created) {
    try {
      await notifyUcpOrderEvent({ event: 'order.created', order: persisted.order, checkout: updated });
    } catch {
      // The signed notification is best effort; Stripe and the local order are
      // the durable source of truth for a completed digital purchase.
    }
  }
  return checkoutResource(updated, origin);
}

function checkoutInput(body) {
  const checkout = body?.checkout || body || {};
  const { pack, lineItems, totals } = normalizeLineItems(checkout.line_items);
  const buyer = normalizeBuyer(checkout.buyer);
  return { checkout, pack, lineItems, totals, buyer };
}

export async function createUcpCheckout({ body, idempotencyKey, origin = siteOrigin(), supabase } = {}) {
  if (!idempotencyKey) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout creation.', 400);
  const { checkout, pack, lineItems, totals, buyer } = checkoutInput(body);
  const admin = assertAdmin(resolveAdmin(supabase));
  const fingerprint = requestHash({ pack, buyer });
  const { data: previous, error: previousError } = await admin
    .from('commerce_checkouts')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();
  if (previousError) {
    if (isMissingTableError(previousError)) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Checkout storage is not available yet.', 503, true);
    throw previousError;
  }
  if (previous) {
    if (previous.request_hash !== fingerprint) throw commerceError('IDEMPOTENCY_CONFLICT', 'That idempotency key was already used for different checkout data.', 409);
    return checkoutResource(previous, origin);
  }

  const id = createOpaqueId('checkout');
  const now = new Date();
  const expires = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const row = {
    id,
    idempotency_key: idempotencyKey,
    request_hash: fingerprint,
    status: buyer.email ? 'ready_for_complete' : 'incomplete',
    currency: 'usd',
    line_items: lineItems,
    totals,
    buyer,
    payment: buyer.email ? {} : {
      messages: [{
        type: 'error',
        code: 'missing',
        path: '$.buyer.email',
        content: 'An email address is required to deliver a digital tone pack.',
        severity: 'requires_buyer_input'
      }]
    },
    expires_at: expires.toISOString()
  };
  const { data: saved, error } = await admin.from('commerce_checkouts').insert(row).select('*').single();
  if (error) {
    if (error.code === '23505') {
      const raced = await getCheckoutByIdempotencyKey(admin, idempotencyKey);
      if (raced?.request_hash !== fingerprint) throw commerceError('IDEMPOTENCY_CONFLICT', 'That idempotency key was already used for different checkout data.', 409);
      return checkoutResource(raced, origin);
    }
    throw error;
  }
  return checkoutResource(saved, origin);
}

export async function getUcpCheckout({ id, origin = siteOrigin(), supabase } = {}) {
  const admin = assertAdmin(resolveAdmin(supabase));
  const checkout = await getCheckoutRow(admin, String(id || '').trim());
  if (!['completed', 'canceled', 'expired', 'complete_in_progress'].includes(checkout.status)
    && new Date(checkout.expires_at).getTime() <= Date.now()) {
    const { data: expired, error } = await admin
      .from('commerce_checkouts')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('id', checkout.id)
      .eq('status', checkout.status)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (expired) Object.assign(checkout, expired);
  }
  return checkoutResource(checkout, origin);
}

export async function updateUcpCheckout({ id, body, origin = siteOrigin(), supabase } = {}) {
  const admin = assertAdmin(resolveAdmin(supabase));
  const current = await getCheckoutRow(admin, String(id || '').trim());
  if (['completed', 'canceled', 'expired'].includes(current.status)) throw commerceError('CHECKOUT_IMMUTABLE', 'That checkout can no longer be updated.', 409);
  if (current.status === 'complete_in_progress') throw commerceError('CHECKOUT_IN_PROGRESS', 'That checkout is being completed. Retry with the same completion request or wait for its result.', 409, true);
  const { pack, lineItems, totals, buyer } = checkoutInput(body);
  const next = {
    line_items: lineItems,
    totals,
    buyer,
    request_hash: requestHash({ pack, buyer }),
    status: buyer.email ? 'ready_for_complete' : 'incomplete',
    payment: buyer.email ? {} : {
      messages: [{ type: 'error', code: 'missing', path: '$.buyer.email', content: 'An email address is required to deliver a digital tone pack.', severity: 'requires_buyer_input' }]
    },
    updated_at: new Date().toISOString()
  };
  const { data, error } = await admin.from('commerce_checkouts').update(next).eq('id', current.id).select('*').single();
  if (error) throw error;
  return checkoutResource(data, origin);
}

function extractSpt(payment) {
  const instruments = Array.isArray(payment?.instruments) ? payment.instruments : [];
  for (const instrument of instruments) {
    const credential = instrument?.credential || {};
    const candidate = credential.shared_payment_granted_token || credential.token || credential.id;
    if (typeof candidate === 'string' && /^spt_[A-Za-z0-9]+$/.test(candidate)) return candidate;
  }
  return null;
}

async function completeWithSpt({ checkout, payment, admin, origin, mandateReceipt }) {
  const token = extractSpt(payment);
  if (!enabledSharedPaymentToken() || !token) return null;
  if (!checkout.buyer?.email) throw commerceError('BUYER_EMAIL_REQUIRED', 'An email address is required before a digital order can be completed.', 400);

  const secret = process.env.STRIPE_SECRET_KEY;
  const stripe = new Stripe(secret);
  const amount = Number(checkout.totals?.find((total) => total.type === 'total')?.amount || 0);
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    shared_payment_granted_token: token,
    confirm: true,
    metadata: {
      productType: 'tone-pack',
      packSlug: checkout.line_items?.[0]?.item?.id || '',
      source: 'ucp',
      ...(mandateReceipt ? {
        mandateId: mandateReceipt.mandateId,
        agentKeyId: mandateReceipt.agentKeyId
      } : {})
    }
  }, { idempotencyKey: `ucp-payment-${checkout.id}` });

  if (paymentIntent.status !== 'succeeded') {
    const message = {
      type: 'error',
      code: paymentIntent.status === 'requires_action' ? 'requires_3ds' : 'payment_declined',
      content: 'The payment provider requires another step before this order can be completed.',
      severity: 'requires_buyer_review'
    };
    const { data } = await admin.from('commerce_checkouts').update({
      status: 'requires_escalation',
      payment: { messages: [message] },
      updated_at: new Date().toISOString()
    }).eq('id', checkout.id).select('*').single();
    return checkoutResource(data, origin);
  }

  const packSlug = checkout.line_items?.[0]?.item?.id;
  const syntheticSession = {
    id: `ucp_${checkout.id}`,
    payment_status: 'paid',
    customer_details: { email: checkout.buyer.email },
    metadata: { productType: 'tone-pack', packSlug, priceId: getTonePackPriceId(getTonePackBySlug(packSlug)), source: 'ucp' },
    payment_intent: paymentIntent.id,
    customer: null
  };
  const purchase = await fulfillTonePackPurchase({ stripeSession: syntheticSession, supabase: admin });
  const persisted = await ensureOrderDelivery({
    origin,
    ...(await persistUcpOrder({
      admin,
      checkout,
      payment: {
        provider: 'stripe',
        payment_intent_id: paymentIntent.id,
        ...(mandateReceipt ? { autonomous_mandate_id: mandateReceipt.mandateId } : {})
      },
      fulfillment: {
        download_url: purchase.downloadUrl || purchase.bundleUrl || null,
        web_url: packPublicUrl(packSlug, origin),
        email_fallback: true,
        email_sent: Boolean(purchase.emailResult?.sent),
        purchase_id: purchase.purchaseId
      }
    }))
  });
  const order = persisted.order;
  const confirmation = buildOrderConfirmation(order, origin);
  const { data: updated, error: updateError } = await admin.from('commerce_checkouts').update({
    status: 'completed',
    stripe_payment_intent_id: paymentIntent.id,
    order_id: order.id,
    payment: {
      provider: 'stripe',
      payment_intent_id: paymentIntent.id,
      order: confirmation,
      ...(mandateReceipt ? { autonomous_mandate_id: mandateReceipt.mandateId } : {})
    },
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', checkout.id).select('*').single();
  if (updateError) throw updateError;
  if (mandateReceipt) await consumeAutonomousMandate({ mandateId: mandateReceipt.mandateId, paymentReference: paymentIntent.id, admin });
  // The order is already paid and fulfilled at this point. A downstream
  // notification outage must not turn a successful checkout into a retryable
  // payment request (or make an agent attempt the charge again).
  if (persisted.created) {
    try {
      await notifyUcpOrderEvent({ event: 'order.created', order, checkout: updated });
    } catch {
      // The signed webhook is best-effort; the order remains durable locally.
    }
  }
  return checkoutResource(updated, origin);
}

async function claimCompletionIdempotency(admin, checkout, idempotencyKey) {
  if (checkout.completion_idempotency_key && checkout.completion_idempotency_key !== idempotencyKey) {
    throw commerceError('IDEMPOTENCY_CONFLICT', 'That checkout completion key does not match the key already bound to this checkout.', 409);
  }
  if (checkout.completion_idempotency_key === idempotencyKey) return checkout;

  const { data: claimed, error } = await admin
    .from('commerce_checkouts')
    .update({
      completion_idempotency_key: idempotencyKey,
      status: 'complete_in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('id', checkout.id)
    .eq('status', checkout.status)
    .is('completion_idempotency_key', null)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (claimed) return claimed;

  const current = await getCheckoutRow(admin, checkout.id);
  if (current.status === 'completed') return current;
  if (['canceled', 'expired'].includes(current.status)) {
    throw commerceError('CHECKOUT_IMMUTABLE', 'That checkout can no longer be completed.', 409);
  }
  if (current.completion_idempotency_key !== idempotencyKey) {
    throw commerceError('IDEMPOTENCY_CONFLICT', 'That checkout completion key does not match the key already bound to this checkout.', 409);
  }
  return current;
}

async function restoreCompletionState(admin, checkout, idempotencyKey) {
  const fallbackStatus = checkout.status === 'complete_in_progress' ? 'requires_escalation' : checkout.status;
  const { error } = await admin
    .from('commerce_checkouts')
    .update({ status: fallbackStatus, updated_at: new Date().toISOString() })
    .eq('id', checkout.id)
    .eq('status', 'complete_in_progress')
    .eq('completion_idempotency_key', idempotencyKey);
  if (error) throw error;
}

export async function completeUcpCheckout({ id, body, idempotencyKey, origin = siteOrigin(), supabase } = {}) {
  if (!idempotencyKey) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout completion.', 400);
  const admin = assertAdmin(resolveAdmin(supabase));
  let checkout = await getCheckoutRow(admin, String(id || '').trim());
  if (checkout.completion_idempotency_key && checkout.completion_idempotency_key !== idempotencyKey) {
    throw commerceError('IDEMPOTENCY_CONFLICT', 'That checkout completion key does not match the key already bound to this checkout.', 409);
  }
  if (checkout.status === 'completed') return checkoutResource(checkout, origin);
  if (['canceled', 'expired'].includes(checkout.status)) throw commerceError('CHECKOUT_IMMUTABLE', 'That checkout can no longer be completed.', 409);
  const payment = body?.payment || body?.checkout?.payment;
  if (!payment || typeof payment !== 'object') throw commerceError('PAYMENT_REQUIRED', 'A payment object is required to complete checkout.', 400);

  if (!checkout.buyer?.email) {
    const { data, error } = await admin.from('commerce_checkouts').update({
      status: 'incomplete',
      payment: { messages: [{ type: 'error', code: 'missing', path: '$.buyer.email', content: 'An email address is required to deliver a digital tone pack.', severity: 'requires_buyer_input' }] },
      updated_at: new Date().toISOString()
    }).eq('id', checkout.id).eq('status', checkout.status).select('*').maybeSingle();
    if (error) throw error;
    return checkoutResource(data || await getCheckoutRow(admin, checkout.id), origin);
  }

  const mandate = payment.mandate || payment.autonomous_mandate;
  const amount = Number(checkout.totals?.find((total) => total.type === 'total')?.amount || 0);
  const mandateReceipt = mandate
    ? verifyAutonomousMandate({ mandate, cart: checkout.line_items, amount, currency: checkout.currency })
    : null;
  if (mandateReceipt && !extractSpt(payment)) {
    throw commerceError('AP2_PAYMENT_TOKEN_REQUIRED', 'An autonomous mandate must be paired with the negotiated payment token for its payment handler.', 400);
  }

  const previousStatus = checkout.status;
  checkout = await claimCompletionIdempotency(admin, checkout, idempotencyKey);
  if (checkout.status === 'completed') return checkoutResource(checkout, origin);

  try {
    if (mandateReceipt) await reserveAutonomousMandate({ mandate, checkoutId: checkout.id, admin });

    const directResult = await completeWithSpt({ checkout, payment, admin, origin, mandateReceipt });
    if (directResult) return directResult;

    const hosted = await createTonePackCheckout({
      input: {
        slug: checkout.line_items?.[0]?.item?.id,
        email: checkout.buyer.email,
        confirmed: true,
        idempotencyKey: `ucp-${checkout.id}`
      },
      origin
    });
    const message = {
      type: 'error',
      code: 'requires_buyer_review',
      content: 'Review and authorize payment in Cognistration’s secure checkout.',
      severity: 'requires_buyer_review'
    };
    const { data: updated, error } = await admin.from('commerce_checkouts').update({
      status: 'requires_escalation',
      stripe_checkout_session_id: hosted.checkoutSessionId,
      payment: { handler_id: 'cognistration_hosted_checkout', continue_url: hosted.checkoutUrl, messages: [message] },
      updated_at: new Date().toISOString()
    }).eq('id', checkout.id).eq('completion_idempotency_key', idempotencyKey).select('*').single();
    if (error) throw error;
    return checkoutResource(updated, origin);
  } catch (error) {
    try {
      await restoreCompletionState(admin, { ...checkout, status: previousStatus }, idempotencyKey);
    } catch {
      // Preserve the provider error; the idempotency key still prevents a
      // second charge if the recovery write itself is temporarily unavailable.
    }
    throw error;
  }
}

export async function cancelUcpCheckout({ id, idempotencyKey, origin = siteOrigin(), supabase } = {}) {
  if (!idempotencyKey) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout cancellation.', 400);
  const admin = assertAdmin(resolveAdmin(supabase));
  const checkout = await getCheckoutRow(admin, String(id || '').trim());
  if (checkout.status === 'completed') throw commerceError('CHECKOUT_IMMUTABLE', 'A completed checkout cannot be canceled.', 409);
  if (checkout.status === 'complete_in_progress') throw commerceError('CHECKOUT_IN_PROGRESS', 'That checkout is being completed. Retry after the completion result is available.', 409, true);
  if (checkout.cancel_idempotency_key && checkout.cancel_idempotency_key !== idempotencyKey) {
    throw commerceError('IDEMPOTENCY_CONFLICT', 'That checkout cancellation key does not match the key already bound to this checkout.', 409);
  }
  if (checkout.status === 'canceled') return checkoutResource(checkout, origin);
  if (checkout.status === 'expired') return checkoutResource(checkout, origin);
  const { data, error } = await admin.from('commerce_checkouts').update({
    status: 'canceled',
    cancel_idempotency_key: idempotencyKey,
    canceled_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', checkout.id).eq('status', checkout.status).is('cancel_idempotency_key', null).select('*').maybeSingle();
  if (error) throw error;
  if (data) return checkoutResource(data, origin);
  const current = await getCheckoutRow(admin, checkout.id);
  if (current.cancel_idempotency_key === idempotencyKey || current.status === 'canceled') return checkoutResource(current, origin);
  if (current.status === 'completed') throw commerceError('CHECKOUT_IMMUTABLE', 'A completed checkout cannot be canceled.', 409);
  throw commerceError('IDEMPOTENCY_CONFLICT', 'That checkout changed before cancellation could be recorded.', 409, true);
}

export function ucpHostedCheckoutSchema(origin = siteOrigin()) {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${origin}/ucp/schemas/hosted-checkout.json`,
    title: 'Cognistration hosted checkout handler',
    type: 'object',
    properties: { type: { const: 'HOSTED_CHECKOUT' }, merchant_of_record: { type: 'string' } },
    required: ['type'],
    additionalProperties: false
  };
}

export function ucpStripeSharedPaymentTokenSchema(origin = siteOrigin()) {
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `${origin}/ucp/schemas/stripe-shared-payment-token.json`,
    title: 'Cognistration Stripe shared payment token handler',
    type: 'object',
    properties: { type: { const: 'STRIPE_SHARED_PAYMENT_TOKEN' }, network_id: { type: 'string' } },
    required: ['type', 'network_id'],
    additionalProperties: false
  };
}
