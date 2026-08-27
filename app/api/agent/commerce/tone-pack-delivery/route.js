import { NextResponse } from 'next/server';
import { getTonePackDelivery } from '@/lib/commerce/agent-checkout.mjs';
import { safeCommerceError, safeCommerceStatus, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  if (commerceRateLimited(req, { scope: 'tone-pack-delivery', limit: 20 })) {
    return NextResponse.json({ ok: false, error: 'Delivery requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, {
      status: 429,
      headers: { 'cache-control': 'no-store' }
    });
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
    return NextResponse.json(result, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = safeCommerceError(error, 'Tone-pack delivery is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: safeCommerceStatus(error),
      headers: { 'cache-control': 'no-store' }
    });
  }
}
