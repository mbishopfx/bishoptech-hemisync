import { MCP_SERVER_NAME, MCP_SERVER_VERSION, MCP_TOOLS } from './mcp-contract.js';
import { MACHINE_PAYMENT_PRICE_CENTS } from '../commerce/machine-payments.mjs';
import { TONE_PACK_PAYMENT_PRICE_CENTS } from '../commerce/tone-pack-machine-payment.mjs';

const toneSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    state: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    targetHz: { type: 'number' },
    baseFreqHz: { type: 'number' },
    durationSec: { type: 'number' },
    summary: { type: 'string' },
    wavUrl: { type: ['string', 'null'], format: 'uri-reference' },
    webmUrl: { type: ['string', 'null'], format: 'uri-reference' },
    mp3Url: { type: ['string', 'null'], format: 'uri-reference' }
  },
  required: ['id', 'name', 'state', 'targetHz', 'baseFreqHz', 'durationSec', 'summary'],
  additionalProperties: false
};

const safetyDetailsSchema = {
  type: 'object',
  properties: {
    category: { type: 'string', enum: ['medical', 'crisis'] },
    route: { type: 'string', const: '/health-warning' },
    title: { type: 'string' },
    message: { type: 'string' }
  },
  required: ['category', 'route', 'title', 'message'],
  additionalProperties: false
};

const safetyBoundariesSchema = {
  type: 'object',
  properties: {
    audioStarted: { type: 'boolean', const: false },
    recordSaved: { type: 'boolean', const: false },
    medicalGuidance: { type: 'boolean', const: false }
  },
  required: ['audioStarted', 'recordSaved', 'medicalGuidance'],
  additionalProperties: false
};

const safetyRedirectSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string' },
    version: { type: 'string' },
    correlationId: { type: 'string' },
    status: { type: 'string', const: 'safety_redirect' },
    safety: { $ref: '#/components/schemas/SafetyDetails' },
    nextAction: { type: 'string' },
    boundaries: safetyBoundariesSchema
  },
  required: ['capabilityId', 'version', 'correlationId', 'status', 'safety', 'nextAction', 'boundaries'],
  additionalProperties: false
};

const toneRecommendationSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    capabilityId: { type: 'string', const: 'cognistration-tone-intention' },
    version: { type: 'string' },
    correlationId: { type: 'string' },
    agentMessage: { type: 'string' },
    status: { type: 'string', enum: ['completed', 'safety_redirect'] },
    matchMode: { type: 'string', enum: ['ai', 'deterministic'] },
    usage: {
      type: 'object',
      properties: {
        recorded: { type: 'boolean' },
        publicPreview: { type: 'boolean' }
      },
      required: ['recorded', 'publicPreview'],
      additionalProperties: false
    },
    track: { anyOf: [toneSchema, { type: 'null' }] },
    safety: { $ref: '#/components/schemas/SafetyDetails' },
    nextAction: { type: 'string' },
    boundaries: safetyBoundariesSchema
  },
  required: ['ok', 'capabilityId', 'version', 'correlationId', 'usage', 'track'],
  additionalProperties: true
};

const tonePackSchema = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    name: { type: 'string' },
    summary: { type: 'string' },
    description: { type: 'string' },
    bestFor: { type: 'array', items: { type: 'string' } },
    states: { type: 'array', items: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] } },
    strategy: { type: 'string' },
    price: { type: 'string' },
    billingMode: { type: 'string', const: 'one-time' },
    durationSec: { type: 'number' },
    durationLabel: { type: 'string' },
    trackCount: { type: 'number' },
    previewAvailable: { type: 'boolean' },
    previewTracks: { type: 'array', items: { type: 'object', additionalProperties: true } },
    purchaseUrl: { type: 'string', format: 'uri-reference' }
  },
  required: ['slug', 'name', 'summary', 'description', 'states', 'price', 'billingMode', 'previewAvailable', 'previewTracks', 'purchaseUrl'],
  additionalProperties: false
};

const policySchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-policy-information' },
    version: { type: 'string' },
    topic: { type: 'string', enum: ['safety', 'terms', 'privacy', 'cookies', 'ai', 'pricing', 'account'] },
    title: { type: 'string' },
    url: { type: 'string', format: 'uri' },
    effectiveDate: { type: ['string', 'null'] },
    summary: { type: 'string' },
    source: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'topic', 'title', 'url', 'effectiveDate', 'summary', 'source'],
  additionalProperties: false
};

const accountOptionsSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-account-options' },
    version: { type: 'string' },
    publicPreview: { type: 'object', additionalProperties: true },
    privateWorkspace: { type: 'object', additionalProperties: true },
    signup: { type: 'object', additionalProperties: true },
    note: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'publicPreview', 'privateWorkspace', 'signup', 'note'],
  additionalProperties: false
};

const idempotencyHeader = {
  name: 'Idempotency-Key',
  in: 'header',
  required: true,
  schema: { type: 'string', pattern: '^[A-Za-z0-9._:-]{8,80}$' },
  description: 'Stable retry key for the same checkout intent.'
};

const hostedCheckoutRequest = {
  type: 'object',
  properties: {
    slug: { type: 'string', minLength: 1, maxLength: 120 },
    email: { type: 'string', format: 'email', maxLength: 254 },
    confirmed: { type: 'boolean', const: true },
    idempotencyKey: { type: 'string', pattern: '^[A-Za-z0-9._:-]{8,80}$' }
  },
  required: ['email', 'confirmed', 'idempotencyKey'],
  additionalProperties: false
};

