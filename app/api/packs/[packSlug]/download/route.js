import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { assertPaidTonePackSession, fulfillTonePackPurchase } from '@/lib/commerce/tone-packs.mjs';
import { assertPaidTonePackPaymentIntent, buildTonePackPaymentSession, tonePackProtectedDeliveryUrl } from '@/lib/commerce/tone-pack-machine-payment.mjs';
import { commerceError, safeCommerceError, safeCommerceStatus, stripeVerificationError } from '@/lib/commerce/commerce-utils.mjs';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function jsonNoStore(body, options = {}) {
  return NextResponse.json(body, {
    ...options,
    headers: { ...(options.headers || {}), 'cache-control': 'no-store' }
  });
}

export async function GET(req, { params }) {
  if (commerceRateLimited(req, { scope: 'tone-pack-download', limit: 20 })) {
    return jsonNoStore({ ok: false, error: 'Download requests are temporarily rate limited.', code: 'RATE_LIMITED', retryable: true }, { status: 429 });
  }
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');
    const paymentReference = req.nextUrl.searchParams.get('payment_reference');
    const trackId = req.nextUrl.searchParams.get('trackId');
    const packSlug = params.packSlug;
    if (!packSlug || (!sessionId && !paymentReference) || (sessionId && paymentReference)) {
      return jsonNoStore({ error: 'A completed checkout session or payment reference is required' }, { status: 400 });
    }
    if (sessionId && !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
      return jsonNoStore({ error: 'A valid checkout session is required', code: 'INVALID_CHECKOUT_SESSION' }, { status: 400 });
    }
    if (paymentReference && !/^pi_[A-Za-z0-9_]+$/.test(paymentReference)) {
      return jsonNoStore({ error: 'A valid payment reference is required', code: 'INVALID_PAYMENT_REFERENCE' }, { status: 400 });
    }
    if (trackId && !/^[A-Za-z0-9._-]{1,120}$/.test(trackId)) {
      return jsonNoStore({ error: 'The requested track is invalid', code: 'INVALID_TRACK' }, { status: 400 });
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) return jsonNoStore({ error: 'Download verification is temporarily unavailable', code: 'STRIPE_NOT_CONFIGURED' }, { status: 503 });
    const stripe = new Stripe(stripeSecret);
    let stripeSession;
    if (sessionId) {
      try {
        stripeSession = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
      } catch (error) {
        throw stripeVerificationError(error, 'Tone-pack download verification is temporarily unavailable.');
      }
      assertPaidTonePackSession({ stripeSession, expectedSlug: packSlug });
    } else {
      let paymentIntent;
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentReference);
      } catch {
        throw commerceError('PAYMENT_NOT_VERIFIED', 'That payment could not be verified.', 403);
      }
      const verified = assertPaidTonePackPaymentIntent({ paymentIntent, expectedSlug: packSlug });
      stripeSession = buildTonePackPaymentSession({ paymentIntent, pack: verified.pack, email: verified.email });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) return jsonNoStore({ error: 'Download delivery is temporarily unavailable', code: 'COMMERCE_STORAGE_NOT_READY' }, { status: 503 });
    const protectedDeliveryUrl = tonePackProtectedDeliveryUrl(packSlug, sessionId || paymentReference, new URL(req.url).origin);
    const purchase = await fulfillTonePackPurchase({ stripeSession, supabase, fallbackDownloadUrl: protectedDeliveryUrl });

    if (!trackId) {
      const response = {
        ok: true,
        status: purchase.status || 'active',
        packSlug: purchase.packSlug,
        packName: purchase.packName
      };
      if (!purchase.downloadUrl) {
        return jsonNoStore({
          ...response,
          error: 'Pack bundle is still being prepared'
        }, { status: 202 });
      }
      return jsonNoStore({
        ...response,
        url: purchase.downloadUrl,
        filename: `${packSlug}.zip`
      });
    }

    const { data: track, error: trackError } = await supabase
      .from('tone_pack_tracks')
      .select('track_id,download_url,track_name,pack_slug,file_extension')
      .eq('pack_slug', packSlug)
      .eq('track_id', trackId)
      .maybeSingle();
    if (trackError) throw trackError;
    if (!track?.download_url) return jsonNoStore({ error: 'Download unavailable' }, { status: 404 });

    await supabase
      .from('tone_pack_purchases')
      .update({ download_count: (purchase.downloadCount || 0) + 1 })
      .eq('id', purchase.purchaseId);

    return jsonNoStore({
      ok: true,
      url: track.download_url,
      filename: `${track.track_id}.${track.file_extension || 'webm'}`,
      trackName: track.track_name
    });
  } catch (error) {
    const safe = safeCommerceError(error, 'The tone-pack download could not be resolved.');
    console.error('Pack download failed:', { code: safe.code, status: safeCommerceStatus(error) });
    return jsonNoStore({ ok: false, error: safe.message, code: safe.code, retryable: safe.retryable }, { status: safeCommerceStatus(error) });
  }
}
