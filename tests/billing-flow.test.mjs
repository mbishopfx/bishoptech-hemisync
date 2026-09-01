import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('public pricing exposes one $20 lifetime payment and no public monthly plan', async () => {
  const pricing = await source('app/pricing/page.js');
  const plans = await source('lib/billing/plans.js');
  assert.match(pricing, /id: LIFETIME_PLAN\.id/);
  assert.match(plans, /LIFETIME_PLAN_ID = 'lifetime'/);
  assert.match(pricing, /price: '\$20'/);
  assert.match(plans, /price_1TWlbTDJtpuPVfuFG5ejsTAG/);
  assert.match(pricing, /mode: 'payment'/);
  assert.doesNotMatch(pricing, /\$9|\$\s*\/month|MONTHLY_PLAN/);
  assert.doesNotMatch(pricing, /id: 'free'/);
  assert.doesNotMatch(pricing, /7-Day|Free Trial/);
});

test('pricing featured previews normalize persisted track fields and expose playback failures', async () => {
  const pricing = await source('app/pricing/page.js');
  assert.match(pricing, /tone\?\.track_name/);
  assert.match(pricing, /tone\?\.metadata\?\.sourceToneName/);
  assert.match(pricing, /tone\?\.metadata\?\.sourceToneSummary/);
  assert.match(pricing, /audio\.load\(\)/);
  assert.match(pricing, /aria-pressed=\{isTonePlaying\}/);
  assert.match(pricing, /This preview could not be loaded/);
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

test('checkout creates the one-time lifetime path and sensitive Studio routes require access', async () => {
  const checkout = await source('app/api/checkout/route.js');
  const studioProjects = await source('app/api/studio/projects/route.js');
  const studioRenders = await source('app/api/studio/renders/route.js');
  assert.match(checkout, /LIFETIME_PRICE_ID/);
  assert.match(checkout, /mode: 'payment'/);
  assert.doesNotMatch(checkout, /mode: 'subscription'/);
  assert.doesNotMatch(checkout, /trial_period_days/);
  assert.match(studioProjects, /requirePlatformSubscriber/);
  assert.match(studioRenders, /requirePlatformSubscriber/);
});
