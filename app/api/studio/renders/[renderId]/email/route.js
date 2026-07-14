import { NextResponse } from 'next/server';
import { jsonError, requirePlatformSubscriber } from '@/lib/auth/session';
import { sendStudioDeliveryEmail } from '@/lib/email/studio-delivery.mjs';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { STUDIO_RENDER_BUCKET } from '@/lib/studio/render';
import { assertDeliveryCooldown } from '@/lib/studio/lifecycle';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req, { params }) {
  try {
    const { user } = await requirePlatformSubscriber(req);
    const { renderId } = await params;
    const supabase = getSupabaseAdmin();
    const { data: record, error } = await supabase
      .from('renders')
      .select('id,status,delivery_email_sent_at,session_specs(name)')
      .eq('id', renderId)
      .eq('user_id', user.id)
      .eq('bucket', STUDIO_RENDER_BUCKET)
      .single();
    if (error) throw error;
    if (record.status !== 'completed') {
      return NextResponse.json({ error: 'Render is not complete' }, { status: 409 });
    }
    if (!user.email) return NextResponse.json({ error: 'Your account has no delivery email' }, { status: 400 });
    assertDeliveryCooldown(record);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';
    const renderUrl = `${siteUrl}/dashboard?tab=studio&render=${encodeURIComponent(renderId)}`;
    const now = new Date().toISOString();
    let claimQuery = supabase.from('renders').update({
      delivery_email_sent_at: now,
      delivery_email_error: null,
      updated_at: now
    }).eq('id', renderId).eq('user_id', user.id);
    claimQuery = record.delivery_email_sent_at
      ? claimQuery.eq('delivery_email_sent_at', record.delivery_email_sent_at)
      : claimQuery.is('delivery_email_sent_at', null);
    const { data: claim, error: claimError } = await claimQuery.select('id').maybeSingle();
    if (claimError) throw claimError;
    if (!claim) return NextResponse.json({ error: 'A delivery email is already being sent' }, { status: 429 });

    let result;
    try {
      result = await sendStudioDeliveryEmail({
        to: user.email,
        projectName: record.session_specs.name,
        renderUrl
      });
    } catch (deliveryError) {
      result = { sent: false, reason: deliveryError.message || 'Delivery failed' };
    }
    await supabase.from('renders').update({
      delivery_email_sent_at: result.sent ? now : null,
      delivery_email_error: result.sent ? null : result.reason || 'Delivery failed',
      updated_at: new Date().toISOString()
    }).eq('id', renderId).eq('user_id', user.id);
    if (!result.sent) return NextResponse.json({ error: result.reason || 'Delivery failed' }, { status: 502 });
    return NextResponse.json({ ok: true, sentTo: user.email, sentAt: now });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
