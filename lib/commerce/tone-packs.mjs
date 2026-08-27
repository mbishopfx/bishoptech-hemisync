import { getSupabaseAdmin } from '../supabase/admin.js';
import { getTonePackBySlug } from '../audio/tone-packs.mjs';
import { sendPackDeliveryEmail } from '../email/pack-delivery.mjs';

export async function fulfillTonePackPurchase({ stripeSession, supabase = getSupabaseAdmin() }) {
  const packSlug = stripeSession?.metadata?.packSlug || stripeSession?.metadata?.planId;
  const pack = getTonePackBySlug(packSlug);
  const email = String(
    stripeSession?.metadata?.purchaserEmail
      || stripeSession?.customer_details?.email
      || stripeSession?.customer_email
      || ''
  ).trim().toLowerCase();

  if (!pack) throw new Error(`Unknown tone pack: ${packSlug || 'missing'}`);
  if (!email) throw new Error('Stripe checkout session did not include a purchaser email');
  if (stripeSession.payment_status && stripeSession.payment_status !== 'paid') {
    throw new Error(`Payment is not complete: ${stripeSession.payment_status}`);
  }
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
  const userId = stripeSession.client_reference_id || stripeSession.metadata?.user_uuid || null;
  const purchase = {
    user_id: userId,
    pack_slug: pack.slug,
    pack_name: catalogRow?.name || pack.name,
    purchaser_email: email,
    price_id: stripeSession.metadata?.priceId || stripeSession.line_items?.data?.[0]?.price?.id || 'pending',
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

  const { data: savedPurchase, error: purchaseError } = await supabase
    .from('tone_pack_purchases')
    .upsert(purchase, { onConflict: 'stripe_session_id' })
    .select('id,pack_slug,purchaser_email,bundle_url,email_sent_at,download_count')
    .single();
  if (purchaseError) throw purchaseError;

  let emailResult = { sent: false, skipped: true, reason: 'already sent or no email provider configured' };
  if (!savedPurchase.email_sent_at) {
    emailResult = await sendPackDeliveryEmail({
      to: email,
      packName: savedPurchase.pack_slug === pack.slug ? pack.name : savedPurchase.pack_slug,
      downloadUrl: bundleUrl,
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
    downloadCount: savedPurchase.download_count || 0,
    emailResult
  };
}
