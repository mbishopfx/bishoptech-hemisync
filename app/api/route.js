export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({
    error: {
      code: 'AUTH_REQUIRED',
      message: 'This API namespace contains both public agent routes and protected member routes. Use the public capability manifest to choose an anonymous route.',
      retryable: false,
      resolution: 'GET /api/capabilities or read /.well-known/oauth-protected-resource.'
    }
  }, {
    status: 401,
    headers: {
      'cache-control': 'no-store',
      'www-authenticate': 'Bearer resource_metadata="https://cognistration.com/.well-known/oauth-protected-resource", scope="member.read member.write"'
    }
  });
}
