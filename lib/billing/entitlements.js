export function normalizeSubscriptionTier(value) {
  return String(value || '').trim().toLowerCase();
}

export function isFreeSubscriptionTier(value) {
  const tier = normalizeSubscriptionTier(value);
  return tier === 'free' || tier === 'none' || tier === 'trial' || tier === 'free_trial';
}

export function isPaidSubscriptionTier(value) {
  return !isFreeSubscriptionTier(value);
}

export function getSubscriptionStatusLabel(profile) {
  return isFreeSubscriptionTier(profile?.subscription_tier) ? 'Free Trial' : 'Paid Plan';
}
