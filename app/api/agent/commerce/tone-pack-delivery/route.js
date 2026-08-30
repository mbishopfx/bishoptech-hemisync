import { NextResponse } from 'next/server';
import { getTonePackDelivery } from '@/lib/commerce/agent-checkout.mjs';
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

export async function GET(req) {
  if (!originAllowed(req)) {
    return json(req, { ok: false, error: 'This delivery can only be requested from Cognistration.', code: 'ORIGIN_NOT_ALLOWED', retryable: false }, 403);
  }
  if (commerceRateLimited(req, { scope: 'tone-pack-delivery', limit: 20 })) {
    return json(req, { ok: false, error: 'Delivery requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, 429);
  }
  try {
    const url = new URL(req.url);
    const result = await getTonePackDelivery({
      input: {
        slug: url.searchParams.get('slug'),
        checkoutSessionId: url.searchParams.get('checkout_session_id')
      },
      origin: siteOrigin()
    });
    return json(req, result);
  } catch (error) {
    const safe = safeCommerceError(error, 'Tone-pack delivery is temporarily unavailable.');
    return json(req, { ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, safeCommerceStatus(error));
  }
}
