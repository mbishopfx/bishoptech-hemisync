import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { Mppx, stripe } from 'mppx/server';
import { machinePaymentEnabled, MACHINE_PAYMENT_PRICE_CENTS, MACHINE_PAYMENT_SESSION_DURATION_SEC } from '@/lib/commerce/machine-payments.mjs';
import { issueMachineSessionGrant } from '@/lib/commerce/machine-session-grants.mjs';
import { safeCommerceError, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PAYMENT_SCOPE = 'cognistration-machine-session-v1';

function unavailable() {
  return NextResponse.json({
    ok: false,
    code: 'MACHINE_PAYMENTS_NOT_ENABLED',
    error: 'Agent payments are not enabled until Stripe Machine Payments access and production signing keys are configured.',
    retryable: true
  }, { status: 503, headers: { 'cache-control': 'no-store' } });
}

function createPaymentHandler(receiptRef) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const stripeClient = new Stripe(secretKey);
  const machinePayments = stripe.create({
    client: stripeClient,
    networkId: process.env.STRIPE_NETWORK_ID,
    livemode: !secretKey.includes('_test_')
  });
  const charge = machinePayments.spt.charge({
    paymentMethodTypes: ['card', 'link'],
    description: 'Cognistration one-session machine access',
    metadata: {
      productType: 'machine-session',
      product: 'cognistration',
      amountCents: String(MACHINE_PAYMENT_PRICE_CENTS)
    },
    onPaymentSuccess: ({ receipt }) => {
      receiptRef.value = receipt;
    }
  });
  const mppx = Mppx.create({
    methods: [charge],
    secretKey: process.env.MPP_SECRET_KEY,
    realm: new URL(siteOrigin()).hostname
  });
  return mppx.stripe.charge({
    amount: String(MACHINE_PAYMENT_PRICE_CENTS),
    scope: PAYMENT_SCOPE
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
        scope: PAYMENT_SCOPE,
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
