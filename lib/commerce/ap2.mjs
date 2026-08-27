import crypto from 'node:crypto';
import { z } from 'zod';
import { commerceError, constantTimeEqual, hashValue, isMissingTableError, siteOrigin } from './commerce-utils.mjs';
import { officialAp2Readiness } from './ap2-official.mjs';

export const AP2_SPEC_URL = 'https://ap2-protocol.org/ap2/specification/';
export const AP2_MANDATE_SPEC_URL = 'https://ap2-protocol.org/ap2/payment_mandate/';

export const AutonomousMandateSchema = z.object({
  version: z.literal('ap2-v1'),
  mandateId: z.string().trim().min(8).max(160),
  mode: z.literal('autonomous'),
  agentKeyId: z.string().trim().min(1).max(200),
  userApproved: z.literal(true),
  currency: z.string().trim().toLowerCase().length(3),
  amountMax: z.coerce.number().int().positive().max(10_000_000),
  cartHash: z.string().regex(/^[a-f0-9]{64}$/),
  expiresAt: z.string().datetime({ offset: true }),
  signatureAlgorithm: z.enum(['Ed25519', 'HMAC-SHA256']),
  signature: z.string().min(16).max(4096)
}).strict();

export function autonomousPaymentEnabled() {
  return String(process.env.AP2_ENABLED || '').toLowerCase() === 'true'
    && String(process.env.UCP_SHARED_PAYMENT_TOKEN_ENABLED || '').toLowerCase() === 'true'
    && Boolean(process.env.STRIPE_SECRET_KEY)
    && Boolean(process.env.STRIPE_NETWORK_ID)
    && Boolean(process.env.AP2_AGENT_PUBLIC_JWK || process.env.AP2_MANDATE_SECRET);
}

export function autonomousPaymentOptions(origin = siteOrigin()) {
  const enabled = autonomousPaymentEnabled();
  const official = officialAp2Readiness(origin);
  return {
    capabilityId: 'cognistration-autonomous-payments',
    version: '0.1.0',
    protocol: 'AP2-compatible autonomous payment mandates',
    specification: AP2_SPEC_URL,
    mandateSpecification: AP2_MANDATE_SPEC_URL,
    status: enabled ? 'enabled' : 'provider_access_required',
    officialAp2: official,
    userApprovalRequired: true,
    closedMandateRequired: true,
    agentIdentityRequired: true,
    merchantVerificationRequired: true,
    signedReceiptRequired: true,
    refundAndDisputeHandling: true,
    endpoint: `${origin}/api/ucp/checkout-sessions/{checkoutId}/complete`,
    note: enabled
      ? 'Autonomous completion is enabled only for a verified, unexpired mandate whose signed cart hash and amount cap match this checkout.'
      : 'AP2 is staged behind provider access, shared payment tokens, an agent signing-key registry, and merchant verification. Hosted checkout remains the safe fallback.'
  };
}

function mandatePayload(mandate) {
  return JSON.stringify({
    version: mandate.version,
    mandateId: mandate.mandateId,
    mode: mandate.mode,
    agentKeyId: mandate.agentKeyId,
    userApproved: mandate.userApproved,
    currency: mandate.currency,
    amountMax: mandate.amountMax,
    cartHash: mandate.cartHash,
    expiresAt: mandate.expiresAt
  });
}

export function hashMandateCart(cart) {
  return hashValue(JSON.stringify(cart || []));
}

function verifyMandateSignature(mandate) {
  const payload = Buffer.from(mandatePayload(mandate));
  const signature = Buffer.from(mandate.signature, 'base64url');
  if (mandate.signatureAlgorithm === 'Ed25519') {
    const rawJwk = String(process.env.AP2_AGENT_PUBLIC_JWK || '').trim();
    if (!rawJwk) return false;
    try {
      return crypto.verify(null, payload, crypto.createPublicKey({ key: JSON.parse(rawJwk), format: 'jwk' }), signature);
    } catch {
      return false;
    }
  }

  const secret = String(process.env.AP2_MANDATE_SECRET || '').trim();
  if (!secret) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return constantTimeEqual(expected, mandate.signature);
}

