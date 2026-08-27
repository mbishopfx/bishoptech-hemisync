import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { PUBLIC_TONE_CATALOG, matchIntentionToTone } from './tone-capability.js';

export const SESSION_CAPABILITY_ID = 'cognistration-session-orchestration';
export const SESSION_CAPABILITY_VERSION = '0.1.0';

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
const SESSION_MODES = ['rest', 'reflect', 'focus', 'momentum', 'synthesis'];

const MODE_CONFIG = {
  rest: {
    label: 'Clear space',
    description: 'A slower route for unwinding, decompression, and a quieter start.',
    states: ['delta', 'theta', 'alpha'],
    arrivalState: 'delta',
    closeState: 'theta'
  },
  reflect: {
    label: 'Make room to reflect',
    description: 'An open route for journaling, imagery, and personal writing.',
    states: ['theta', 'alpha', 'delta'],
    arrivalState: 'theta',
    closeState: 'alpha'
  },
  focus: {
    label: 'Set a clear direction',
    description: 'A steady route for reading, writing, planning, and focused work.',
    states: ['alpha', 'beta', 'theta'],
    arrivalState: 'alpha',
    closeState: 'theta'
  },
  momentum: {
    label: 'Build momentum',
    description: 'A more active route for starting a task or returning to motion.',
    states: ['beta', 'alpha', 'gamma'],
    arrivalState: 'alpha',
    closeState: 'alpha'
  },
  synthesis: {
    label: 'Open a synthesis window',
    description: 'A sharper route for ideas, pattern-finding, and creative work.',
    states: ['gamma', 'beta', 'alpha'],
    arrivalState: 'alpha',
    closeState: 'theta'
  }
};

const STATE_GUIDANCE = {
  delta: {
    direction: 'Slowest listening direction',
    bestFor: 'settling, quiet, and a low-input start',
    tradeoff: 'can feel too slow when you need active momentum'
  },
  theta: {
    direction: 'Open, spacious listening direction',
    bestFor: 'reflection, imagery, and easing between activities',
    tradeoff: 'can feel less task-directed than alpha or beta'
  },
  alpha: {
    direction: 'Clear, even listening direction',
    bestFor: 'writing, reading, planning, and a balanced reset',
    tradeoff: 'may feel too neutral when you want a deeper downshift or stronger drive'
  },
  beta: {
    direction: 'Active listening direction',
    bestFor: 'starting, organizing, and maintaining forward motion',
    tradeoff: 'may feel too active for late-night or quiet reflection'
  },
  gamma: {
    direction: 'Synthesis-oriented listening direction',
    bestFor: 'creative problem-solving and connecting ideas',
    tradeoff: 'is usually a poor fit when the goal is to slow down'
  }
};

const SESSION_CUES = {
  rest: {
    title: 'Clear one small piece of space',
    prompt: 'Name the one thing you do not need to solve during this session.',
    suggestedSeconds: 60,
    pairedDirection: 'delta → theta'
  },
  reflect: {
    title: 'Give the page a starting edge',
    prompt: 'Write one honest sentence about what is taking up the most attention right now.',
    suggestedSeconds: 90,
    pairedDirection: 'theta → alpha'
  },
  focus: {
    title: 'Choose the next visible action',
    prompt: 'Write the smallest finished action that would make the next 20 minutes useful.',
    suggestedSeconds: 60,
    pairedDirection: 'alpha → beta'
  },
  momentum: {
    title: 'Lower the starting friction',
    prompt: 'Set a two-minute action that proves you have begun, without requiring the whole task to be solved.',
    suggestedSeconds: 60,
    pairedDirection: 'alpha → beta'
  },
  synthesis: {
    title: 'Put two ideas beside each other',
    prompt: 'Write two ideas you are holding, then describe one useful connection between them.',
    suggestedSeconds: 90,
    pairedDirection: 'alpha → gamma'
  }
};

export const SessionPlanInputSchema = z.object({
  intention: z.string().trim().min(1).max(240),
  durationMin: z.coerce.number().int().min(5).max(60).optional().default(20),
  mode: z.enum(SESSION_MODES).optional(),
  targetState: z.enum(PUBLIC_STATES).optional()
}).strict();

export const ToneComparisonInputSchema = z.object({
  intention: z.string().trim().min(1).max(240),
  limit: z.coerce.number().int().min(2).max(4).optional().default(3)
}).strict();

export const SessionCueInputSchema = z.object({
  intention: z.string().trim().min(1).max(240).optional(),
  mode: z.enum(SESSION_MODES).optional()
}).strict();

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}
function modeForIntention(intention) {
  const normalized = normalizeText(intention);
  const keywordModes = [
    ['rest', ['rest', 'relax', 'calm', 'quiet', 'sleep', 'unwind', 'decompress', 'clear my mind', 'clear my head']],
    ['reflect', ['diary', 'journal', 'write', 'reflect', 'reflection', 'imagine', 'dream']],
    ['focus', ['focus', 'study', 'read', 'plan', 'organize', 'concentrate']],
    ['momentum', ['energy', 'energize', 'start', 'execute', 'momentum', 'drive', 'active']],
    ['synthesis', ['idea', 'ideas', 'creative', 'create', 'solve', 'synthesis', 'pattern', 'insight']]
  ];

  return keywordModes.find(([, keywords]) => keywords.some((keyword) => normalized.includes(keyword)))?.[0] || 'reflect';
}

