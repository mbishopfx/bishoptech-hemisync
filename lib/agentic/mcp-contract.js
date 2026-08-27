import { publicAccountOptions } from './account-capability.js';
import {
  IOS_APP_CAPABILITY_ID,
  IOS_APP_CAPABILITY_VERSION,
  IOS_APP_STORE_URL,
  publicIosAppOffer
} from './ios-capability.js';
import { memberWebMcpManifestTools, webMcpManifestTools } from './webmcp-contract.js';
import { SESSION_CAPABILITY_ID, SESSION_CAPABILITY_VERSION } from './session-capability.js';
import { INTENT_CAPABILITY_ID, INTENT_CAPABILITY_VERSION } from './intent-capability.js';
import { publicTonePackCatalogSummary } from './pack-capability.js';
import { policyCatalogSummary } from './policy-capability.js';
import { SKILL_IMPORT_EXTENSION, skillCatalogSummary } from './skill-capability.js';
import {
  MACHINE_WIDGET_RESOURCE_META,
  MACHINE_WIDGET_RESOURCE_MIME_TYPE,
  MACHINE_WIDGET_RESOURCE_URI
} from './machine-capability.js';
import { agentCheckoutPublicPolicy } from '../commerce/agent-checkout.mjs';
import { autonomousPaymentOptions } from '../commerce/ap2.mjs';
import { machinePaymentOptions } from '../commerce/machine-payments.mjs';
import { workshopAccessPolicy } from '../commerce/workshop-access.mjs';

export const MCP_SERVER_NAME = 'cognistration-agentic-platform';
export const MCP_SERVER_VERSION = '0.8.0';
export const MCP_PROTOCOL_VERSION = '2026-07-28';
export const MCP_LEGACY_PROTOCOL_VERSION = '2025-11-25';
export const MCP_SUPPORTED_LEGACY_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26'];

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

const publicToneOutput = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    state: { type: 'string', enum: PUBLIC_STATES },
    targetHz: { type: 'number' },
    baseFreqHz: { type: 'number' },
    durationSec: { type: 'number' },
    summary: { type: 'string' },
    wavUrl: { type: ['string', 'null'] }
  },
  required: ['id', 'name', 'state', 'targetHz', 'baseFreqHz', 'durationSec', 'summary'],
  additionalProperties: true
};

const publicTonePackOutput = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    name: { type: 'string' },
    summary: { type: 'string' },
    description: { type: 'string' },
    bestFor: { type: 'array', items: { type: 'string' } },
    states: { type: 'array', items: { type: 'string', enum: PUBLIC_STATES } },
    strategy: { type: 'string' },
    price: { type: 'string' },
    billingMode: { type: 'string', const: 'one-time' },
    durationSec: { type: 'number' },
    durationLabel: { type: 'string' },
    trackCount: { type: 'number' },
    previewAvailable: { type: 'boolean' },
    previewTracks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          state: { type: 'string', enum: PUBLIC_STATES },
          targetState: { type: 'string', enum: PUBLIC_STATES },
          targetHz: { type: 'number' },
          baseFreqHz: { type: 'number' },
          durationSec: { type: 'number' },
          previewSeconds: { type: 'number' },
          previewUrl: { type: ['string', 'null'], format: 'uri-reference' }
        },
        required: ['id', 'name', 'state', 'targetState', 'targetHz', 'baseFreqHz', 'durationSec', 'previewSeconds', 'previewUrl'],
        additionalProperties: false
      }
    },
    purchaseUrl: { type: 'string', format: 'uri-reference' }
  },
  required: ['slug', 'name', 'summary', 'description', 'bestFor', 'states', 'strategy', 'price', 'billingMode', 'durationSec', 'durationLabel', 'trackCount', 'previewAvailable', 'previewTracks', 'purchaseUrl'],
  additionalProperties: false
};

const policyOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string' },
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

const iosAppOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: IOS_APP_CAPABILITY_ID },
    version: { type: 'string', const: IOS_APP_CAPABILITY_VERSION },
    app: {
      type: 'object',
      properties: {
        id: { type: 'string', const: 'cognistration-for-iphone' },
        name: { type: 'string' },
        platform: { type: 'string', const: 'iPhone' },
        price: { type: 'string', const: '$2.99' },
        billingMode: { type: 'string', const: 'one-time purchase' },
        access: { type: 'string' },
        requires: { type: 'string' },
        url: { type: 'string', const: IOS_APP_STORE_URL, format: 'uri' },
        features: { type: 'array', items: { type: 'string' } },
        source: { type: 'string' },
        availabilityNote: { type: 'string' },
        pricingContext: { type: 'string' }
      },
      required: ['id', 'name', 'platform', 'price', 'billingMode', 'access', 'requires', 'url', 'features', 'source', 'availabilityNote', 'pricingContext'],
      additionalProperties: false
    }
  },
  required: ['capabilityId', 'version', 'app'],
  additionalProperties: false
};

const machineControlsOutput = {
  type: 'object',
  properties: {
    targetState: { type: 'string', enum: PUBLIC_STATES },
    carrierHz: { type: 'number', minimum: 100, maximum: 400 },
    beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
    volume: { type: 'number', minimum: 0, maximum: 100 },
    isPlaying: { type: 'boolean' },
    stateVersion: { type: 'integer', minimum: 1 }
  },
  required: ['targetState', 'carrierHz', 'beatHz', 'volume', 'isPlaying', 'stateVersion'],
  additionalProperties: false
};

const machineGeneratorOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-machine-generator' },
    version: { type: 'string' },
    resourceUri: { type: 'string', const: MACHINE_WIDGET_RESOURCE_URI },
    controls: machineControlsOutput,
    tone: { anyOf: [publicToneOutput, { type: 'null' }] },
    seededBy: { type: 'string', enum: ['listener-input', 'balanced-start'] },
    availableActions: { type: 'array', items: { type: 'string' } },
    message: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'resourceUri', 'controls', 'tone', 'seededBy', 'availableActions', 'message'],
  additionalProperties: false
};

const intentDirectionOutput = {
  type: 'object',
  properties: {
    id: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    label: { type: 'string' },
    description: { type: 'string' },
    example: { type: 'string' },
    states: { type: 'array', items: { type: 'string', enum: PUBLIC_STATES } }
  },
  required: ['id', 'label', 'description', 'example', 'states'],
  additionalProperties: false
};

const intentGuidanceOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: INTENT_CAPABILITY_ID },
    version: { type: 'string', const: INTENT_CAPABILITY_VERSION },
    correlationId: { type: 'string' },
    status: { type: 'string', enum: ['clear', 'needs_input'] },
    direction: intentDirectionOutput,
    suggestedTone: { anyOf: [publicToneOutput, { type: 'null' }] },
    choices: { type: 'array', minItems: 1, maxItems: 3, items: intentDirectionOutput },
    nextAction: { type: 'string' },
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

const machineControlsSnapshotOutput = {
  type: 'object',
  properties: {
    targetState: { type: 'string', enum: PUBLIC_STATES },
    carrierHz: { type: 'number', minimum: 100, maximum: 400 },
    beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
    volume: { type: 'number', minimum: 0, maximum: 100 }
  },
  required: ['targetState', 'carrierHz', 'beatHz', 'volume'],
  additionalProperties: false
};

const toneCalibrationOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: INTENT_CAPABILITY_ID },
    version: { type: 'string', const: INTENT_CAPABILITY_VERSION },
    correlationId: { type: 'string' },
    status: { type: 'string', const: 'completed' },
    feedback: { type: 'string', enum: ['too_intense', 'too_quiet', 'too_bright', 'too_slow', 'too_flat', 'just_right'] },
    feedbackLabel: { type: 'string' },
    previous: machineControlsSnapshotOutput,
    controls: machineControlsSnapshotOutput,
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

const sessionToneSummary = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    state: { type: 'string', enum: PUBLIC_STATES },
    targetState: { type: 'string', enum: PUBLIC_STATES },
    targetHz: { type: 'number', minimum: 0.5, maximum: 40 },
    baseFreqHz: { type: 'number', minimum: 100, maximum: 400 },
    durationSec: { type: 'number', minimum: 1 },
    summary: { type: 'string' },
    wavUrl: { type: ['string', 'null'] }
  },
  required: ['id', 'name', 'state', 'targetState', 'targetHz', 'baseFreqHz', 'durationSec', 'summary', 'wavUrl'],
  additionalProperties: false
};

