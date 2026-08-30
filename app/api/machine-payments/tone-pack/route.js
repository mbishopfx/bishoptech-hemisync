import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getTonePackPriceId } from '@/lib/audio/tone-packs.mjs';
import { getPublicTonePack } from '@/lib/agentic/pack-capability.js';
import { createMachinePaymentHandler } from '@/lib/commerce/machine-payment-handler.mjs';
import {
  assertPaidTonePackPaymentIntent,
  buildTonePackPaymentSession,
  parseTonePackPaymentInput,
  tonePackPaymentEnabled,
  tonePackPaymentScope,
  tonePackProtectedDeliveryUrl,
  TONE_PACK_PAYMENT_AMOUNT,
  TONE_PACK_PAYMENT_PRICE_CENTS,
  TONE_PACK_PAYMENT_PROTOCOL
} from '@/lib/commerce/tone-pack-machine-payment.mjs';
import { fulfillTonePackPurchase } from '@/lib/commerce/tone-packs.mjs';
import { commerceError, safeCommerceError, safeCommerceStatus, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 4096;

function noStore(options = {}) {
  return { ...options, headers: { ...(options.headers || {}), 'cache-control': 'no-store' } };
}

function unavailable() {
  return NextResponse.json({
    ok: false,
    code: 'TONE_PACK_PAYMENTS_NOT_ENABLED',
    error: 'Tone-pack agent payments are not enabled until Stripe Machine Payments access and production keys are configured.',
    retryable: true
  }, noStore({ status: 503 }));
}

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) throw commerceError('REQUEST_TOO_LARGE', 'The tone-pack payment request is too large.', 413);

  let body = {};
  if (raw.trim()) {
    try {
      body = JSON.parse(raw);
    } catch {
      throw commerceError('INVALID_JSON', 'The tone-pack payment request must be valid JSON.', 400);
    }
  }
  return parseTonePackPaymentInput(body);
}

function receiptPayload(receipt) {
  return receipt ? {
    method: receipt.method,
    status: receipt.status,
    reference: receipt.reference,
    timestamp: receipt.timestamp
  } : null;
}

export async function GET(request) {
  if (!tonePackPaymentEnabled()) return unavailable();
  return NextResponse.json({
    ok: true,
    service: 'Cognistration tone-pack payments',
    protocol: TONE_PACK_PAYMENT_PROTOCOL,
    method: 'POST',
    amount: TONE_PACK_PAYMENT_AMOUNT,
    amountCents: TONE_PACK_PAYMENT_PRICE_CENTS,
    currency: 'usd',
    paymentHeader: 'Payment-Authorization',
    receiptHeader: 'Payment-Receipt',
    endpoint: `${new URL(request.url).origin}${new URL(request.url).pathname}`,
    input: 'Approved public tone-pack slug, delivery email, and confirmed=true.',
    delivery: 'Verified browser download plus delivery email fallback.',
    acceptsPaymentDetails: false
  }, noStore());
}

export async function POST(request) {
  if (!tonePackPaymentEnabled()) return unavailable();
  if (commerceRateLimited(request, { scope: 'tone-pack-machine-payment', limit: 20 })) {
    return NextResponse.json({ ok: false, error: 'Tone-pack payment requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, noStore({ status: 429 }));
  }

  let input;
  try {
    input = await parseBody(request);
  } catch (error) {
    const safe = safeCommerceError(error, 'The tone-pack payment request could not be prepared.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, noStore({ status: safeCommerceStatus(error, 400) }));
  }

  try {
    const receiptRef = { value: null };
    const scope = tonePackPaymentScope({ slug: input.pack.slug, email: input.email });
    const result = await createMachinePaymentHandler({
      receiptRef,
      scope,
      amount: TONE_PACK_PAYMENT_AMOUNT,
      amountCents: TONE_PACK_PAYMENT_PRICE_CENTS,
      description: `${input.pack.name} tone pack`,
      productType: 'tone-pack-machine-payment',
      metadata: {
        cognistrationMppRoute: 'tone-pack-v1',
        packSlug: input.pack.slug,
        priceId: getTonePackPriceId(input.pack),
        purchaserEmail: input.email
      }
    })(request);

    if (result.status === 402) return result.challenge;

    const receipt = receiptRef.value;
    const paymentReference = receipt?.reference;
    if (!/^pi_[A-Za-z0-9_]+$/.test(String(paymentReference || ''))) {
      throw commerceError('INVALID_PAYMENT_REFERENCE', 'The payment provider did not return a verifiable receipt.', 402, true);
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentReference);
    } catch {
      throw commerceError('PAYMENT_NOT_VERIFIED', 'The tone-pack payment could not be verified yet.', 403, true);
    }
    const verified = assertPaidTonePackPaymentIntent({
      paymentIntent,
      expectedSlug: input.pack.slug,
      expectedEmail: input.email
    });
    const stripeSession = buildTonePackPaymentSession({ paymentIntent, pack: verified.pack, email: verified.email });
    const supabase = getSupabaseAdmin();
    if (!supabase) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Tone-pack delivery is temporarily unavailable.', 503, true);
    const protectedDeliveryUrl = tonePackProtectedDeliveryUrl(verified.pack.slug, paymentReference, siteOrigin());
    const purchase = await fulfillTonePackPurchase({ stripeSession, supabase, fallbackDownloadUrl: protectedDeliveryUrl });
    const downloadUrl = purchase.downloadUrl || purchase.bundleUrl || protectedDeliveryUrl;

    return result.withReceipt(NextResponse.json({
      ok: true,
      status: 'paid',
      resource: {
        type: 'cognistration_tone_pack',
        paymentMethod: 'machine_payment',
        paymentReference,
        pack: getPublicTonePack(verified.pack.slug),
        downloadUrl,
        protectedDeliveryUrl,
        webUrl: `${siteOrigin()}/packs#${encodeURIComponent(verified.pack.slug)}`,
        emailDelivery: {
          attempted: Boolean(purchase.emailResult),
          sent: Boolean(purchase.emailResult?.sent),
          fallbackUrl: protectedDeliveryUrl
        },
        purchaseId: purchase.purchaseId,
        message: 'Payment verified. The pack is ready to download, and delivery email was attempted.'
      },
      receipt: receiptPayload(receipt)
    }, noStore()));
  } catch (error) {
    const safe = safeCommerceError(error, 'Tone-pack payment verification is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, noStore({ status: safeCommerceStatus(error, 402) }));
  }
}
