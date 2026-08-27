import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function loadStripeHealth(stripeSecret) {
  if (!stripeSecret) {
    return { status: 'skipped', reason: 'missing_secret' };
  }

  const stripe = new Stripe(stripeSecret);
  // Prove the server credential is usable without returning balances,
  // customer counts, payment-event counts, or other financial telemetry from
  // a public endpoint.
  await stripe.balance.retrieve();
  return { status: 'ok' };
}

async function checkCommerceTable(supabase, table, column = 'id') {
  const { error } = await supabase.from(table).select(column, { head: true, count: 'exact' }).limit(1);
  return !error;
}

async function loadCommerceHealth(supabase) {
  const checks = await Promise.all([
    checkCommerceTable(supabase, 'agent_checkout_requests'),
    checkCommerceTable(supabase, 'workshop_access_keys'),
    checkCommerceTable(supabase, 'commerce_checkouts', 'cancel_idempotency_key'),
    checkCommerceTable(supabase, 'commerce_orders'),
    checkCommerceTable(supabase, 'commerce_webhook_events', 'event_id'),
    checkCommerceTable(supabase, 'ap2_mandates', 'mandate_id'),
    checkCommerceTable(supabase, 'machine_session_grants')
  ]);
  return {
    status: checks.every(Boolean) ? 'ok' : 'degraded',
    checkout_state: checks[0] && checks[2] ? 'ready' : 'not_ready',
    workshop_access: checks[1] ? 'ready' : 'not_ready',
    order_events: checks[3] && checks[4] ? 'ready' : 'not_ready',
    autonomous_payment_audit: checks[5] ? 'ready' : 'not_ready',
    machine_payment_grants: checks[6] ? 'ready' : 'not_ready'
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { count, error } = await supabase.from('agentic_tones').select('*', { count: 'exact', head: true });
    
    if (error) throw error;

    const stripeHealth = await loadStripeHealth(process.env.STRIPE_SECRET_KEY);
    const commerceHealth = await loadCommerceHealth(supabase);
    const overallStatus = stripeHealth.status === 'ok' && commerceHealth.status === 'ok' ? 'healthy' : 'degraded';

    return NextResponse.json({
      status: overallStatus,
      env: {
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_ai_gateway_key: !!(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL || process.env.OPENAI_API_KEY),
        has_stripe_secret: !!process.env.STRIPE_SECRET_KEY,
        has_stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
        site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev'
      },
      database: {
        agentic_tones_count: count || 0,
        commerce: commerceHealth
      },
      stripe: stripeHealth
    });
  } catch (err) {
    return NextResponse.json({ status: 'unhealthy', error: err.message }, { status: 500 });
  }
}