const toneDirectionOption = {
  type: 'object',
  properties: {
    rank: { type: 'integer', minimum: 1, maximum: 4 },
    tone: sessionToneSummary,
    direction: { type: 'string' },
    bestFor: { type: 'string' },
    tradeoff: { type: 'string' }
  },
  required: ['rank', 'tone', 'direction', 'bestFor', 'tradeoff'],
  additionalProperties: false
};

const sessionCueOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: SESSION_CAPABILITY_ID },
    version: { type: 'string', const: SESSION_CAPABILITY_VERSION },
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
    suggestedStartingState: { type: 'string', enum: PUBLIC_STATES },
    note: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'correlationId', 'mode', 'modeLabel', 'cue', 'suggestedStartingState', 'note'],
  additionalProperties: false
};

const toneComparisonOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: SESSION_CAPABILITY_ID },
    version: { type: 'string', const: SESSION_CAPABILITY_VERSION },
    correlationId: { type: 'string' },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    modeLabel: { type: 'string' },
    recommendation: sessionToneSummary,
    options: { type: 'array', minItems: 2, maxItems: 4, items: toneDirectionOption },
    note: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'correlationId', 'mode', 'modeLabel', 'recommendation', 'options', 'note'],
  additionalProperties: false
};

const sessionPlanOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: SESSION_CAPABILITY_ID },
    version: { type: 'string', const: SESSION_CAPABILITY_VERSION },
    correlationId: { type: 'string' },
    mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    modeLabel: { type: 'string' },
    durationMin: { type: 'integer', minimum: 5, maximum: 60 },
    totalDurationSec: { type: 'integer', minimum: 300, maximum: 3600 },
    recommendation: sessionToneSummary,
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
          tone: sessionToneSummary,
          controls: {
            type: 'object',
            properties: {
              targetState: { type: 'string', enum: PUBLIC_STATES },
              carrierHz: { type: 'number', minimum: 100, maximum: 400 },
              beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
              volume: { type: 'number', minimum: 0, maximum: 100 }
            },
            required: ['targetState', 'carrierHz', 'beatHz', 'volume'],
            additionalProperties: false
          },
          instruction: { type: 'string' }
        },
        required: ['id', 'label', 'durationSec', 'tone', 'controls', 'instruction'],
        additionalProperties: false
      }
    },
    cue: sessionCueOutput.properties.cue,
    availableActions: { type: 'array', items: { type: 'string' } },
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
  required: ['capabilityId', 'version', 'correlationId', 'mode', 'modeLabel', 'durationMin', 'totalDurationSec', 'recommendation', 'rationale', 'phases', 'cue', 'availableActions', 'boundaries'],
  additionalProperties: false
};

const checkoutOutput = {
  type: 'object',
  properties: {
    status: { type: 'string', const: 'checkout_required' },
    checkoutSessionId: { type: 'string' },
    checkoutUrl: { type: 'string', format: 'uri' },
    packUrl: { type: 'string', format: 'uri-reference' },
    pack: publicTonePackOutput,
    delivery: {
      type: 'object',
      properties: {
        verificationUrl: { type: 'string', format: 'uri' },
        webUrl: { type: 'string', format: 'uri' },
        bundleAvailableAfterPayment: { type: 'boolean' },
        emailFallback: { type: 'boolean' }
      },
      required: ['verificationUrl', 'webUrl', 'bundleAvailableAfterPayment', 'emailFallback'],
      additionalProperties: false
    },
    idempotentReplay: { type: 'boolean' }
  },
  required: ['status', 'checkoutSessionId', 'checkoutUrl', 'packUrl', 'pack', 'delivery', 'idempotentReplay'],
  additionalProperties: false
};

