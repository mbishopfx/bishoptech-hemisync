import { NextResponse } from 'next/server';
import { getWorkshopAccessForSession, WorkshopAccessSessionInputSchema } from '@/lib/commerce/workshop-access.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';
import { safeCommerceError, safeCommerceStatus, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  if (commerceRateLimited(req, { scope: 'workshop-access-session', limit: 20 })) {
    return NextResponse.json({ ok: false, error: 'Workshop access requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, {
      status: 429,
      headers: { 'cache-control': 'no-store' }
    });
  }

  try {
    const parsed = WorkshopAccessSessionInputSchema.parse({
      checkoutSessionId: new URL(req.url).searchParams.get('checkout_session_id')
    });
    const result = await getWorkshopAccessForSession({
      sessionId: parsed.checkoutSessionId,
      origin: siteOrigin()
    });
    return NextResponse.json({ ok: true, ...result }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = safeCommerceError(error, 'Workshop access is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: safeCommerceStatus(error),
      headers: { 'cache-control': 'no-store' }
    });
  }
}
