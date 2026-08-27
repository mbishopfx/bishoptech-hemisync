import { NextResponse } from 'next/server';
import { createUcpCheckout } from '@/lib/commerce/ucp.mjs';
import { commerceError, siteOrigin, validateIdempotencyKey } from '@/lib/commerce/commerce-utils.mjs';
import { authorizeUcpRequest, idempotencyKeyFrom, parseJsonBody, ucpSecurityError } from '@/lib/commerce/ucp-security.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function responseForError(error) {
  const safe = ucpSecurityError(error);
  const status = error?.status || (error?.name === 'ZodError' ? 400 : 500);
  return NextResponse.json({ error: safe }, { status, headers: { 'cache-control': 'no-store' } });
}

export async function POST(request) {
  if (commerceRateLimited(request, { scope: 'ucp-create-checkout', limit: 20 })) {
    return NextResponse.json({ error: { code: 'RATE_LIMITED', message: 'Checkout requests are temporarily rate limited.', retryable: true } }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }
  try {
    const rawBody = await request.text();
    const body = parseJsonBody(rawBody);
    authorizeUcpRequest(request, rawBody, { requireAgentProfile: true, meta: body?.meta || body?._meta || {} });
    const rawKey = idempotencyKeyFrom(request, body);
    if (!rawKey) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout creation.', 400);
    const result = await createUcpCheckout({
      body,
      idempotencyKey: validateIdempotencyKey(rawKey),
      origin: siteOrigin()
    });
    return NextResponse.json(result, { status: 201, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return responseForError(error);
  }
}
