import { NextResponse } from 'next/server';
import { machinePaymentEnabled, MACHINE_PAYMENT_PRICE_CENTS, MACHINE_PAYMENT_SESSION_DURATION_SEC, MACHINE_PAYMENT_SESSION_SCOPE } from '@/lib/commerce/machine-payments.mjs';
import { createMachinePaymentHandler } from '@/lib/commerce/machine-payment-handler.mjs';
import { issueMachineSessionGrant } from '@/lib/commerce/machine-session-grants.mjs';
import { safeCommerceError, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function unavailable() {
  return NextResponse.json({
    ok: false,
    code: 'MACHINE_PAYMENTS_NOT_ENABLED',
    error: 'Agent payments are not enabled until Stripe Machine Payments access and production signing keys are configured.',
    retryable: true
  }, { status: 503, headers: { 'cache-control': 'no-store' } });
}

function createPaymentHandler(receiptRef) {
  return createMachinePaymentHandler({
    receiptRef,
    scope: MACHINE_PAYMENT_SESSION_SCOPE,
    description: 'Cognistration one-session machine access',
    productType: 'machine-session'
  });
}

export async function GET(request) {
  if (!machinePaymentEnabled()) return unavailable();
  return NextResponse.json({
    ok: true,
    service: 'Cognistration machine session payments',
    protocol: 'Stripe Machine Payments Protocol',
    method: 'POST',
    amountCents: MACHINE_PAYMENT_PRICE_CENTS,
    currency: 'usd',
    paymentHeader: 'Payment-Authorization',
    endpoint: `${new URL(request.url).origin}${new URL(request.url).pathname}`
  }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(request) {
  if (!machinePaymentEnabled()) return unavailable();
  if (commerceRateLimited(request, { scope: 'machine-payment', limit: 30 })) {
    return NextResponse.json({ ok: false, error: 'Machine payment requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }

  if ((request.headers.get('accept') || '').includes('text/html')) {
    return NextResponse.redirect(`${siteOrigin()}/pricing#machine-workshop`, 303);
  }

  try {
    const receiptRef = { value: null };
    const handler = createPaymentHandler(receiptRef);
    const result = await handler(request);
    if (result.status === 402) return result.challenge;

    const receipt = receiptRef.value;
    const grant = await issueMachineSessionGrant({ receipt });
    return result.withReceipt(Response.json({
      ok: true,
      status: 'paid',
      resource: {
        type: 'cognistration_machine_session',
        accessType: grant.accessType,
        accessKey: grant.accessKey,
        accessKeyHint: grant.accessKeyHint,
        launchUrl: grant.accessUrl,
        durationSec: MACHINE_PAYMENT_SESSION_DURATION_SEC,
        startsAt: grant.startsAt,
        expiresAt: grant.expiresAt,
        scope: MACHINE_PAYMENT_SESSION_SCOPE,
        endpoint: `${siteOrigin()}/machine`,
        controls: ['state', 'carrierHz', 'beatHz', 'volume'],
        audioStartsOnlyAfterExplicitUserAction: true
      },
      receipt: receipt ? {
        method: receipt.method,
        status: receipt.status,
        reference: receipt.reference,
        timestamp: receipt.timestamp
      } : null
    }, { headers: { 'cache-control': 'no-store' } }));
  } catch (error) {
    const safe = safeCommerceError(error, 'Machine payment verification is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: error?.status || 402,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
