import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('public pricing exposes one $9 monthly membership and no lifetime or free account plan', async () => {
  const pricing = await source('app/pricing/page.js');
  const plans = await source('lib/billing/plans.js');
  assert.match(pricing, /id: MONTHLY_PLAN\.id/);
  assert.match(plans, /MONTHLY_PLAN_ID = 'monthly'/);
  assert.match(pricing, /price: '\$9'/);
  assert.doesNotMatch(pricing, /id: 'lifetime'/);
  assert.doesNotMatch(pricing, /id: 'free'/);
  assert.doesNotMatch(pricing, /7-Day|Free Trial|Lifetime Access/);
});

test('signup always continues to Stripe and login checks entitlement before dashboard access', async () => {
  const signup = await source('app/signup/SignupClient.jsx');
  const login = await source('app/login/LoginClient.jsx');
  const dashboard = await source('app/dashboard/page.jsx');
  assert.match(signup, /username/);
  assert.match(signup, /redirectToStripeCheckout/);
  assert.match(login, /api\/account\/access/);
  assert.match(login, /Membership required/);
  assert.match(dashboard, /access\?\.granted/);
});

test('checkout has no trial or lifetime mode and sensitive Studio routes require membership', async () => {
  const checkout = await source('app/api/checkout/route.js');
  const studioProjects = await source('app/api/studio/projects/route.js');
  const studioRenders = await source('app/api/studio/renders/route.js');
  assert.match(checkout, /mode: 'subscription'/);
  assert.match(checkout, /payment_method_collection: 'always'/);
  assert.doesNotMatch(checkout, /trial_period_days/);
  assert.doesNotMatch(checkout, /LIFETIME_PRICE_ID/);
  assert.match(studioProjects, /requirePlatformSubscriber/);
  assert.match(studioRenders, /requirePlatformSubscriber/);
});
