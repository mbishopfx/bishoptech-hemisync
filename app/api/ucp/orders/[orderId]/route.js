import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { commerceError, isMissingTableError, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { authorizeUcpRequest, ucpSecurityError } from '@/lib/commerce/ucp-security.mjs';
import { UCP_VERSION } from '@/lib/commerce/ucp.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function readOrder(id) {
  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Order storage is not available yet.', 503, true);
  }
  if (!admin) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Order storage is not available yet.', 503, true);
  const { data, error } = await admin.from('commerce_orders').select('*').eq('id', id).maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Order storage is not available yet.', 503, true);
    throw error;
  }
  if (!data) throw commerceError('NOT_FOUND', 'That order was not found.', 404);
  return data;
}

export async function GET(request, { params }) {
  try {
    authorizeUcpRequest(request);
    const order = await readOrder(params.orderId);
    return NextResponse.json({
      ucp: { version: UCP_VERSION },
      id: order.id,
      permalink_url: `${siteOrigin()}/api/ucp/orders/${encodeURIComponent(order.id)}`,
      checkout_id: order.checkout_id,
      status: order.status,
      currency: String(order.currency || 'usd').toUpperCase(),
      line_items: order.line_items || [],
      totals: order.totals || [],
      fulfillment: order.fulfillment || {},
      created_at: order.created_at,
      updated_at: order.updated_at
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = ucpSecurityError(error);
    return NextResponse.json({ error: safe }, { status: error?.status || 500, headers: { 'cache-control': 'no-store' } });
  }
}
