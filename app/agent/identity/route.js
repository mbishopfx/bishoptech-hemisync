export const dynamic = 'force-dynamic';

export function POST() {
  return Response.json({ error: { code: 'USER_AUTH_REQUIRED', message: 'Identity ceremonies require a user-controlled first-party sign-in. This endpoint never accepts a password or payment credential.', retryable: false, resolution: 'Open /auth.md and complete the user-controlled sign-in flow.' } }, { status: 501, headers: { 'cache-control': 'no-store' } });
}

export function GET() {
  return Response.json({ endpoint: '/agent/identity', status: 'user_controlled', documentation: 'https://cognistration.com/auth.md#claim' }, { status: 200, headers: { 'cache-control': 'public, max-age=60' } });
}
