import { NextResponse } from 'next/server';
import { hashValue, safeCommerceError, safeCommerceStatus, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';
import { createMachinePaymentHandler } from '@/lib/commerce/machine-payment-handler.mjs';
import {
  machinePaymentEnabled,
  MACHINE_PAYMENT_PRICE_CENTS,
  MACHINE_PAYMENT_SESSION_DURATION_SEC,
  MACHINE_PAYMENT_TONE_SCOPE_PREFIX
} from '@/lib/commerce/machine-payments.mjs';
import { issueMachineSessionGrant } from '@/lib/commerce/machine-session-grants.mjs';
import {
  buildMachineGeneratorState,
  MachineGeneratorInputSchema
} from '@/lib/agentic/machine-capability.js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 4096;

function unavailable() {
  return NextResponse.json({
    ok: false,
    code: 'MACHINE_PAYMENTS_NOT_ENABLED',
    error: 'Agent payments are not enabled until Stripe Machine Payments access and production signing keys are configured.',
    retryable: true
  }, { status: 503, headers: { 'cache-control': 'no-store' } });
}

function toneInputKey(input) {
  return JSON.stringify({
    intention: input.intention ?? null,
    toneId: input.toneId ?? null,
    state: input.state ?? null,
    targetState: input.targetState ?? null,
    carrierHz: input.carrierHz ?? null,
    beatHz: input.beatHz ?? null,
    volume: input.volume ?? null
  });
}

function tonePaymentScope(input) {
  return `${MACHINE_PAYMENT_TONE_SCOPE_PREFIX}:${hashValue(toneInputKey(input))}`;
}

async function parseToneInput(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) {
    const error = new Error('The tone session request is too large.');
    error.status = 413;
    error.code = 'REQUEST_TOO_LARGE';
    throw error;
  }

  let body = {};
  if (raw.trim()) {
    try {
      body = JSON.parse(raw);
    } catch {
      const error = new Error('The tone session request must be valid JSON.');
      error.status = 400;
      error.code = 'INVALID_JSON';
      throw error;
    }
  }
  return MachineGeneratorInputSchema.parse(body);
}

function receiptPayload(receipt) {
  return receipt ? {
    method: receipt.method,
    status: receipt.status,
    reference: receipt.reference,
    timestamp: receipt.timestamp
  } : null;
}

export async function GET() {
  if (!machinePaymentEnabled()) return unavailable();
  return NextResponse.json({
    ok: true,
    service: 'Cognistration paid tone sessions',
    protocol: 'Stripe Machine Payments Protocol',
    method: 'POST',
    amountCents: MACHINE_PAYMENT_PRICE_CENTS,
    currency: 'usd',
    paymentHeader: 'Payment-Authorization',
    endpoint: `${siteOrigin()}/api/machine-payments/tone`,
    input: 'Approved public tone ID or short intention with bounded controls.',
    audioStartsOnlyAfterExplicitUserAction: true
  }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(request) {
  if (!machinePaymentEnabled()) return unavailable();
  if (commerceRateLimited(request, { scope: 'machine-payment-tone', limit: 30 })) {
    return NextResponse.json({ ok: false, error: 'Machine payment requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }

  let input;
  let machine;
  try {
    input = await parseToneInput(request);
    machine = await buildMachineGeneratorState(input);
  } catch (error) {
    const safe = safeCommerceError(error, 'The tone session request could not be prepared.');
    return NextResponse.json({ ok: false, error: safe.message, code: error?.code || safe.code || 'INVALID_TONE_REQUEST', retryable: safe.retryable }, {
      status: error?.status || 400,
      headers: { 'cache-control': 'no-store' }
    });
  }

  try {
    const receiptRef = { value: null };
    const result = await createMachinePaymentHandler({
      receiptRef,
      scope: tonePaymentScope(input),
      description: 'Cognistration custom tone session',
      productType: 'machine-tone-session',
      metadata: { toneCapability: machine.capabilityId }
    })(request);

    if (result.status === 402) return result.challenge;

    const receipt = receiptRef.value;
    const grant = await issueMachineSessionGrant({
      receipt,
      scope: MACHINE_PAYMENT_TONE_SCOPE_PREFIX
    });

    return result.withReceipt(NextResponse.json({
      ok: true,
      status: 'paid',
      resource: {
        type: 'cognistration_custom_tone_session',
        accessType: grant.accessType,
        accessKey: grant.accessKey,
        accessKeyHint: grant.accessKeyHint,
        launchUrl: grant.accessUrl,
        durationSec: MACHINE_PAYMENT_SESSION_DURATION_SEC,
        startsAt: grant.startsAt,
        expiresAt: grant.expiresAt,
        scope: MACHINE_PAYMENT_TONE_SCOPE_PREFIX,
        endpoint: `${siteOrigin()}/machine`,
        controls: machine.controls,
        tone: machine.tone,
        seededBy: machine.seededBy,
        availableActions: machine.availableActions,
        message: machine.message,
        audioStartsOnlyAfterExplicitUserAction: true
      },
      receipt: receiptPayload(receipt)
    }, { headers: { 'cache-control': 'no-store' } }));
  } catch (error) {
    const safe = safeCommerceError(error, 'Machine tone payment verification is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: safeCommerceStatus(error, 402),
      headers: { 'cache-control': 'no-store' }
    });
  }
}
