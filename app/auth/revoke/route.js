export const dynamic = 'force-dynamic';

export function POST() {
  return Response.json({
    error: 'revocation_delegated',
    error_description: 'Sign out through the first-party Cognistration session or revoke a paid workshop key through its explicit user-controlled flow.',
    documentation: 'https://cognistration.com/auth.md#revocation'
  }, { status: 501, headers: { 'cache-control': 'no-store' } });
}
