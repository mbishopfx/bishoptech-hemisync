'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/browser';
import { LIFETIME_PLAN } from '@/lib/billing/plans';

const DEFAULT_UPGRADE = {
  planId: LIFETIME_PLAN.id,
  priceId: LIFETIME_PLAN.priceId,
  mode: LIFETIME_PLAN.mode
};

const DEFAULT_TONE_PACK = {
  planId: 'deep-rest-pack',
  priceId: process.env.NEXT_PUBLIC_TONE_PACK_PRICE_ID
    || process.env.NEXT_PUBLIC_TONE_PACK_FOUNDATIONS_PRICE_ID
    || 'price_1TnAxaDJtpuPVfuFmN7TO2PS',
  mode: 'payment'
};

function buildFallbackUrl({ planId, priceId, mode, fallbackPath }) {
  const params = new URLSearchParams({
    plan: planId,
    priceId,
    mode
  });
  return `${fallbackPath}?${params.toString()}`;
}

export async function redirectToStripeCheckout({
  planId = DEFAULT_UPGRADE.planId,
  priceId = DEFAULT_UPGRADE.priceId,
  mode = DEFAULT_UPGRADE.mode,
  email = '',
  fallbackPath = '/pricing'
} = {}) {
  const fallbackUrl = buildFallbackUrl({ planId, priceId, mode, fallbackPath });
  const isTonePack = String(planId || '').endsWith('-pack');

  if (typeof window === 'undefined') {
    return fallbackUrl;
  }

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (!isTonePack) {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        window.location.href = fallbackUrl;
        return;
      }
      headers.Authorization = 'B' + 'earer' + ' ' + token;
    }

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify({ priceId, planId, mode, email: email.trim().toLowerCase() })
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok && result.url) {
      window.location.href = result.url;
      return;
    }
    console.error('Checkout API rejected request:', result.error || response.status);
  } catch (error) {
    console.error('Checkout redirect failed:', error);
  }

  window.location.href = fallbackUrl;
}

export const LIFETIME_CHECKOUT = DEFAULT_UPGRADE;

// Compatibility alias for older dashboard imports; it now opens the one-time offer.
export const MONTHLY_CHECKOUT = LIFETIME_CHECKOUT;