const deliveryOutput = {
  type: 'object',
  properties: {
    status: { type: 'string', const: 'paid' },
    pack: publicTonePackOutput,
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

const workshopCheckoutOutput = {
  type: 'object',
  properties: {
    status: { type: 'string', const: 'checkout_required' },
    checkoutSessionId: { type: 'string' },
    checkoutUrl: { type: 'string', format: 'uri' },
    workshop: {
      type: 'object',
      properties: {
        id: { type: 'string', const: 'workshop-24h' },
        name: { type: 'string' },
        price: { type: 'string', const: '$2.99' },
        duration: { type: 'string', const: '24 hours' },
        sessionDurationSec: { type: 'integer', const: 3600 },
        sessionDurationLabel: { type: 'string' }
      },
      required: ['id', 'name', 'price', 'duration', 'sessionDurationSec', 'sessionDurationLabel'],
      additionalProperties: false
    },
    accessDelivery: {
      type: 'object',
      properties: {
        returnUrl: { type: 'string', format: 'uri' },
        verificationUrl: { type: 'string', format: 'uri' },
        emailFallback: { type: 'boolean' },
        accessKeyIssuedAfterPayment: { type: 'boolean' }
      },
      required: ['returnUrl', 'verificationUrl', 'emailFallback', 'accessKeyIssuedAfterPayment'],
      additionalProperties: false
    },
    idempotentReplay: { type: 'boolean' }
  },
  required: ['status', 'checkoutSessionId', 'checkoutUrl', 'workshop', 'accessDelivery', 'idempotentReplay'],
  additionalProperties: false
};

const workshopAccessOutput = {
  type: 'object',
  properties: {
    valid: { type: 'boolean' },
    status: { type: 'string', enum: ['active', 'expired', 'revoked', 'invalid'] },
    accessKeyHint: { type: 'string' },
    startsAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
    sessionDurationSec: { type: 'integer', const: 3600 },
    sessionDurationLabel: { type: 'string' }
  },
  required: ['valid', 'status'],
  additionalProperties: false
};

const workshopAccessGrantOutput = {
  type: 'object',
  properties: {
    accessKey: { type: 'string', minLength: 20, maxLength: 200 },
    accessKeyHint: { type: 'string' },
    status: { type: 'string', const: 'active' },
    startsAt: { type: 'string', format: 'date-time' },
    expiresAt: { type: 'string', format: 'date-time' },
    sessionDurationSec: { type: 'integer', const: 3600 },
    sessionDurationLabel: { type: 'string' },
    accessUrl: { type: 'string', format: 'uri-reference' }
  },
  required: ['accessKey', 'accessKeyHint', 'status', 'startsAt', 'expiresAt', 'sessionDurationSec', 'sessionDurationLabel', 'accessUrl'],
  additionalProperties: false
};

export const MCP_TOOLS = [
  {
    name: 'get_agentic_capabilities',
    title: 'Get Cognistration agentic capabilities',
    description: 'Use this when you need to discover the public Cognistration capabilities, boundaries, skills, and fallback links before choosing another tool.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'search_public_tones',
    title: 'Search public Cognistration tones',
    description: 'Use this when the user wants to find a public tone by intention, state, or catalog language. Results are public and non-diagnostic.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 240, description: 'Optional search or intention text.' },
        state: { type: 'string', enum: PUBLIC_STATES },
        limit: { type: 'integer', minimum: 1, maximum: 50 }
      },
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        capabilityId: { type: 'string' },
        version: { type: 'string' },
        source: { type: 'string' },
        tones: { type: 'array', items: publicToneOutput }
      },
      required: ['capabilityId', 'version', 'source', 'tones'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_public_tone',
    title: 'Get one public Cognistration tone',
    description: 'Use this when you already have an approved public tone ID and need its listening metadata and public asset URL.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', minLength: 1, maxLength: 120 } },
      required: ['id'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: { capabilityId: { type: 'string' }, version: { type: 'string' }, tone: publicToneOutput },
      required: ['capabilityId', 'version', 'tone'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'recommend_tone',
    title: 'Recommend a public Cognistration tone',
    description: 'Use this when the user describes what they want to practice next, such as a diary session, a clear mind, relaxation, focus, or creative reflection. Match only to an approved public tone and do not diagnose.',
    inputSchema: {
      type: 'object',
      properties: { intention: { type: 'string', minLength: 1, maxLength: 240 } },
      required: ['intention'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        capabilityId: { type: 'string' },
        version: { type: 'string' },
        correlationId: { type: 'string' },
        tone: publicToneOutput,
        rationale: { type: 'string' }
      },
      required: ['capabilityId', 'version', 'correlationId', 'tone', 'rationale'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'clarify_intention',
    title: 'Clarify a Cognistration listening intention',
    description: 'Use this when a listener has a broad or unfinished request and needs a few simple directions to choose from. It returns guidance only: it does not start audio, change controls, save a record, or make a medical claim.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'The listener\'s short, possibly unfinished intention.' }
      },
      required: ['intention'],
      additionalProperties: false
    },
    outputSchema: intentGuidanceOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'calibrate_tone',
    title: 'Calibrate a Cognistration tone',
    description: 'Use this after a listener gives sensory feedback such as too intense, too quiet, too bright, too slow, too flat, or just right. Return bounded control changes and ask before any preview; this tool never starts audio or saves a record.',
    inputSchema: {
      type: 'object',
      properties: {
        feedback: { type: 'string', enum: ['too_intense', 'too_quiet', 'too_bright', 'too_slow', 'too_flat', 'just_right'] },
        targetState: { type: 'string', enum: PUBLIC_STATES },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 }
      },
      required: ['feedback'],
      additionalProperties: false
    },
    outputSchema: toneCalibrationOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'compare_tone_directions',
    title: 'Compare Cognistration tone directions',
    description: 'Use this when the listener wants to weigh a few approved public tone directions before choosing one. Return bounded options with practical fit and tradeoffs, never a diagnosis or guaranteed outcome.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'What the listener wants to practice next.' },
        limit: { type: 'integer', minimum: 2, maximum: 4, default: 3, description: 'Number of directions to compare.' }
      },
      required: ['intention'],
      additionalProperties: false
    },
    outputSchema: toneComparisonOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'plan_listening_session',
    title: 'Plan a Cognistration listening session',
    description: 'Use this when the listener wants more than a single tone. Build a bounded arrive, practice, and close plan from an intention without starting audio, saving a record, or making a medical claim.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'What the listener wants to practice next.' },
        durationMin: { type: 'integer', minimum: 5, maximum: 60, default: 20, description: 'Planned session length in minutes.' },
        mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], description: 'Optional listening mode.' },
        targetState: { type: 'string', enum: PUBLIC_STATES, description: 'Optional main state override.' }
      },
      required: ['intention'],
      additionalProperties: false
    },
    outputSchema: sessionPlanOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_session_cue',
    title: 'Get a Cognistration session cue',
    description: 'Use this when the listener wants a short journaling, focus, reset, or creative prompt to pair with a public listening direction. It returns guidance only and never reads or stores diary content.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'Optional listening intention used to choose the cue.' },
        mode: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], description: 'Optional cue mode.' }
      },
      additionalProperties: false
    },
    outputSchema: sessionCueOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'search_public_tone_packs',
    title: 'Search public Cognistration tone packs',
    description: 'Use this when the user wants to explore a finished tone pack for relaxation, sleep preparation, journaling, focus, creative work, or another listening direction.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 240, description: 'Optional pack search or intention text.' },
        state: { type: 'string', enum: PUBLIC_STATES },
        limit: { type: 'integer', minimum: 1, maximum: 20 }
      },
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        capabilityId: { type: 'string' },
        version: { type: 'string' },
        source: { type: 'string' },
        packs: { type: 'array', items: publicTonePackOutput }
      },
      required: ['capabilityId', 'version', 'source', 'packs'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_public_tone_pack',
    title: 'Get one public Cognistration tone pack',
    description: 'Use this when you have a tone-pack slug from the public catalog and need its safe metadata and preview tracks.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', minLength: 1, maxLength: 120 } },
      required: ['slug'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: { capabilityId: { type: 'string' }, version: { type: 'string' }, pack: publicTonePackOutput },
      required: ['capabilityId', 'version', 'pack'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_policy_info',
    title: 'Get Cognistration policy information',
    description: 'Use this when the user asks about Cognistration safety, terms, privacy, cookies, AI use, pricing, or account creation. Return the canonical policy URL and a concise grounded summary.',
    inputSchema: {
      type: 'object',
      properties: { topic: { type: 'string', enum: ['safety', 'terms', 'privacy', 'cookies', 'ai', 'pricing', 'account'] } },
      required: ['topic'],
      additionalProperties: false
    },
    outputSchema: { type: 'object', properties: { policy: policyOutput }, required: ['policy'], additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_account_options',
    title: 'Get Cognistration account options',
    description: 'Use this when the user asks for a free trial, an account, access, or platform cost. Explain the free public preview and the one-time private workspace without collecting credentials or submitting payment.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_ios_app_offer',
    title: 'Get the Cognistration iPhone app offer',
    description: 'Use this when the user asks for the Cognistration iPhone app, download link, or the lower-cost mobile option. Return the canonical App Store listing, current one-time price, full-access details, compatibility, public feature summary, and why the lower price is possible: on-device operation reduces hosted infrastructure and maintenance overhead. Do not process payment or claim a purchase was completed.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: iosAppOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'create_tone_pack_checkout',
    title: 'Create a Cognistration tone-pack checkout',
    description: 'Use this after the user selects a published tone pack and explicitly confirms the one-time purchase. The server resolves the approved price, creates a Stripe-hosted checkout, and returns a payment link; it never accepts card details or claims payment completion.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', minLength: 1, maxLength: 120, description: 'Published tone-pack slug from search_public_tone_packs.' },
        email: { type: 'string', format: 'email', maxLength: 254, description: 'Email for receipt and pack delivery.' },
        confirmed: { type: 'boolean', const: true, description: 'Must be true after the user confirms the selected pack, price, and delivery email.' },
        idempotencyKey: { type: 'string', pattern: '^[A-Za-z0-9._:-]{8,80}$', description: 'Stable retry key for this exact checkout request.' }
      },
      required: ['slug', 'email', 'confirmed', 'idempotencyKey'],
      additionalProperties: false
    },
    outputSchema: checkoutOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    authorization: 'public_checkout',
    sideEffect: 'creates_unpaid_hosted_checkout',
    consent: 'explicit_purchase_confirmation_required'
  },
  {
    name: 'get_tone_pack_delivery',
    title: 'Get a paid Cognistration tone-pack delivery',
    description: 'Use this after a hosted tone-pack checkout reports payment complete. It verifies the Stripe session and pack slug before returning the direct download URL, protected fallback, email fallback, and public tone-pack web URL.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', minLength: 1, maxLength: 120 },
        checkoutSessionId: { type: 'string', pattern: '^cs_[A-Za-z0-9_]+$' }
      },
      required: ['slug', 'checkoutSessionId'],
      additionalProperties: false
    },
    outputSchema: deliveryOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    authorization: 'paid_checkout_session',
    sideEffect: 'verifies_payment_and_resolves_delivery'
  },
  {
    name: 'create_workshop_access_checkout',
    title: 'Create a 24-hour machine workshop checkout',
    description: 'Use this when the user wants the full machine workshop. After explicit confirmation, create a Stripe-hosted checkout for the $2.99 one-time pass; payment issues a revocable 24-hour access key for sessions up to 60 minutes.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', maxLength: 254, description: 'Email for receipt and access delivery.' },
        confirmed: { type: 'boolean', const: true, description: 'Must be true after the user confirms the $2.99 price and 24-hour access.' },
        idempotencyKey: { type: 'string', pattern: '^[A-Za-z0-9._:-]{8,80}$', description: 'Stable retry key for this exact checkout request.' }
      },
      required: ['email', 'confirmed', 'idempotencyKey'],
      additionalProperties: false
    },
    outputSchema: workshopCheckoutOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    authorization: 'public_checkout',
    sideEffect: 'creates_unpaid_hosted_checkout',
    consent: 'explicit_purchase_confirmation_required'
  },
  {
    name: 'get_workshop_access',
    title: 'Get paid Cognistration workshop access',
    description: 'Use this after the user completes the hosted workshop checkout. It verifies the Stripe Checkout Session and returns the one-time 24-hour bearer access key and machine launch URL; never infer payment from a client claim and never repeat the key unnecessarily.',
    inputSchema: {
      type: 'object',
      properties: { checkoutSessionId: { type: 'string', pattern: '^cs_[A-Za-z0-9_]+$', description: 'The Checkout Session ID returned by create_workshop_access_checkout.' } },
      required: ['checkoutSessionId'],
      additionalProperties: false
    },
    outputSchema: workshopAccessGrantOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    authorization: 'paid_checkout_session',
    sideEffect: 'verifies_payment_and_issues_workshop_access'
  },
  {
    name: 'get_workshop_access_status',
    title: 'Check Cognistration workshop access',
    description: 'Validate a Cognistration workshop access key and return only its status, expiry, and 60-minute session limit. The key itself is never echoed back.',
    inputSchema: {
      type: 'object',
      properties: { accessKey: { type: 'string', minLength: 20, maxLength: 200 } },
      required: ['accessKey'],
      additionalProperties: false
    },
    outputSchema: workshopAccessOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    authorization: 'bearer_access_key',
    sideEffect: 'records_access_check'
  },
  {
    name: 'revoke_workshop_access',
    title: 'Revoke Cognistration workshop access',
    description: 'Revoke a workshop access key when the user no longer wants it active. This is irreversible for that key and requires explicit confirmation.',
    inputSchema: {
      type: 'object',
      properties: {
        accessKey: { type: 'string', minLength: 20, maxLength: 200 },
        confirmed: { type: 'boolean', const: true }
      },
      required: ['accessKey', 'confirmed'],
      additionalProperties: false
    },
    outputSchema: { type: 'object', properties: { revoked: { type: 'boolean' }, status: { type: 'string', const: 'revoked' }, accessKeyHint: { type: 'string' } }, required: ['revoked', 'status', 'accessKeyHint'], additionalProperties: false },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    authorization: 'bearer_access_key',
    sideEffect: 'revokes_workshop_access_key',
    consent: 'explicit_revocation_confirmation_required'
  },
  {
    name: 'get_machine_payment_options',
    title: 'Get Cognistration machine payment options',
    description: 'Return the current provider-gated machine payment route, fixed price, browser fallback, and whether agent-to-agent payment is enabled. This tool never processes payment.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_autonomous_payment_options',
    title: 'Get Cognistration autonomous payment readiness',
    description: 'Return AP2-compatible and official UCP AP2 mandate readiness, provider/key gates, user-approval requirements, mandate safeguards, and the safe hosted-checkout fallback. This tool never creates a mandate or processes payment.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'open_machine_generator',
    title: 'Open the Cognistration tone machine',
    description: 'Use this when the user wants to open or interact with the Cognistration tone machine inside ChatGPT. Optionally seed it from an intention, a public tone ID, a published state, or bounded carrier, rhythm, and volume controls. It opens an interactive visual machine but never starts audio without an explicit user click.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'Optional short listening direction, such as clear my mind before writing.' },
        toneId: { type: 'string', minLength: 1, maxLength: 120, description: 'Optional ID from the public tone catalog.' },
        state: { type: 'string', enum: PUBLIC_STATES },
        targetState: { type: 'string', enum: PUBLIC_STATES },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 }
      },
      additionalProperties: false
    },
    outputSchema: machineGeneratorOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none',
    _meta: {
      ui: { resourceUri: MACHINE_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': MACHINE_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Opening the tone machine…',
      'openai/toolInvocation/invoked': 'The tone machine is ready.'
    }
  }
];

