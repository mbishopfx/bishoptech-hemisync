import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { fulfillTonePackPurchase } from '@/lib/commerce/tone-packs.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    const trackId = req.nextUrl.searchParams.get('trackId');
    const packSlug = params.packSlug;
    if (!packSlug || !sessionId) {
      return NextResponse.json({ error: 'A completed checkout session is required' }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return NextResponse.json({ error: 'Stripe secret missing' }, { status: 503 });
    const stripe = new Stripe(stripeSecret);
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (stripeSession.payment_status !== 'paid' || stripeSession.metadata?.packSlug !== packSlug) {
      return NextResponse.json({ error: 'Pack purchase could not be verified' }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ error: 'Supabase admin unavailable' }, { status: 503 });
    const protectedDeliveryUrl = `${new URL(req.url).origin}/api/packs/${encodeURIComponent(packSlug)}/download?session_id=${encodeURIComponent(sessionId)}`;
    const purchase = await fulfillTonePackPurchase({ stripeSession, supabase, fallbackDownloadUrl: protectedDeliveryUrl });

    if (!trackId) {
      if (!purchase.downloadUrl) return NextResponse.json({ ...purchase, error: 'Pack bundle is still being prepared' }, { status: 202 });
      return NextResponse.json({ ...purchase, url: purchase.downloadUrl, filename: `${packSlug}.zip` });
    }

    const { data: track, error: trackError } = await supabase
      .from('tone_pack_tracks')
      .select('track_id,download_url,track_name,pack_slug,file_extension')
      .eq('pack_slug', packSlug)
      .eq('track_id', trackId)
      .maybeSingle();
    if (trackError) throw trackError;
    if (!track?.download_url) return NextResponse.json({ error: 'Download unavailable' }, { status: 404 });

    await supabase
      .from('tone_pack_purchases')
      .update({ download_count: (purchase.downloadCount || 0) + 1 })
      .eq('id', purchase.purchaseId);

    return NextResponse.json({
      ok: true,
      url: track.download_url,
      filename: `${track.track_id}.${track.file_extension || 'webm'}`,
      trackName: track.track_name
    });
  } catch (error) {
    console.error('Pack download failed:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to resolve download' }, { status: 500 });
  }
}
