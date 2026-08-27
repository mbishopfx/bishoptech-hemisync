import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { autonomousPaymentEnabled, autonomousPaymentOptions, hashMandateCart, verifyAutonomousMandate } from '../lib/commerce/ap2.mjs';
import { createWorkshopCheckout } from '../lib/commerce/workshop-checkout.mjs';
import { createTonePackCheckout } from '../lib/commerce/agent-checkout.mjs';
import { buildUcpOrderEvent, createUcpDetachedSignature, notifyUcpOrderEvent, verifyUcpDetachedSignature } from '../lib/commerce/order-events.mjs';
import {
  createMerchantAuthorization,
  createOfficialAp2CheckoutReceipt,
  createOfficialAp2PaymentReceipt,
  officialAp2CapabilityEnabled,
  officialAp2Readiness,
  verifyOfficialAp2CheckoutMandate,
  verifyOfficialAp2PaymentMandate
} from '../lib/commerce/ap2-official.mjs';
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

function encode(value) {
  return Buffer.from(value).toString('base64url');
}

function signCompactJws({ header, payload, privateJwk }) {
  const encodedHeader = encode(JSON.stringify(header));
  const encodedPayload = encode(JSON.stringify(payload));
  const signature = crypto.sign('sha256', Buffer.from(`${encodedHeader}.${encodedPayload}`), {
    key: crypto.createPrivateKey({ key: privateJwk, format: 'jwk' }),
    dsaEncoding: 'ieee-p1363'
  });
  return `${encodedHeader}.${encodedPayload}.${signature.toString('base64url')}`;
}

function disclosure(value, salt) {
  const encoded = encode(JSON.stringify([salt, value]));
  return {
    encoded,
    digest: crypto.createHash('sha256').update(encoded, 'ascii').digest('base64url')
  };
}

function buildOfficialCheckoutMandate({ checkout, agentPrivateJwk, agentPublicJwk, merchantPrivateJwk, checkoutConstraints = [] }) {
  const merchantAuthorization = createMerchantAuthorization({ checkout, privateJwk: merchantPrivateJwk });
  const signedCheckout = { ...checkout, ap2: { merchant_authorization: merchantAuthorization } };
  const checkoutJwt = signCompactJws({
    header: { alg: 'ES256', typ: 'JWT', kid: merchantPrivateJwk.kid },
    payload: signedCheckout,
    privateJwk: merchantPrivateJwk
  });
  const checkoutHash = crypto.createHash('sha256').update(checkoutJwt, 'ascii').digest('base64url');
  const closed = disclosure({
    vct: 'mandate.checkout.1',
    checkout_hash: checkoutHash,
    checkout_jwt: checkoutJwt
  }, 'closed-checkout-salt');
  const open = disclosure({
    vct: 'mandate.checkout.open.1',
    constraints: checkoutConstraints,
    cnf: { jwk: agentPublicJwk }
  }, 'open-checkout-salt');
  const root = signCompactJws({
    header: { alg: 'ES256', typ: 'example+sd-jwt', kid: agentPrivateJwk.kid },
    payload: { delegate_payload: [{ '...': open.digest }], _sd_alg: 'sha-256' },
    privateJwk: agentPrivateJwk
  }) + `~${open.encoded}~`;
  const delegated = signCompactJws({
    header: { alg: 'ES256', typ: 'kb+sd-jwt' },
    payload: {
      delegate_payload: [{ '...': closed.digest }],
      iat: Math.floor(new Date('2026-08-27T12:00:00.000Z').getTime() / 1000),
      aud: 'merchant',
      nonce: 'checkout-nonce',
      sd_hash: crypto.createHash('sha256').update(root, 'ascii').digest('base64url'),
      _sd_alg: 'sha-256'
    },
    privateJwk: agentPrivateJwk
  }) + `~${closed.encoded}~`;
  return {
    token: `${root}~~${delegated}`,
    checkoutHash,
    openMandateHash: crypto.createHash('sha256').update(root, 'ascii').digest('base64url')
  };
}

