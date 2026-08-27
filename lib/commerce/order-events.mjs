import crypto from 'node:crypto';
import { hashValue, siteOrigin } from './commerce-utils.mjs';

export const UCP_ORDER_VERSION = '2026-01-23';

const SIGNING_ALGORITHMS = new Map([
  ['P-256', { alg: 'ES256', digest: 'sha256', size: 64 }],
  ['P-384', { alg: 'ES384', digest: 'sha384', size: 96 }],
  ['P-521', { alg: 'ES512', digest: 'sha512', size: 132 }]
]);

function encode(value) {
  return Buffer.from(value).toString('base64url');
}

function decodeJson(value) {
  return JSON.parse(Buffer.from(String(value), 'base64url').toString('utf8'));
}

function readPrivateSigningKey() {
  const raw = String(process.env.UCP_SIGNING_PRIVATE_JWK || '').trim();
  if (!raw) return null;
  try {
    const jwk = JSON.parse(raw);
    if (!jwk || typeof jwk !== 'object' || Array.isArray(jwk) || !jwk.d || !jwk.kty) return null;
    return jwk;
  } catch {
    return null;
  }
}

function signingProfile(jwk) {
  const profile = SIGNING_ALGORITHMS.get(jwk?.crv);
  if (!profile || jwk.kty !== 'EC') return null;
  const alg = String(process.env.UCP_SIGNING_ALGORITHM || jwk.alg || profile.alg).trim();
  if (alg !== profile.alg) return null;
  const kid = String(process.env.UCP_SIGNING_KEY_ID || jwk.kid || '').trim();
  if (!kid || kid.length > 200) return null;
  return { ...profile, kid };
}

/**
 * Sign an order webhook using RFC 7797's detached JWS representation.
 * The raw JSON body is the unencoded payload, so the protected header marks
 * `b64` as false and the receiver can verify the exact bytes it received.
 */
export function createUcpDetachedSignature({ body, privateJwk } = {}) {
  if (typeof body !== 'string' || !body) return null;
  const jwk = privateJwk || readPrivateSigningKey();
  const profile = signingProfile(jwk);
  if (!profile) return null;

  const header = {
    alg: profile.alg,
    kid: profile.kid,
    b64: false,
    crit: ['b64']
  };
  const encodedHeader = encode(JSON.stringify(header));
  const signingInput = Buffer.from(`${encodedHeader}.${body}`, 'utf8');
  try {
    const key = crypto.createPrivateKey({ key: jwk, format: 'jwk' });
    const signature = crypto.sign(profile.digest, signingInput, {
      key,
      dsaEncoding: 'ieee-p1363'
    });
    if (signature.length !== profile.size) return null;
    return `${encodedHeader}..${signature.toString('base64url')}`;
  } catch {
    return null;
  }
}

export function verifyUcpDetachedSignature({ body, provided, publicJwk } = {}) {
  if (typeof body !== 'string' || !body || typeof provided !== 'string') return false;
  const parts = provided.split('.');
  if (parts.length !== 3 || parts[1] !== '') return false;
  let header;
  try { header = decodeJson(parts[0]); } catch { return false; }
  const profile = SIGNING_ALGORITHMS.get(publicJwk?.crv);
  if (!profile || publicJwk?.kty !== 'EC' || header.alg !== profile.alg || !header.kid || header.kid !== publicJwk.kid) return false;
  if (header.b64 !== false || !Array.isArray(header.crit) || !header.crit.includes('b64')) return false;
  let signature;
  try { signature = Buffer.from(parts[2], 'base64url'); } catch { return false; }
  if (signature.length !== profile.size) return false;
  try {
    return crypto.verify(profile.digest, Buffer.from(`${parts[0]}.${body}`, 'utf8'), {
      key: crypto.createPublicKey({ key: publicJwk, format: 'jwk' }),
      dsaEncoding: 'ieee-p1363'
    }, signature);
  } catch {
    return false;
  }
}

function numericQuantity(value, fallback = 1) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity >= 1 ? quantity : fallback;
}

function orderLineItem(lineItem) {
  const quantity = numericQuantity(lineItem?.quantity?.total ?? lineItem?.quantity);
  const requestedFulfilled = Number(lineItem?.quantity?.fulfilled);
  const fulfilled = Number.isInteger(requestedFulfilled) && requestedFulfilled >= 0
    ? Math.min(quantity, requestedFulfilled)
    : quantity;
  return {
    id: String(lineItem?.id || lineItem?.item?.id || '').slice(0, 160),
    item: lineItem?.item || {},
    quantity: { total: quantity, fulfilled },
    totals: Array.isArray(lineItem?.totals) ? lineItem.totals : [],
    status: fulfilled === quantity ? 'fulfilled' : (fulfilled > 0 ? 'partial' : 'processing')
  };
}

