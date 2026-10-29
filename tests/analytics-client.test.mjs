import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getSafeCognistrationRoute, pushCognistrationEvent, startCognistrationGtm, updateCognistrationAnalyticsConsent } from '../lib/analytics/client.mjs';

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;

function installWindow({ consent = 'granted', pathname = '/', search = '' } = {}) {
  const values = new Map([['cognistration:analytics-consent', consent]]);
  globalThis.window = {
    localStorage: { getItem: (key) => values.get(key) ?? null },
    location: { origin: 'https://cognistration.com', pathname, search },
    dataLayer: [],
  };
  return window;
}

afterEach(() => {
  if (originalWindow === undefined) delete globalThis.window;
  else globalThis.window = originalWindow;
  if (originalDocument === undefined) delete globalThis.document;
  else globalThis.document = originalDocument;
});

test('safe route mapping covers public pages and normalizes dynamic identifiers', () => {
  assert.equal(getSafeCognistrationRoute('/pricing'), '/pricing');
  assert.equal(getSafeCognistrationRoute('/blog/focus-and-attention'), '/blog/focus-and-attention');
  assert.equal(getSafeCognistrationRoute('/tutorial/dreamwork-lucid-dreaming'), '/tutorial/dreamwork-lucid-dreaming');
  assert.equal(getSafeCognistrationRoute('/community/private-username'), '/community/:profile');
  assert.equal(getSafeCognistrationRoute('/checkout/ucp/private-token'), '/checkout/ucp/:checkout');
  assert.equal(getSafeCognistrationRoute('/dashboard'), null);
  assert.equal(getSafeCognistrationRoute('/blog/article?email=private@example.com'), null);
});

test('analytics events fail closed without explicit consent', () => {
  const site = installWindow({ consent: 'denied' });

  assert.equal(pushCognistrationEvent('page_view'), false);
  assert.equal(site.dataLayer.length, 0);
});

test('GTM loader stays inert without consent', () => {
  const site = installWindow({ consent: 'denied' });
  let appendedScripts = 0;
  globalThis.document = {
    createElement: () => ({ dataset: {} }),
    head: { appendChild: () => { appendedScripts += 1; } },
  };

  assert.equal(startCognistrationGtm(), false);
  assert.equal(site.dataLayer.length, 0);
  assert.equal(appendedScripts, 0);
});

test('GTM loader inserts the Cognistration container once after consent', () => {
  const site = installWindow({ consent: 'granted' });
  const appendedScripts = [];
  globalThis.document = {
    createElement: (tag) => ({ tag, dataset: {} }),
    head: { appendChild: (script) => { appendedScripts.push(script); } },
  };

  assert.equal(startCognistrationGtm(), true);
  assert.equal(startCognistrationGtm(), true);
  assert.equal(site.dataLayer.length, 3);
  assert.deepEqual(site.dataLayer[0], ['consent', 'default', { analytics_storage: 'denied' }]);
  assert.deepEqual(Object.keys(site.dataLayer[1]).sort(), ['event', 'gtm.start']);
  assert.equal(site.dataLayer[1].event, 'gtm.js');
  assert.deepEqual(site.dataLayer[2], ['consent', 'update', { analytics_storage: 'granted' }]);
  assert.equal(appendedScripts.length, 1);
  assert.equal(appendedScripts[0].tag, 'script');
  assert.equal(appendedScripts[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-KXQH68LN');
  assert.equal(appendedScripts[0].async, true);
  assert.equal(appendedScripts[0].dataset.cognistrationGtm, 'true');
});

test('consent revocation updates Google consent state and fails closed before GTM loads', () => {
  const site = installWindow({ consent: 'denied' });
  assert.equal(updateCognistrationAnalyticsConsent(false), false);
  assert.equal(site.dataLayer.length, 0);

  site.__cognistrationGtmLoaded = true;
  site.gtag = (...args) => site.dataLayer.push(args);
  assert.equal(updateCognistrationAnalyticsConsent(false), true);
  assert.deepEqual(site.dataLayer, [['consent', 'update', { analytics_storage: 'denied' }]]);
});

test('CTA event accepts only stable identifiers and protected route context', () => {
  const site = installWindow({ pathname: '/blog/focus-and-attention', search: '?email=private@example.com' });

  assert.equal(pushCognistrationEvent('cta_click', {
    cta_id: 'pricing',
    page_placement: 'blog_article',
    email: 'private@example.com',
    page_path: '/dashboard',
  }), true);

  assert.deepEqual(site.dataLayer[0], {
    page_path: '/blog/focus-and-attention',
    page_title: 'Cognistration | blog_article',
    page_location: 'https://cognistration.com/blog/focus-and-attention',
    cta_id: 'pricing',
    page_placement: 'blog_article',
    event: 'cta_click',
  });
});

test('form and purchase events keep only approved fields', () => {
  const site = installWindow({ pathname: '/checkout/confirmed' });

  assert.equal(pushCognistrationEvent('form_start', { form_id: 'account_signup', value: 'private form data' }), true);
  assert.equal(pushCognistrationEvent('purchase', {
    currency: 'USD',
    items: [{ item_id: 'workspace_lifetime', item_name: 'private title', price: 20 }],
    session_id: 'private-session-id',
  }), true);

  assert.deepEqual(site.dataLayer[0], {
    page_path: '/checkout/confirmed',
    page_title: 'Cognistration | checkout',
    page_location: 'https://cognistration.com/checkout/confirmed',
    form_id: 'account_signup',
    event: 'form_start',
  });
  assert.deepEqual(site.dataLayer[1], {
    page_path: '/checkout/confirmed',
    page_title: 'Cognistration | checkout',
    page_location: 'https://cognistration.com/checkout/confirmed',
    currency: 'USD',
    items: [{ item_id: 'workspace_lifetime' }],
    event: 'purchase',
  });
});

test('invalid routes, malformed event fields, and unapproved events are dropped', () => {
  const site = installWindow({ pathname: '/dashboard' });

  assert.equal(pushCognistrationEvent('page_view'), false);
  site.location.pathname = '/pricing';
  assert.equal(pushCognistrationEvent('cta_click', { cta_id: 'private@example.com', page_placement: 'pricing' }), false);
  assert.equal(pushCognistrationEvent('purchase', { currency: 'USD', items: [{ item_id: 'bad id' }] }), false);
  assert.equal(pushCognistrationEvent('generate_lead', { email: 'private@example.com' }), false);
  assert.equal(site.dataLayer.length, 0);
});
