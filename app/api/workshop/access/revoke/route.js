import { NextResponse } from 'next/server';
import { revokeWorkshopAccess } from '@/lib/commerce/workshop-access.mjs';
import { safeCommerceError } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  if (commerceRateLimited(req, { scope: 'workshop-access-revoke', limit: 20 })) {
    return NextResponse.json({ ok: false, error: 'Access changes are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, { status: 429, headers: { 'cache-control': 'no-store' } });
  }
  try {
    const body = await req.json();
    const result = await revokeWorkshopAccess({ input: { accessKey: body?.accessKey }, reason: body?.reason });
    return NextResponse.json({ ok: true, ...result }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = safeCommerceError(error, 'Workshop access revocation is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: error?.status || 500,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
