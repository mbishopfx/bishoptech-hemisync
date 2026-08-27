import { NextResponse } from 'next/server';
import {
  cancelUcpCheckout,
  completeUcpCheckout,
  createUcpCheckout,
  getUcpCheckout,
  updateUcpCheckout
} from '@/lib/commerce/ucp.mjs';
import { commerceError, siteOrigin, validateIdempotencyKey } from '@/lib/commerce/commerce-utils.mjs';
import { authorizeUcpRequest, idempotencyKeyFrom, parseJsonBody, ucpSecurityError } from '@/lib/commerce/ucp-security.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function headers() {
  return { 'content-type': 'application/json', 'cache-control': 'no-store' };
}

function rpcError(id, code, message, status = 200, data) {
  return NextResponse.json({ jsonrpc: '2.0', id: id ?? null, error: { code, message, ...(data ? { data } : {}) } }, { status, headers: headers() });
}

function rpcResult(id, result) {
  return NextResponse.json({ jsonrpc: '2.0', id, result }, { headers: headers() });
}

function requestMeta(request, params) {
  return request?._meta || params?._meta || params?.meta || {};
}

function assertUcpAgent(request, params) {
  const meta = requestMeta(request, params);
  const agent = meta['ucp-agent'];
  if (!agent || typeof agent !== 'object' || typeof agent.profile !== 'string' || !agent.profile.trim()) {
    throw commerceError('UCP_AGENT_REQUIRED', 'The UCP MCP request must include meta.ucp-agent.profile.', 400);
  }
  return agent;
}

function checkoutId(params) {
  return params?.checkout_id || params?.checkoutId || params?.id;
}

function operationBody(params) {
  return params?.checkout || params?.body || params || {};
}

async function dispatch(request, body) {
  const params = body.params || {};
  assertUcpAgent(body, params);
  const origin = siteOrigin();
  const rawKey = idempotencyKeyFrom(request, body) || idempotencyKeyFrom(request, params);
  const key = rawKey ? validateIdempotencyKey(rawKey) : null;

  if (body.method === 'create_checkout') {
    if (!key) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout creation.', 400);
    return createUcpCheckout({ body: operationBody(params), idempotencyKey: key, origin });
  }
  if (body.method === 'get_checkout') {
    return getUcpCheckout({ id: checkoutId(params), origin });
  }
  if (body.method === 'update_checkout') {
    return updateUcpCheckout({ id: checkoutId(params), body: operationBody(params), origin });
  }
  if (body.method === 'complete_checkout') {
    if (!key) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout completion.', 400);
    return completeUcpCheckout({ id: checkoutId(params), body: operationBody(params), idempotencyKey: key, origin });
  }
  if (body.method === 'cancel_checkout') {
    if (!key) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout cancellation.', 400);
    return cancelUcpCheckout({ id: checkoutId(params), idempotencyKey: key, origin });
  }
  throw commerceError('METHOD_NOT_FOUND', 'That UCP checkout operation is not available.', 404);
}

export async function GET() {
  return NextResponse.json({
    service: 'Cognistration UCP checkout MCP transport',
    operations: ['create_checkout', 'get_checkout', 'update_checkout', 'complete_checkout', 'cancel_checkout'],
    metadata: 'Include meta.ucp-agent.profile and Idempotency-Key for create, complete, and cancel.'
  }, { headers: headers() });
}

export async function POST(request) {
  let body;
  try {
    const rawBody = await request.text();
    body = parseJsonBody(rawBody);
    authorizeUcpRequest(request, rawBody);
  } catch (error) {
    const safe = ucpSecurityError(error);
    return rpcError(null, safe.code, safe.message, error?.status || 400, { retryable: safe.retryable });
  }

  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    return rpcError(body?.id, -32600, 'Invalid JSON-RPC request.', 400);
  }

  try {
    return rpcResult(body.id, await dispatch(request, body));
  } catch (error) {
    const safe = ucpSecurityError(error);
    const status = error?.status || (error?.name === 'ZodError' ? 400 : 200);
    const code = error?.code === 'METHOD_NOT_FOUND' ? -32601 : safe.code;
    return rpcError(body.id, code, safe.message, status, { retryable: safe.retryable });
  }
}
