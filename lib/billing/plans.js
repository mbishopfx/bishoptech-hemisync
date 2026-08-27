export const LIFETIME_PLAN_ID = 'lifetime';

export const DEFAULT_LIFETIME_PRICE_ID = 'price_1TWlbTDJtpuPVfuFG5ejsTAG';

export const WORKSHOP_PLAN_ID = 'workshop-24h';
export const WORKSHOP_ACCESS_DURATION_HOURS = 24;
export const WORKSHOP_SESSION_DURATION_SEC = 60 * 60;
export const WORKSHOP_PRICE_CENTS = 299;
export const DEFAULT_WORKSHOP_PRICE_ID = 'price_1U8vR7DJtpuPVfuFaWdob1le';

// This is a separate, accountless product from platform membership. The
// environment override is useful for Stripe test mode and for rotating prices
// without changing application behavior.
export const WORKSHOP_PRICE_ID = process.env.STRIPE_WORKSHOP_PRICE_ID
  || process.env.NEXT_PUBLIC_STRIPE_WORKSHOP_PRICE_ID
  || DEFAULT_WORKSHOP_PRICE_ID;

export const WORKSHOP_PLAN = Object.freeze({
  id: WORKSHOP_PLAN_ID,
  name: 'Cognistration 24-Hour Machine Workshop',
  price: WORKSHOP_PRICE_CENTS / 100,
  priceLabel: '$2.99',
  interval: null,
  durationHours: WORKSHOP_ACCESS_DURATION_HOURS,
  sessionDurationSec: WORKSHOP_SESSION_DURATION_SEC,
  priceId: WORKSHOP_PRICE_ID,
  mode: 'payment'
});

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
