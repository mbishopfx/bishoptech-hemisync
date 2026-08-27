import { NextResponse } from 'next/server';
import { validateWorkshopAccessKey } from '@/lib/commerce/workshop-access.mjs';
import { safeCommerceError, safeCommerceStatus } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  if (commerceRateLimited(req, { scope: 'workshop-access-validate', limit: 60 })) {
    return NextResponse.json({ ok: false, error: 'Access checks are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }
  try {
    const result = await validateWorkshopAccessKey({ input: await req.json() });
    return NextResponse.json({ ok: true, ...result }, {
      status: result.valid ? 200 : 403,
      headers: { 'cache-control': 'no-store' }
    });
  } catch (error) {
    const safe = safeCommerceError(error, 'Workshop access validation is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: safeCommerceStatus(error),
      headers: { 'cache-control': 'no-store' }
    });
  }
}
