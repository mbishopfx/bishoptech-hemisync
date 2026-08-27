import { NextResponse } from 'next/server';
import { getWorkshopAccessForSession } from '@/lib/commerce/workshop-access.mjs';
import { safeCommerceError, safeCommerceStatus, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const sessionId = new URL(req.url).searchParams.get('session_id');
    const result = await getWorkshopAccessForSession({ sessionId, origin: siteOrigin() });
    return NextResponse.json({ ok: true, ...result }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = safeCommerceError(error, 'Workshop access is temporarily unavailable.');
    return NextResponse.json({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, {
      status: safeCommerceStatus(error),
      headers: { 'cache-control': 'no-store' }
    });
  }
}
