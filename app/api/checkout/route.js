import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { priceId, planId, mode = 'subscription' } = await req.json();

    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    // Authenticate user
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode === 'payment' ? 'payment' : 'subscription',
      ...(mode === 'payment'
        ? {}
        : {
            subscription_data: {
              trial_period_days: 7,
              metadata: {
                planId: planId,
                user_uuid: user.id
              }
            }
          }),
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hemisync.bishoptech.dev'}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://hemisync.bishoptech.dev'}/pricing`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        user_uuid: user.id,
        planId: planId
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
