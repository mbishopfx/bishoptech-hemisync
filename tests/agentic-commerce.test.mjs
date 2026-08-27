import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { autonomousPaymentEnabled, autonomousPaymentOptions, hashMandateCart, verifyAutonomousMandate } from '../lib/commerce/ap2.mjs';
import { createWorkshopCheckout } from '../lib/commerce/workshop-checkout.mjs';
import { createTonePackCheckout } from '../lib/commerce/agent-checkout.mjs';
import { buildUcpOrderEvent, createUcpDetachedSignature, notifyUcpOrderEvent, verifyUcpDetachedSignature } from '../lib/commerce/order-events.mjs';
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
import { assertUcpAgentProfile, idempotencyKeyFrom, authorizeUcpRequest, verifyRequestSignature } from '../lib/commerce/ucp-security.mjs';
import { ucpProfile } from '../lib/commerce/ucp.mjs';

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
  assert.equal(verifyRequestSignature({ rawBody: '', timestamp, provided: crypto.createHmac('sha256', 'ucp-unit-secret').update(`${timestamp}.`).digest('base64'), secret: 'ucp-unit-secret' }), true);
});

test('UCP idempotency metadata is discoverable without exposing credentials', () => {
  const request = new Request('https://example.test', { headers: { 'Idempotency-Key': 'header-1234' } });
  assert.equal(idempotencyKeyFrom(request, {}), 'header-1234');
  assert.equal(idempotencyKeyFrom(new Request('https://example.test'), { meta: { 'idempotency-key': 'meta-1234' } }), 'meta-1234');
  assert.equal(idempotencyKeyFrom(new Request('https://example.test'), { arguments: { meta: { 'idempotency-key': 'nested-1234' } } }), 'nested-1234');
});

test('UCP agent identity can be supplied in metadata or the standard profile header', () => {
  const profile = 'https://platform.example/profiles/shopping-agent.json';
  assert.deepEqual(assertUcpAgentProfile({ meta: { 'ucp-agent': { profile } }, request: new Request('https://example.test') }), { profile });
  assert.deepEqual(assertUcpAgentProfile({ request: new Request('https://example.test', { headers: { 'UCP-Agent': `profile="${profile}"` } }) }), { profile });
  assert.throws(
    () => assertUcpAgentProfile({ meta: { 'ucp-agent': { profile } }, request: new Request('https://example.test', { headers: { 'UCP-Agent': 'profile="https://other.example/agent.json"' } }) }),
    (error) => error.code === 'UCP_AGENT_MISMATCH'
  );
});

test('UCP order events use full order payloads and verifiable detached signatures', async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const privateJwk = { ...privateKey.export({ format: 'jwk' }), kid: 'order-signing-1' };
  const publicJwk = { ...publicKey.export({ format: 'jwk' }), kid: 'order-signing-1' };
  const event = buildUcpOrderEvent({
    event: 'order.created',
    origin: 'https://example.test',
    now: new Date('2026-08-27T12:00:00.000Z'),
    order: {
      id: 'order_123',
      checkout_id: 'checkout_123',
      line_items: [{
        id: 'line_deep-rest-pack',
        item: { id: 'deep-rest-pack', title: 'Deep Rest', price: 299 },
        quantity: 1,
        totals: [{ type: 'total', amount: 299 }]
      }],
      totals: [{ type: 'total', amount: 299 }],
      fulfillment: {
        download_url: 'https://example.test/private-download',
        protected_delivery_url: 'https://example.test/protected-download',
        web_url: 'https://example.test/packs#deep-rest-pack'
      },
      updated_at: '2026-08-27T12:00:00.000Z'
    }
  });
  assert.equal(event.ucp.version, '2026-01-23');
  assert.equal(event.line_items[0].quantity.fulfilled, 1);
  assert.equal(event.fulfillment.expectations[0].method_type, 'digital');
  assert.ok(event.event_id.startsWith('evt_'));
  assert.equal(event.fulfillment.download_url, undefined);
  assert.equal(event.fulfillment.protected_delivery_url, undefined);

  const body = JSON.stringify(event);
  const detached = createUcpDetachedSignature({ body, privateJwk });
  assert.match(detached, /^[A-Za-z0-9_-]+\.\.[A-Za-z0-9_-]+$/);
  assert.equal(verifyUcpDetachedSignature({ body, provided: detached, publicJwk }), true);
  assert.equal(verifyUcpDetachedSignature({ body: `${body}.tampered`, provided: detached, publicJwk }), false);

  await withEnv({
    UCP_ORDER_WEBHOOK_URL: 'https://platform.example/ucp/orders',
    UCP_SIGNING_PRIVATE_JWK: JSON.stringify(privateJwk),
    UCP_SIGNING_PUBLIC_JWK: JSON.stringify(publicJwk),
    UCP_SIGNING_KEY_ID: undefined,
    UCP_SIGNING_ALGORITHM: undefined
  }, async () => {
    let request;
    const result = await notifyUcpOrderEvent({
      event: 'order.created',
      order: { id: 'order_123', checkout_id: 'checkout_123', line_items: [], totals: [], updated_at: '2026-08-27T12:00:00.000Z' },
      fetchImpl: async (url, init) => {
        request = { url, init };
        return new Response(null, { status: 204 });
      }
    });
    assert.equal(result.sent, true);
    assert.equal(request.url, 'https://platform.example/ucp/orders');
    const delivered = JSON.parse(request.init.body);
    assert.equal(delivered.event_id, result.eventId);
    assert.equal(delivered.checkout_id, 'checkout_123');
    assert.ok(request.init.headers['Request-Signature']);
    assert.equal(verifyUcpDetachedSignature({ body: request.init.body, provided: request.init.headers['Request-Signature'], publicJwk }), true);
  });
});

