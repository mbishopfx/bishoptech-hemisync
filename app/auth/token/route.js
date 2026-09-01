export const dynamic = 'force-dynamic';

function response() {
  return Response.json({
    error: 'token_endpoint_not_enabled',
    error_description: 'Do not send a password, service key, card, or payment credential to Cognistration. Use the first-party sign-in flow described in auth.md.',
    documentation: 'https://cognistration.com/auth.md'
  }, { status: 501, headers: { 'cache-control': 'no-store' } });
}

export function POST() { return response(); }
export function GET() { return response(); }
