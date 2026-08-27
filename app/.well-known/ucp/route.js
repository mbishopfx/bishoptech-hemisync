import { NextResponse } from 'next/server';
import { ucpProfile } from '@/lib/commerce/ucp.mjs';
import { siteOrigin } from '@/lib/commerce/commerce-utils.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json(ucpProfile(siteOrigin()), {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=300',
      'content-type': 'application/json; charset=utf-8'
    }
  });
}
