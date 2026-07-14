import { MONTHLY_PRICE_ID } from './plans.js';

function objectId(value) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id || null;
}

export function subscriptionUsesMonthlyPrice(subscription) {
  return Boolean(subscription?.items?.data?.some((item) => item?.price?.id === MONTHLY_PRICE_ID));
}

export function subscriptionGrantsAccess(subscription) {
  return subscriptionUsesMonthlyPrice(subscription) && subscription?.status === 'active';
}

export function subscriptionProfilePatch(subscription, { paymentMethodAttached } = {}) {
  const grantsAccess = subscriptionGrantsAccess(subscription);
  const hasPaymentMethod = paymentMethodAttached
    ?? Boolean(objectId(subscription?.default_payment_method));

  return {
    plan: grantsAccess ? 'pro' : 'free',
    subscription_tier: grantsAccess ? 'monthly' : 'none',
    entitlement_type: grantsAccess ? 'monthly' : 'none',
    billing_status: subscription?.status || 'inactive',
    stripe_customer_id: objectId(subscription?.customer),
    stripe_subscription_id: subscription?.id || null,
    payment_method_attached: grantsAccess && hasPaymentMethod,
    trial_expires_at: null
  };
}

export function checkoutGrantsAccess(checkoutSession, subscription) {
  return checkoutSession?.mode === 'subscription'
    && checkoutSession?.payment_status === 'paid'
    && subscriptionGrantsAccess(subscription);
}
