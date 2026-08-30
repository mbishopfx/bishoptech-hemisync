import { NextResponse } from 'next/server';
import { createTonePackCheckout } from '@/lib/commerce/agent-checkout.mjs';
import { safeCommerceError, safeCommerceStatus, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';
import { applyCors, resolveAllowedOrigin } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function json(req, body, status = 200) {
  return applyCors(req, NextResponse.json(body, {
    status,
    headers: { 'cache-control': 'no-store' }
  }));
}

function originAllowed(req) {
  const requestOrigin = req.headers.get('origin');
  return !requestOrigin || Boolean(resolveAllowedOrigin(requestOrigin));
}

export function OPTIONS(req) {
  return applyCors(req, new NextResponse(null, { status: 204 }));
}

export async function POST(req) {
  if (!originAllowed(req)) {
    return json(req, { ok: false, error: 'This checkout can only be started from Cognistration.', code: 'ORIGIN_NOT_ALLOWED', retryable: false }, 403);
  }
  if (commerceRateLimited(req, { scope: 'tone-pack-checkout', limit: 12 })) {
    return json(req, { ok: false, error: 'Checkout requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, 429);
  }
  try {
    const result = await createTonePackCheckout({
      input: await req.json(),
      origin: siteOrigin()
    });
    return json(req, result, 201);
  } catch (error) {
    const safe = safeCommerceError(error, 'Tone-pack checkout is temporarily unavailable.');
    return json(req, { ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, safeCommerceStatus(error));
  }
}
