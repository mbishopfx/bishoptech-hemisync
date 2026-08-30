import { z } from 'zod';
import { getTonePackBySlug, getTonePackPriceId } from '../audio/tone-packs.db.mjs';
import { commerceError, hashValue, normalizeEmail, siteOrigin } from './commerce-utils.mjs';

export const TONE_PACK_PAYMENT_PRICE_CENTS = 599;
export const TONE_PACK_PAYMENT_AMOUNT = (TONE_PACK_PAYMENT_PRICE_CENTS / 100).toFixed(2);
export const TONE_PACK_PAYMENT_PROTOCOL = 'Stripe Machine Payments Protocol';
export const TONE_PACK_PAYMENT_SCOPE_PREFIX = 'cognistration-tone-pack-v1';
export const TONE_PACK_PAYMENT_DEFAULT_SLUG = 'full-spectrum-pack';
export const TONE_PACK_PAYMENT_PRODUCT_TYPE = 'tone-pack-machine-payment';

export const TonePackPaymentInputSchema = z.object({
  slug: z.string().trim().min(1).max(120).optional().default(TONE_PACK_PAYMENT_DEFAULT_SLUG),
  email: z.string().trim().min(3).max(254),
  confirmed: z.boolean()
}).strict();

export function tonePackPaymentEnabled() {
  return String(process.env.MPP_ENABLED || '').toLowerCase() === 'true'
    && Boolean(process.env.STRIPE_NETWORK_ID)
    && Boolean(process.env.STRIPE_SECRET_KEY)
    && Boolean(process.env.MPP_SECRET_KEY);
}

export function parseTonePackPaymentInput(input = {}) {
  const parsed = TonePackPaymentInputSchema.parse(input);
  if (parsed.confirmed !== true) {
    throw commerceError('CONFIRMATION_REQUIRED', 'Confirm the $5.99 tone pack and delivery email before payment begins.', 400);
  }

  const pack = getTonePackBySlug(parsed.slug);
  if (!pack) throw commerceError('NOT_FOUND', 'That tone pack is not in the approved public catalog.', 404);

  return {
    ...parsed,
    slug: pack.slug,
    email: normalizeEmail(parsed.email),
    pack
  };
}

export function tonePackPaymentScope({ slug, email } = {}) {
  const normalizedSlug = String(slug || '').trim();
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedSlug) throw commerceError('INVALID_PACK', 'A published tone-pack slug is required.', 400);
  return `${TONE_PACK_PAYMENT_SCOPE_PREFIX}:${hashValue(`${normalizedSlug}|${normalizedEmail}`)}`;
}

export function tonePackPaymentOptions(origin = siteOrigin()) {
  const enabled = tonePackPaymentEnabled();
  return {
    capabilityId: 'cognistration-tone-pack-payments',
    version: '0.1.0',
    protocol: TONE_PACK_PAYMENT_PROTOCOL,
    status: enabled ? 'enabled' : 'provider_access_required',
    price: '$5.99',
    amount: TONE_PACK_PAYMENT_AMOUNT,
    amountCents: TONE_PACK_PAYMENT_PRICE_CENTS,
    currency: 'usd',
    method: 'POST',
    endpoint: `${origin}/api/machine-payments/tone-pack`,
    resource: 'one published Cognistration tone-pack bundle',
    defaultPack: TONE_PACK_PAYMENT_DEFAULT_SLUG,
    packSelection: 'Any approved public tone-pack slug is accepted; the server fixes the amount at $5.99.',
    input: 'Published tone-pack slug, delivery email, and confirmed=true. The payment credential belongs in the Payment-Authorization header, never in the JSON body.',
    delivery: {
      emailRequired: true,
      browserDownload: true,
      emailFallback: true,
      protectedDownloadQuery: 'payment_reference'
    },
    browserFallback: `${origin}/packs#${encodeURIComponent(TONE_PACK_PAYMENT_DEFAULT_SLUG)}`,
    acceptsPaymentDetails: false,
    activation: {
      providerAccess: 'Stripe Machine Payments access is required for the live account.',
      requiredProductionConfiguration: ['MPP_ENABLED=true', 'STRIPE_NETWORK_ID', 'STRIPE_SECRET_KEY', 'MPP_SECRET_KEY'],
      paymentHeader: 'Payment-Authorization',
      receiptHeader: 'Payment-Receipt'
    },
    note: enabled
      ? 'The route returns an MPP challenge and verifies the exact $5.99 Stripe PaymentIntent before releasing the bundle and sending delivery email.'
      : 'Enable Stripe Machine Payments access, set the listed production configuration, and turn on MPP_ENABLED before accepting agent payments.'
  };
}

