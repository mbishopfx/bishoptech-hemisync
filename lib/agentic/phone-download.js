import { z } from 'zod';
import { machinePaymentOptions } from '../commerce/machine-payments.mjs';
import { siteOrigin } from '../commerce/commerce-utils.mjs';
import { publicIosAppOffer } from './ios-capability.js';
import { getPublicTone } from './tone-capability.js';

export const PHONE_DOWNLOAD_CAPABILITY_ID = 'cognistration-phone-download-options';
export const PHONE_DOWNLOAD_CAPABILITY_VERSION = '0.1.0';
export const PHONE_DOWNLOAD_WIDGET_RESOURCE_URI = 'ui://cognistration/phone-download/v1.html';
export const PHONE_DOWNLOAD_WIDGET_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

export const PhoneDownloadOptionsInputSchema = z.object({
  toneId: z.string().trim().min(1).max(120).optional(),
  state: z.enum(PUBLIC_STATES).optional(),
  targetState: z.enum(PUBLIC_STATES).optional(),
  carrierHz: z.coerce.number().int().min(100).max(400).optional(),
  beatHz: z.coerce.number().min(0.5).max(40).optional(),
  volume: z.coerce.number().int().min(0).max(100).optional()
}).strict();

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function safeTone(tone) {
  if (!tone) return null;
  return {
    id: tone.id,
    name: tone.name,
    state: tone.state,
    targetHz: tone.targetHz,
    baseFreqHz: tone.baseFreqHz,
    durationSec: tone.durationSec,
    summary: tone.summary
  };
}

export function buildPhoneDownloadOptions(input = {}, origin = siteOrigin()) {
  const parsed = PhoneDownloadOptionsInputSchema.parse(input);
  const tone = parsed.toneId ? getPublicTone(parsed.toneId) : null;
  if (parsed.toneId && !tone) {
    const error = new Error('That public tone ID is not in the approved catalog.');
    error.status = 404;
    throw error;
  }

  const targetState = parsed.targetState || parsed.state || tone?.state || 'theta';
  const controls = {
    targetState,
    carrierHz: Math.round(clamp(Number(parsed.carrierHz ?? tone?.baseFreqHz ?? 200), 100, 400)),
    beatHz: Math.round(clamp(Number(parsed.beatHz ?? tone?.targetHz ?? 6), 0.5, 40) * 10) / 10,
    volume: Math.round(clamp(Number(parsed.volume ?? 72), 0, 100))
  };
  const payment = machinePaymentOptions(origin);
  const app = publicIosAppOffer().app;

  return {
    capabilityId: PHONE_DOWNLOAD_CAPABILITY_ID,
    version: PHONE_DOWNLOAD_CAPABILITY_VERSION,
    resourceUri: PHONE_DOWNLOAD_WIDGET_RESOURCE_URI,
    resourceMimeType: PHONE_DOWNLOAD_WIDGET_RESOURCE_MIME_TYPE,
    status: 'ready',
    tone: safeTone(tone),
    controls,
    phonePreview: {
      status: payment.status,
      protocol: payment.protocol,
      price: payment.price,
      amountCents: payment.amountCents,
      currency: payment.currency,
      endpoint: payment.toneSession.endpoint,
      requiresAccount: false,
      requiresExplicitConfirmation: true,
      browserFallback: payment.browserFallback,
      message: payment.status === 'enabled'
        ? 'A compatible agent can prepare one phone-ready preview through the fixed-price route, then wait for your explicit approval before payment.'
        : 'The fixed-price agent payment route is not enabled for this deployment yet; the browser pricing page remains available.'
    },
    iosApp: {
      name: app.name,
      price: app.price,
      billingMode: app.billingMode,
      requires: app.requires,
      url: app.url,
      features: [...app.features]
    },
    availableActions: ['request_agent_payment_preview', 'open_ios_app_offer'],
    message: tone
      ? `Choose how to continue ${tone.name} on a phone.`
      : 'Choose a no-account phone preview route or the full iPhone app.'
  };
}
