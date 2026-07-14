export function normalizeSubscriptionTier(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeBillingStatus(value) {
  return String(value || '').trim().toLowerCase();
}

export function isLifetimeMember(profile) {
  return normalizeSubscriptionTier(profile?.entitlement_type) === 'lifetime'
    || normalizeSubscriptionTier(profile?.subscription_tier) === 'lifetime';
}

export function isActiveMonthlySubscriber(profile) {
  return normalizeSubscriptionTier(profile?.entitlement_type) === 'monthly'
    && normalizeBillingStatus(profile?.billing_status) === 'active'
    && Boolean(profile?.stripe_customer_id)
    && Boolean(profile?.stripe_subscription_id)
    && profile?.payment_method_attached === true;
}

export function hasPlatformAccess(profile) {
  return isLifetimeMember(profile) || isActiveMonthlySubscriber(profile);
}

export function isFreeSubscriptionTier(value) {
  const tier = normalizeSubscriptionTier(value);
  return tier === 'free' || tier === 'none' || tier === 'trial' || tier === 'free_trial';
}

export function isPaidSubscriptionTier(value) {
  return !isFreeSubscriptionTier(value);
}

export function getSubscriptionStatusLabel(profile) {
  if (isLifetimeMember(profile)) return 'Lifetime Member';
  if (isActiveMonthlySubscriber(profile)) return '$9 Monthly Member';
  return 'Subscription Required';
}

export function getPlatformAccessState(profile) {
  const granted = hasPlatformAccess(profile);
  return {
    granted,
    entitlement: isLifetimeMember(profile)
      ? 'lifetime'
      : isActiveMonthlySubscriber(profile)
        ? 'monthly'
        : 'none',
    billingStatus: normalizeBillingStatus(profile?.billing_status) || 'inactive',
    label: getSubscriptionStatusLabel(profile)
  };
}
