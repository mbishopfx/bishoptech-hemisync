import { z } from 'zod';
import {
  PUBLIC_TONE_CATALOG,
  getPublicTone,
  matchIntentionToTone
} from './tone-capability.js';

export const MACHINE_WIDGET_CAPABILITY_ID = 'cognistration-machine-generator';
export const MACHINE_WIDGET_CAPABILITY_VERSION = '0.2.0';
export const MACHINE_WIDGET_RESOURCE_URI = 'ui://cognistration/machine-generator/v4.html';
export const MACHINE_WIDGET_PREVIOUS_RESOURCE_URI = 'ui://cognistration/machine-generator/v3.html';
export const MACHINE_WIDGET_LEGACY_RESOURCE_URI = 'ui://cognistration/machine-generator/v1.html';
export const MACHINE_WIDGET_COMPATIBILITY_RESOURCE_URIS = [
  MACHINE_WIDGET_PREVIOUS_RESOURCE_URI,
  'ui://cognistration/machine-generator/v2.html',
  MACHINE_WIDGET_LEGACY_RESOURCE_URI
];
export const MACHINE_WIDGET_RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
const DEFAULT_BEAT_HZ = {
  delta: 3,
  theta: 6,
  alpha: 10,
  beta: 18,
  gamma: 39.5
};

export const MachineGeneratorInputSchema = z
  .object({
    intention: z.string().trim().min(1).max(240).optional(),
    toneId: z.string().trim().min(1).max(120).optional(),
    state: z.enum(PUBLIC_STATES).optional(),
    targetState: z.enum(PUBLIC_STATES).optional(),
    carrierHz: z.coerce.number().int().min(100).max(400).optional(),
    beatHz: z.coerce.number().min(0.5).max(40).optional(),
    volume: z.coerce.number().int().min(0).max(100).optional()
  })
  .strict();

export const MACHINE_WIDGET_RESOURCE_META = {
  ui: {
    prefersBorder: false,
    domain: 'https://cognistration.com',
    csp: {
      connectDomains: ['https://cognistration.com'],
      resourceDomains: ['https://cognistration.com'],
      frameDomains: ['https://cognistration.com']
    }
  },
  'openai/widgetDescription': 'An interactive Cognistration tone machine. It lets the listener seed a session from an intention, tune bounded carrier, rhythm, and volume controls, adjust them live through an app host, browse public tone packs, and start an explicit local audio preview.',
  'openai/widgetPrefersBorder': false,
  'openai/widgetDomain': 'https://cognistration.com',
  'openai/widgetCSP': {
    connect_domains: ['https://cognistration.com'],
    resource_domains: ['https://cognistration.com'],
    frame_domains: ['https://cognistration.com']
  }
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function controlSnapshot({ state, tone, carrierHz, beatHz, volume }) {
  return {
    targetState: state,
    carrierHz: rounded(carrierHz, 0),
    beatHz: rounded(beatHz, 1),
    volume: rounded(volume, 0),
    isPlaying: false,
    stateVersion: 1
  };
}

export async function buildMachineGeneratorState(input = {}) {
  const parsed = MachineGeneratorInputSchema.parse(input);
  let tone = null;

  if (parsed.toneId) {
    tone = getPublicTone(parsed.toneId);
    if (!tone) {
      const error = new Error('That public tone ID is not in the approved catalog.');
      error.status = 404;
      throw error;
    }
  } else if (parsed.intention) {
    const recommendation = await matchIntentionToTone({
      intention: parsed.intention,
      tones: PUBLIC_TONE_CATALOG,
      useAi: false
    });
    tone = recommendation.tone;
  }

  const state = parsed.targetState || parsed.state || tone?.state || 'theta';
  const carrierHz = clamp(
    Number(parsed.carrierHz ?? tone?.baseFreqHz ?? 200),
    100,
    400
  );
  const beatHz = clamp(
    Number(parsed.beatHz ?? tone?.targetHz ?? DEFAULT_BEAT_HZ[state]),
    0.5,
    40
  );
  const volume = clamp(Number(parsed.volume ?? 72), 0, 100);

  return {
    capabilityId: MACHINE_WIDGET_CAPABILITY_ID,
    version: MACHINE_WIDGET_CAPABILITY_VERSION,
    resourceUri: MACHINE_WIDGET_RESOURCE_URI,
    controls: controlSnapshot({ state, tone, carrierHz, beatHz, volume }),
    tone,
    seededBy: parsed.intention || parsed.toneId ? 'listener-input' : 'balanced-start',
    availableActions: [
      'generate_from_intention',
      'choose_state',
      'set_machine_controls',
      'adjust_machine_controls',
      'set_machine_direction',
      'browse_tone_packs',
      'start_machine_preview',
      'stop_machine_preview',
      'open_machine_fullscreen'
    ],
    message: tone
      ? `Your machine is set to ${tone.name}. Tune it until the session feels usable.`
      : 'Your machine is ready. Start with a direction, then tune the session around the moment.'
  };
}