const tonePackDeliverySchema = {
  type: 'object',
  properties: {
    status: { type: 'string', const: 'paid' },
    pack: { $ref: '#/components/schemas/TonePack' },
    downloadUrl: { type: 'string', format: 'uri' },
    protectedDeliveryUrl: { type: 'string', format: 'uri' },
    webUrl: { type: 'string', format: 'uri' },
    emailDelivery: {
      type: 'object',
      properties: {
        attempted: { type: 'boolean' },
        sent: { type: 'boolean' },
        fallbackUrl: { type: 'string', format: 'uri' }
      },
      required: ['attempted', 'sent', 'fallbackUrl'],
      additionalProperties: false
    },
    purchaseId: { type: 'string' }
  },
  required: ['status', 'pack', 'downloadUrl', 'protectedDeliveryUrl', 'webUrl', 'emailDelivery', 'purchaseId'],
  additionalProperties: false
};

const workshopAccessGrantSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    accessKey: { type: 'string', minLength: 20, maxLength: 200 },
    accessKeyHint: { type: 'string' },
    status: { type: 'string', const: 'active' },
    startsAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
    sessionDurationSec: { type: 'integer', const: 3600 },
    sessionDurationLabel: { type: 'string' },
    accessUrl: { type: 'string', format: 'uri-reference' }
  },
  required: ['ok', 'accessKey', 'accessKeyHint', 'status', 'startsAt', 'expiresAt', 'sessionDurationSec', 'sessionDurationLabel', 'accessUrl'],
  additionalProperties: false
};

const machineToneRequest = {
  type: 'object',
  properties: {
    intention: { type: 'string', minLength: 1, maxLength: 240 },
    toneId: { type: 'string', minLength: 1, maxLength: 120 },
    state: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
    beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
    volume: { type: 'integer', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
};

const tonePackPaymentRequest = {
  type: 'object',
  properties: {
    slug: { type: 'string', minLength: 1, maxLength: 120, default: 'full-spectrum-pack', description: 'Optional approved public tone-pack slug; defaults to the Full Spectrum Pack.' },
    email: { type: 'string', format: 'email', maxLength: 254, description: 'Email used for digital pack delivery.' },
    confirmed: { type: 'boolean', const: true, description: 'Explicit confirmation of the $5.99 one-time price and delivery email.' }
  },
  required: ['email', 'confirmed'],
  additionalProperties: false
};

const sessionIntentionRequest = {
  type: 'object',
  properties: {
    intention: { type: 'string', minLength: 1, maxLength: 240 },
    durationMin: { type: 'integer', minimum: 5, maximum: 60, default: 20 },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] }
  },
  required: ['intention'],
  additionalProperties: false
};

const toneDirectionComparisonRequest = {
  type: 'object',
  properties: {
    intention: { type: 'string', minLength: 1, maxLength: 240 },
    limit: { type: 'integer', minimum: 2, maximum: 4, default: 3 }
  },
  required: ['intention'],
  additionalProperties: false
};

const sessionCueRequest = {
  type: 'object',
  properties: {
    intention: { type: 'string', minLength: 1, maxLength: 240 },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] }
  },
  additionalProperties: false
};

const intentDirectionSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    label: { type: 'string' },
    description: { type: 'string' },
    example: { type: 'string' },
    states: { type: 'array', items: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] } }
  },
  required: ['id', 'label', 'description', 'example', 'states'],
  additionalProperties: false
};

const intentGuidanceSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-intent-guidance' },
    version: { type: 'string', const: '0.1.0' },
    correlationId: { type: 'string' },
    status: { type: 'string', enum: ['clear', 'needs_input', 'safety_redirect'] },
    direction: intentDirectionSchema,
    suggestedTone: { anyOf: [toneSchema, { type: 'null' }] },
    choices: { type: 'array', minItems: 1, maxItems: 3, items: intentDirectionSchema },
    nextAction: { type: 'string' },
    safety: { $ref: '#/components/schemas/SafetyDetails' },
    boundaries: {
      type: 'object',
      properties: {
        audioStarted: { type: 'boolean', const: false },
        recordSaved: { type: 'boolean', const: false },
        medicalGuidance: { type: 'boolean', const: false }
      },
      required: ['audioStarted', 'recordSaved', 'medicalGuidance'],
      additionalProperties: false
    }
  },
  required: ['capabilityId', 'version', 'correlationId', 'status', 'nextAction', 'boundaries'],
  additionalProperties: false
};

const toneCalibrationSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-intent-guidance' },
    version: { type: 'string', const: '0.1.0' },
    correlationId: { type: 'string' },
    status: { type: 'string', const: 'completed' },
    feedback: { type: 'string', enum: ['too_intense', 'too_quiet', 'too_bright', 'too_slow', 'too_flat', 'just_right'] },
    feedbackLabel: { type: 'string' },
    previous: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 }
      },
      required: ['targetState', 'carrierHz', 'beatHz', 'volume'],
      additionalProperties: false
    },
    controls: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 }
      },
      required: ['targetState', 'carrierHz', 'beatHz', 'volume'],
      additionalProperties: false
    },
    changed: { type: 'array', items: { type: 'string', enum: ['targetState', 'carrierHz', 'beatHz', 'volume'] } },
    message: { type: 'string' },
    nextAction: { type: 'string' },
    boundaries: {
      type: 'object',
      properties: {
        audioStarted: { type: 'boolean', const: false },
        recordSaved: { type: 'boolean', const: false },
        controlsBounded: { type: 'boolean', const: true }
      },
      required: ['audioStarted', 'recordSaved', 'controlsBounded'],
      additionalProperties: false
    }
  },
  required: ['capabilityId', 'version', 'correlationId', 'status', 'feedback', 'feedbackLabel', 'previous', 'controls', 'changed', 'message', 'nextAction', 'boundaries'],
  additionalProperties: false
};

const sessionToneSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    state: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    targetHz: { type: 'number', minimum: 0.5, maximum: 40 },
    baseFreqHz: { type: 'number', minimum: 100, maximum: 400 },
    durationSec: { type: 'number', minimum: 1 },
    summary: { type: 'string' },
    wavUrl: { type: ['string', 'null'], format: 'uri-reference' }
  },
  required: ['id', 'name', 'state', 'targetState', 'targetHz', 'baseFreqHz', 'durationSec', 'summary', 'wavUrl'],
  additionalProperties: false
};

const sessionCueSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-session-orchestration' },
    version: { type: 'string', const: '0.1.0' },
    correlationId: { type: 'string' },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    modeLabel: { type: 'string' },
    cue: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        prompt: { type: 'string' },
        suggestedSeconds: { type: 'integer', minimum: 15, maximum: 300 },
        pairedDirection: { type: 'string' }
      },
      required: ['title', 'prompt', 'suggestedSeconds', 'pairedDirection'],
      additionalProperties: false
    },
    suggestedStartingState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
    note: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'correlationId', 'mode', 'modeLabel', 'cue', 'suggestedStartingState', 'note'],
  additionalProperties: false
};

const toneDirectionComparisonSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-session-orchestration' },
    version: { type: 'string', const: '0.1.0' },
    correlationId: { type: 'string' },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    modeLabel: { type: 'string' },
    recommendation: sessionToneSchema,
    options: {
      type: 'array',
      minItems: 2,
      maxItems: 4,
      items: {
        type: 'object',
        properties: {
          rank: { type: 'integer', minimum: 1, maximum: 4 },
          tone: sessionToneSchema,
          direction: { type: 'string' },
          bestFor: { type: 'string' },
          tradeoff: { type: 'string' }
        },
        required: ['rank', 'tone', 'direction', 'bestFor', 'tradeoff'],
        additionalProperties: false
      }
    },
    note: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'correlationId', 'mode', 'modeLabel', 'recommendation', 'options', 'note'],
  additionalProperties: false
};

const sessionPlanSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-session-orchestration' },
    version: { type: 'string', const: '0.1.0' },
    correlationId: { type: 'string' },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    modeLabel: { type: 'string' },
    durationMin: { type: 'integer', minimum: 5, maximum: 60 },
    totalDurationSec: { type: 'integer', minimum: 300, maximum: 3600 },
    recommendation: sessionToneSchema,
    rationale: { type: 'string' },
    phases: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', enum: ['arrive', 'practice', 'close'] },
          label: { type: 'string' },
          durationSec: { type: 'integer', minimum: 60, maximum: 3300 },
          tone: sessionToneSchema,
          controls: { type: 'object', additionalProperties: true },
          instruction: { type: 'string' }
        },
        required: ['id', 'label', 'durationSec', 'tone', 'controls', 'instruction'],
        additionalProperties: false
      }
    },
    cue: sessionCueSchema.properties.cue,
    availableActions: { type: 'array', items: { type: 'string' } },
    boundaries: { type: 'object', additionalProperties: true }
  },
  required: ['capabilityId', 'version', 'correlationId', 'mode', 'modeLabel', 'durationMin', 'totalDurationSec', 'recommendation', 'rationale', 'phases', 'cue', 'availableActions', 'boundaries'],
  additionalProperties: false
};

const sessionRecipeRequest = {
  type: 'object',
  properties: {
    targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'], default: 'theta' },
    carrierHz: { type: 'integer', minimum: 100, maximum: 400, default: 200 },
    beatHz: { type: 'number', minimum: 0.5, maximum: 40, default: 6 },
    volume: { type: 'integer', minimum: 0, maximum: 100, default: 72 },
    durationSec: { type: 'integer', minimum: 60, maximum: 3600, default: 120 },
    intentionLabel: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], default: 'reflect', description: 'A safe direction label, not diary text.' }
  },
  additionalProperties: false
};

const sessionRecipeSchema = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-session-recipe' },
    version: { type: 'string', const: '0.1.0' },
    correlationId: { type: 'string' },
    status: { type: 'string', const: 'completed' },
    recipe: {
      type: 'object',
      properties: {
        recipeVersion: { type: 'string', const: 'cognistration-session-recipe-v1' },
        targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 },
        durationSec: { type: 'integer', minimum: 60, maximum: 3600 },
        intentionLabel: { type: 'string' }
      },
      required: ['recipeVersion', 'targetState', 'carrierHz', 'beatHz', 'volume', 'durationSec', 'intentionLabel'],
      additionalProperties: false
    },
    privacy: {
      type: 'object',
      properties: {
        contentIncluded: { type: 'boolean', const: false },
        diaryContentIncluded: { type: 'boolean', const: false },
        storage: { type: 'string', const: 'none' },
        shareable: { type: 'string', const: 'technical-settings-only' }
      },
      required: ['contentIncluded', 'diaryContentIncluded', 'storage', 'shareable'],
      additionalProperties: false
    },
    nextAction: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'correlationId', 'status', 'recipe', 'privacy', 'nextAction'],
  additionalProperties: false
};

const ucpCheckoutSchema = {
  type: 'object',
  properties: {
    ucp: { type: 'object', additionalProperties: true },
    id: { type: 'string' },
    status: { type: 'string', enum: ['incomplete', 'requires_escalation', 'ready_for_complete', 'complete_in_progress', 'completed', 'canceled'] },
    buyer: { type: 'object', additionalProperties: true },
    line_items: { type: 'array', items: { type: 'object', additionalProperties: true } },
    currency: { type: 'string', minLength: 3, maxLength: 3 },
    totals: { type: 'array', items: { type: 'object', additionalProperties: true } },
    messages: { type: 'array', items: { type: 'object', additionalProperties: true } },
    links: { type: 'array', items: { type: 'object', additionalProperties: true } },
    expires_at: { type: 'string', format: 'date-time' },
    continue_url: { type: 'string', format: 'uri' },
    payment: { type: 'object', additionalProperties: true }
  },
  required: ['ucp', 'id', 'status', 'line_items', 'currency', 'totals', 'links', 'expires_at', 'payment'],
  additionalProperties: true
};

