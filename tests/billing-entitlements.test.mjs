import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getPlatformAccessState,
  hasPlatformAccess,
  isActiveMonthlySubscriber,
  isLifetimeMember
} from '../lib/billing/entitlements.js';
import {
  checkoutGrantsAccess,
  lifetimeProfilePatch,
  subscriptionGrantsAccess,
  subscriptionProfilePatch
} from '../lib/billing/stripe-subscription.js';
import { MONTHLY_PRICE_ID } from '../lib/billing/plans.js';

const activeMonthly = {
  entitlement_type: 'monthly',
  billing_status: 'active',
  stripe_customer_id: 'cus_paid',
  stripe_subscription_id: 'sub_paid',
  payment_method_attached: true
};

test('lifetime profiles and legacy active Stripe monthly profiles receive access', () => {
  assert.equal(isLifetimeMember({ subscription_tier: 'lifetime' }), true);
  assert.equal(hasPlatformAccess({ entitlement_type: 'lifetime', billing_status: 'active' }), true);
  assert.equal(isActiveMonthlySubscriber(activeMonthly), true);
  assert.equal(hasPlatformAccess(activeMonthly), true);
  assert.equal(hasPlatformAccess({ subscription_tier: 'premium' }), false);
  assert.equal(hasPlatformAccess({ ...activeMonthly, billing_status: 'past_due' }), false);
  assert.equal(hasPlatformAccess({ ...activeMonthly, stripe_subscription_id: null }), false);
  assert.equal(hasPlatformAccess({ ...activeMonthly, payment_method_attached: false }), false);
  assert.deepEqual(getPlatformAccessState({ subscription_tier: 'lifetime' }), {
    granted: true,
    entitlement: 'lifetime',
    billingStatus: 'inactive',
    label: 'Lifetime Member'
  });
});

test('legacy Stripe membership provisioning still requires its configured monthly price and active status', () => {
  const subscription = {
    id: 'sub_paid',
    status: 'active',
    customer: 'cus_paid',
    default_payment_method: 'pm_card',
    items: { data: [{ price: { id: MONTHLY_PRICE_ID } }] }
  };
  assert.equal(subscriptionGrantsAccess(subscription), true);
  assert.equal(checkoutGrantsAccess({ mode: 'subscription', payment_status: 'paid' }, subscription), true);
  assert.equal(checkoutGrantsAccess({ mode: 'subscription', payment_status: 'unpaid' }, subscription), false);
  assert.equal(subscriptionGrantsAccess({ ...subscription, status: 'past_due' }), false);
  assert.equal(subscriptionGrantsAccess({ ...subscription, items: { data: [{ price: { id: 'price_other' } }] } }), false);
  assert.deepEqual(subscriptionProfilePatch(subscription), {
    plan: 'pro',
    subscription_tier: 'monthly',
    entitlement_type: 'monthly',
    billing_status: 'active',
    stripe_customer_id: 'cus_paid',
    stripe_subscription_id: 'sub_paid',
    payment_method_attached: true,
    trial_expires_at: null
  });
});

test('a paid lifetime checkout maps to permanent platform access', () => {
  assert.deepEqual(lifetimeProfilePatch({ customer: 'cus_lifetime' }), {
    plan: 'founder',
    subscription_tier: 'lifetime',
    entitlement_type: 'lifetime',
    billing_status: 'active',
    stripe_customer_id: 'cus_lifetime',
    stripe_subscription_id: null,
    payment_method_attached: true,
    grandfathered_at: null,
    trial_expires_at: null
  });
});
