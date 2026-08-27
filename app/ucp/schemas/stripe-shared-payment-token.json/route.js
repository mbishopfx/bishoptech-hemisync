import { NextResponse } from 'next/server';
import { siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { ucpStripeSharedPaymentTokenSchema } from '@/lib/commerce/ucp.mjs';

export const dynamic = 'force-static';

export async function GET() {
  return NextResponse.json(ucpStripeSharedPaymentTokenSchema(siteOrigin()), { headers: { 'cache-control': 'public, max-age=300' } });
}
