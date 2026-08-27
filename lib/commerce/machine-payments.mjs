import { WORKSHOP_SESSION_DURATION_SEC } from '../billing/plans.js';
import { siteOrigin } from './commerce-utils.mjs';

export const MACHINE_PAYMENT_PRICE_CENTS = 50;
// MPP's public amount is expressed in major currency units. Keep the cents
// value for product metadata and expose the correctly scaled USD amount to
// the payment handler so enabling the provider cannot accidentally create a
// $50 charge for a $0.50 resource.
export const MACHINE_PAYMENT_AMOUNT = (MACHINE_PAYMENT_PRICE_CENTS / 100).toFixed(2);
export const MACHINE_PAYMENT_SESSION_DURATION_SEC = WORKSHOP_SESSION_DURATION_SEC;
export const MACHINE_PAYMENT_PROTOCOL = 'Stripe Machine Payments Protocol';
export const MACHINE_PAYMENT_SESSION_SCOPE = 'cognistration-machine-session-v1';
export const MACHINE_PAYMENT_TONE_SCOPE_PREFIX = 'cognistration-machine-tone-v1';

export function machinePaymentEnabled() {
  return String(process.env.MPP_ENABLED || '').toLowerCase() === 'true'
    && Boolean(process.env.STRIPE_NETWORK_ID)
    && Boolean(process.env.STRIPE_SECRET_KEY)
    && Boolean(process.env.MPP_SECRET_KEY)
    && Boolean(process.env.MACHINE_PAYMENT_GRANT_SECRET);
}

export function machinePaymentOptions(origin = siteOrigin()) {
  const enabled = machinePaymentEnabled();
  return {
    capabilityId: 'cognistration-machine-payments',
    version: '0.1.0',
    protocol: MACHINE_PAYMENT_PROTOCOL,
    status: enabled ? 'enabled' : 'provider_access_required',
    price: '$0.50',
    amount: MACHINE_PAYMENT_AMOUNT,
    amountCents: MACHINE_PAYMENT_PRICE_CENTS,
    currency: 'usd',
    resource: 'one bounded machine session request',
    sessionDurationSec: WORKSHOP_SESSION_DURATION_SEC,
    endpoint: `${origin}/api/machine-payments/session`,
    toneSession: {
      endpoint: `${origin}/api/machine-payments/tone`,
      method: 'POST',
      amount: MACHINE_PAYMENT_AMOUNT,
      amountCents: MACHINE_PAYMENT_PRICE_CENTS,
      currency: 'usd',
      scopePrefix: MACHINE_PAYMENT_TONE_SCOPE_PREFIX,
      resource: 'one bounded custom tone session request',
      input: 'Approved public tone ID or short intention, with optional bounded state, carrier, rhythm, and volume controls.'
    },
    paymentPassport: {
      status: 'staged_contract',
      version: 'cognistration-payment-passport-v1',
      expiresInSec: 300,
      fixedAmountCents: MACHINE_PAYMENT_PRICE_CENTS,
      fixedProduct: 'machine-session',
      fixedRecipient: 'cognistration.com',
      confirmationScope: 'single-resource',
      acceptedByRoute: false
    },
    browserFallback: `${origin}/pricing#machine-workshop`,
    acceptsPaymentDetails: false,
    activation: {
      providerAccess: 'Stripe Machine Payments access is required for the live account.',
      requiredProductionConfiguration: [
        'MPP_ENABLED=true',
        'STRIPE_NETWORK_ID',
        'STRIPE_SECRET_KEY',
        'MPP_SECRET_KEY',
        'MACHINE_PAYMENT_GRANT_SECRET'
      ],
      paymentHeader: 'Payment-Authorization',
      receiptHeader: 'Payment-Receipt'
    },
    note: enabled
      ? 'The route returns a machine-payment challenge and verifies the provider receipt before releasing the session resource.'
      : 'Enable Stripe Machine Payments access, set the listed production configuration, and turn on MPP_ENABLED before accepting agent payments.'
  };
}