export function verifyAutonomousMandate({ mandate: input, cart, amount, currency, now = new Date() } = {}) {
  if (!autonomousPaymentEnabled()) throw commerceError('AP2_PROVIDER_ACCESS_REQUIRED', 'Autonomous payment mandates are not enabled for this merchant yet.', 503, true);
  const mandate = AutonomousMandateSchema.parse(input || {});
  if (mandate.currency !== String(currency || '').toLowerCase()) throw commerceError('MANDATE_CURRENCY_MISMATCH', 'The autonomous mandate currency does not match this checkout.', 409);
  if (Number(amount) > mandate.amountMax) throw commerceError('MANDATE_AMOUNT_EXCEEDED', 'The checkout total exceeds the user-approved mandate limit.', 409);
  if (new Date(mandate.expiresAt).getTime() <= now.getTime()) throw commerceError('MANDATE_EXPIRED', 'The autonomous payment mandate has expired.', 409);
  if (mandate.cartHash !== hashMandateCart(cart)) throw commerceError('MANDATE_CART_MISMATCH', 'The signed autonomous mandate does not match this checkout cart.', 409);
  if (!verifyMandateSignature(mandate)) throw commerceError('MANDATE_SIGNATURE_INVALID', 'The autonomous payment mandate signature could not be verified.', 401);
  return {
    verified: true,
    mandateId: mandate.mandateId,
    agentKeyId: mandate.agentKeyId,
    expiresAt: mandate.expiresAt,
    amountMax: mandate.amountMax
  };
}

export async function reserveAutonomousMandate({ mandate, checkoutId, admin, now = new Date() } = {}) {
  if (!admin) throw commerceError('AP2_STORAGE_NOT_READY', 'Autonomous payment audit storage is not available yet.', 503, true);
  const record = {
    mandate_id: mandate.mandateId,
    checkout_id: checkoutId,
    agent_key_id: mandate.agentKeyId,
    cart_hash: mandate.cartHash,
    currency: mandate.currency,
    amount_max: mandate.amountMax,
    expires_at: mandate.expiresAt,
    signature_hash: hashValue(mandate.signature),
    status: 'reserved',
    updated_at: now.toISOString()
  };
  const { data: existing, error: readError } = await admin.from('ap2_mandates').select('*').eq('mandate_id', mandate.mandateId).maybeSingle();
  if (readError) {
    if (isMissingTableError(readError)) throw commerceError('AP2_STORAGE_NOT_READY', 'Autonomous payment audit storage is not available yet.', 503, true);
    throw readError;
  }
  if (existing) {
    if (existing.checkout_id !== checkoutId) throw commerceError('MANDATE_REPLAYED', 'That autonomous mandate is bound to another checkout.', 409);
    if (existing.status === 'consumed') throw commerceError('MANDATE_REPLAYED', 'That autonomous mandate has already been used.', 409);
    if (existing.status === 'revoked' || new Date(existing.expires_at).getTime() <= now.getTime()) throw commerceError('MANDATE_EXPIRED', 'That autonomous mandate is no longer active.', 409);
    return existing;
  }
  const { data, error } = await admin.from('ap2_mandates').insert(record).select('*').single();
  if (error) {
    if (error.code === '23505') return reserveAutonomousMandate({ mandate, checkoutId, admin, now });
    throw error;
  }
  return data;
}

export async function consumeAutonomousMandate({ mandateId, paymentReference, admin, now = new Date() } = {}) {
  if (!admin || !mandateId) return;
  const { error } = await admin.from('ap2_mandates').update({
    status: 'consumed',
    payment_reference: paymentReference || null,
    consumed_at: now.toISOString(),
    updated_at: now.toISOString()
  }).eq('mandate_id', mandateId).eq('status', 'reserved');
  if (error && !isMissingTableError(error)) throw error;
}
