const JSON_HEADERS = {
  'cache-control': 'no-store',
  'content-type': 'application/json; charset=utf-8'
};

function apiRouteNotFound(method) {
  return Response.json({
    ok: false,
    error: {
      code: 'API_ROUTE_NOT_FOUND',
      message: 'The requested public API route does not exist.',
      retryable: false,
      resolution: 'Read /docs or GET /openapi.json to choose a supported API route.',
      method
    }
  }, { status: 404, headers: JSON_HEADERS });
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function GET() {
  return apiRouteNotFound('GET');
}

export function POST() {
  return apiRouteNotFound('POST');
}

export function PUT() {
  return apiRouteNotFound('PUT');
}

export function PATCH() {
  return apiRouteNotFound('PATCH');
}

export function DELETE() {
  return apiRouteNotFound('DELETE');
}

export function OPTIONS() {
  return apiRouteNotFound('OPTIONS');
}

export function HEAD() {
  return new Response(null, {
    status: 404,
    headers: {
      ...JSON_HEADERS,
      'x-error-code': 'API_ROUTE_NOT_FOUND'
    }
  });
}
