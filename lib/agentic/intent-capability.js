import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { PUBLIC_TONE_CATALOG, matchIntentionToTone } from './tone-capability.js';
import { safetyRedirectForIntention } from './safety-capability.js';

export const INTENT_CAPABILITY_ID = 'cognistration-intent-guidance';
export const INTENT_CAPABILITY_VERSION = '0.1.0';

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
const GENERIC_INTENTIONS = new Set(['help', 'something', 'anything', 'not sure', 'i do not know', 'idk', 'better', 'a session']);

const DIRECTION_DEFINITIONS = [
  {
    id: 'rest',
    label: 'Clear space',
    description: 'A slower, quieter starting direction for unwinding and decompression.',
    example: 'I want to unwind after a long day.',
    states: ['delta', 'theta'],
    keywords: ['rest', 'relax', 'relaxation', 'calm', 'quiet', 'sleep', 'unwind', 'decompress', 'settle', 'clear my mind', 'clear my head', 'downshift', 'recover']
  },
  {
    id: 'reflect',
    label: 'Make room to reflect',
    description: 'An open direction for journaling, breathwork, imagery, and personal writing.',
    example: 'I need a gentle start for journaling.',
    states: ['theta', 'alpha'],
    keywords: ['diary', 'journal', 'journaling', 'reflect', 'reflection', 'write', 'writing', 'meditate', 'meditation', 'breath', 'breathing', 'dream']
  },
  {
    id: 'focus',
    label: 'Set a clear direction',
    description: 'A steady direction for reading, planning, writing, and focused work.',
    example: 'I need to focus on a writing block.',
    states: ['alpha', 'beta'],
    keywords: ['focus', 'study', 'read', 'reading', 'work', 'plan', 'planning', 'organize', 'concentrate', 'concentration', 'attention']
  },
  {
    id: 'momentum',
    label: 'Build momentum',
    description: 'A more active direction for starting a task and returning to motion.',
    example: 'Help me start the task I keep avoiding.',
    states: ['beta', 'alpha'],
    keywords: ['start', 'starting', 'energy', 'energize', 'motivation', 'motivated', 'momentum', 'drive', 'execute', 'active', 'action']
  },
  {
    id: 'synthesis',
    label: 'Open a synthesis window',
    description: 'A sharper direction for connecting ideas, creative work, and problem-solving.',
    example: 'Give me space to connect ideas for a new concept.',
    states: ['gamma', 'beta', 'alpha'],
    keywords: ['idea', 'ideas', 'creative', 'create', 'brainstorm', 'solve', 'problem', 'pattern', 'insight', 'synthesis']
  }
];

const CALIBRATION_DEFINITIONS = {
  too_intense: {
    label: 'Make it gentler',
    description: 'Lower the preview level and ease the rhythmic difference.',
    apply: ({ carrierHz, beatHz, volume }) => ({
      carrierHz,
      beatHz: Math.max(0.5, beatHz - 1),
      volume: Math.max(10, volume - 12)
    })
  },
  too_quiet: {
    label: 'Bring it forward',
    description: 'Raise the preview level modestly while keeping the tone and rhythm unchanged.',
    apply: ({ carrierHz, beatHz, volume }) => ({
      carrierHz,
      beatHz,
      volume: Math.min(100, volume + 12)
    })
  },
  too_bright: {
    label: 'Soften the carrier',
    description: 'Move the carrier down by a modest bounded step.',
    apply: ({ carrierHz, beatHz, volume }) => ({
      carrierHz: Math.max(100, carrierHz - 24),
      beatHz,
      volume
    })
  },
  too_slow: {
    label: 'Add movement',
    description: 'Raise the rhythmic difference by a small bounded step.',
    apply: ({ carrierHz, beatHz, volume }) => ({
      carrierHz,
      beatHz: Math.min(40, beatHz + 2),
      volume
    })
  },
  too_flat: {
    label: 'Add contrast',
    description: 'Add a little rhythmic contrast without changing the carrier or volume.',
    apply: ({ carrierHz, beatHz, volume }) => ({
      carrierHz,
      beatHz: Math.min(40, beatHz + 2),
      volume
    })
  },
  just_right: {
    label: 'Keep this direction',
    description: 'Keep the current controls as they are.',
    apply: ({ carrierHz, beatHz, volume }) => ({ carrierHz, beatHz, volume })
  }
};

export const IntentClarificationInputSchema = z.object({
  intention: z.string().trim().min(1).max(240)
}).strict();

export const ToneCalibrationInputSchema = z.object({
  feedback: z.enum(Object.keys(CALIBRATION_DEFINITIONS)),
  targetState: z.enum(PUBLIC_STATES).optional().default('theta'),
  carrierHz: z.coerce.number().int().min(100).max(400).optional().default(200),
  beatHz: z.coerce.number().min(0.5).max(40).optional().default(6),
  volume: z.coerce.number().int().min(0).max(100).optional().default(72)
}).strict();

