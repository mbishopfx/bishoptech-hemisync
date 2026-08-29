import { z } from 'zod';
import { getPublicTone } from './tone-capability.js';
import {
  SCIENCE_GUIDE_BACKGROUND_URL,
  SCIENCE_GUIDE_RESOURCE_MIME_TYPE,
  SCIENCE_GUIDE_RESOURCE_URI,
  SCIENCE_GUIDE_SLIDES,
  SCIENCE_GUIDE_SOURCES
} from './science-content.js';

export const SCIENCE_GUIDE_CAPABILITY_ID = 'cognistration-science-guide';
export const SCIENCE_GUIDE_CAPABILITY_VERSION = '0.1.0';

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
const DEFAULT_BEAT_HZ = {
  delta: 3,
  theta: 6,
  alpha: 10,
  beta: 18,
  gamma: 39.5
};

export const ScienceGuideInputSchema = z
  .object({
    toneId: z.string().trim().min(1).max(120).optional(),
    state: z.enum(PUBLIC_STATES).optional(),
    targetState: z.enum(PUBLIC_STATES).optional(),
    carrierHz: z.coerce.number().int().min(100).max(400).optional(),
    beatHz: z.coerce.number().min(0.5).max(40).optional(),
    volume: z.coerce.number().int().min(0).max(100).optional(),
    intentionLabel: z.enum(['rest', 'reflect', 'focus', 'momentum', 'synthesis']).optional()
  })
  .strict();

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function buildScienceGuideState(input = {}) {
  const parsed = ScienceGuideInputSchema.parse(input);
  let tone = null;

  if (parsed.toneId) {
    tone = getPublicTone(parsed.toneId);
    if (!tone) {
      const error = new Error('That public tone ID is not in the approved catalog.');
      error.status = 404;
      throw error;
    }
  }

  const targetState = parsed.targetState || parsed.state || tone?.state || 'theta';
  const carrierHz = clamp(Number(parsed.carrierHz ?? tone?.baseFreqHz ?? 200), 100, 400);
  const beatHz = clamp(Number(parsed.beatHz ?? tone?.targetHz ?? DEFAULT_BEAT_HZ[targetState]), 0.5, 40);
  const volume = clamp(Number(parsed.volume ?? 72), 0, 100);

  return {
    capabilityId: SCIENCE_GUIDE_CAPABILITY_ID,
    version: SCIENCE_GUIDE_CAPABILITY_VERSION,
    resourceUri: SCIENCE_GUIDE_RESOURCE_URI,
    resourceMimeType: SCIENCE_GUIDE_RESOURCE_MIME_TYPE,
    status: 'ready',
    controls: {
      targetState,
      carrierHz: rounded(carrierHz, 0),
      beatHz: rounded(beatHz, 1),
      volume: rounded(volume, 0),
      isPlaying: false
    },
    tone,
    intentionLabel: parsed.intentionLabel || null,
    background: {
      url: SCIENCE_GUIDE_BACKGROUND_URL,
      label: 'FFT ocean surface'
    },
    slides: SCIENCE_GUIDE_SLIDES,
    sources: SCIENCE_GUIDE_SOURCES,
    boundaries: {
      audioStarted: false,
      recordSaved: false,
      diaryContentIncluded: false,
      medicalGuidance: false,
      diagnosticClaim: false
    },
    message: 'The educational guide is ready. It explains the signal, FFR, descriptive frequency bands, evidence limits, and safe listening boundaries without starting audio.'
  };
}
