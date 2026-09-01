export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ endpoint: '/agent/events', status: 'not_streaming', events: [], documentation: 'https://cognistration.com/auth.md#errors' }, { headers: { 'cache-control': 'no-store' } });
}

export function POST() {
  return Response.json({ error: { code: 'EVENTS_NOT_SUPPORTED', message: 'Cognistration does not expose an agent credential event stream.', retryable: false } }, { status: 501, headers: { 'cache-control': 'no-store' } });
}
