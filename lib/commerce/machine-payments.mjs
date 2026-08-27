import { WORKSHOP_SESSION_DURATION_SEC } from '../billing/plans.js';
import { siteOrigin } from './commerce-utils.mjs';

export const MACHINE_PAYMENT_PRICE_CENTS = 50;
export const MACHINE_PAYMENT_SESSION_DURATION_SEC = WORKSHOP_SESSION_DURATION_SEC;
export const MACHINE_PAYMENT_PROTOCOL = 'Stripe Machine Payments Protocol';

export function machinePaymentEnabled() {
  return String(process.env.MPP_ENABLED || '').toLowerCase() === 'true'
    && Boolean(process.env.STRIPE_NETWORK_ID)
    && Boolean(process.env.STRIPE_SECRET_KEY)
    && Boolean(process.env.MPP_SECRET_KEY);
}

export function machinePaymentOptions(origin = siteOrigin()) {
  const enabled = machinePaymentEnabled();
  return {
    capabilityId: 'cognistration-machine-payments',
    version: '0.1.0',
    protocol: MACHINE_PAYMENT_PROTOCOL,
    status: enabled ? 'enabled' : 'provider_access_required',
    price: '$0.50',
    amountCents: MACHINE_PAYMENT_PRICE_CENTS,
    currency: 'usd',
    resource: 'one bounded machine session request',
    sessionDurationSec: WORKSHOP_SESSION_DURATION_SEC,
    endpoint: `${origin}/api/machine-payments/session`,
    browserFallback: `${origin}/pricing#machine-workshop`,
    acceptsPaymentDetails: false,
    note: enabled
      ? 'The route returns a machine-payment challenge and verifies the provider receipt before releasing the session resource.'
      : 'Enable Stripe Machine Payments access, set the network and MPP secret keys, and turn on MPP_ENABLED before accepting agent payments.'
  };
}
