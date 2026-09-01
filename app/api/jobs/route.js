export const dynamic = 'force-static';

const statusBody = {
  service: 'Cognistration public agent API',
  asyncJobs: false,
  status: 'synchronous_only',
  supportedOperations: [],
  documentation: 'https://cognistration.com/docs.md',
  message: 'The public agent contract completes bounded requests synchronously. Private audio rendering has its own authenticated render status routes.'
};

export function GET() {
  return Response.json(statusBody, { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } });
}

export function POST() {
  return Response.json({ ok: false, error: { code: 'ASYNC_NOT_SUPPORTED', message: 'No public asynchronous job can be created from this endpoint.', retryable: false, resolution: 'Use the synchronous public tools or an authenticated member render route.' }, ...statusBody }, { status: 501, headers: { 'cache-control': 'no-store' } });
}
