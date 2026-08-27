import { NextResponse } from 'next/server';
import {
  cancelUcpCheckout,
  completeUcpCheckout,
  createUcpCheckout,
  getUcpCheckout,
  ucpProfile,
  updateUcpCheckout
} from '@/lib/commerce/ucp.mjs';
import { UCP_MCP_INSTRUCTIONS, UCP_MCP_PROTOCOL_VERSION, UCP_MCP_SERVER_INFO, UCP_MCP_TOOL_NAMES, UCP_MCP_TOOLS } from '@/lib/commerce/ucp-contract.mjs';
import { commerceError, siteOrigin, validateIdempotencyKey } from '@/lib/commerce/commerce-utils.mjs';
import { assertUcpAgentProfile, authorizeUcpRequest, idempotencyKeyFrom, parseJsonBody, ucpSecurityError } from '@/lib/commerce/ucp-security.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LEGACY_OPERATIONS = new Set(['create_checkout', 'get_checkout', 'update_checkout', 'complete_checkout', 'cancel_checkout']);

function headers(protocolVersion = UCP_MCP_PROTOCOL_VERSION) {
  return {
    'content-type': 'application/json',
    'cache-control': 'no-store',
    'MCP-Protocol-Version': protocolVersion
  };
}

function emptyNotification() {
  return new NextResponse(null, { status: 202, headers: headers() });
}

function rpcError(id, code, message, status = 200, data) {
  return NextResponse.json({
    jsonrpc: '2.0',
    id: id ?? null,
    error: { code, message, ...(data ? { data } : {}) }
  }, { status, headers: headers() });
}

function rpcResult(id, result) {
  return NextResponse.json({ jsonrpc: '2.0', id, result }, { headers: headers() });
}

function wantsEventStream(request) {
  return (request.headers.get('accept') || '')
    .split(',')
    .some((value) => value.trim().toLowerCase().startsWith('text/event-stream'));
}

async function streamIfRequested(request, response) {
  if (!wantsEventStream(request) || response.status === 202) return response;

  const body = await response.text();
  if (!body) return response;

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('content-type', 'text/event-stream; charset=utf-8');
  responseHeaders.set('cache-control', 'no-cache, no-store');
  responseHeaders.set('connection', 'keep-alive');
  responseHeaders.set('x-accel-buffering', 'no');
  responseHeaders.delete('content-length');

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`event: message\ndata: ${body}\n\n`));
      controller.close();
    }
  });

  return new NextResponse(stream, { status: response.status, headers: responseHeaders });
}

function requestMeta(body, args) {
  return body?.params?.meta
    || body?.params?._meta
    || body?.params?.arguments?.meta
    || body?.params?.arguments?._meta
    || args?.meta
    || args?._meta
    || body?.meta
    || body?._meta
    || {};
}

function assertOperationAgent(request, body, args) {
  return assertUcpAgentProfile({ meta: requestMeta(body, args), request });
}

function operationId(args) {
  return args?.id || args?.checkout_id || args?.checkoutId;
}

function idempotencyKey(request, body, args) {
  const key = idempotencyKeyFrom(request, {
    ...body,
    ...args,
    arguments: args,
    params: { ...(body?.params || {}), arguments: args }
  });
  return key ? validateIdempotencyKey(key) : null;
}

function requireToolObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw commerceError('INVALID_INPUT', `${field} must be an object.`, 400);
  }
}

function requireToolId(args) {
  if (typeof args?.id !== 'string' || !args.id.trim()) {
    throw commerceError('INVALID_INPUT', 'The checkout id is required for this UCP operation.', 400);
  }
}

function assertToolArguments(name, args) {
  requireToolObject(args, 'arguments');
  if (name !== 'create_checkout') requireToolId(args);

  if (name === 'create_checkout' || name === 'update_checkout') {
    requireToolObject(args.checkout, 'checkout');
    if (!Array.isArray(args.checkout.line_items) || args.checkout.line_items.length !== 1) {
      throw commerceError('INVALID_LINE_ITEMS', 'Choose exactly one published Cognistration tone pack per checkout.', 400);
    }
    if (args.checkout.id) throw commerceError('INVALID_INPUT', 'The checkout payload must not include an id.', 400);
  }

  if (name === 'complete_checkout') {
    requireToolObject(args.checkout, 'checkout');
    requireToolObject(args.checkout.payment, 'checkout.payment');
    if (args.checkout.id || args.checkout.line_items) throw commerceError('INVALID_INPUT', 'Complete checkout accepts payment data and risk signals, not a replacement checkout id or cart.', 400);
  }
}