function resultMeta() {
  return {
    capabilityId: INTENT_CAPABILITY_ID,
    version: INTENT_CAPABILITY_VERSION,
    correlationId: randomUUID()
  };
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function scoreDirection(definition, intention) {
  return definition.keywords.reduce((score, keyword) => score + (intention.includes(keyword) ? (keyword.includes(' ') ? 3 : 1) : 0), 0);
}

function publicDirection(definition) {
  return {
    id: definition.id,
    label: definition.label,
    description: definition.description,
    example: definition.example,
    states: definition.states
  };
}

function safeTone(tone) {
  if (!tone) return null;
  return {
    id: tone.id,
    name: tone.name,
    state: tone.state,
    targetState: tone.targetState,
    targetHz: tone.targetHz,
    baseFreqHz: tone.baseFreqHz,
    durationSec: tone.durationSec,
    summary: tone.summary,
    wavUrl: tone.wavUrl
  };
}

export async function clarifyIntention(input = {}) {
  const parsed = IntentClarificationInputSchema.parse(input);
  const safetyRedirect = safetyRedirectForIntention(parsed.intention, {
    capabilityId: INTENT_CAPABILITY_ID,
    version: INTENT_CAPABILITY_VERSION
  });
  if (safetyRedirect) return safetyRedirect;

  const normalized = normalizeText(parsed.intention);
  const scored = DIRECTION_DEFINITIONS
    .map((definition) => ({ definition, score: scoreDirection(definition, normalized) }))
    .sort((a, b) => b.score - a.score);
  const top = scored[0];
  const second = scored[1];
  const generic = normalized.length < 12 || GENERIC_INTENTIONS.has(normalized);
  const clear = !generic && top.score > 0 && (top.score > second.score || top.score >= 3);

  if (!clear) {
    return {
      ...resultMeta(),
      status: 'needs_input',
      choices: scored.slice(0, 3).map(({ definition }) => publicDirection(definition)),
      nextAction: 'Ask the listener to choose one direction or provide one short sentence about the next moment.',
      boundaries: {
        audioStarted: false,
        recordSaved: false,
        medicalGuidance: false
      }
    };
  }

  const recommendation = await matchIntentionToTone({
    intention: parsed.intention,
    tones: PUBLIC_TONE_CATALOG,
    useAi: false
  });

  return {
    ...resultMeta(),
    status: 'clear',
    direction: publicDirection(top.definition),
    suggestedTone: safeTone(recommendation.tone),
    nextAction: 'Use recommend_tone with the listener intention, then show the controls before any preview.',
    boundaries: {
      audioStarted: false,
      recordSaved: false,
      medicalGuidance: false
    }
  };
}

function rounded(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function calibrateTone(input = {}) {
  const parsed = ToneCalibrationInputSchema.parse(input);
  const previous = {
    targetState: parsed.targetState,
    carrierHz: parsed.carrierHz,
    beatHz: rounded(parsed.beatHz, 1),
    volume: parsed.volume
  };
  const adjusted = CALIBRATION_DEFINITIONS[parsed.feedback].apply(parsed);
  const controls = {
    targetState: previous.targetState,
    carrierHz: Math.round(adjusted.carrierHz),
    beatHz: rounded(adjusted.beatHz, 1),
    volume: Math.round(adjusted.volume)
  };
  const changed = Object.keys(controls).filter((key) => controls[key] !== previous[key]);
  const definition = CALIBRATION_DEFINITIONS[parsed.feedback];

  return {
    ...resultMeta(),
    status: 'completed',
    feedback: parsed.feedback,
    feedbackLabel: definition.label,
    previous,
    controls,
    changed,
    message: changed.length ? definition.description : 'That control is already at a safe boundary for this adjustment.',
    nextAction: 'Show the updated controls and ask before starting a preview.',
    boundaries: {
      audioStarted: false,
      recordSaved: false,
      controlsBounded: true
    }
  };
}

export function intentGuidanceCatalog() {
  return {
    ...resultMeta(),
    directions: DIRECTION_DEFINITIONS.map(publicDirection),
    calibration: Object.entries(CALIBRATION_DEFINITIONS).map(([id, definition]) => ({
      id,
      label: definition.label,
      description: definition.description
    })),
    bounds: {
      intentionMaxLength: 240,
      carrierHz: [100, 400],
      beatHz: [0.5, 40],
      volume: [0, 100]
    },
    safetyRouting: {
      route: '/health-warning',
      categories: ['medical', 'crisis'],
      response: 'safety_redirect',
      audioStarted: false,
      recordSaved: false
    },
    note: 'Clarification and calibration return guidance and bounded controls only. They do not start audio, save records, or make a medical claim.'
  };
}
