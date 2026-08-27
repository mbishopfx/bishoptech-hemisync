const CRISIS_PATTERNS = [
  /\bsuicid(?:e|al)\b/i,
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bwant to die\b/i,
  /\bself[- ]?harm\b/i,
  /\bhurt myself\b/i,
  /\boverdose\b/i,
  /\b(?:in|having a) crisis\b/i,
  /\b(?:not|can't|cannot) stay safe\b/i,
  /\bemergency\b/i
];

const MEDICAL_PATTERNS = [
  /\bmedical advice\b/i,
  /\bdiagnos(?:e|ed|is|ing)\b/i,
  /\btreat(?:ment|ing)?\b/i,
  /\bcure\b/i,
  /\bmedicat(?:e|ed|ion|ions)\b/i,
  /\bprescription\b/i,
  /\bclinical\b/i,
  /\btherap(?:y|ist)\b/i,
  /\bdepression\b/i,
  /\banxiety\b/i,
  /\badhd\b/i,
  /\bptsd\b/i,
  /\bbipolar\b/i,
  /\bpanic attack\b/i,
  /\bseizure(?:s)?\b/i,
  /\bepilepsy\b/i,
  /\btinnitus\b/i,
  /\bdissociation\b/i,
  /\bneurological\b/i,
  /\bmental health\b/i
];

export const SAFETY_CAPABILITY_ID = 'cognistration-safety-routing';
export const SAFETY_CAPABILITY_VERSION = '0.1.0';
export const SAFETY_ROUTE_PATH = '/health-warning';

function correlationId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `safety-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function safetyCategoryForIntention(intention) {
  const normalized = normalizeText(intention);
  if (!normalized) return null;
  if (CRISIS_PATTERNS.some((pattern) => pattern.test(normalized))) return 'crisis';
  if (MEDICAL_PATTERNS.some((pattern) => pattern.test(normalized))) return 'medical';
  return null;
}

function safetyCopy(category) {
  if (category === 'crisis') {
    return {
      title: 'Pause and get immediate support',
      message: 'Cognistration cannot provide crisis or emergency support. If you may be in immediate danger, contact local emergency services now, then review the Cognistration health and safety page.'
    };
  }

  return {
    title: 'Use qualified health support for health questions',
    message: 'Cognistration cannot diagnose, treat, or answer health questions. Review the health and safety page and speak with a qualified professional for personal guidance.'
  };
}

export function safetyRedirectForIntention(intention, { capabilityId = SAFETY_CAPABILITY_ID, version = SAFETY_CAPABILITY_VERSION } = {}) {
  const category = safetyCategoryForIntention(intention);
  if (!category) return null;

  const copy = safetyCopy(category);
  return {
    capabilityId,
    version,
    correlationId: correlationId(),
    status: 'safety_redirect',
    safety: {
      category,
      route: SAFETY_ROUTE_PATH,
      title: copy.title,
      message: copy.message
    },
    nextAction: `Open ${SAFETY_ROUTE_PATH} before continuing.`,
    boundaries: {
      audioStarted: false,
      recordSaved: false,
      medicalGuidance: false
    }
  };
}
