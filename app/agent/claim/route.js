export const dynamic = 'force-dynamic';

export function POST() {
  return Response.json({ error: { code: 'USER_AUTH_REQUIRED', message: 'Claims are issued only after a person completes the first-party authentication ceremony.', retryable: false, resolution: 'Do not send credentials to this endpoint.' } }, { status: 501, headers: { 'cache-control': 'no-store' } });
}

export function GET() {
  return Response.json({ endpoint: '/agent/claim', status: 'user_controlled', documentation: 'https://cognistration.com/auth.md#claim' }, { status: 200, headers: { 'cache-control': 'public, max-age=60' } });
}
