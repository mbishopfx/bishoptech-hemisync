import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { matchIntentionToTone, PUBLIC_TONE_CATALOG } from './tone-capability.js';
import { createStudioSpecFromPreset } from '../studio/spec.js';
import { safetyRedirectForIntention } from './safety-capability.js';

export const MEMBER_CAPABILITY_ID = 'cognistration-member-session';
export const MEMBER_CAPABILITY_VERSION = '0.1.0';
export const MEMBER_MIN_DURATION_SEC = 5 * 60;
export const MEMBER_MAX_DURATION_SEC = 60 * 60;

const SAFE_IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{8,80}$/;
const MEMBER_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

export const MemberPlanInputSchema = z.object({
  intention: z.string().trim().min(1).max(240),
  durationSec: z.coerce.number().int().min(MEMBER_MIN_DURATION_SEC).max(MEMBER_MAX_DURATION_SEC).default(5 * 60),
  targetState: z.enum(MEMBER_STATES).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  idempotencyKey: z.string().regex(SAFE_IDEMPOTENCY_KEY).optional()
}).strict();

const JOURNEY_BY_STATE = {
  delta: 'deep-reset-15',
  theta: 'deep-reset-15',
  alpha: 'induction-alpha-theta-integration-15',
  beta: 'focus-15-no-time-15',
  gamma: 'creative-hypnagogia-15'
};

const STATE_LABELS = {
  delta: 'slow reset',
  theta: 'open reflection',
  alpha: 'steady focus',
  beta: 'directed momentum',
  gamma: 'creative synthesis'
};

function safeName(value, fallback) {
  const normalized = String(value || '').replace(/[<>]/g, '').trim().slice(0, 120);
  return normalized || fallback;
}

function safeTargetTone(tone, targetState) {
  if (!targetState) return tone;
  return PUBLIC_TONE_CATALOG.find((candidate) => candidate.state === targetState) || tone;
}

export function journeyPresetForState(state) {
  return JOURNEY_BY_STATE[state] || JOURNEY_BY_STATE.alpha;
}

export function memberStateLabel(state) {
  return STATE_LABELS[state] || STATE_LABELS.alpha;
}

export async function buildMemberSessionPlan(input = {}, { useAi = false } = {}) {
  const parsed = MemberPlanInputSchema.parse(input);
  const safetyRedirect = safetyRedirectForIntention(parsed.intention, {
    capabilityId: MEMBER_CAPABILITY_ID,
    version: MEMBER_CAPABILITY_VERSION
  });
  if (safetyRedirect) return safetyRedirect;

  const matched = await matchIntentionToTone({ intention: parsed.intention, useAi });
  const targetState = parsed.targetState || matched.tone.state || 'alpha';
  const tone = safeTargetTone(matched.tone, parsed.targetState);
  const journeyPresetId = journeyPresetForState(targetState);
  const studioSpec = createStudioSpecFromPreset({
    presetId: journeyPresetId,
    durationSec: parsed.durationSec
  });

  const safeStudioSpec = {
    ...studioSpec,
    targetState,
    description: `A private ${memberStateLabel(targetState)} session built from the Cognistration library.`
  };

  return {
    capabilityId: MEMBER_CAPABILITY_ID,
    version: MEMBER_CAPABILITY_VERSION,
    correlationId: randomUUID(),
    status: 'completed',
    recommendation: {
      toneId: tone.id,
      name: tone.name,
      state: targetState,
      targetHz: tone.targetHz,
      baseFreqHz: tone.baseFreqHz,
      summary: tone.summary
    },
    studioSpec: safeStudioSpec,
    suggestedName: safeName(parsed.name, `${tone.name} session`),
    rationale: `This plan pairs a ${memberStateLabel(targetState)} direction with a structured ${Math.round(parsed.durationSec / 60)}-minute progression.`,
    controls: {
      durationSec: parsed.durationSec,
      targetState,
      journeyPresetId
    }
  };
}

export function memberErrorResponse(error, correlationId = randomUUID()) {
  const status = Number.isInteger(error?.status) ? error.status : error?.issues ? 400 : 500;
  const code = error?.code || (status === 401 ? 'AUTH_REQUIRED' : status === 403 ? 'SUBSCRIPTION_REQUIRED' : status === 400 ? 'INVALID_REQUEST' : 'MEMBER_REQUEST_FAILED');
  const safeMessage = code === 'CONFIRMATION_REQUIRED'
    ? 'Please confirm before creating or rendering a private session.'
    : status === 401
    ? 'Sign in to use your private workspace.'
    : status === 403
      ? 'An active Cognistration membership is required for private sessions.'
      : status === 400
        ? 'Review the session details and try again.'
        : 'The private workspace is unavailable right now. Try again shortly.';

  if (status >= 500) {
    console.error('[member capability]', correlationId, error?.message || 'unknown error');
  }

  return {
    body: {
      capabilityId: MEMBER_CAPABILITY_ID,
      version: MEMBER_CAPABILITY_VERSION,
      correlationId,
      status: status >= 500 ? 'failed' : 'needs_input',
      error: { code, safeMessage, retryable: status >= 500 }
    },
    status
  };
}

export function serializeMemberProject(project) {
  if (!project) return null;
  return {
    id: project.id,
    name: project.name,
    focusLevel: project.focus_level,
    version: project.version,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    targetState: project.spec?.targetState || null,
    durationSec: project.spec?.durationSec || null,
    journeyPresetId: project.spec?.journeyPresetId || null
  };
}

export function serializeMemberRender(render) {
  if (!render) return null;
  return {
    id: render.id,
    sessionId: render.session_id,
    status: render.status,
    phase: render.phase,
    progress: render.progress,
    exportFormats: render.export_formats || ['mp3'],
    createdAt: render.created_at,
    updatedAt: render.updated_at
  };
}
