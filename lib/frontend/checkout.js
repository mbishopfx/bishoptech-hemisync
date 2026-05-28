'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const DEFAULT_UPGRADE = {
  planId: 'lifetime',
  priceId: 'price_1TWlbTDJtpuPVfuFG5ejsTAG',
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
  fallbackPath = '/pricing'
} = {}) {
  const fallbackUrl = buildFallbackUrl({ planId, priceId, mode, fallbackPath });

  if (typeof window === 'undefined') {
    return fallbackUrl;
  }

  try {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      window.location.href = fallbackUrl;
      return;
    }

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ priceId, planId, mode })
    });

    const result = await response.json().catch(() => ({}));
    if (response.ok && result.url) {
      window.location.href = result.url;
      return;
    }
  } catch (error) {
    console.error('Checkout redirect failed:', error);
  }

  window.location.href = fallbackUrl;
}

export const LIFETIME_CHECKOUT = DEFAULT_UPGRADE;
