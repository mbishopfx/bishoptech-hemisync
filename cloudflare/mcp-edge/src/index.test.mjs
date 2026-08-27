import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './index.js';

const allowedOrigin = 'https://cognistration.com';
const disallowedOrigin = 'https://example.test';

test('health responds to an allowed origin with an exact CORS origin', async () => {
  const response = await worker.fetch(new Request('https://edge.test/health', {
    headers: { Origin: allowedOrigin }
  }), {});

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), allowedOrigin);
  assert.equal((await response.json()).status, 'ready');
});

test('disallowed origins are rejected before the upstream is reached', async () => {
  const response = await worker.fetch(new Request('https://edge.test/health', {
    headers: { Origin: disallowedOrigin }
  }), {});

  assert.equal(response.status, 403);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('allowed MCP requests proxy the upstream and preserve the protocol response', async () => {
  const originalFetch = globalThis.fetch;
  let forwardedRequest;
  globalThis.fetch = async (request) => {
    forwardedRequest = request;
    return new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: { tools: [] } }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'MCP-Protocol-Version': '2026-07-28' }
    });
  };

  try {
    const response = await worker.fetch(new Request('https://edge.test/mcp', {
      method: 'POST',
      headers: {
        Origin: allowedOrigin,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'MCP-Protocol-Version': '2026-07-28',
        'Mcp-Method': 'tools/list'
      }
    }), { UPSTREAM_MCP_ENDPOINT: 'https://cognistration.com/api/mcp' });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), allowedOrigin);
    assert.equal(response.headers.get('MCP-Protocol-Version'), '2026-07-28');
    assert.equal(new URL(forwardedRequest.url).pathname, '/api/mcp');
    assert.equal(forwardedRequest.headers.get('x-cognistration-edge'), 'cloudflare');
    assert.deepEqual(await response.json(), { jsonrpc: '2.0', id: 1, result: { tools: [] } });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
