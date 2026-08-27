import { NextResponse } from 'next/server';
import { getUcpCheckout, updateUcpCheckout } from '@/lib/commerce/ucp.mjs';
import { siteOrigin, validateIdempotencyKey } from '@/lib/commerce/commerce-utils.mjs';
import { authorizeUcpRequest, idempotencyKeyFrom, parseJsonBody, ucpSecurityError } from '@/lib/commerce/ucp-security.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function responseForError(error) {
  const safe = ucpSecurityError(error);
  const status = error?.status || (error?.name === 'ZodError' ? 400 : 500);
  return NextResponse.json({ error: safe }, { status, headers: { 'cache-control': 'no-store' } });
}

export async function GET(request, { params }) {
  try {
    authorizeUcpRequest(request);
    return NextResponse.json(await getUcpCheckout({ id: params.checkoutId, origin: siteOrigin() }), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return responseForError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const rawBody = await request.text();
    const body = parseJsonBody(rawBody);
    authorizeUcpRequest(request, rawBody, { requireAgentProfile: true, meta: body?.meta || body?._meta || {} });
    const idempotencyKey = idempotencyKeyFrom(request, body);
    if (idempotencyKey) validateIdempotencyKey(idempotencyKey);
    return NextResponse.json(await updateUcpCheckout({ id: params.checkoutId, body, origin: siteOrigin() }), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return responseForError(error);
  }
}