function modeConfig(mode) {
  return MODE_CONFIG[mode] || MODE_CONFIG.reflect;
}

function toneForState(state) {
  return PUBLIC_TONE_CATALOG.find((tone) => tone.state === state) || PUBLIC_TONE_CATALOG[0];
}

function toneSummary(tone) {
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

function stateOption(tone, rank) {
  const guidance = STATE_GUIDANCE[tone.state] || STATE_GUIDANCE.alpha;
  return {
    rank,
    tone: toneSummary(tone),
    direction: guidance.direction,
    bestFor: guidance.bestFor,
    tradeoff: guidance.tradeoff
  };
}

function phaseFor({ id, label, durationSec, tone, instruction }) {
  return {
    id,
    label,
    durationSec,
    tone: toneSummary(tone),
    controls: {
      targetState: tone.state,
      carrierHz: tone.baseFreqHz,
      beatHz: tone.targetHz,
      volume: 72
    },
    instruction
  };
}

function cueForMode(mode) {
  return SESSION_CUES[mode] || SESSION_CUES.reflect;
}

function resultMeta() {
  return {
    capabilityId: SESSION_CAPABILITY_ID,
    version: SESSION_CAPABILITY_VERSION,
    correlationId: randomUUID()
  };
}

export function sessionGuideCatalog() {
  return {
    ...resultMeta(),
    modes: SESSION_MODES.map((mode) => ({
      id: mode,
      label: MODE_CONFIG[mode].label,
      description: MODE_CONFIG[mode].description,
      states: MODE_CONFIG[mode].states,
      cue: cueForMode(mode)
    })),
    bounds: {
      intentionMaxLength: 240,
      planDurationMin: 5,
      planDurationMax: 60,
      comparisonOptionsMin: 2,
      comparisonOptionsMax: 4
    },
    note: 'Planning and cues are public guidance. They do not start audio, save a record, or make a medical claim.'
  };
}

export async function compareToneDirections(input = {}) {
  const parsed = ToneComparisonInputSchema.parse(input);
  const recommendation = await matchIntentionToTone({ intention: parsed.intention, useAi: false });
  const mode = modeForIntention(parsed.intention);
  const config = modeConfig(mode);
  const candidates = [];
  const seen = new Set();

  function addTone(tone) {
    if (!tone?.id || seen.has(tone.id)) return;
    seen.add(tone.id);
    candidates.push(tone);
  }

  addTone(recommendation.tone);
  for (const state of config.states) addTone(toneForState(state));
  for (const tone of PUBLIC_TONE_CATALOG) addTone(tone);

  return {
    ...resultMeta(),
    mode,
    modeLabel: config.label,
    recommendation: toneSummary(recommendation.tone),
    options: candidates.slice(0, parsed.limit).map((tone, index) => stateOption(tone, index + 1)),
    note: 'Compare the listening directions as starting points. None is a diagnosis or guaranteed outcome.'
  };
}

export async function buildSessionPlan(input = {}) {
  const parsed = SessionPlanInputSchema.parse(input);
  const recommendation = await matchIntentionToTone({ intention: parsed.intention, useAi: false });
  const mode = parsed.mode || modeForIntention(parsed.intention);
  const config = modeConfig(mode);
  const mainTone = parsed.targetState ? toneForState(parsed.targetState) : recommendation.tone;
  const arrivalTone = toneForState(config.arrivalState);
  const closeTone = toneForState(config.closeState);
  const totalSec = parsed.durationMin * 60;
  const boundarySec = Math.min(180, Math.max(60, Math.round((totalSec * 0.15) / 15) * 15));
  const coreSec = totalSec - (boundarySec * 2);
  const cue = cueForMode(mode);

  return {
    ...resultMeta(),
    mode,
    modeLabel: config.label,
    durationMin: parsed.durationMin,
    totalDurationSec: totalSec,
    recommendation: toneSummary(mainTone),
    rationale: recommendation.response,
    phases: [
      phaseFor({
        id: 'arrive',
        label: 'Arrive',
        durationSec: boundarySec,
        tone: arrivalTone,
        instruction: 'Settle into the session and decide what can wait until later.'
      }),
      phaseFor({
        id: 'practice',
        label: 'Practice',
        durationSec: coreSec,
        tone: mainTone,
        instruction: cue.prompt
      }),
      phaseFor({
        id: 'close',
        label: 'Close',
        durationSec: boundarySec,
        tone: closeTone,
        instruction: 'Notice what you want to carry forward and end the session deliberately.'
      })
    ],
    cue,
    availableActions: [
      'set_visible_controls',
      'start_explicit_preview',
      'save_in_private_workspace'
    ],
    boundaries: {
      audioStarted: false,
      recordSaved: false,
      medicalGuidance: false
    }
  };
}

export function getSessionCue(input = {}) {
  const parsed = SessionCueInputSchema.parse(input);
  const mode = parsed.mode || modeForIntention(parsed.intention);
  const config = modeConfig(mode);

  return {
    ...resultMeta(),
    mode,
    modeLabel: config.label,
    cue: cueForMode(mode),
    suggestedStartingState: config.states[0],
    note: 'This is a short reflection cue paired with a listening direction. Nothing is saved or started.'
  };
}
