import { NextResponse } from 'next/server';
import { getTonePackDelivery } from '@/lib/commerce/agent-checkout.mjs';
import { safeCommerceError, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
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
      status: error?.status || 500,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