test('UCP discovery never publishes private signing material and only advertises signed events when ready', async () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const privateJwk = { ...privateKey.export({ format: 'jwk' }), kid: 'profile-signing-1' };
  const publicJwk = { ...publicKey.export({ format: 'jwk' }), kid: 'profile-signing-1' };
  await withEnv({
    UCP_ORDER_WEBHOOK_URL: 'https://platform.example/ucp/orders',
    UCP_SIGNING_PRIVATE_JWK: JSON.stringify(privateJwk),
    UCP_SIGNING_PUBLIC_JWK: JSON.stringify(privateJwk),
    UCP_SIGNING_KEY_ID: undefined,
    UCP_SIGNING_ALGORITHM: undefined
  }, async () => {
    const unsafe = ucpProfile('https://example.test');
    assert.deepEqual(unsafe.signing_keys, []);
    assert.equal(unsafe.ucp.capabilities['dev.ucp.shopping.order'][0].config, undefined);
  });
  await withEnv({
    UCP_ORDER_WEBHOOK_URL: 'https://platform.example/ucp/orders',
    UCP_SIGNING_PRIVATE_JWK: JSON.stringify(privateJwk),
    UCP_SIGNING_PUBLIC_JWK: JSON.stringify(publicJwk),
    UCP_SIGNING_KEY_ID: undefined,
    UCP_SIGNING_ALGORITHM: undefined
  }, async () => {
    const ready = ucpProfile('https://example.test');
    assert.deepEqual(ready.signing_keys, [publicJwk]);
    assert.equal(ready.ucp.capabilities['dev.ucp.shopping.order'][0].config.webhook_url, 'https://platform.example/ucp/orders');
  });
});

test('AP2 remains provider-gated and binds its future mandate to a cart hash', async () => {
  await withEnv({ AP2_ENABLED: undefined, UCP_SHARED_PAYMENT_TOKEN_ENABLED: undefined, STRIPE_NETWORK_ID: undefined, AP2_AGENT_PUBLIC_JWK: undefined, AP2_MANDATE_SECRET: undefined }, async () => {
    assert.equal(autonomousPaymentEnabled(), false);
    assert.equal(autonomousPaymentOptions('https://example.test').status, 'provider_access_required');
    assert.throws(() => verifyAutonomousMandate({ mandate: {}, cart: [], amount: 50, currency: 'usd' }), (error) => error.code === 'AP2_PROVIDER_ACCESS_REQUIRED');
  });
  assert.match(hashMandateCart([{ id: 'line_deep-rest-pack', quantity: 1 }]), /^[a-f0-9]{64}$/);
});