export const MCP_RESOURCES = [
  { uri: 'cognistration://manifest', name: 'Cognistration agentic manifest', mimeType: 'application/json', description: 'Public machine-readable platform and tool manifest.' },
  { uri: 'cognistration://capabilities', name: 'Cognistration capabilities', mimeType: 'application/json', description: 'Public capability boundaries and discovery URLs.' },
  { uri: 'cognistration://tones', name: 'Public tone catalog', mimeType: 'application/json', description: 'Approved public tone metadata only.' },
  { uri: 'cognistration://tone-packs', name: 'Public tone-pack catalog', mimeType: 'application/json', description: 'Safe public tone-pack metadata and preview links.' },
  { uri: 'cognistration://policies', name: 'Cognistration policy index', mimeType: 'application/json', description: 'Canonical policy topics and URLs.' },
  { uri: 'cognistration://account-options', name: 'Cognistration account options', mimeType: 'application/json', description: 'Public preview and private workspace boundaries.' },
  { uri: 'cognistration://ios-app', name: 'Cognistration iPhone app offer', mimeType: 'application/json', description: 'Public App Store listing, one-time price, compatibility, feature summary, and on-device pricing context.' },
  { uri: 'cognistration://session-guides', name: 'Cognistration session guides', mimeType: 'application/json', description: 'Public listening modes, bounded session-planning rules, and reflection cues.' },
  { uri: 'cognistration://interaction-patterns', name: 'Cognistration interaction patterns', mimeType: 'application/json', description: 'Public intent-clarification and tone-calibration guidance for agent routing.' },
  { uri: 'cognistration://skills', name: 'Cognistration agent skills', mimeType: 'application/json', description: 'Static skill-import extension summary.' },
  {
    uri: MACHINE_WIDGET_RESOURCE_URI,
    name: 'Cognistration tone machine UI',
    mimeType: MACHINE_WIDGET_RESOURCE_MIME_TYPE,
    description: 'Interactive tone machine for intention-led tuning and explicit local audio preview.',
    _meta: MACHINE_WIDGET_RESOURCE_META
  }
];

