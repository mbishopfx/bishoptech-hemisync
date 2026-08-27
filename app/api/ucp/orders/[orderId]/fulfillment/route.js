import { NextResponse } from 'next/server';
import { getTonePackBySlug } from '@/lib/audio/tone-packs.db.mjs';
import { commerceError, isMissingTableError, siteOrigin } from '@/lib/commerce/commerce-utils.mjs';
import { authorizeUcpRequest, ucpSecurityError } from '@/lib/commerce/ucp-security.mjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { UCP_VERSION } from '@/lib/commerce/ucp.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function readOrder(id) {
  const admin = getSupabaseAdmin();
  if (!admin) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Order storage is not available yet.', 503, true);
  const { data, error } = await admin
    .from('commerce_orders')
    .select('id,status,line_items,fulfillment')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    if (isMissingTableError(error)) throw commerceError('COMMERCE_STORAGE_NOT_READY', 'Order storage is not available yet.', 503, true);
    throw error;
  }
  if (!data) throw commerceError('NOT_FOUND', 'That order was not found.', 404);
  return data;
}

function isSelfUrl(value, orderId) {
  try {
    const url = new URL(value);
    return url.pathname === `/api/ucp/orders/${encodeURIComponent(orderId)}/fulfillment`;
  } catch {
    return false;
  }
}

async function resolveBundleUrl(order) {
  const recorded = order.fulfillment?.download_url;
  if (recorded && !isSelfUrl(recorded, order.id)) return recorded;

  const packSlug = order.line_items?.[0]?.item?.id;
  const pack = getTonePackBySlug(packSlug);
  if (pack?.bundleUrl) return pack.bundleUrl;

  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data, error } = await admin
    .from('tone_packs')
    .select('bundle_url')
    .eq('slug', packSlug)
    .maybeSingle();
  if (error || !data?.bundle_url) return null;
  return data.bundle_url;
}

export async function GET(request, { params }) {
  try {
    authorizeUcpRequest(request);
    const order = await readOrder(params.orderId);
    if (!['paid', 'fulfilled'].includes(order.status)) {
      throw commerceError('FULFILLMENT_NOT_READY', 'This order is not ready for digital delivery yet.', 409, true);
    }
    const downloadUrl = await resolveBundleUrl(order);
    if (!downloadUrl) {
      return NextResponse.json({
        ucp: { version: UCP_VERSION },
        order_id: order.id,
        status: 'pending',
        retryable: true
      }, { status: 202, headers: { 'cache-control': 'no-store' } });
    }
    return NextResponse.json({
      ucp: { version: UCP_VERSION },
      order_id: order.id,
      status: 'fulfilled',
      download_url: downloadUrl
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const safe = ucpSecurityError(error);
    return NextResponse.json({ error: safe }, {
      status: error?.status || 500,
      headers: { 'cache-control': 'no-store' }
    });
  }
}
