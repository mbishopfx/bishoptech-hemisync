import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { issueMachineSessionGrantWithRetry } from '@/lib/commerce/machine-session-grants.mjs';
import {
  constantTimeEqual,
  commerceError,
  safeCommerceError,
  safeCommerceStatus
} from '@/lib/commerce/commerce-utils.mjs';
import { MACHINE_PAYMENT_PRICE_CENTS } from '@/lib/commerce/machine-payments.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 2048;

function noStore(options = {}) {
  return { ...options, headers: { ...(options.headers || {}), 'cache-control': 'no-store' } };
}

function recoveryToken(request) {
  const provided = String(request.headers.get('x-cognistration-recovery-token') || '').trim();
  const expected = String(process.env.MACHINE_PAYMENT_RECOVERY_TOKEN || '').trim();
  if (!provided || !expected || !constantTimeEqual(provided, expected)) {
    throw commerceError('RECOVERY_UNAUTHORIZED', 'Machine payment reconciliation is not available.', 401);
  }
}

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) {
    throw commerceError('REQUEST_TOO_LARGE', 'The reconciliation request is too large.', 413);
  }

  let body;
  try {
    body = raw.trim() ? JSON.parse(raw) : {};
  } catch {
    throw commerceError('INVALID_JSON', 'The reconciliation request must be valid JSON.', 400);
  }

  const paymentIntentId = String(body?.paymentIntentId || '').trim();
  if (!/^pi_[A-Za-z0-9_]+$/.test(paymentIntentId)) {
    throw commerceError('INVALID_PAYMENT_REFERENCE', 'A valid Stripe payment reference is required.', 400);
  }
  return { paymentIntentId };
}

function assertMppPaymentIntent(paymentIntent) {
  if (paymentIntent?.status !== 'succeeded') {
    throw commerceError('PAYMENT_NOT_VERIFIED', 'That payment has not completed.', 403);
  }
  if (paymentIntent.amount !== MACHINE_PAYMENT_PRICE_CENTS || paymentIntent.currency !== 'usd') {
    throw commerceError('PAYMENT_MISMATCH', 'That payment does not match the approved machine resource.', 403);
  }
  if (paymentIntent.metadata?.mpp_intent !== 'charge' || paymentIntent.metadata?.mpp_server_id !== 'cognistration.com') {
    throw commerceError('PAYMENT_MISMATCH', 'That payment is not a Cognistration machine-payment transaction.', 403);
  }
}

export async function POST(request) {
  try {
    recoveryToken(request);
    const { paymentIntentId } = await parseBody(request);
    const secretKey = String(process.env.STRIPE_SECRET_KEY || '').trim();
    if (!secretKey) throw commerceError('STRIPE_UNAVAILABLE', 'Payment verification is temporarily unavailable.', 503, true);

    const stripe = new Stripe(secretKey);
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch {
      throw commerceError('PAYMENT_NOT_VERIFIED', 'That payment could not be verified.', 403);
    }
    assertMppPaymentIntent(paymentIntent);

    const grant = await issueMachineSessionGrantWithRetry({
      receipt: {
        method: 'stripe',
        status: 'success',
        reference: paymentIntent.id,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      ok: true,
      status: 'paid',
      resource: {
        type: 'cognistration_custom_tone_session',
        accessType: grant.accessType,
        accessKey: grant.accessKey,
        accessKeyHint: grant.accessKeyHint,
        launchUrl: grant.accessUrl,
        durationSec: grant.sessionDurationSec,
        startsAt: grant.startsAt,
        expiresAt: grant.expiresAt,
        scope: grant.scope
      }
    }, noStore());
  } catch (error) {
    const safe = safeCommerceError(error, 'Machine payment reconciliation is temporarily unavailable.');
    return NextResponse.json({ ok: false, code: safe.code, error: safe.message, retryable: safe.retryable }, noStore({ status: safeCommerceStatus(error, 500) }));
  }
}
