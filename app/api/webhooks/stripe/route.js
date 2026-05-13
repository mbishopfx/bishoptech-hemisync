import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;

  try {
    if (!endpointSecret) {
        // Fallback for debugging if secret not set yet
        event = JSON.parse(body);
    } else {
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    }
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const session = event.data.object;
      const userId = session.client_reference_id || session.metadata?.user_uuid;
      const subscriptionId = session.subscription || session.id;
      
      if (userId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const planId = session.metadata?.planId || (subscription.items.data[0].price.id === 'price_1TWlb7DJtpuPVfuFfSVEXPYU' ? 'starter' : 'pro');
        
        await supabase
          .from('profiles')
          .update({ 
            subscription_tier: planId,
            trial_expires_at: new Date(subscription.trial_end * 1000).toISOString()
          })
          .eq('id', userId);
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_uuid;
      if (userId) {
        await supabase
          .from('profiles')
          .update({ subscription_tier: 'none' })
          .eq('id', userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
