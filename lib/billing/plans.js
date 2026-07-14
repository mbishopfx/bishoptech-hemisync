export const MONTHLY_PLAN_ID = 'monthly';
export const MONTHLY_PRICE_ID = process.env.STRIPE_MONTHLY_PRICE_ID
  || process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
  || 'price_1TWlb7DJtpuPVfuFfSVEXPYU';

export const MONTHLY_PLAN = Object.freeze({
  id: MONTHLY_PLAN_ID,
  name: 'Cognistration Membership',
  price: 9,
  interval: 'month',
  priceId: MONTHLY_PRICE_ID,
  mode: 'subscription'
});
