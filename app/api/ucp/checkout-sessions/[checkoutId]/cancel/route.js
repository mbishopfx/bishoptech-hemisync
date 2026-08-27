import { NextResponse } from 'next/server';
import { cancelUcpCheckout } from '@/lib/commerce/ucp.mjs';
import { commerceError, siteOrigin, validateIdempotencyKey } from '@/lib/commerce/commerce-utils.mjs';
import { authorizeUcpRequest, idempotencyKeyFrom, parseJsonBody, ucpSecurityError } from '@/lib/commerce/ucp-security.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request, { params }) {
  if (commerceRateLimited(request, { scope: 'ucp-cancel-checkout', limit: 20 })) {
    return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Checkout requests are temporarily rate limited.', retryable: true } }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }
  try {
    const rawBody = await request.text();
    const body = parseJsonBody(rawBody);
    authorizeUcpRequest(request, rawBody, { requireAgentProfile: true, meta: body?.meta || body?._meta || {} });
    const rawKey = idempotencyKeyFrom(request, body);
    if (!rawKey) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout cancellation.', 400);
    const result = await cancelUcpCheckout({
      id: params.checkoutId,
      idempotencyKey: validateIdempotencyKey(rawKey),
      origin: siteOrigin()
    });
    return NextResponse.json(result, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = ucpSecurityError(error);
    return NextResponse.json({ error: safe }, { status: error?.status || (error?.name === 'ZodError' ? 400 : 500), headers: { 'cache-control': 'no-store' } });
  }
}
