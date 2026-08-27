import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function moneyToDollars(amount = 0, currency = 'usd') {
  return {
    amount,
    currency,
    display: `${(amount / 100).toFixed(2)} ${String(currency || 'usd').toUpperCase()}`
  };
}

async function loadStripeHealth(stripeSecret) {
  if (!stripeSecret) {
    return { status: 'skipped', reason: 'missing_secret' };
  }

  const stripe = new Stripe(stripeSecret);
  const since = Math.floor(Date.now() / 1000) - 86400;

  const [balance, active, trialing, pastDue, canceled, completedEvents, failedEvents, deletedEvents] = await Promise.all([
    stripe.balance.retrieve(),
    stripe.subscriptions.list({ status: 'active', limit: 100 }),
    stripe.subscriptions.list({ status: 'trialing', limit: 100 }),
    stripe.subscriptions.list({ status: 'past_due', limit: 100 }),
    stripe.subscriptions.list({ status: 'canceled', limit: 100 }),
    stripe.events.list({ type: 'checkout.session.completed', created: { gte: since }, limit: 100 }),
    stripe.events.list({ type: 'payment_intent.payment_failed', created: { gte: since }, limit: 100 }),
    stripe.events.list({ type: 'customer.subscription.deleted', created: { gte: since }, limit: 100 }),
  ]);

  const available = balance.available || [];
  const pending = balance.pending || [];
  const availableTotal = available.reduce((sum, item) => sum + (item.amount || 0), 0);
  const pendingTotal = pending.reduce((sum, item) => sum + (item.amount || 0), 0);

  return {
    status: 'ok',
    balance: {
      available: moneyToDollars(availableTotal, available[0]?.currency),
      pending: moneyToDollars(pendingTotal, pending[0]?.currency)
    },
    subscriptions: {
      active: active.data.length,
      trialing: trialing.data.length,
      past_due: pastDue.data.length,
      canceled: canceled.data.length
    },
    last_24h_events: {
      checkout_session_completed: completedEvents.data.length,
      payment_intent_failed: failedEvents.data.length,
      customer_subscription_deleted: deletedEvents.data.length
    }
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { count, error } = await supabase.from('agentic_tones').select('*', { count: 'exact', head: true });
    
    if (error) throw error;

    const stripeHealth = await loadStripeHealth(process.env.STRIPE_SECRET_KEY);

    return NextResponse.json({
      status: 'healthy',
      env: {
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_ai_gateway_key: !!(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL || process.env.OPENAI_API_KEY),
        has_stripe_secret: !!process.env.STRIPE_SECRET_KEY,
        has_stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
        site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev'
      },
      database: {
        agentic_tones_count: count || 0
      },
      stripe: stripeHealth
    });
  } catch (err) {
    return NextResponse.json({ status: 'unhealthy', error: err.message }, { status: 500 });
  }
}
