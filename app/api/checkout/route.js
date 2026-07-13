import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getTonePackBySlug, getTonePackPriceId } from '@/lib/audio/tone-packs.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PREMIUM_PRICE_ID = 'price_1TWlb7DJtpuPVfuFfSVEXPYU';
const LIFETIME_PRICE_ID = 'price_1TWlbTDJtpuPVfuFG5ejsTAG';

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
    const { priceId, planId, email } = body || {};
    const pack = getTonePackBySlug(planId);
    const isPackPurchase = Boolean(pack);

    if (!priceId || !planId) {
      return NextResponse.json({ error: 'Price ID and product selection are required' }, { status: 400 });
    }

    if (isPackPurchase) {
      const normalizedEmail = String(email || '').trim().toLowerCase();
      if (!isValidEmail(normalizedEmail)) {
        return NextResponse.json({ error: 'A valid email is required for pack delivery' }, { status: 400 });
      }

      const expectedPriceId = getTonePackPriceId(pack);
      if (!expectedPriceId || priceId !== expectedPriceId) {
        return NextResponse.json({ error: 'Unexpected price ID for selected pack' }, { status: 400 });
      }

      const stripe = new Stripe(stripeSecret);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';
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

    const planConfig = {
      premium: { expectedPriceId: PREMIUM_PRICE_ID, mode: 'subscription' },
      lifetime: { expectedPriceId: LIFETIME_PRICE_ID, mode: 'payment' }
    }[planId];

    if (!planConfig || priceId !== planConfig.expectedPriceId) {
      return NextResponse.json({ error: 'Unsupported plan selection' }, { status: 400 });
    }

    const user = await getOptionalUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required for account plans' }, { status: 401 });
    }

    const stripe = new Stripe(stripeSecret);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: planConfig.mode,
      ...(planConfig.mode === 'subscription'
        ? {
            subscription_data: {
              trial_period_days: 7,
              metadata: { planId, user_uuid: user.id }
            }
          }
        : {}),
      success_url: `${siteUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { user_uuid: user.id, planId, priceId }
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error?.message || 'Checkout could not be created' }, { status: 500 });
  }
}
