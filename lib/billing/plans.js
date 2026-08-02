export const LIFETIME_PLAN_ID = 'lifetime';

export const DEFAULT_LIFETIME_PRICE_ID = 'price_1TWlbTDJtpuPVfuFG5ejsTAG';

// The named environment variables allow deployment overrides, while the supplied
// lifetime price remains the safe default for every checkout environment.
export const LIFETIME_PRICE_ID = process.env.STRIPE_LIFETIME_PRICE_ID
  || process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID
  || DEFAULT_LIFETIME_PRICE_ID;

export const LIFETIME_PLAN = Object.freeze({
  id: LIFETIME_PLAN_ID,
  name: 'Cognistration Lifetime Access',
  price: 20,
  interval: null,
  priceId: LIFETIME_PRICE_ID,
  mode: 'payment'
});

// Keep the historical recurring identifiers available to webhook compatibility
// and grandfathered accounts. New checkout cannot select this legacy plan.
export const LEGACY_MONTHLY_PLAN_ID = 'monthly';
export const LEGACY_MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID
  || process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
  || 'price_1TWlb7DJtpuPVfuFfSVEXPYU';

export const MONTHLY_PLAN_ID = LEGACY_MONTHLY_PLAN_ID;
export const MONTHLY_PRICE_ID = LEGACY_MONTHLY_PRICE_ID;
