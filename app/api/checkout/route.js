import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getTonePackBySlug, getTonePackPriceId } from '@/lib/audio/tone-packs.mjs';
import { LIFETIME_PLAN_ID, LIFETIME_PRICE_ID } from '@/lib/billing/plans';
import { hasPlatformAccess } from '@/lib/billing/entitlements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

async function getOptionalUser(req) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser(token);
    return data?.user || null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecret) {
      return NextResponse.json({ error: 'Stripe secret missing' }, { status: 503 });
    }

    const body = await req.json();
    const { priceId: requestedPriceId, planId, email } = body || {};
    const submittedPriceId = String(requestedPriceId || '').trim();
    const pack = getTonePackBySlug(planId);
    const isPackPurchase = Boolean(pack);

    if (!planId || (isPackPurchase && !submittedPriceId)) {
      return NextResponse.json({ error: 'Price ID and product selection are required' }, { status: 400 });
    }

    if (isPackPurchase) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json({ error: 'A valid email is required for pack delivery' }, { status: 400 });
      }

      const expectedPriceId = getTonePackPriceId(pack);
      if (!expectedPriceId || submittedPriceId !== expectedPriceId) {
        return NextResponse.json({ error: 'Unexpected price ID for selected pack' }, { status: 400 });
      }

      const stripe = new Stripe(stripeSecret);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev';
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: expectedPriceId, quantity: 1 }],
        mode: 'payment',
        customer_creation: 'always',
        customer_email: normalizedEmail,
        payment_intent_data: {
          receipt_email: normalizedEmail,
          metadata: {
            productType: 'tone-pack',
            packSlug: pack.slug,
            purchaserEmail: normalizedEmail
          }
        },
        success_url: `${siteUrl}/packs/success?session_id={CHECKOUT_SESSION_ID}&pack=${encodeURIComponent(pack.slug)}`,
        cancel_url: `${siteUrl}/packs?cancelled=1`,
        metadata: {
          productType: 'tone-pack',
          planId: pack.slug,
          packSlug: pack.slug,
          priceId: expectedPriceId,
          purchaserEmail: normalizedEmail
        }
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    const resolvedLifetimePriceId = submittedPriceId || LIFETIME_PRICE_ID;
    if (planId !== LIFETIME_PLAN_ID || !LIFETIME_PRICE_ID || resolvedLifetimePriceId !== LIFETIME_PRICE_ID) {
      if (!LIFETIME_PRICE_ID) {
        return NextResponse.json({ error: 'Lifetime price is not configured' }, { status: 503 });
      }
      return NextResponse.json({ error: 'Unsupported plan selection' }, { status: 400 });
    }

    const user = await getOptionalUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required for account plans' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: profile } = await supabase
      .from('profiles')
      .select('entitlement_type,billing_status,subscription_tier,stripe_customer_id,stripe_subscription_id,payment_method_attached')
      .eq('id', user.id)
      .maybeSingle();
    if (hasPlatformAccess(profile)) {
      return NextResponse.json({ error: 'This account already has platform access' }, { status: 409 });
    }

    const stripe = new Stripe(stripeSecret);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: LIFETIME_PRICE_ID, quantity: 1 }],
      mode: 'payment',
      success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing?cancelled=1`,
      client_reference_id: user.id,
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_creation: 'always', customer_email: user.email }),
      payment_intent_data: {
        metadata: { user_uuid: user.id, planId: LIFETIME_PLAN_ID, priceId: LIFETIME_PRICE_ID }
      },
      metadata: { user_uuid: user.id, planId: LIFETIME_PLAN_ID, priceId: LIFETIME_PRICE_ID }
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error?.message || 'Checkout could not be created' }, { status: 500 });
  }
}
