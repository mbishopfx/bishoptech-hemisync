import { NextResponse } from 'next/server';
import { getPolicyInfo, PolicyInputSchema } from '@/lib/agentic/policy-capability';

export const dynamic = 'force-dynamic';

const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const parsed = PolicyInputSchema.safeParse({ topic: requestUrl.searchParams.get('topic') });
  if (!parsed.success) {
    return NextResponse.json({
      ok: false,
      code: 'INVALID_INPUT',
      error: 'Choose one published policy topic: safety, terms, privacy, cookies, ai, pricing, or account.'
    }, { status: 400, headers: { 'cache-control': 'public, max-age=300, s-maxage=300' } });
  }

  return NextResponse.json({ ok: true, policy: getPolicyInfo(parsed.data, canonicalOrigin) }, {
    headers: { 'cache-control': 'public, max-age=300, s-maxage=300' }
  });
}