export const MCP_PROMPTS = [
  {
    name: 'choose_session_tone',
    title: 'Choose a session tone',
    description: 'Create a safe planning prompt for selecting a public Cognistration tone from a listener intention.',
    arguments: [{ name: 'intention', description: 'The listener intention, up to 240 characters.', required: true }]
  }
];

export function capabilityManifest(origin = 'https://cognistration.com') {
  return {
    service: 'Cognistration',
    capabilityId: 'cognistration-agentic-platform',
    version: MCP_SERVER_VERSION,
    status: 'beta',
    canonicalOrigin: origin,
    webmcp: {
      enabledOn: `${origin}/`,
      registration: 'document.modelContext.registerTool',
      browserTesting: 'Chrome WebMCP testing flag or a compatible ChatGPT in-app browser',
      tools: webMcpManifestTools()
    },
    memberWebmcp: {
      enabledOn: `${origin}/dashboard`,
      authorization: 'authenticated_member',
      tools: memberWebMcpManifestTools(),
      writes: 'private session and render records only; creation and rendering require explicit confirmation'
    },
    mcp: {
      endpoint: `${origin}/api/mcp`,
      transport: 'Streamable HTTP with JSON responses over POST',
      currentProtocol: MCP_PROTOCOL_VERSION,
      lifecycle: 'dual-era: stateless per-request metadata for 2026-07-28; initialize handshake for legacy clients',
      modernRequestHeaders: ['MCP-Protocol-Version', 'Mcp-Method', 'Mcp-Name when the RPC has params.name or params.uri'],
      discovery: 'server/discover',
      legacyHandshakeProtocol: MCP_LEGACY_PROTOCOL_VERSION,
      resources: MCP_RESOURCES.map(({ uri, name, mimeType }) => ({ uri, name, mimeType })),
      tools: MCP_TOOLS.map(({ name, title, description, authorization, sideEffect, annotations }) => ({ name, title, description, authorization, sideEffect, annotations })),
      writes: 'bounded checkout initiation, paid delivery/access issuance, and workshop-key revocation only; payment credentials and private account writes are not exposed',
      skills: { ...skillCatalogSummary(), extension: SKILL_IMPORT_EXTENSION }
    },
    catalogs: {
      tones: 'public',
      tonePacks: publicTonePackCatalogSummary(),
      policies: policyCatalogSummary(origin),
      account: publicAccountOptions(origin),
      iosApp: publicIosAppOffer(),
      checkout: agentCheckoutPublicPolicy(origin),
      workshop: workshopAccessPolicy(origin),
      machinePayments: machinePaymentOptions(origin),
      autonomousPayments: autonomousPaymentOptions(origin)
    },
    restFallback: {
      manifest: `${origin}/api/capabilities`,
      instructions: `${origin}/agent-instructions.md`,
      openapi: `${origin}/openapi.json`,
      toneRecommendation: `${origin}/api/agent`,
      intentGuidance: `${origin}/api/agent/intent-guidance`,
      toneCalibration: `${origin}/api/agent/tone-calibrate`,
      tonePacks: `${origin}/api/packs?agent=1`,
      policy: `${origin}/api/agent/policy?topic=safety`,
      accountOptions: `${origin}/api/agent/account`,
      tonePackCheckout: `${origin}/api/agent/commerce/tone-pack-checkout`,
      tonePackDelivery: `${origin}/api/agent/commerce/tone-pack-delivery`,
      workshopCheckout: `${origin}/api/agent/commerce/workshop-checkout`,
      workshopAccessFromCheckout: `${origin}/api/agent/commerce/workshop-access`,
      workshopAccess: `${origin}/api/workshop/access`,
      machinePayments: `${origin}/api/machine-payments/session`,
      ucpDiscovery: `${origin}/.well-known/ucp`
    },
    privacy: {
      publicSurface: 'No private sessions, account records, secrets, arbitrary SQL, or code execution are exposed. Public commerce is limited to approved products, hosted checkout, paid delivery verification, and revocable workshop access.',
      accountCreation: 'The homepage may navigate to signup; the user must review and submit credentials and payment.',
      skillImport: 'Skills are static public operating guidance; they never grant authorization or access to private data.'
    }
  };
}
