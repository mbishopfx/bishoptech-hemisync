import { NextResponse } from 'next/server';
import { ucpProfile } from '@/lib/commerce/ucp.mjs';
import { siteOrigin } from '@/lib/commerce/commerce-utils.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    service: 'Cognistration UCP shopping service',
    profile: ucpProfile(siteOrigin()),
    checkoutEndpoint: `${siteOrigin()}/api/ucp/checkout-sessions`,
    mcpEndpoint: `${siteOrigin()}/api/ucp/mcp`
  }, { headers: { 'cache-control': 'no-store' } });
}
