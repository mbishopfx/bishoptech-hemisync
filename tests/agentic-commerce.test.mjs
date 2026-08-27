import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { autonomousPaymentEnabled, autonomousPaymentOptions, hashMandateCart, verifyAutonomousMandate } from '../lib/commerce/ap2.mjs';
import { createWorkshopCheckout } from '../lib/commerce/workshop-checkout.mjs';
import { createTonePackCheckout } from '../lib/commerce/agent-checkout.mjs';
import {
  createWorkshopAccessKey,
  decryptWorkshopAccessKey,
  encryptWorkshopAccessKey,
  hashWorkshopAccessKey
} from '../lib/commerce/workshop-access.mjs';
import {
  createMachineSessionGrant,
  decryptMachineSessionGrant,
  encryptMachineSessionGrant,
  hashMachineSessionGrant
} from '../lib/commerce/machine-session-grants.mjs';
import { constantTimeEqual, normalizeEmail, validateIdempotencyKey } from '../lib/commerce/commerce-utils.mjs';
import { idempotencyKeyFrom, authorizeUcpRequest } from '../lib/commerce/ucp-security.mjs';

function withEnv(values, callback) {
  const keys = Object.keys(values);
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return Promise.resolve(callback()).finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test('commerce inputs normalize safely and require stable retry keys', () => {
  assert.equal(normalizeEmail('  Listener@Example.com '), 'listener@example.com');
  assert.equal(validateIdempotencyKey('checkout-1234'), 'checkout-1234');
  assert.throws(() => normalizeEmail('not-an-email'), (error) => error.code === 'INVALID_EMAIL');
  assert.throws(() => validateIdempotencyKey('short'), (error) => error.code === 'INVALID_IDEMPOTENCY_KEY');
  assert.equal(constantTimeEqual('same', 'same'), true);
  assert.equal(constantTimeEqual('same', 'different'), false);
});

test('hosted payment tools refuse side effects without explicit confirmation', async () => {
  await assert.rejects(
    createTonePackCheckout({ input: { slug: 'deep-rest-pack', email: 'listener@example.com', confirmed: false, idempotencyKey: 'tone-pack-1234' } }),
    (error) => error.code === 'CONFIRMATION_REQUIRED'
  );
  await assert.rejects(
    createWorkshopCheckout({ input: { email: 'listener@example.com', confirmed: false, idempotencyKey: 'workshop-1234' } }),
    (error) => error.code === 'CONFIRMATION_REQUIRED'
  );
});

test('workshop bearer keys can be encrypted at rest and hashed for lookup', () => {
  const key = createWorkshopAccessKey(() => Buffer.alloc(32, 7));
  const ciphertext = encryptWorkshopAccessKey(key, 'unit-secret', () => Buffer.alloc(12, 3));
  assert.equal(decryptWorkshopAccessKey(ciphertext, 'unit-secret'), key);
  assert.notEqual(hashWorkshopAccessKey(key, 'unit-secret'), hashWorkshopAccessKey(key, 'other-secret'));
  assert.notEqual(ciphertext, key);
});

test('machine payment grants are bound to a receipt and encrypted at rest', () => {
  const key = createMachineSessionGrant(() => Buffer.alloc(32, 9));
  const ciphertext = encryptMachineSessionGrant(key, 'unit-secret', () => Buffer.alloc(12, 4));
  assert.equal(decryptMachineSessionGrant(ciphertext, 'unit-secret'), key);
  assert.notEqual(hashMachineSessionGrant(key, 'unit-secret'), hashMachineSessionGrant(key, 'other-secret'));
  assert.match(key, /^cgms_[A-Za-z0-9_-]+$/);
});

test('UCP request signatures are accepted only inside the replay window', async () => {
  const rawBody = JSON.stringify({ line_items: [{ item: { id: 'deep-rest-pack' }, quantity: 1 }] });
  const timestamp = new Date().toISOString();
  const signature = crypto.createHmac('sha256', 'ucp-unit-secret').update(`${timestamp}.${rawBody}`).digest('base64');
  await withEnv({ UCP_API_TOKEN: undefined, UCP_SHARED_SECRET: 'ucp-unit-secret' }, async () => {
    const request = new Request('https://example.test/api/ucp/checkout-sessions', {
      method: 'POST',
      headers: { 'x-ucp-timestamp': timestamp, 'x-ucp-signature': signature }
    });
    assert.deepEqual(authorizeUcpRequest(request, rawBody), { authorized: true, tokenRequired: false, signatureRequired: true });
  });
});

test('UCP idempotency metadata is discoverable without exposing credentials', () => {
  const request = new Request('https://example.test', { headers: { 'Idempotency-Key': 'header-1234' } });
  assert.equal(idempotencyKeyFrom(request, {}), 'header-1234');
  assert.equal(idempotencyKeyFrom(new Request('https://example.test'), { meta: { 'idempotency-key': 'meta-1234' } }), 'meta-1234');
});

test('AP2 remains provider-gated and binds its future mandate to a cart hash', async () => {
  await withEnv({ AP2_ENABLED: undefined, UCP_SHARED_PAYMENT_TOKEN_ENABLED: undefined, STRIPE_NETWORK_ID: undefined, AP2_AGENT_PUBLIC_JWK: undefined, AP2_MANDATE_SECRET: undefined }, async () => {
    assert.equal(autonomousPaymentEnabled(), false);
    assert.equal(autonomousPaymentOptions('https://example.test').status, 'provider_access_required');
    assert.throws(() => verifyAutonomousMandate({ mandate: {}, cart: [], amount: 50, currency: 'usd' }), (error) => error.code === 'AP2_PROVIDER_ACCESS_REQUIRED');
  });
  assert.match(hashMandateCart([{ id: 'line_deep-rest-pack', quantity: 1 }]), /^[a-f0-9]{64}$/);
});
