import { NextResponse } from 'next/server';
import { siteOrigin } from '@/lib/commerce/commerce-utils.mjs';

export const dynamic = 'force-static';

export async function GET() {
  const origin = siteOrigin();
  return NextResponse.json({
    type: 'HOSTED_CHECKOUT',
    name: 'Cognistration hosted checkout',
    merchantOfRecord: 'Cognistration',
    checkoutUrlPolicy: 'The checkout URL is created server-side from the approved catalog and opens Stripe-hosted payment review.',
    paymentCredentialsAccepted: false,
    schema: `${origin}/ucp/schemas/hosted-checkout.json`
  }, { headers: { 'cache-control': 'public, max-age=300' } });
}