function buildOfficialPaymentMandate({ checkoutHash, agentPrivateJwk, agentPublicJwk, paymentConstraints = [] }) {
  const closed = disclosure({
    vct: 'mandate.payment.1',
    transaction_id: checkoutHash,
    payee: { name: 'Cognistration', website: 'https://cognistration.com' },
    payment_amount: { amount: 299, currency: 'USD' },
    payment_instrument: { type: 'card', id: 'payment-token-reference' }
  }, 'closed-payment-salt');
  const open = disclosure({
    vct: 'mandate.payment.open.1',
    constraints: paymentConstraints,
    cnf: { jwk: agentPublicJwk }
  }, 'open-payment-salt');
  const root = signCompactJws({
    header: { alg: 'ES256', typ: 'example+sd-jwt', kid: agentPrivateJwk.kid },
    payload: { delegate_payload: [{ '...': open.digest }], _sd_alg: 'sha-256' },
    privateJwk: agentPrivateJwk
  }) + `~${open.encoded}~`;
  const delegated = signCompactJws({
    header: { alg: 'ES256', typ: 'kb+sd-jwt' },
    payload: {
      delegate_payload: [{ '...': closed.digest }],
      iat: Math.floor(new Date('2026-08-27T12:00:00.000Z').getTime() / 1000),
      aud: 'merchant',
      nonce: 'payment-nonce',
      sd_hash: crypto.createHash('sha256').update(root, 'ascii').digest('base64url'),
      _sd_alg: 'sha-256'
    },
    privateJwk: agentPrivateJwk
  }) + `~${closed.encoded}~`;
  return `${root}~~${delegated}`;
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

test('official AP2 verifies SD-JWT checkout mandates and merchant authorization', async () => {
  const agent = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const merchant = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
  const agentPrivateJwk = { ...agent.privateKey.export({ format: 'jwk' }), kid: 'agent-test-1' };
  const agentPublicJwk = { ...agent.publicKey.export({ format: 'jwk' }), kid: 'agent-test-1' };
  const merchantPrivateJwk = { ...merchant.privateKey.export({ format: 'jwk' }), kid: 'merchant-test-1' };
  const merchantPublicJwk = { ...merchant.publicKey.export({ format: 'jwk' }), kid: 'merchant-test-1' };
  const checkout = {
    id: 'checkout_ap2_test',
    status: 'ready_for_complete',
    currency: 'USD',
    line_items: [{
      id: 'line_deep-rest-pack',
      item: { id: 'deep-rest-pack', title: 'Deep Rest', price: 299 },
      quantity: 1,
      totals: [{ type: 'total', amount: 299 }]
    }],
    totals: [{ type: 'total', amount: 299 }],
    expires_at: '2099-01-01T00:00:00.000Z'
  };

  await withEnv({
    AP2_OFFICIAL_ENABLED: 'true',
    AP2_ENABLED: 'true',
    UCP_SHARED_PAYMENT_TOKEN_ENABLED: 'true',
    STRIPE_SECRET_KEY: 'sk_test_ap2_unit',
    STRIPE_NETWORK_ID: 'network_ap2_unit',
    UCP_SIGNING_PRIVATE_JWK: JSON.stringify(merchantPrivateJwk),
    UCP_SIGNING_PUBLIC_JWK: JSON.stringify(merchantPublicJwk),
    AP2_AGENT_PUBLIC_JWK: JSON.stringify(agentPublicJwk),
    AP2_PAYMENT_PUBLIC_JWK: JSON.stringify(agentPublicJwk),
    AP2_PAYMENT_RECEIPT_PRIVATE_JWK: JSON.stringify(merchantPrivateJwk),
    AP2_PAYMENT_RECEIPT_PUBLIC_JWK: JSON.stringify(merchantPublicJwk),
    AP2_EXPECTED_AUDIENCE: undefined,
    AP2_EXPECTED_NONCE: undefined
  }, async () => {
    assert.equal(officialAp2CapabilityEnabled(), true);
    assert.equal(officialAp2Readiness('https://example.test').status, 'enabled');
    assert.ok(ucpProfile('https://example.test').ucp.capabilities['dev.ucp.shopping.ap2_mandate']);
    const checkoutMandate = buildOfficialCheckoutMandate({
      checkout,
      agentPrivateJwk,
      agentPublicJwk,
      merchantPrivateJwk,
      checkoutConstraints: [
        { type: 'checkout.allowed_merchants', allowed: [{ website: 'https://cognistration.com' }] },
        {
          type: 'checkout.line_items',
          items: [{ id: 'line_deep-rest-pack', acceptable_items: [{ id: 'deep-rest-pack' }], quantity: 1 }]
        }
      ]
    });
    const verified = verifyOfficialAp2CheckoutMandate({ token: checkoutMandate.token, checkout, now: new Date('2026-08-27T12:00:00.000Z') });
    assert.equal(verified.official, true);
    assert.equal(verified.currency, 'usd');
    assert.equal(verified.amountMax, 299);
    assert.equal(verified.agentKeyId, 'agent-test-1');

    const paymentMandate = buildOfficialPaymentMandate({
      checkoutHash: checkoutMandate.checkoutHash,
      agentPrivateJwk,
      agentPublicJwk,
      paymentConstraints: [
        { type: 'payment.amount_range', currency: 'USD', min: 299, max: 299 },
        { type: 'payment.allowed_payees', allowed: [{ website: 'https://cognistration.com' }] },
        { type: 'payment.allowed_payment_instruments', allowed: [{ id: 'payment-token-reference', type: 'card' }] },
        { type: 'payment.reference', conditional_transaction_id: checkoutMandate.openMandateHash }
      ]
    });
    const payment = verifyOfficialAp2PaymentMandate({
      token: paymentMandate,
      checkout,
      checkoutMandate: verified,
      now: new Date('2026-08-27T12:00:00.000Z')
    });
    assert.equal(payment.paymentMandateId.startsWith('payment_'), true);

    const checkoutReceipt = createOfficialAp2CheckoutReceipt({
      token: checkoutMandate.token,
      orderId: 'order_ap2_test',
      now: new Date('2026-08-27T12:00:00.000Z')
    });
    const paymentReceipt = createOfficialAp2PaymentReceipt({
      token: paymentMandate,
      paymentId: 'pi_ap2_test',
      pspConfirmationId: 'pi_ap2_test',
      now: new Date('2026-08-27T12:00:00.000Z')
    });
    assert.equal(JSON.parse(Buffer.from(checkoutReceipt.split('.')[1], 'base64url')).reference, verified.mandateReference);
    assert.equal(JSON.parse(Buffer.from(paymentReceipt.split('.')[1], 'base64url')).reference, payment.mandateReference);
    assert.equal(JSON.parse(Buffer.from(checkoutReceipt.split('.')[1], 'base64url')).order_id, 'order_ap2_test');
    assert.equal(JSON.parse(Buffer.from(paymentReceipt.split('.')[1], 'base64url')).payment_id, 'pi_ap2_test');

    const changedCheckout = { ...checkout, totals: [{ type: 'total', amount: 399 }] };
    assert.throws(
      () => verifyOfficialAp2CheckoutMandate({ token: checkoutMandate.token, checkout: changedCheckout }),
      (error) => error.code === 'AP2_MANDATE_SCOPE_MISMATCH'
    );
  });
});
