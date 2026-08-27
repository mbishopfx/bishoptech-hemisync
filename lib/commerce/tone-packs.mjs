import { getSupabaseAdmin } from '../supabase/admin.js';
import { getTonePackBySlug, getTonePackPriceId } from '../audio/tone-packs.mjs';
import { sendPackDeliveryEmail } from '../email/pack-delivery.mjs';
import { commerceError, siteOrigin } from './commerce-utils.mjs';

function protectedDeliveryUrl(packSlug, stripeSessionId, origin = siteOrigin()) {
  if (!packSlug || !/^cs_[A-Za-z0-9_]+$/.test(String(stripeSessionId || ''))) return null;
  return `${origin}/api/packs/${encodeURIComponent(packSlug)}/download?session_id=${encodeURIComponent(stripeSessionId)}`;
}

function lineItemPriceId(stripeSession) {
  const price = stripeSession?.line_items?.data?.[0]?.price;
  return typeof price === 'string' ? price : price?.id || null;
}

export function assertPaidTonePackSession({ stripeSession, expectedSlug } = {}) {
  const metadataPack = stripeSession?.metadata?.packSlug;
  const metadataPlan = stripeSession?.metadata?.planId;
  if (metadataPack && metadataPlan && metadataPack !== metadataPlan) {
    throw commerceError('PAYMENT_MISMATCH', 'The checkout session contains conflicting tone-pack identifiers.', 403);
  }
  const sessionPack = metadataPack || metadataPlan;
  const pack = getTonePackBySlug(sessionPack);
  if (!pack || (expectedSlug && pack.slug !== expectedSlug)) {
    throw commerceError('PAYMENT_MISMATCH', 'The checkout session does not match the selected tone pack.', 403);
  }
  if (!stripeSession?.id) {
    throw commerceError('INVALID_CHECKOUT_SESSION', 'The checkout session reference is missing.', 400);
  }
  if (stripeSession.payment_status !== 'paid') {
    throw commerceError('PAYMENT_NOT_VERIFIED', 'The tone-pack payment has not completed.', 403);
  }

  const expectedPriceId = getTonePackPriceId(pack);
  const observedPriceIds = [stripeSession?.metadata?.priceId, lineItemPriceId(stripeSession)]
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  if (!expectedPriceId || observedPriceIds.length === 0 || observedPriceIds.some((value) => value !== expectedPriceId)) {
    throw commerceError('PAYMENT_MISMATCH', 'The checkout price does not match the approved tone-pack price.', 403);
  }
  return pack;
}

export async function fulfillTonePackPurchase({ stripeSession, supabase = getSupabaseAdmin(), fallbackDownloadUrl = null }) {
  const pack = assertPaidTonePackSession({ stripeSession });
  const email = String(
    stripeSession?.metadata?.purchaserEmail
      || stripeSession?.customer_details?.email
      || stripeSession?.customer_email
      || ''
  ).trim().toLowerCase();

  if (!email) throw new Error('Stripe checkout session did not include a purchaser email');
  if (!supabase) throw new Error('Supabase admin unavailable');

  const { data: catalogRow, error: catalogError } = await supabase
    .from('tone_packs')
    .select('slug,name,bundle_url')
    .eq('slug', pack.slug)
    .maybeSingle();
  if (catalogError && !String(catalogError.message || '').toLowerCase().includes('does not exist')) {
    throw catalogError;
  }

  const bundleUrl = catalogRow?.bundle_url || pack.bundleUrl || null;
  const downloadUrl = bundleUrl || fallbackDownloadUrl || protectedDeliveryUrl(pack.slug, stripeSession.id);
  const userId = stripeSession.client_reference_id || stripeSession.metadata?.user_uuid || null;
  const purchase = {
    user_id: userId,
    pack_slug: pack.slug,
    pack_name: catalogRow?.name || pack.name,
    purchaser_email: email,
    price_id: stripeSession.metadata?.priceId || lineItemPriceId(stripeSession) || getTonePackPriceId(pack),
    stripe_session_id: stripeSession.id,
    stripe_customer_id: typeof stripeSession.customer === 'string' ? stripeSession.customer : null,
    stripe_payment_intent_id: typeof stripeSession.payment_intent === 'string' ? stripeSession.payment_intent : null,
    bundle_url: bundleUrl,
    status: 'active',
    metadata: {
      productType: 'tone-pack',
      planId: pack.slug,
      source: 'stripe-checkout'
    }
  };

  const { data: existingPurchase, error: existingPurchaseError } = await supabase
    .from('tone_pack_purchases')
    .select('id,status')
    .eq('stripe_session_id', stripeSession.id)
    .maybeSingle();
  if (existingPurchaseError) throw existingPurchaseError;
  if (['refunded', 'disputed', 'canceled'].includes(existingPurchase?.status)) {
    throw commerceError('DELIVERY_REVOKED', 'This tone-pack delivery is no longer available.', 403);
  }

  const { data: savedPurchase, error: purchaseError } = await supabase
    .from('tone_pack_purchases')
    .upsert(purchase, { onConflict: 'stripe_session_id' })
    .select('id,pack_slug,purchaser_email,bundle_url,email_sent_at,download_count,status')
    .single();
  if (purchaseError) throw purchaseError;

  let emailResult = { sent: false, skipped: true, reason: 'already sent or no email provider configured' };
  if (!savedPurchase.email_sent_at) {
    emailResult = await sendPackDeliveryEmail({
      to: email,
      packName: savedPurchase.pack_slug === pack.slug ? pack.name : savedPurchase.pack_slug,
      downloadUrl,
      sessionId: stripeSession.id
    });

    if (emailResult.sent) {
      await supabase
        .from('tone_pack_purchases')
        .update({ email_sent_at: new Date().toISOString(), email_error: null })
        .eq('id', savedPurchase.id);
    } else if (emailResult.reason) {
      await supabase
        .from('tone_pack_purchases')
        .update({ email_error: emailResult.reason })
        .eq('id', savedPurchase.id);
    }
  }

  return {
    ok: true,
    purchaseId: savedPurchase.id,
    packSlug: pack.slug,
    packName: pack.name,
    email,
    bundleUrl,
    downloadUrl,
    downloadCount: savedPurchase.download_count || 0,
    emailResult
  };
}
