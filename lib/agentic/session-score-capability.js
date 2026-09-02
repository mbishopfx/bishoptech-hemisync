import { z } from 'zod';
import { safetyRedirectForIntention } from './safety-capability.js';

export const SESSION_SCORE_CAPABILITY_ID = 'cognistration-session-score';
export const SESSION_SCORE_CAPABILITY_VERSION = '0.1.0';
export const SESSION_SCORE_PREVIEW_CAP_SEC = 120;
export const SESSION_SCORE_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

const halfStep = (value) => Math.abs(Number(value) * 2 - Math.round(Number(value) * 2)) < 1e-9;

export const SessionScoreStageSchema = z.object({
  id: z.string().trim().min(1).max(48).regex(/^[a-z0-9][a-z0-9-]*$/),
  label: z.string().trim().min(1).max(48),
  state: z.enum(SESSION_SCORE_STATES),
  durationSec: z.coerce.number().int().min(15).max(3600),
  carrierHz: z.coerce.number().int().min(100).max(400),
  beatHz: z.object({
    from: z.coerce.number().min(0.5).max(40).refine(halfStep, 'Beat frequency must use 0.5 Hz increments.'),
    to: z.coerce.number().min(0.5).max(40).refine(halfStep, 'Beat frequency must use 0.5 Hz increments.')
  }).strict(),
  volume: z.coerce.number().int().min(0).max(100)
}).strict();

export const SessionScoreSchema = z.object({
  durationSec: z.coerce.number().int().min(60).max(3600),
  stages: z.array(SessionScoreStageSchema).min(1).max(6)
}).strict().superRefine((score, context) => {
  const ids = new Set(score.stages.map((stage) => stage.id));
  if (ids.size !== score.stages.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['stages'], message: 'Stage IDs must be unique.' });
  }
  const total = score.stages.reduce((sum, stage) => sum + stage.durationSec, 0);
  if (total !== score.durationSec) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['stages'], message: 'Stage durations must sum exactly to score durationSec.' });
  }
});

export const SessionScoreComposeInputSchema = z.object({
  intention: z.string().trim().min(1).max(240).optional(),
  direction: z.enum(['rest', 'reflect', 'focus', 'momentum', 'synthesis']).optional().default('focus'),
  durationSec: z.coerce.number().int().min(60).max(3600).optional().default(600),
  score: SessionScoreSchema.optional()
}).strict().refine((input) => input.score || input.intention || input.direction, {
  message: 'Provide a bounded direction, intention, or complete score.'
});

export const SessionScoreRefineInputSchema = z.object({
  score: SessionScoreSchema,
  stageId: z.string().trim().min(1).max(48),
  patch: z.object({
    label: z.string().trim().min(1).max(48).optional(),
    state: z.enum(SESSION_SCORE_STATES).optional(),
    carrierHz: z.coerce.number().int().min(100).max(400).optional(),
    beatFromHz: z.coerce.number().min(0.5).max(40).refine(halfStep, 'Beat frequency must use 0.5 Hz increments.').optional(),
    beatToHz: z.coerce.number().min(0.5).max(40).refine(halfStep, 'Beat frequency must use 0.5 Hz increments.').optional(),
    volume: z.coerce.number().int().min(0).max(100).optional()
  }).strict().refine((patch) => Object.keys(patch).length > 0, 'At least one stage field is required.')
}).strict();

const DIRECTION_CONFIG = {
  rest: [
    ['Arrive', 'alpha', 190, 8, 6, 58],
    ['Settle', 'theta', 170, 6, 4, 52],
    ['Close', 'delta', 150, 4, 2, 46]
  ],
  reflect: [
    ['Arrive', 'alpha', 200, 9, 8, 60],
    ['Open', 'theta', 180, 8, 5, 56],
    ['Return', 'alpha', 200, 5, 8, 52]
  ],
  focus: [
    ['Arrive', 'alpha', 220, 8, 10, 62],
    ['Practice', 'beta', 240, 10, 16, 68],
    ['Close', 'alpha', 210, 16, 8, 56]
  ],
  momentum: [
    ['Prime', 'alpha', 230, 9, 12, 64],
    ['Build', 'beta', 260, 12, 20, 72],
    ['Land', 'alpha', 220, 20, 10, 58]
  ],
  synthesis: [
    ['Open', 'alpha', 220, 10, 12, 62],
    ['Connect', 'gamma', 280, 12, 32, 66],
    ['Integrate', 'theta', 200, 32, 7, 54]
  ]
};

