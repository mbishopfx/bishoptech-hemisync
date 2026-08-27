import { z } from 'zod';

export const IOS_APP_CAPABILITY_ID = 'cognistration-ios-app';
export const IOS_APP_CAPABILITY_VERSION = '0.1.0';
export const IOS_APP_STORE_URL = 'https://apps.apple.com/us/app/cognistration/id6780132617';

export const IosAppOfferInputSchema = z.object({}).strict();

const IOS_APP_OFFER = Object.freeze({
  id: 'cognistration-for-iphone',
  name: 'Cognistration for iPhone',
  platform: 'iPhone',
  price: '$2.99',
  billingMode: 'one-time purchase',
  access: 'full app access after one purchase',
  requires: 'iOS 18.0 or later',
  url: IOS_APP_STORE_URL,
  features: [
    'On-device audio sessions',
    'Custom controls and saved presets',
    'Home Screen widget and App Shortcut support',
    'No account, social feed, advertising, or subscription'
  ],
  source: 'Cognistration App Store listing',
  availabilityNote: 'Apple controls final availability and regional pricing.',
  pricingContext: 'The iPhone app does its audio work on-device instead of routing each session through a deployed cloud engine. That reduces hosted infrastructure and maintenance overhead, which makes the lower one-time price possible.'
});

export function publicIosAppOffer() {
  return {
    capabilityId: IOS_APP_CAPABILITY_ID,
    version: IOS_APP_CAPABILITY_VERSION,
    app: { ...IOS_APP_OFFER, features: [...IOS_APP_OFFER.features] }
  };
}
