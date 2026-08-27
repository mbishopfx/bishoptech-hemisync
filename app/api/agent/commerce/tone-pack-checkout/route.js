import { NextResponse } from 'next/server';
import { createTonePackCheckout } from '@/lib/commerce/agent-checkout.mjs';
import { safeCommerceError, safeCommerceStatus, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  if (commerceRateLimited(req, { scope: 'tone-pack-checkout', limit: 12 })) {
    return NextResponse.json({ ok: false, error: 'Checkout requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }
  try {
    const result = await createTonePackCheckout({
      input: await req.json(),
      origin: siteOrigin()
    });
    return NextResponse.json(result, { status: 201, headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = safeCommerceError(error, 'Tone-pack checkout is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: safeCommerceStatus(error),
      headers: { 'cache-control': 'no-store' }
    });
  }
}