async function dispatchOperation({ request, name, args, legacy = false }) {
  if (!UCP_MCP_TOOL_NAMES.has(name) && !LEGACY_OPERATIONS.has(name)) {
    throw commerceError('METHOD_NOT_FOUND', 'That UCP checkout operation is not available.', 404);
  }

  assertOperationAgent(request, { params: legacy ? { meta: args?.meta, _meta: args?._meta } : { arguments: args } }, args);
  const origin = siteOrigin();
  const key = idempotencyKey(request, {}, args);
  const body = legacy ? (args?.checkout || args?.body || args || {}) : args;
  const id = operationId(args);

  if (name === 'create_checkout') {
    if (!key) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout creation.', 400);
    return createUcpCheckout({ body, idempotencyKey: key, origin });
  }
  if (name === 'get_checkout') return getUcpCheckout({ id, origin });
  if (name === 'update_checkout') return updateUcpCheckout({ id, body, origin });
  if (name === 'complete_checkout') {
    if (!key) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout completion.', 400);
    return completeUcpCheckout({ id, body, idempotencyKey: key, origin });
  }
  if (name === 'cancel_checkout') {
    if (!key) throw commerceError('IDEMPOTENCY_REQUIRED', 'Idempotency-Key is required for checkout cancellation.', 400);
    return cancelUcpCheckout({ id, idempotencyKey: key, origin });
  }
  throw commerceError('METHOD_NOT_FOUND', 'That UCP checkout operation is not available.', 404);
}

function toolCallResult(resource) {
  return {
    content: [{ type: 'text', text: JSON.stringify(resource) }],
    structuredContent: resource,
    isError: false
  };
}

function ucpErrorData(error) {
  const safe = ucpSecurityError(error);
  return {
    status: 'error',
    retryable: safe.retryable,
    errors: [{
      code: safe.code,
      message: safe.message,
      severity: error?.status >= 500 ? 'requires_buyer_review' : 'requires_buyer_input'
    }]
  };
}

async function dispatch(request, body) {
  const params = body.params || {};

  if (body.method === 'tools/call') {
    if (typeof params.name !== 'string' || !params.name.trim()) {
      throw commerceError('INVALID_TOOL', 'The MCP tools/call request must include a tool name.', 400);
    }
    if (!UCP_MCP_TOOL_NAMES.has(params.name)) {
      throw commerceError('METHOD_NOT_FOUND', 'That UCP checkout tool is not available.', 404);
    }
    const args = params.arguments && typeof params.arguments === 'object' ? params.arguments : {};
    assertToolArguments(params.name, args);
    return toolCallResult(await dispatchOperation({ request, name: params.name, args }));
  }

  if (LEGACY_OPERATIONS.has(body.method)) {
    return dispatchOperation({ request, name: body.method, args: params, legacy: true });
  }

  if (body.method === 'initialize') {
    return {
      protocolVersion: UCP_MCP_PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: UCP_MCP_SERVER_INFO,
      instructions: UCP_MCP_INSTRUCTIONS
    };
  }
  if (body.method === 'ping') return {};
  if (body.method === 'tools/list') return { tools: UCP_MCP_TOOLS };
  if (body.method === 'resources/list') return { resources: [] };
  if (body.method === 'prompts/list') return { prompts: [] };
  if (body.method === 'server/discover') return { profile: ucpProfile(siteOrigin()) };

  throw commerceError('METHOD_NOT_FOUND', 'That MCP method is not available on the UCP checkout transport.', 404);
}

export async function GET() {
  return NextResponse.json({
    service: 'Cognistration UCP checkout MCP transport',
    protocolVersion: UCP_MCP_PROTOCOL_VERSION,
    tools: UCP_MCP_TOOLS.map((tool) => tool.name),
    operations: [...LEGACY_OPERATIONS],
    metadata: 'Include meta.ucp-agent.profile on every UCP request and Idempotency-Key for create, complete, and cancel.'
  }, { headers: headers() });
}

export async function POST(request) {
  if (commerceRateLimited(request, { scope: 'ucp-mcp', limit: 60 })) {
    const limited = commerceError('RATE_LIMITED', 'UCP requests are temporarily rate limited. Retry shortly.', 429, true);
    return streamIfRequested(request, rpcError(null, -32029, limited.message, 429, ucpErrorData(limited)));
  }

  let body;
  try {
    const rawBody = await request.text();
    body = parseJsonBody(rawBody);
    authorizeUcpRequest(request, rawBody);
  } catch (error) {
    const safe = ucpSecurityError(error);
    return streamIfRequested(request, rpcError(null, -32602, safe.message, error?.status || 400, ucpErrorData(error)));
  }

  if (!body || body.jsonrpc !== '2.0' || typeof body.method !== 'string') {
    const invalid = commerceError('INVALID_JSONRPC', 'Invalid JSON-RPC request.', 400);
    return streamIfRequested(request, rpcError(body?.id, -32600, invalid.message, 400, ucpErrorData(invalid)));
  }

  try {
    // UCP requires the calling agent profile on every request, including
    // lifecycle notifications. Keep the check at the transport boundary so
    // initialize/discovery calls cannot bypass the negotiated identity.
    assertUcpAgentProfile({ meta: requestMeta(body, {}), request });
    if (body.method.startsWith('notifications/')) return emptyNotification();

    return streamIfRequested(request, rpcResult(body.id, await dispatch(request, body)));
  } catch (error) {
    const safe = ucpSecurityError(error);
    const status = error?.status || (error?.name === 'ZodError' ? 400 : 200);
    const code = error?.code === 'METHOD_NOT_FOUND' ? -32601 : (error?.name === 'ZodError' || error?.status < 500 ? -32602 : -32603);
    return streamIfRequested(request, rpcError(body.id, code, safe.message, status, ucpErrorData(error)));
  }
}