function digitalFulfillment({ order, lineItems, event, occurredAt }) {
  const existing = order?.fulfillment && typeof order.fulfillment === 'object' ? order.fulfillment : {};
  const safeExisting = { ...existing };
  // Delivery URLs and provider bookkeeping are available through the
  // authenticated order-fulfillment route, not broadcast in lifecycle events.
  delete safeExisting.download_url;
  delete safeExisting.protected_delivery_url;
  delete safeExisting.purchase_id;
  delete safeExisting.email_sent;
  delete safeExisting.access_key;
  delete safeExisting.accessKey;
  delete safeExisting.access_key_ciphertext;

  return {
    ...safeExisting,
    expectations: Array.isArray(existing.expectations) && existing.expectations.length
      ? existing.expectations
      : [{
        id: `digital_${String(order?.id || 'order').slice(0, 120)}`,
        line_items: lineItems.map((lineItem) => ({ id: lineItem.id, quantity: lineItem.quantity.total })),
        method_type: 'digital',
        destination: {},
        description: 'Digital tone pack delivery is available now.',
        fulfillable_on: 'now'
      }],
    events: Array.isArray(existing.events) && existing.events.length
      ? existing.events
      : [{
        id: `fulfillment_${hashValue(`${event}|${order?.id || 'order'}|${occurredAt}`).slice(0, 32)}`,
        occurred_at: occurredAt,
        type: 'delivered',
        line_items: lineItems.map((lineItem) => ({ id: lineItem.id, quantity: lineItem.quantity.total })),
        description: 'Digital tone pack delivery is available through the order fulfillment link.'
      }]
  };
}

export function buildUcpOrderEvent({ event = 'order.updated', order = {}, checkout, origin = siteOrigin(), now = new Date() } = {}) {
  const occurredAt = String(order.updated_at || now.toISOString());
  const lineItems = (Array.isArray(order.line_items) ? order.line_items : []).map(orderLineItem);
  const orderId = String(order.id || '').slice(0, 160);
  const eventId = `evt_${hashValue(`${event}|${orderId}|${occurredAt}`).slice(0, 48)}`;
  return {
    ucp: {
      version: UCP_ORDER_VERSION,
      capabilities: { 'dev.ucp.shopping.order': [{ version: UCP_ORDER_VERSION }] }
    },
    id: orderId,
    checkout_id: String(order.checkout_id || checkout?.id || '').slice(0, 160),
    permalink_url: `${origin}/api/ucp/orders/${encodeURIComponent(orderId)}`,
    line_items: lineItems,
    fulfillment: digitalFulfillment({ order, lineItems, event, occurredAt }),
    adjustments: Array.isArray(order.adjustments) ? order.adjustments : [],
    totals: Array.isArray(order.totals) ? order.totals : [],
    event_id: eventId,
    created_time: occurredAt
  };
}

export function ucpOrderEventSigningConfigured() {
  return Boolean(process.env.UCP_ORDER_WEBHOOK_URL && signingProfile(readPrivateSigningKey()));
}

export async function notifyUcpOrderEvent({ event, order, checkout, origin = siteOrigin(), fetchImpl = fetch } = {}) {
  const endpoint = String(process.env.UCP_ORDER_WEBHOOK_URL || '').trim();
  if (!endpoint || !ucpOrderEventSigningConfigured()) {
    return { sent: false, skipped: true, reason: 'UCP order webhook signing is not configured.' };
  }

  const payload = JSON.stringify(buildUcpOrderEvent({ event, order, checkout, origin }));
  const requestSignature = createUcpDetachedSignature({ body: payload });
  if (!requestSignature) return { sent: false, skipped: true, reason: 'UCP order webhook signing key is invalid.' };

  const parsedPayload = JSON.parse(payload);
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Request-Signature': requestSignature,
      'X-UCP-Event-Id': parsedPayload.event_id
    },
    body: payload,
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) return { sent: false, reason: `UCP webhook returned ${response.status}`, eventId: parsedPayload.event_id };
  return { sent: true, eventId: parsedPayload.event_id };
}