const jsonResponse = (description, schema) => ({
  description,
  content: { 'application/json': { schema } }
});

function mppPaymentInfo(amountCents, description) {
  return {
    offers: [{
      intent: 'charge',
      method: 'stripe',
      // MPP discovery expresses fiat amounts in the currency's smallest unit.
      amount: String(amountCents),
      currency: 'usd',
      description
    }]
  };
}

const errorSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean', const: false },
    error: { oneOf: [{ type: 'string' }, { type: 'object', additionalProperties: true }] },
    code: { type: 'string' },
    message: { type: 'string' },
    retryable: { type: 'boolean' },
    resolution: { type: 'string' },
    requestId: { type: 'string' }
  },
  required: ['error'],
  additionalProperties: true
};

export function publicOpenApiDocument(origin = 'https://cognistration.com') {
  const canonicalOrigin = String(origin).replace(/\/$/, '');
  const publicTools = MCP_TOOLS.map(({ name, title, description, inputSchema, outputSchema, annotations, authorization, sideEffect }) => ({
    name,
    title,
    description,
    inputSchema,
    outputSchema,
    annotations,
    authorization,
    sideEffect
  }));

  return {
    openapi: '3.1.0',
    info: {
      title: 'Cognistration public agent API',
      version: MCP_SERVER_VERSION,
      description: 'Compatibility contract for the public Cognistration tone catalog, free agent planning tools, bounded hosted checkout, UCP checkout lifecycle, and the live provider-gated machine-payment challenge. Payment credentials, private workspace records, diary content, and arbitrary writes are not exposed.'
    },
    servers: [{ url: canonicalOrigin }],
    externalDocs: {
      description: 'Cognistration agent instructions and safety boundaries',
      url: `${canonicalOrigin}/agent-instructions.md`
    },
    'x-service-info': {
      categories: ['audio', 'commerce'],
      docs: {
        homepage: canonicalOrigin,
        llms: `${canonicalOrigin}/llms.txt`,
        apiReference: `${canonicalOrigin}/docs`
      }
    },
    'x-cognistration': {
      serverName: MCP_SERVER_NAME,
      capabilityId: 'cognistration-agentic-platform',
      publicTools,
      mcpEndpoint: `${canonicalOrigin}/api/mcp`,
      discovery: {
        agentCard: `${canonicalOrigin}/.well-known/agent-card.json`,
        ard: `${canonicalOrigin}/.well-known/ard.json`,
        apiCatalog: `${canonicalOrigin}/.well-known/api-catalog`,
        skills: `${canonicalOrigin}/.well-known/agent-skills/index.json`,
        sandbox: `${canonicalOrigin}/api/sandbox`
      },
      versions: { current: 'v1', status: `${canonicalOrigin}/api/v1` }
    },
    security: [],
    paths: {
      '/api/capabilities': {
        get: {
          operationId: 'getAgenticCapabilities',
          summary: 'Read public platform capabilities',
          responses: {
            200: jsonResponse('The public capability manifest.', { type: 'object', additionalProperties: true })
          }
        }
      },
      '/api/sandbox': {
        get: {
          operationId: 'getAgentSandboxCapabilities',
          summary: 'Read the no-write integration sandbox contract',
          description: 'Returns deterministic sandbox capabilities. No account, audio, checkout, credential, private-data, or persistence operation is performed.',
          responses: { 200: jsonResponse('Sandbox capabilities.', { type: 'object', additionalProperties: true }) }
        },
        post: {
          operationId: 'runAgentSandboxCheck',
          summary: 'Run one deterministic no-write sandbox check',
          description: 'Runs a bounded recommendation or controls-shape check without starting audio, saving data, or contacting payment systems.',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { operation: { type: 'string', enum: ['capabilities', 'recommendation', 'controls'] }, intention: { type: 'string', maxLength: 240 }, targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] }, carrierHz: { type: 'integer', minimum: 100, maximum: 400 }, beatHz: { type: 'number', minimum: 0.5, maximum: 40 }, volume: { type: 'integer', minimum: 0, maximum: 100 } }, additionalProperties: false } } } },
          responses: { 200: jsonResponse('Deterministic sandbox result.', { type: 'object', additionalProperties: true }), 400: jsonResponse('The sandbox request is invalid.', { $ref: '#/components/schemas/Error' }) }
        }
      },
      '/api/jobs': {
        get: {
          operationId: 'getPublicAsyncJobStatus',
          summary: 'Read public asynchronous-job support status',
          description: 'Reports whether the public agent contract supports asynchronous jobs. It currently completes bounded public operations synchronously.',
          responses: { 200: jsonResponse('The public asynchronous-job status.', { type: 'object', additionalProperties: true }) }
        },
        post: {
          operationId: 'createPublicAsyncJob',
          summary: 'Attempt to create a public asynchronous job',
          description: 'The public agent contract is synchronous and does not create an asynchronous job.',
          responses: { 501: jsonResponse('Asynchronous public jobs are not supported.', { $ref: '#/components/schemas/Error' }) }
        }
      },
      '/api/batch': {
        post: {
          operationId: 'runReadOnlyAgentBatch',
          summary: 'Run a bounded read-only batch',
          description: 'Groups up to 20 published capability, tone-pack, policy, or intent-guidance reads. It does not write, start audio, or process payment.',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { operations: { type: 'array', minItems: 1, maxItems: 20, items: { type: 'object', properties: { id: { type: 'string' }, method: { type: 'string', enum: ['GET', 'POST'] }, path: { type: 'string', enum: ['/api/capabilities', '/api/packs', '/api/agent/policy', '/api/agent/intent-guidance'] }, body: { type: 'object', additionalProperties: true } }, required: ['id', 'method', 'path'], additionalProperties: false } } }, required: ['operations'], additionalProperties: false } } } },
          responses: { 200: jsonResponse('Batch results with an opaque cursor field.', { type: 'object', properties: { ok: { type: 'boolean' }, results: { type: 'array', items: { type: 'object', additionalProperties: true } }, nextCursor: { type: ['string', 'null'] } }, required: ['ok', 'results', 'nextCursor'], additionalProperties: false }), 400: jsonResponse('The batch request is invalid.', { $ref: '#/components/schemas/Error' }) }
        }
      },
      '/ask': {
        get: {
          operationId: 'askCognistration',
          summary: 'Ask a bounded natural-language product question',
          parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 240 } }],
          responses: { 200: jsonResponse('A bounded answer with a response-type metadata envelope.', { type: 'object', additionalProperties: true }), 400: jsonResponse('The query is invalid.', { $ref: '#/components/schemas/Error' }) }
        },
        post: {
          operationId: 'askCognistrationPost',
          summary: 'Ask a bounded natural-language product question',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { query: { type: 'string', minLength: 1, maxLength: 240 }, q: { type: 'string', minLength: 1, maxLength: 240 }, prefer: { type: 'object', additionalProperties: true } }, additionalProperties: false } } } },
          responses: { 200: jsonResponse('A bounded answer or streaming negotiation response.', { type: 'object', additionalProperties: true }), 400: jsonResponse('The query is invalid.', { $ref: '#/components/schemas/Error' }) }
        }
      },
      '/a2a': {
        get: { operationId: 'getA2aStatus', summary: 'Read A2A compatibility status', responses: { 200: jsonResponse('A2A service information.', { type: 'object', additionalProperties: true }) } },
        post: { operationId: 'sendA2aMessage', summary: 'Send one stateless A2A compatibility message', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', additionalProperties: true } } } }, responses: { 200: jsonResponse('A2A task and artifact response.', { type: 'object', additionalProperties: true }), 400: jsonResponse('The A2A request is invalid.', { $ref: '#/components/schemas/Error' }) } }
      },
      '/api/docs-mcp': {
        get: { operationId: 'getDocumentationMcpStatus', summary: 'Read the documentation MCP service status', responses: { 200: jsonResponse('Documentation MCP service information.', { type: 'object', additionalProperties: true }) } },
        post: { operationId: 'callDocumentationMcp', summary: 'Call the read-only documentation MCP server', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['jsonrpc', 'id', 'method'], additionalProperties: true } } } }, responses: { 200: jsonResponse('A documentation MCP result.', { type: 'object', additionalProperties: true }), 400: jsonResponse('The documentation MCP request is invalid.', { $ref: '#/components/schemas/Error' }) } }
      },
      '/api/agent': {
        post: {
          operationId: 'recommendToneFromIntention',
          summary: 'Match a short intention to one approved public tone',
          description: 'Uses optional AI classification with a deterministic approved-catalog fallback. The response is non-diagnostic and bounded to the public tone library.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { intention: { type: 'string', minLength: 1, maxLength: 240 } },
                  required: ['intention'],
                  additionalProperties: false
                }
              }
            }
          },
          responses: {
            200: jsonResponse('An approved public tone recommendation.', { $ref: '#/components/schemas/ToneRecommendation' }),
            400: jsonResponse('The intention is empty, oversized, or malformed.', { $ref: '#/components/schemas/Error' }),
            403: jsonResponse('The public preview limit or account boundary applies.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/intent-guidance': {
        post: {
          operationId: 'clarifyCognistrationIntention',
          summary: 'Clarify a broad listening intention',
          description: 'Returns a few public listening directions or one bounded suggestion without changing controls, starting audio, saving a record, or making a medical claim.',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { intention: { type: 'string', minLength: 1, maxLength: 240 } }, required: ['intention'], additionalProperties: false } } } },
          responses: {
            200: jsonResponse('Public intent guidance.', { type: 'object', required: ['ok', 'guidance'], properties: { ok: { type: 'boolean' }, guidance: { $ref: '#/components/schemas/IntentGuidance' } }, additionalProperties: false }),
            400: jsonResponse('The intention is empty, oversized, or malformed.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('Intent guidance is temporarily unavailable.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/tone-calibrate': {
        post: {
          operationId: 'calibrateCognistrationTone',
          summary: 'Return bounded tone changes from listener feedback',
          description: 'Maps sensory feedback to safe visible control changes. It never starts audio, saves a record, or claims a medical outcome.',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { feedback: { type: 'string', enum: ['too_intense', 'too_quiet', 'too_bright', 'too_slow', 'too_flat', 'just_right'] }, targetState: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] }, carrierHz: { type: 'integer', minimum: 100, maximum: 400 }, beatHz: { type: 'number', minimum: 0.5, maximum: 40 }, volume: { type: 'integer', minimum: 0, maximum: 100 } }, required: ['feedback'], additionalProperties: false } } } },
          responses: {
            200: jsonResponse('Bounded tone calibration guidance.', { type: 'object', required: ['ok', 'calibration'], properties: { ok: { type: 'boolean' }, calibration: { $ref: '#/components/schemas/ToneCalibration' } }, additionalProperties: false }),
            400: jsonResponse('The feedback or controls are invalid.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('Tone calibration is temporarily unavailable.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/tone-compare': {
        post: {
          operationId: 'comparePublicToneDirections',
          summary: 'Compare approved tone directions for an intention',
          description: 'Returns two to four public tone options with practical fit and tradeoffs. It does not start audio, save a session, or make a medical claim.',
          requestBody: { required: true, content: { 'application/json': { schema: toneDirectionComparisonRequest } } },
          responses: {
            200: jsonResponse('A bounded comparison of public tone directions.', { type: 'object', required: ['ok', 'comparison'], properties: { ok: { type: 'boolean' }, comparison: { $ref: '#/components/schemas/ToneDirectionComparison' } }, additionalProperties: false }),
            400: jsonResponse('The intention or comparison limit is invalid.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('The public tone comparison is temporarily unavailable.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/session-plan': {
        post: {
          operationId: 'planPublicListeningSession',
          summary: 'Plan a bounded listening session',
          description: 'Builds an arrive, practice, and close plan from a short intention without starting audio or saving a record.',
          requestBody: { required: true, content: { 'application/json': { schema: sessionIntentionRequest } } },
          responses: {
            200: jsonResponse('A public three-phase listening session plan.', { type: 'object', required: ['ok', 'plan'], properties: { ok: { type: 'boolean' }, plan: { $ref: '#/components/schemas/SessionPlan' } }, additionalProperties: false }),
            400: jsonResponse('The intention, duration, mode, or state is invalid.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('The public session planner is temporarily unavailable.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/session-cue': {
        post: {
          operationId: 'getPublicSessionCue',
          summary: 'Get a short session cue',
          description: 'Returns a public journaling, focus, reset, or creative cue. Diary content is never accepted, read, or stored by this route.',
          requestBody: { required: false, content: { 'application/json': { schema: sessionCueRequest } } },
          responses: {
            200: jsonResponse('A public non-diagnostic session cue.', { type: 'object', required: ['ok', 'cue'], properties: { ok: { type: 'boolean' }, cue: { $ref: '#/components/schemas/SessionCue' } }, additionalProperties: false }),
            400: jsonResponse('The intention or mode is invalid.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('The public session cue is temporarily unavailable.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/session-recipe': {
        post: {
          operationId: 'preparePublicSessionRecipe',
          summary: 'Prepare a technical-settings-only session recipe',
          description: 'Returns a portable recipe with only state, carrier, beat, volume, duration, and a safe direction label. Diary content is never accepted, returned, or stored.',
          requestBody: { required: false, content: { 'application/json': { schema: sessionRecipeRequest } } },
          responses: {
            200: jsonResponse('A local-friendly technical session recipe.', { type: 'object', required: ['ok', 'capabilityId', 'version', 'correlationId', 'status', 'recipe', 'privacy', 'nextAction'], properties: { ok: { type: 'boolean' }, capabilityId: { type: 'string' }, version: { type: 'string' }, correlationId: { type: 'string' }, status: { type: 'string' }, recipe: sessionRecipeSchema.properties.recipe, privacy: sessionRecipeSchema.properties.privacy, nextAction: { type: 'string' } }, additionalProperties: false }),
            400: jsonResponse('The recipe settings are outside the published bounds.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('The public recipe capability is temporarily unavailable.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/packs': {
        get: {
          operationId: 'listPublicTonePacks',
          summary: 'Read public tone-pack metadata and preview links',
          parameters: [
            { name: 'agent', in: 'query', schema: { type: 'string', enum: ['1'] }, description: 'Return the safe agent-compatible catalog shape.' },
            { name: 'slug', in: 'query', schema: { type: 'string', maxLength: 120 }, description: 'Read one public pack by slug when agent=1.' },
            { name: 'query', in: 'query', schema: { type: 'string', maxLength: 240 }, description: 'Search pack name, purpose, state, and public description when agent=1.' },
            { name: 'state', in: 'query', schema: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 20 } },
            { name: 'cursor', in: 'query', schema: { type: 'string', maxLength: 200 }, description: 'Opaque continuation cursor returned by a paginated response.' }
          ],
          responses: {
            200: jsonResponse('Public tone-pack metadata only.', {
              type: 'object',
              properties: { ok: { type: 'boolean' }, source: { type: 'string' }, packs: { type: 'array', items: { $ref: '#/components/schemas/TonePack' } }, pack: { $ref: '#/components/schemas/TonePack' }, nextCursor: { type: ['string', 'null'] } },
              required: ['ok'],
              additionalProperties: true
            }),
            400: jsonResponse('The pack query does not satisfy the public bounds.', { $ref: '#/components/schemas/Error' }),
            404: jsonResponse('The requested public pack is not in the catalog.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/policy': {
        get: {
          operationId: 'getCognistrationPolicyInfo',
          summary: 'Read one canonical policy or safety page summary',
          parameters: [{ name: 'topic', in: 'query', required: true, schema: { type: 'string', enum: ['safety', 'terms', 'privacy', 'cookies', 'ai', 'pricing', 'account'] } }],
          responses: {
            200: jsonResponse('A canonical public policy summary and URL.', { type: 'object', properties: { ok: { type: 'boolean' }, policy: { $ref: '#/components/schemas/Policy' } }, required: ['ok', 'policy'], additionalProperties: false }),
            400: jsonResponse('The policy topic is missing or invalid.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/account': {
        get: {
          operationId: 'getCognistrationAccountOptions',
          summary: 'Read public preview and private workspace access options',
          responses: {
            200: jsonResponse('Account and pricing boundaries; no credentials are accepted.', { allOf: [{ $ref: '#/components/schemas/AccountOptions' }, { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'] }] })
          }
        }
      },
      '/api/agent/commerce/tone-pack-checkout': {
        post: {
          operationId: 'createTonePackHostedCheckout',
          summary: 'Create a hosted checkout for one published tone pack',
          description: 'The server resolves the approved catalog price and returns a Stripe-hosted payment link. Card details never pass through this API.',
          requestBody: { required: true, content: { 'application/json': { schema: { ...hostedCheckoutRequest, required: ['slug', 'email', 'confirmed', 'idempotencyKey'] } } } },
          responses: {
            201: jsonResponse('A Stripe-hosted checkout link.', { type: 'object', additionalProperties: true }),
            400: jsonResponse('The product, email, confirmation, or retry key is invalid.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('Stripe or commerce storage is not ready.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/commerce/tone-pack-delivery': {
        get: {
          operationId: 'getTonePackDelivery',
          summary: 'Resolve a paid tone-pack delivery',
          description: 'Verifies the Stripe Checkout Session before returning the direct download, protected fallback, email fallback, and public tone-pack URL.',
          parameters: [
            { name: 'slug', in: 'query', required: true, schema: { type: 'string', minLength: 1, maxLength: 120 } },
            { name: 'checkout_session_id', in: 'query', required: true, schema: { type: 'string', pattern: '^cs_[A-Za-z0-9_]+$' } }
          ],
          responses: {
            200: jsonResponse('Verified digital tone-pack delivery paths.', tonePackDeliverySchema),
            400: jsonResponse('The tone-pack slug or checkout session reference is invalid.', { $ref: '#/components/schemas/Error' }),
            403: jsonResponse('The checkout session is not paid for this tone pack.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('Stripe or delivery storage is not ready.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/commerce/workshop-checkout': {
        post: {
          operationId: 'createMachineWorkshopHostedCheckout',
          summary: 'Create a hosted checkout for the 24-hour machine workshop',
          requestBody: { required: true, content: { 'application/json': { schema: { ...hostedCheckoutRequest, properties: { email: hostedCheckoutRequest.properties.email, confirmed: hostedCheckoutRequest.properties.confirmed, idempotencyKey: hostedCheckoutRequest.properties.idempotencyKey }, required: ['email', 'confirmed', 'idempotencyKey'] } } } },
          responses: {
            201: jsonResponse('A Stripe-hosted checkout link for the $2.99 one-time workshop pass.', { type: 'object', additionalProperties: true }),
            400: jsonResponse('The email, confirmation, or retry key is invalid.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('Stripe or commerce storage is not ready.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/agent/commerce/workshop-access': {
        get: {
          operationId: 'getPaidWorkshopAccess',
          summary: 'Resolve a paid 24-hour machine workshop access key',
          description: 'Verifies the paid Stripe Checkout Session and returns the one-time bearer access key and machine launch URL. The same Checkout Session is idempotent and cannot create a second active key.',
          parameters: [{ name: 'checkout_session_id', in: 'query', required: true, schema: { type: 'string', pattern: '^cs_[A-Za-z0-9_]+$' } }],
          responses: {
            200: jsonResponse('Verified workshop access grant.', workshopAccessGrantSchema),
            400: jsonResponse('The workshop Checkout Session reference is invalid.', { $ref: '#/components/schemas/Error' }),
            403: jsonResponse('The Checkout Session is not a paid workshop purchase.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('Stripe or workshop access storage is not ready.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/machine-payments/session': {
        get: {
          operationId: 'getMachinePaymentRouteStatus',
          summary: 'Read provider-gated machine payment status',
          responses: { 200: jsonResponse('Current machine payment route status.', { type: 'object', additionalProperties: true }), 503: jsonResponse('Provider access is not enabled.', { $ref: '#/components/schemas/Error' }) }
        },
        post: {
          operationId: 'payForMachineSession',
          summary: 'Pay for one bounded machine session through MPP',
          description: 'Returns a 402 machine-payment challenge until a compatible agent submits a valid provider credential. Hosted pricing remains the browser fallback.',
          'x-payment-info': mppPaymentInfo(MACHINE_PAYMENT_PRICE_CENTS, 'One bounded Cognistration machine session; the runtime 402 challenge is authoritative.'),
          requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', additionalProperties: false, description: 'No body fields are required for the fixed machine-session resource.' } } } },
          responses: {
            200: jsonResponse('A paid machine-session resource and signed payment receipt.', { type: 'object', additionalProperties: true }),
            402: jsonResponse('Payment is required or the submitted credential needs another attempt.', { type: 'object', additionalProperties: true }),
            503: jsonResponse('Stripe Machine Payments access is not enabled.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/machine-payments/tone': {
        get: {
          operationId: 'getMachineTonePaymentRouteStatus',
          summary: 'Read provider-gated custom tone payment status',
          responses: { 200: jsonResponse('Current paid tone-session route status.', { type: 'object', additionalProperties: true }), 503: jsonResponse('Provider access is not enabled.', { $ref: '#/components/schemas/Error' }) }
        },
        post: {
          operationId: 'payForCustomToneSession',
          summary: 'Pay for one bounded custom tone session through MPP',
          description: 'The server resolves an approved public tone and bounded controls before returning a 402 machine-payment challenge. A compatible agent retries with a valid provider credential to receive the verified tone-session resource.',
          'x-payment-info': mppPaymentInfo(MACHINE_PAYMENT_PRICE_CENTS, 'One bounded Cognistration custom tone session; the runtime 402 challenge is authoritative.'),
          requestBody: { required: false, content: { 'application/json': { schema: machineToneRequest } } },
          responses: {
            200: jsonResponse('A paid custom tone-session resource and signed payment receipt.', { type: 'object', additionalProperties: true }),
            400: jsonResponse('The tone request is invalid or outside the approved bounds.', { $ref: '#/components/schemas/Error' }),
            402: jsonResponse('Payment is required or the submitted credential needs another attempt.', { type: 'object', additionalProperties: true }),
            503: jsonResponse('Stripe Machine Payments access is not enabled.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/machine-payments/tone-pack': {
        get: {
          operationId: 'getTonePackMachinePaymentRouteStatus',
          summary: 'Read provider-gated tone-pack payment status',
          responses: { 200: jsonResponse('Current $5.99 tone-pack payment route status.', { type: 'object', additionalProperties: true }), 503: jsonResponse('Provider access is not enabled.', { $ref: '#/components/schemas/Error' }) }
        },
        post: {
          operationId: 'payForTonePack',
          summary: 'Pay for one published tone pack through MPP',
          description: 'The server fixes the amount at $5.99, binds the request to an approved pack and delivery email, returns a 402 challenge to compatible agents, and verifies the Stripe PaymentIntent before releasing the download and email fallback.',
          'x-payment-info': mppPaymentInfo(TONE_PACK_PAYMENT_PRICE_CENTS, 'One published Cognistration tone-pack bundle; the runtime 402 challenge is authoritative.'),
          requestBody: { required: true, content: { 'application/json': { schema: tonePackPaymentRequest } } },
          responses: {
            200: jsonResponse('A paid tone-pack resource, verified receipt, and download paths.', { type: 'object', additionalProperties: true }),
            400: jsonResponse('The pack, email, or explicit confirmation is invalid.', { $ref: '#/components/schemas/Error' }),
            402: jsonResponse('Payment is required or the submitted credential needs another attempt.', { type: 'object', additionalProperties: true }),
            403: jsonResponse('The payment does not match the approved tone-pack purchase.', { $ref: '#/components/schemas/Error' }),
            503: jsonResponse('Stripe Machine Payments or delivery storage is not enabled.', { $ref: '#/components/schemas/Error' })
          }
        }
      },
      '/api/ucp/checkout-sessions': {
        post: {
          operationId: 'createUcpCheckout',
          summary: 'Create a UCP checkout session',
          parameters: [idempotencyHeader],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['line_items'], properties: { buyer: { type: 'object', additionalProperties: true }, line_items: { type: 'array', minItems: 1, maxItems: 1, items: { type: 'object', additionalProperties: true } } }, additionalProperties: true } } } },
          responses: { 201: jsonResponse('A server-priced UCP checkout resource.', { $ref: '#/components/schemas/UcpCheckout' }), 400: jsonResponse('The UCP checkout is invalid.', { $ref: '#/components/schemas/Error' }) }
        }
      },
      '/api/ucp/checkout-sessions/{checkoutId}': {
        parameters: [{ name: 'checkoutId', in: 'path', required: true, schema: { type: 'string' } }],
        get: { operationId: 'getUcpCheckout', summary: 'Read a UCP checkout session', responses: { 200: jsonResponse('The current UCP checkout state.', { $ref: '#/components/schemas/UcpCheckout' }), 404: jsonResponse('Checkout not found.', { $ref: '#/components/schemas/Error' }) } },
        put: { operationId: 'updateUcpCheckout', summary: 'Replace a UCP checkout cart or buyer', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['line_items'], additionalProperties: true } } } }, responses: { 200: jsonResponse('The recomputed checkout state.', { $ref: '#/components/schemas/UcpCheckout' }) } }
      },
      '/api/ucp/checkout-sessions/{checkoutId}/complete': {
        post: { operationId: 'completeUcpCheckout', summary: 'Complete a UCP checkout with a compatible payment handler', parameters: [idempotencyHeader, { name: 'checkoutId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['payment'], additionalProperties: true } } } }, responses: { 200: jsonResponse('Completed order or buyer-review escalation.', { $ref: '#/components/schemas/UcpCheckout' }), 409: jsonResponse('The cart or mandate cannot be completed.', { $ref: '#/components/schemas/Error' }) } }
      },
      '/api/ucp/checkout-sessions/{checkoutId}/cancel': {
        post: { operationId: 'cancelUcpCheckout', summary: 'Cancel a UCP checkout', parameters: [idempotencyHeader, { name: 'checkoutId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: jsonResponse('Canceled checkout state.', { $ref: '#/components/schemas/UcpCheckout' }) } }
      },
      '/api/mcp': {
        post: {
          operationId: 'callPublicMcp',
          summary: 'Call the bounded public MCP JSON-RPC adapter',
          description: 'Use the MCP endpoint directly when the consuming host supports Streamable HTTP. Public reads and narrow, explicitly confirmed checkout operations are exposed through the published MCP registry.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['jsonrpc', 'id', 'method'],
                  properties: {
                    jsonrpc: { type: 'string', const: '2.0' },
                    id: { oneOf: [{ type: 'string' }, { type: 'integer' }] },
                    method: { type: 'string' },
                    params: { type: 'object', additionalProperties: true }
                  },
                  additionalProperties: false
                }
              }
            }
          },
          responses: {
            200: jsonResponse('A bounded JSON-RPC result or protocol error.', { type: 'object', additionalProperties: true }),
            400: jsonResponse('The request does not satisfy the MCP contract.', { type: 'object', additionalProperties: true }),
            403: jsonResponse('The request origin is not allowed.', { $ref: '#/components/schemas/Error' })
          }
        }
      }
    },
    components: {
      schemas: {
        Tone: toneSchema,
        ToneRecommendation: toneRecommendationSchema,
        TonePack: tonePackSchema,
        Policy: policySchema,
        AccountOptions: accountOptionsSchema,
        IntentGuidance: intentGuidanceSchema,
        SafetyDetails: safetyDetailsSchema,
        SafetyRedirect: safetyRedirectSchema,
        ToneCalibration: toneCalibrationSchema,
        SessionCue: sessionCueSchema,
        ToneDirectionComparison: toneDirectionComparisonSchema,
        SessionPlan: sessionPlanSchema,
        SessionRecipe: sessionRecipeSchema,
        UcpCheckout: ucpCheckoutSchema,
        Error: errorSchema
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Optional user-scoped bearer session for private member operations. Public discovery and preview operations are anonymous.'
        }
      }
    }
  };
}
