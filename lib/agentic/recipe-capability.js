import { z } from 'zod';

export const SESSION_RECIPE_CAPABILITY_ID = 'cognistration-session-recipe';
export const SESSION_RECIPE_CAPABILITY_VERSION = '0.1.0';
export const SESSION_RECIPE_VERSION = 'cognistration-session-recipe-v1';

export const SESSION_RECIPE_LABELS = {
  rest: 'Clear space',
  reflect: 'Make room to reflect',
  focus: 'Set a clear direction',
  momentum: 'Build momentum',
  synthesis: 'Open a synthesis window'
};

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
const INTENTION_LABELS = Object.keys(SESSION_RECIPE_LABELS);

export const SessionRecipeInputSchema = z.object({
  targetState: z.enum(PUBLIC_STATES).default('theta'),
  carrierHz: z.coerce.number().int().min(100).max(400).default(200),
  beatHz: z.coerce.number().min(0.5).max(40).default(6),
  volume: z.coerce.number().int().min(0).max(100).default(72),
  durationSec: z.coerce.number().int().min(60).max(3600).default(120),
  intentionLabel: z.enum(INTENTION_LABELS).default('reflect')
}).strict();

function correlationId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `recipe-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function buildSessionRecipe(input = {}) {
  const parsed = SessionRecipeInputSchema.parse(input);

  return {
    capabilityId: SESSION_RECIPE_CAPABILITY_ID,
    version: SESSION_RECIPE_CAPABILITY_VERSION,
    correlationId: correlationId(),
    status: 'completed',
    recipe: {
      recipeVersion: SESSION_RECIPE_VERSION,
      targetState: parsed.targetState,
      carrierHz: parsed.carrierHz,
      beatHz: parsed.beatHz,
      volume: parsed.volume,
      durationSec: parsed.durationSec,
      intentionLabel: SESSION_RECIPE_LABELS[parsed.intentionLabel]
    },
    privacy: {
      contentIncluded: false,
      diaryContentIncluded: false,
      storage: 'none',
      shareable: 'technical-settings-only'
    },
    nextAction: 'Export or share this recipe locally. It contains no diary text or account data.'
  };
}

export function sessionRecipeInputFromControls({ targetState = 'theta', carrierHz = 200, beatHz = 6, volume = 72, durationSec = 120, intentionLabel = 'reflect' } = {}) {
  return SessionRecipeInputSchema.parse({ targetState, carrierHz, beatHz, volume, durationSec, intentionLabel });
}
