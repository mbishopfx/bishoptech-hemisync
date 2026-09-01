export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    error: {
      code: 'AUTH_REQUIRED',
      message: 'The versioned API entry point requires a user-scoped bearer session for protected operations.',
      retryable: false,
      resolution: 'Read /auth.md and /.well-known/oauth-protected-resource before selecting a route.'
    }
  }, {
    status: 401,
    headers: {
      'cache-control': 'no-store',
      'www-authenticate': 'Bearer resource_metadata="https://cognistration.com/.well-known/oauth-protected-resource", scope="openid profile email"'
    }
  });
}
