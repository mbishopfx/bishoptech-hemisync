import Stripe from 'stripe';
import { Mppx, stripe } from 'mppx/server';
import {
  MACHINE_PAYMENT_AMOUNT,
  MACHINE_PAYMENT_PRICE_CENTS
} from './machine-payments.mjs';
import { siteOrigin } from './commerce-utils.mjs';

/**
 * Build the shared MPP + Stripe handler used by each bounded machine resource.
 * The provider credential is never accepted in the request body and payment
 * metadata is limited to server-controlled product labels.
 */
export function createMachinePaymentHandler({
  receiptRef,
  scope,
  description,
  productType,
  metadata = {},
  amount = MACHINE_PAYMENT_AMOUNT,
  amountCents = MACHINE_PAYMENT_PRICE_CENTS
} = {}) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const stripeClient = new Stripe(secretKey);
  const machinePayments = stripe.create({
    client: stripeClient,
    networkId: process.env.STRIPE_NETWORK_ID,
    livemode: !secretKey.includes('_test_')
  });
  const charge = machinePayments.spt.charge({
    paymentMethodTypes: ['card', 'link'],
    description,
    metadata: {
      productType,
      product: 'cognistration',
      amountCents: String(amountCents),
      ...metadata
    },
    onPaymentSuccess: ({ receipt }) => {
      receiptRef.value = receipt;
    }
  });
  const mppx = Mppx.create({
    methods: [charge],
    secretKey: process.env.MPP_SECRET_KEY,
    realm: new URL(siteOrigin()).hostname
  });

  return mppx.stripe.charge({
    // MPP uses major currency units here; the Stripe adapter converts this to
    // the smallest unit using its configured USD decimals.
    amount,
    scope
  });
}
