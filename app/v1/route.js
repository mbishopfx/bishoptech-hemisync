export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ error: { code: 'AUTH_REQUIRED', message: 'Use the public capability manifest or the authenticated versioned API routes.', retryable: false } }, {
    status: 401,
    headers: {
      'cache-control': 'no-store',
      'www-authenticate': 'Bearer resource_metadata="https://cognistration.com/.well-known/oauth-protected-resource"'
    }
  });
}
