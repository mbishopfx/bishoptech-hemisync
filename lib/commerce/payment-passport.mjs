import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { MACHINE_PAYMENT_PRICE_CENTS } from './machine-payments.mjs';

export const PAYMENT_PASSPORT_VERSION = 'cognistration-payment-passport-v1';
export const PAYMENT_PASSPORT_TTL_SEC = 5 * 60;
export const PAYMENT_PASSPORT_PRODUCT = 'machine-session';
export const PAYMENT_PASSPORT_RECIPIENT = 'cognistration.com';
export const PAYMENT_PASSPORT_CONFIRMATION_SCOPE = 'single-resource';

const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9._:-]{8,80}$/;

const PaymentPassportPayloadSchema = z.object({
  version: z.literal(PAYMENT_PASSPORT_VERSION),
  intentId: z.string().uuid(),
  amountCents: z.number().int().positive(),
  currency: z.literal('usd'),
  product: z.literal(PAYMENT_PASSPORT_PRODUCT),
  recipient: z.literal(PAYMENT_PASSPORT_RECIPIENT),
  confirmationScope: z.literal(PAYMENT_PASSPORT_CONFIRMATION_SCOPE),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  idempotencyKey: z.string().regex(IDEMPOTENCY_PATTERN)
}).strict();

const PaymentPassportSchema = PaymentPassportPayloadSchema.extend({
  signature: z.string().regex(/^[a-f0-9]{64}$/)
}).strict();

function signingPayload(passport) {
  return JSON.stringify({
    version: passport.version,
    intentId: passport.intentId,
    amountCents: passport.amountCents,
    currency: passport.currency,
    product: passport.product,
    recipient: passport.recipient,
    confirmationScope: passport.confirmationScope,
    issuedAt: passport.issuedAt,
    expiresAt: passport.expiresAt,
    idempotencyKey: passport.idempotencyKey
  });
}

function signatureFor(passport, secret) {
  return createHmac('sha256', String(secret)).update(signingPayload(passport)).digest('hex');
}

function invalid(code) {
  return { valid: false, code };
}

export function createPaymentPassport({ secret, idempotencyKey, now = new Date(), intentId = randomUUID() } = {}) {
  if (!String(secret || '').trim()) throw new Error('A payment passport signing secret is required.');
  if (!IDEMPOTENCY_PATTERN.test(String(idempotencyKey || ''))) throw new Error('A valid payment passport idempotency key is required.');

  const issuedAt = new Date(now);
  const expiresAt = new Date(issuedAt.getTime() + PAYMENT_PASSPORT_TTL_SEC * 1000);
  const payload = PaymentPassportPayloadSchema.parse({
    version: PAYMENT_PASSPORT_VERSION,
    intentId,
    amountCents: MACHINE_PAYMENT_PRICE_CENTS,
    currency: 'usd',
    product: PAYMENT_PASSPORT_PRODUCT,
    recipient: PAYMENT_PASSPORT_RECIPIENT,
    confirmationScope: PAYMENT_PASSPORT_CONFIRMATION_SCOPE,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    idempotencyKey
  });

  return { ...payload, signature: signatureFor(payload, secret) };
}

export function verifyPaymentPassport(input, { secret, now = new Date() } = {}) {
  if (!String(secret || '').trim()) return invalid('SIGNING_SECRET_UNAVAILABLE');

  const parsed = PaymentPassportSchema.safeParse(input);
  if (!parsed.success) return invalid('INVALID_PASSPORT');
  const passport = parsed.data;

  if (passport.amountCents !== MACHINE_PAYMENT_PRICE_CENTS) return invalid('AMOUNT_NOT_ALLOWED');

  const expected = signatureFor(passport, secret);
  const actualBuffer = Buffer.from(passport.signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return invalid('SIGNATURE_INVALID');

  const nowMs = new Date(now).getTime();
  const issuedAtMs = new Date(passport.issuedAt).getTime();
  const expiresAtMs = new Date(passport.expiresAt).getTime();
  if (!Number.isFinite(nowMs) || !Number.isFinite(issuedAtMs) || !Number.isFinite(expiresAtMs)) return invalid('TIMESTAMP_INVALID');
  if (expiresAtMs <= issuedAtMs || nowMs < issuedAtMs - 30_000) return invalid('PASSPORT_NOT_ACTIVE');
  if (nowMs >= expiresAtMs) return invalid('PASSPORT_EXPIRED');

  return {
    valid: true,
    payload: {
      version: passport.version,
      intentId: passport.intentId,
      amountCents: passport.amountCents,
      currency: passport.currency,
      product: passport.product,
      recipient: passport.recipient,
      confirmationScope: passport.confirmationScope,
      issuedAt: passport.issuedAt,
      expiresAt: passport.expiresAt,
      idempotencyKey: passport.idempotencyKey
    }
  };
}