function directionFromIntention(intention, fallback) {
  const text = String(intention || '').toLowerCase();
  if (/rest|quiet|sleep|unwind|slow/.test(text)) return 'rest';
  if (/reflect|journal|diary|imagine/.test(text)) return 'reflect';
  if (/creative|idea|synthesi|pattern/.test(text)) return 'synthesis';
  if (/energy|start|momentum|active/.test(text)) return 'momentum';
  return fallback || 'focus';
}

function stageDurations(durationSec, count) {
  const base = Math.floor(durationSec / count);
  const durations = Array.from({ length: count }, () => base);
  durations[count - 1] += durationSec - base * count;
  return durations;
}

function scoreCorrelationId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `score-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function publicScore(score, direction = null) {
  return {
    capabilityId: SESSION_SCORE_CAPABILITY_ID,
    version: SESSION_SCORE_CAPABILITY_VERSION,
    correlationId: scoreCorrelationId(),
    status: 'completed',
    engine: 'browser-binaural-sine',
    ...(direction ? { direction } : {}),
    durationSec: score.durationSec,
    stages: score.stages.map((stage) => ({
      ...stage,
      carrierBehavior: 'constant-within-stage',
      beatBehavior: stage.beatHz.from === stage.beatHz.to ? 'constant' : 'linear-within-stage'
    })),
    preview: {
      maxDurationSec: SESSION_SCORE_PREVIEW_CAP_SEC,
      requiresExplicitConfirmation: true,
      audioReadyRequired: true,
      fullScoreRendered: false
    },
    boundaries: {
      browserLocal: true,
      persisted: false,
      rendered: false,
      audioStarted: false,
      medicalGuidance: false
    }
  };
}

export function composeSessionScore(input = {}) {
  const parsed = SessionScoreComposeInputSchema.parse(input);
  if (parsed.intention) {
    const redirect = safetyRedirectForIntention(parsed.intention, {
      capabilityId: SESSION_SCORE_CAPABILITY_ID,
      version: SESSION_SCORE_CAPABILITY_VERSION
    });
    if (redirect) return redirect;
  }
  if (parsed.score) return publicScore(SessionScoreSchema.parse(parsed.score));

  const direction = directionFromIntention(parsed.intention, parsed.direction);
  const config = DIRECTION_CONFIG[direction];
  const durations = stageDurations(parsed.durationSec, config.length);
  const score = SessionScoreSchema.parse({
    durationSec: parsed.durationSec,
    stages: config.map(([label, state, carrierHz, from, to, volume], index) => ({
      id: `stage-${index + 1}`,
      label,
      state,
      durationSec: durations[index],
      carrierHz,
      beatHz: { from, to },
      volume
    }))
  });
  return publicScore(score, direction);
}

export function refineSessionScore(input = {}) {
  const parsed = SessionScoreRefineInputSchema.parse(input);
  const stageIndex = parsed.score.stages.findIndex((stage) => stage.id === parsed.stageId);
  if (stageIndex < 0) {
    const error = new Error('The selected stage is not part of this score.');
    error.code = 'STAGE_NOT_FOUND';
    throw error;
  }
  const stages = parsed.score.stages.map((stage, index) => index !== stageIndex ? stage : ({
    ...stage,
    ...(parsed.patch.label !== undefined ? { label: parsed.patch.label } : {}),
    ...(parsed.patch.state !== undefined ? { state: parsed.patch.state } : {}),
    ...(parsed.patch.carrierHz !== undefined ? { carrierHz: parsed.patch.carrierHz } : {}),
    beatHz: {
      from: parsed.patch.beatFromHz ?? stage.beatHz.from,
      to: parsed.patch.beatToHz ?? stage.beatHz.to
    },
    ...(parsed.patch.volume !== undefined ? { volume: parsed.patch.volume } : {})
  }));
  return publicScore(SessionScoreSchema.parse({ durationSec: parsed.score.durationSec, stages }));
}

export function sessionScoreTechnicalExport(score) {
  const parsed = SessionScoreSchema.parse(score);
  return {
    format: 'cognistration-session-score-v1',
    engine: 'browser-binaural-sine',
    durationSec: parsed.durationSec,
    stages: parsed.stages,
    previewCapSec: SESSION_SCORE_PREVIEW_CAP_SEC,
    persisted: false,
    rendered: false
  };
}
