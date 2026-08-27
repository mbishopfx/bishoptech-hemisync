const ALLOWED_METHODS = new Set(['GET', 'POST', 'DELETE', 'OPTIONS']);
const MCP_PATH = '/mcp';
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://cognistration.com',
  'https://www.cognistration.com',
  'https://chatgpt.com',
  'https://www.chatgpt.com',
  'https://chat.openai.com'
]);

function allowedOrigins(env = {}) {
  const configured = String(env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
}

function originAllowed(request, env) {
  const requestedOrigin = request.headers.get('Origin');
  return !requestedOrigin || allowedOrigins(env).has(requestedOrigin);
}

function corsHeaders(request, env) {
  const requestedOrigin = request.headers.get('Origin');
  const headers = {
    'access-control-allow-headers': 'Accept, Authorization, Content-Type, Last-Event-ID, Mcp-Method, Mcp-Name, MCP-Protocol-Version',
    'access-control-allow-methods': 'DELETE, GET, OPTIONS, POST',
    'access-control-expose-headers': 'Content-Type, MCP-Protocol-Version',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
  if (requestedOrigin && originAllowed(request, env)) headers['access-control-allow-origin'] = requestedOrigin;
  return headers;
}

function json(value, status, request, env) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...corsHeaders(request, env)
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
  Object.entries(corsHeaders(request, env)).forEach(([key, value]) => responseHeaders.set(key, value));
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
    if (!originAllowed(request, env)) {
      return json({ error: 'This edge worker does not allow that request origin.' }, 403, request, env);
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return json({ service: 'cognistration-mcp-edge', status: 'ready', upstream: 'configured', canonicalHost: 'cognistration.com' }, 200, request, env);
    }

    if (url.pathname !== MCP_PATH || !ALLOWED_METHODS.has(request.method)) {
      return json({ error: 'This edge worker exposes only the MCP endpoint and health check.' }, 404, request, env);
    }

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request, env) });

    try {
      return await proxyMcp(request, env);
    } catch {
      return json({ error: 'The canonical Cognistration MCP endpoint could not be reached.', retryable: true }, 502, request, env);
    }
  }
};

export default worker;
