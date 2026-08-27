const ALLOWED_METHODS = new Set(['GET', 'POST', 'DELETE', 'OPTIONS']);
const MCP_PATH = '/mcp';

function corsHeaders(request) {
  const requestedOrigin = request.headers.get('Origin');
  return {
    'access-control-allow-origin': requestedOrigin || '*',
    'access-control-allow-headers': 'Accept, Authorization, Content-Type, Last-Event-ID, Mcp-Method, Mcp-Name, MCP-Protocol-Version',
    'access-control-allow-methods': 'DELETE, GET, OPTIONS, POST',
    'access-control-expose-headers': 'Content-Type, MCP-Protocol-Version',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
}

function json(value, status, request) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...corsHeaders(request)
    }
  });
}

function upstreamUrl(request, env) {
  const configured = String(env.UPSTREAM_MCP_ENDPOINT || '').trim();
  if (!configured) throw new Error('UPSTREAM_MCP_ENDPOINT is not configured.');
  const target = new URL(configured);
  const incoming = new URL(request.url);
  target.search = incoming.search;
  return target;
}

async function proxyMcp(request, env) {
  const target = upstreamUrl(request, env);
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('x-cognistration-edge', 'cloudflare');
  headers.set('x-forwarded-host', new URL(request.url).host);

  const forwarded = new Request(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  });
  const upstreamResponse = await fetch(forwarded);
  const responseHeaders = new Headers(upstreamResponse.headers);
  Object.entries(corsHeaders(request)).forEach(([key, value]) => responseHeaders.set(key, value));
  responseHeaders.set('cache-control', 'no-store');
  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders
  });
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ service: 'cognistration-mcp-edge', status: 'ready', upstream: 'configured', canonicalHost: 'cognistration.com' }, 200, request);
    }

    if (url.pathname !== MCP_PATH || !ALLOWED_METHODS.has(request.method)) {
      return json({ error: 'This edge worker exposes only the MCP endpoint and health check.' }, 404, request);
    }

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });

    try {
      return await proxyMcp(request, env);
    } catch {
      return json({ error: 'The canonical Cognistration MCP endpoint could not be reached.', retryable: true }, 502, request);
    }
  }
};

export default worker;