export function tonePackProtectedDeliveryUrl(packSlug, paymentReference, origin = siteOrigin()) {
  const slug = String(packSlug || '').trim();
  const reference = String(paymentReference || '').trim();
  if (!slug) return null;
  if (/^cs_[A-Za-z0-9_]+$/.test(reference)) {
    return `${origin}/api/packs/${encodeURIComponent(slug)}/download?session_id=${encodeURIComponent(reference)}`;
  }
  if (/^pi_[A-Za-z0-9_]+$/.test(reference)) {
    return `${origin}/api/packs/${encodeURIComponent(slug)}/download?payment_reference=${encodeURIComponent(reference)}`;
  }
  return null;
}

export function assertPaidTonePackPaymentIntent({ paymentIntent, expectedSlug, expectedEmail } = {}) {
  if (!paymentIntent?.id || !/^pi_[A-Za-z0-9_]+$/.test(paymentIntent.id)) {
    throw commerceError('INVALID_PAYMENT_REFERENCE', 'The payment reference is not valid.', 403);
  }
  if (paymentIntent.status !== 'succeeded') {
    throw commerceError('PAYMENT_NOT_VERIFIED', 'The tone-pack payment has not completed.', 403);
  }
  if (paymentIntent.amount !== TONE_PACK_PAYMENT_PRICE_CENTS || paymentIntent.currency !== 'usd') {
    throw commerceError('PAYMENT_MISMATCH', 'The payment does not match the approved $5.99 tone-pack price.', 403);
  }

  const metadata = paymentIntent.metadata || {};
  const pack = getTonePackBySlug(metadata.packSlug || metadata.planId);
  if (!pack || (expectedSlug && pack.slug !== expectedSlug)) {
    throw commerceError('PAYMENT_MISMATCH', 'The payment does not match the selected tone pack.', 403);
  }

  const expectedPriceId = getTonePackPriceId(pack);
  if (metadata.productType !== TONE_PACK_PAYMENT_PRODUCT_TYPE
    || metadata.cognistrationMppRoute !== 'tone-pack-v1'
    || metadata.mpp_intent !== 'charge'
    || metadata.mpp_server_id !== new URL(siteOrigin()).hostname
    || metadata.amountCents !== String(TONE_PACK_PAYMENT_PRICE_CENTS)
    || metadata.priceId !== expectedPriceId) {
    throw commerceError('PAYMENT_MISMATCH', 'The payment is not a verified Cognistration tone-pack transaction.', 403);
  }

  const email = normalizeEmail(metadata.purchaserEmail || paymentIntent.receipt_email);
  if (expectedEmail && email !== normalizeEmail(expectedEmail)) {
    throw commerceError('PAYMENT_MISMATCH', 'The payment email does not match the delivery request.', 403);
  }

  return { pack, email };
}

export function buildTonePackPaymentSession({ paymentIntent, pack, email } = {}) {
  if (!paymentIntent?.id || !pack?.slug) throw new Error('A verified tone-pack payment and pack are required');
  const normalizedEmail = normalizeEmail(email);
  const priceId = getTonePackPriceId(pack);
  return {
    id: `mpp_${paymentIntent.id}`,
    payment_status: 'paid',
    customer_details: { email: normalizedEmail },
    customer_email: normalizedEmail,
    customer: typeof paymentIntent.customer === 'string' ? paymentIntent.customer : null,
    metadata: {
      productType: 'tone-pack',
      planId: pack.slug,
      packSlug: pack.slug,
      priceId,
      purchaserEmail: normalizedEmail,
      source: 'mpp-tone-pack'
    },
    payment_intent: paymentIntent.id,
    line_items: { data: [{ price: { id: priceId }, quantity: 1 }] }
  };
}
