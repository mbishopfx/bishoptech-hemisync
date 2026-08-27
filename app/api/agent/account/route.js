import { NextResponse } from 'next/server';
import { publicAccountOptions } from '@/lib/agentic/account-capability';

export const dynamic = 'force-static';

const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';

export async function GET() {
  return NextResponse.json({ ok: true, ...publicAccountOptions(canonicalOrigin) }, {
    headers: { 'cache-control': 'public, max-age=300, s-maxage=300' }
  });
}
