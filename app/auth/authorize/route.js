export const dynamic = 'force-dynamic';

function response() {
  return Response.json({
    error: 'authorization_server_not_enabled',
    error_description: 'Cognistration public discovery is anonymous. Private member access must be completed through the first-party sign-in page; this endpoint does not collect credentials.',
    documentation: 'https://cognistration.com/auth.md'
  }, { status: 501, headers: { 'cache-control': 'no-store' } });
}

export function GET() { return response(); }
export function POST() { return response(); }
