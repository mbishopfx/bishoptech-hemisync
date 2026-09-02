import {
  ACCOUNT_SIGNUP_CAPABILITY_ID,
  ACCOUNT_SIGNUP_CAPABILITY_VERSION,
  publicAccountOptions
} from './account-capability.js';
import {
  IOS_APP_CAPABILITY_ID,
  IOS_APP_CAPABILITY_VERSION,
  IOS_APP_STORE_URL,
  publicIosAppOffer
} from './ios-capability.js';
import {
  IOS_APP_WIDGET_RESOURCE_META,
  IOS_APP_WIDGET_RESOURCE_MIME_TYPE,
  IOS_APP_WIDGET_RESOURCE_URI
} from './ios-widget.js';
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
import {
  MACHINE_CONTROL_CAPABILITY_ID,
  MACHINE_CONTROL_CAPABILITY_VERSION
} from './machine-control-capability.js';
import {
  ACCOUNT_SIGNUP_WIDGET_RESOURCE_META,
  ACCOUNT_SIGNUP_WIDGET_RESOURCE_MIME_TYPE,
  ACCOUNT_SIGNUP_WIDGET_RESOURCE_URI
} from './account-widget.js';
import {
  FEEDBACK_CAPABILITY_ID,
  FEEDBACK_CAPABILITY_VERSION
} from './feedback-capability.js';
import {
  FEEDBACK_WIDGET_RESOURCE_META,
  FEEDBACK_WIDGET_RESOURCE_MIME_TYPE,
  FEEDBACK_WIDGET_RESOURCE_URI
} from './feedback-widget.js';
import {
  SCIENCE_GUIDE_BACKGROUND_URL,
  SCIENCE_GUIDE_RESOURCE_MIME_TYPE,
  SCIENCE_GUIDE_RESOURCE_URI
} from './science-content.js';
import { SCIENCE_GUIDE_CAPABILITY_ID, SCIENCE_GUIDE_CAPABILITY_VERSION } from './science-capability.js';
import { SCIENCE_GUIDE_WIDGET_RESOURCE_META } from './science-widget.js';
import {
  PHONE_DOWNLOAD_CAPABILITY_ID,
  PHONE_DOWNLOAD_CAPABILITY_VERSION,
  PHONE_DOWNLOAD_WIDGET_RESOURCE_MIME_TYPE,
  PHONE_DOWNLOAD_WIDGET_RESOURCE_URI
} from './phone-download.js';
import { PHONE_DOWNLOAD_WIDGET_RESOURCE_META } from './phone-download-widget.js';
import {
  TONE_PACK_CHECKOUT_WIDGET_RESOURCE_META,
  TONE_PACK_CHECKOUT_WIDGET_RESOURCE_MIME_TYPE,
  TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI
} from './tone-pack-widget.js';
import { agentCheckoutPublicPolicy } from '../commerce/agent-checkout.mjs';
import { autonomousPaymentOptions } from '../commerce/ap2.mjs';
import { machinePaymentOptions } from '../commerce/machine-payments.mjs';
import { tonePackPaymentOptions } from '../commerce/tone-pack-machine-payment.mjs';
import { workshopAccessPolicy } from '../commerce/workshop-access.mjs';
import { SESSION_SCORE_CAPABILITY_ID, SESSION_SCORE_CAPABILITY_VERSION } from './session-score-capability.js';

export const MCP_SERVER_NAME = 'cognistration-agentic-platform';
export const MCP_SERVER_VERSION = '0.14.0';
export const MCP_PROTOCOL_VERSION = '2026-07-28';
export const MCP_LEGACY_PROTOCOL_VERSION = '2025-11-25';
export const MCP_SUPPORTED_LEGACY_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26'];

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

const sessionScoreStageInput = {
  type: 'object',
  properties: {
    id: { type: 'string', minLength: 1, maxLength: 48, pattern: '^[a-z0-9][a-z0-9-]*$' },
    label: { type: 'string', minLength: 1, maxLength: 48 },
    state: { type: 'string', enum: PUBLIC_STATES },
    durationSec: { type: 'integer', minimum: 15, maximum: 3600 },
    carrierHz: { type: 'integer', minimum: 50, maximum: 2000, description: 'Constant carrier frequency for this stage.' },
    beatHz: { type: 'object', properties: { from: { type: 'number', minimum: 0.1, maximum: 40, multipleOf: 0.1 }, to: { type: 'number', minimum: 0.1, maximum: 40, multipleOf: 0.1 } }, required: ['from', 'to'], additionalProperties: false },
    volume: { type: 'integer', minimum: 0, maximum: 100 }
  },
  required: ['id', 'label', 'state', 'durationSec', 'carrierHz', 'beatHz', 'volume'], additionalProperties: false
};

const sessionScoreSoundInput = {
  type: 'object',
  properties: {
    entrainmentModes: { type: 'object', properties: { binaural: { type: 'boolean', default: true }, monaural: { type: 'boolean', default: false }, isochronic: { type: 'boolean', default: false } }, additionalProperties: false, description: 'Choose one or more signal modes.' },
    background: { type: 'object', properties: { type: { type: 'string', enum: ['none', 'ocean', 'asset'] }, assetId: { type: 'string', enum: ['lumina', 'mindsEyes', 'nattkatt', 'papa', 'scatter'] }, mixDb: { type: 'number', minimum: -60, maximum: -6 }, crossfadeSec: { type: 'number', minimum: 0, maximum: 10 } }, required: ['type'], additionalProperties: false, description: 'Approved ambience metadata; public preview stays signal-only.' },
    breathGuide: { type: 'object', properties: { enabled: { type: 'boolean' }, pattern: { type: 'string', enum: ['coherent-5.5', '4-7-8', 'box'] }, bpm: { type: 'number', minimum: 2, maximum: 12 } }, additionalProperties: false },
    fades: { type: 'object', properties: { inSec: { type: 'number', minimum: 0, maximum: 60 }, outSec: { type: 'number', minimum: 0, maximum: 60 } }, additionalProperties: false }
  },
  additionalProperties: false
};

const sessionScoreInput = {
  type: 'object',
  properties: { durationSec: { type: 'integer', minimum: 60, maximum: 3600 }, stages: { type: 'array', minItems: 1, maxItems: 12, items: sessionScoreStageInput }, sound: sessionScoreSoundInput },
  required: ['durationSec', 'stages'], additionalProperties: false
};

const sessionScoreStageOutput = {
  type: 'object',
  properties: {
    ...sessionScoreStageInput.properties,
    carrierBehavior: { type: 'string', const: 'constant-within-stage' },
    beatBehavior: { type: 'string', enum: ['constant', 'linear-within-stage'] }
  },
  required: [...sessionScoreStageInput.required, 'carrierBehavior', 'beatBehavior'],
  additionalProperties: false
};

const sessionScoreOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: SESSION_SCORE_CAPABILITY_ID },
    version: { type: 'string', const: SESSION_SCORE_CAPABILITY_VERSION },
    correlationId: { type: 'string' },
    status: { type: 'string', const: 'completed' },
    engine: { type: 'string', const: 'browser-signal-score' },
    direction: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] },
    durationSec: { type: 'integer', minimum: 60, maximum: 3600 },
    sound: sessionScoreSoundInput,
    stages: { type: 'array', minItems: 1, maxItems: 12, items: sessionScoreStageOutput },
    preview: {
      type: 'object',
      properties: {
        maxDurationSec: { type: 'integer', const: 120 },
        requiresExplicitConfirmation: { type: 'boolean', const: true },
        audioReadyRequired: { type: 'boolean', const: true },
        fullScoreRendered: { type: 'boolean', const: false }
      },
      required: ['maxDurationSec', 'requiresExplicitConfirmation', 'audioReadyRequired', 'fullScoreRendered'],
      additionalProperties: false
    },
    boundaries: {
      type: 'object',
      properties: {
        browserLocal: { type: 'boolean', const: true },
        persisted: { type: 'boolean', const: false },
        rendered: { type: 'boolean', const: false },
        audioStarted: { type: 'boolean', const: false },
        medicalGuidance: { type: 'boolean', const: false }
      },
      required: ['browserLocal', 'persisted', 'rendered', 'audioStarted', 'medicalGuidance'],
      additionalProperties: false
    }
  },
  required: ['capabilityId', 'version', 'correlationId', 'status', 'engine', 'durationSec', 'sound', 'stages', 'preview', 'boundaries'],
  additionalProperties: false
};

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

const phoneDownloadOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: PHONE_DOWNLOAD_CAPABILITY_ID },
    version: { type: 'string', const: PHONE_DOWNLOAD_CAPABILITY_VERSION },
    resourceUri: { type: 'string', const: PHONE_DOWNLOAD_WIDGET_RESOURCE_URI },
    resourceMimeType: { type: 'string', const: PHONE_DOWNLOAD_WIDGET_RESOURCE_MIME_TYPE },
    status: { type: 'string', const: 'ready' },
    seededBy: { type: 'string', enum: ['listener-input', 'balanced-start'] },
    tone: {
      anyOf: [{
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          state: { type: 'string', enum: PUBLIC_STATES },
          targetHz: { type: 'number' },
          baseFreqHz: { type: 'number' },
          durationSec: { type: 'number' },
          summary: { type: 'string' }
        },
        required: ['id', 'name', 'state', 'targetHz', 'baseFreqHz', 'durationSec', 'summary'],
        additionalProperties: false
      }, { type: 'null' }]
    },
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
    phonePreview: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['enabled', 'provider_access_required'] },
        protocol: { type: 'string' },
        price: { type: 'string', const: '$0.50' },
        amountCents: { type: 'integer', const: 50 },
        currency: { type: 'string', const: 'usd' },
        endpoint: { type: 'string', format: 'uri' },
        requiresAccount: { type: 'boolean', const: false },
        requiresExplicitConfirmation: { type: 'boolean', const: true },
        browserFallback: { type: 'string', format: 'uri' },
        message: { type: 'string' }
      },
      required: ['status', 'protocol', 'price', 'amountCents', 'currency', 'endpoint', 'requiresAccount', 'requiresExplicitConfirmation', 'browserFallback', 'message'],
      additionalProperties: false
    },
    iosApp: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        price: { type: 'string', const: '$2.99' },
        billingMode: { type: 'string', const: 'one-time purchase' },
        requires: { type: 'string' },
        url: { type: 'string', const: IOS_APP_STORE_URL, format: 'uri' },
        features: { type: 'array', items: { type: 'string' } }
      },
      required: ['name', 'price', 'billingMode', 'requires', 'url', 'features'],
      additionalProperties: false
    },
    availableActions: { type: 'array', items: { type: 'string' } },
    message: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'resourceUri', 'controls', 'tone', 'seededBy', 'availableActions', 'message'],
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
    message: { type: 'string' },
    status: { type: 'string', const: 'safety_redirect' },
    safety: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['medical', 'crisis'] },
        route: { type: 'string', const: '/health-warning' },
        title: { type: 'string' },
        message: { type: 'string' }
      },
      required: ['category', 'route', 'title', 'message'],
      additionalProperties: false
    },
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
  required: ['capabilityId', 'version', 'resourceUri', 'controls', 'tone', 'seededBy', 'availableActions', 'message'],
  additionalProperties: false
};

const machineControlPatchOutput = {
  type: 'object',
  properties: {
    targetState: { type: 'string', enum: PUBLIC_STATES },
    carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
    beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
    volume: { type: 'integer', minimum: 0, maximum: 100 }
  },
  additionalProperties: false
};

const machineAdjustmentOutput = {
  type: 'object',
  properties: {
    control: { type: 'string', enum: ['carrier', 'rhythm', 'volume'] },
    field: { type: 'string', enum: ['carrierHz', 'beatHz', 'volume'] },
    direction: { type: 'string', enum: ['smaller', 'larger', 'slower', 'faster', 'quieter', 'louder'] },
    step: { type: 'number', minimum: 0.5, maximum: 50 },
    delta: { type: 'number' },
    previousValue: { type: 'number' },
    nextValue: { type: 'number' },
    clamped: { type: 'boolean' }
  },
  required: ['control', 'field', 'direction', 'step', 'delta'],
  additionalProperties: false
};

const machineControlOperationOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: MACHINE_CONTROL_CAPABILITY_ID },
    version: { type: 'string', const: MACHINE_CONTROL_CAPABILITY_VERSION },
    resourceUri: { type: 'string', const: MACHINE_WIDGET_RESOURCE_URI },
    status: { type: 'string', enum: ['completed', 'requested'] },
    controlPatch: machineControlPatchOutput,
    adjustment: machineAdjustmentOutput,
    controls: machineControlsOutput,
    audioAction: { type: 'string', enum: ['start', 'stop'] },
    displayAction: { type: 'string', const: 'fullscreen' },
    playbackPreserved: { type: 'boolean' },
    requiresUserGesture: { type: 'boolean' },
    audioReady: { type: 'boolean' },
    audioVerification: { type: 'string', enum: ['pending', 'confirmed'] },
    message: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'resourceUri', 'status', 'message'],
  additionalProperties: false
};

const machineControlContractOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: MACHINE_CONTROL_CAPABILITY_ID },
    version: { type: 'string', const: MACHINE_CONTROL_CAPABILITY_VERSION },
    bounds: { type: 'object' },
    defaults: { type: 'object' },
    defaultSteps: { type: 'object' },
    directionMap: { type: 'object' },
    liveBehavior: { type: 'string' },
    audioBoundary: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'bounds', 'defaults', 'defaultSteps', 'directionMap', 'liveBehavior', 'audioBoundary'],
  additionalProperties: false
};

const MACHINE_WIDGET_TOOL_META = {
  ui: { resourceUri: MACHINE_WIDGET_RESOURCE_URI, visibility: ['model', 'app'] },
  'openai/outputTemplate': MACHINE_WIDGET_RESOURCE_URI,
  'openai/widgetAccessible': true
};

const scienceGuideOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: SCIENCE_GUIDE_CAPABILITY_ID },
    version: { type: 'string', const: SCIENCE_GUIDE_CAPABILITY_VERSION },
    resourceUri: { type: 'string', const: SCIENCE_GUIDE_RESOURCE_URI },
    resourceMimeType: { type: 'string', const: SCIENCE_GUIDE_RESOURCE_MIME_TYPE },
    status: { type: 'string', const: 'ready' },
    controls: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: PUBLIC_STATES },
        carrierHz: { type: 'number', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'number', minimum: 0, maximum: 100 },
        isPlaying: { type: 'boolean', const: false }
      },
      required: ['targetState', 'carrierHz', 'beatHz', 'volume', 'isPlaying'],
      additionalProperties: false
    },
    tone: { anyOf: [publicToneOutput, { type: 'null' }] },
    intentionLabel: { type: ['string', 'null'], enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis', null] },
    background: {
      type: 'object',
      properties: {
        url: { type: 'string', const: SCIENCE_GUIDE_BACKGROUND_URL, format: 'uri' },
        label: { type: 'string' }
      },
      required: ['url', 'label'],
      additionalProperties: false
    },
    slides: { type: 'array', minItems: 7, items: { type: 'object' } },
    sources: { type: 'array', minItems: 5, items: { type: 'object' } },
    boundaries: {
      type: 'object',
      properties: {
        audioStarted: { type: 'boolean', const: false },
        recordSaved: { type: 'boolean', const: false },
        diaryContentIncluded: { type: 'boolean', const: false },
        medicalGuidance: { type: 'boolean', const: false },
        diagnosticClaim: { type: 'boolean', const: false }
      },
      required: ['audioStarted', 'recordSaved', 'diaryContentIncluded', 'medicalGuidance', 'diagnosticClaim'],
      additionalProperties: false
    },
    message: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'resourceUri', 'resourceMimeType', 'status', 'controls', 'tone', 'intentionLabel', 'background', 'slides', 'sources', 'boundaries', 'message'],
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

const safetyRedirectOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string' },
    version: { type: 'string' },
    correlationId: { type: 'string' },
    status: { type: 'string', const: 'safety_redirect' },
    safety: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['medical', 'crisis'] },
        route: { type: 'string', const: '/health-warning' },
        title: { type: 'string' },
        message: { type: 'string' }
      },
      required: ['category', 'route', 'title', 'message'],
      additionalProperties: false
    },
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
  required: ['capabilityId', 'version', 'correlationId', 'status', 'safety', 'nextAction', 'boundaries'],
  additionalProperties: false
};

const intentGuidanceResultOutput = {
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

const intentGuidanceOutput = { anyOf: [intentGuidanceResultOutput, safetyRedirectOutput] };

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

const sessionCueResultOutput = {
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

const sessionCueOutput = { anyOf: [sessionCueResultOutput, safetyRedirectOutput] };

const toneComparisonResultOutput = {
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

const toneComparisonOutput = { anyOf: [toneComparisonResultOutput, safetyRedirectOutput] };

const sessionPlanResultOutput = {
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
    cue: sessionCueResultOutput.properties.cue,
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

const sessionPlanOutput = { anyOf: [sessionPlanResultOutput, safetyRedirectOutput] };

const sessionRecipeOutput = {
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
        targetState: { type: 'string', enum: PUBLIC_STATES },
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

const accountSignupOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: ACCOUNT_SIGNUP_CAPABILITY_ID },
    version: { type: 'string', const: ACCOUNT_SIGNUP_CAPABILITY_VERSION },
    resourceUri: { type: 'string', const: ACCOUNT_SIGNUP_WIDGET_RESOURCE_URI },
    status: { type: 'string', const: 'ready' },
    userSubmissionRequired: { type: 'boolean', const: true },
    credentialsSubmitted: { type: 'boolean', const: false },
    paymentSubmitted: { type: 'boolean', const: false },
    availableActions: { type: 'array', items: { type: 'string' } },
    message: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'resourceUri', 'status', 'userSubmissionRequired', 'credentialsSubmitted', 'paymentSubmitted', 'availableActions', 'message'],
  additionalProperties: false
};

const feedbackOpenOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: FEEDBACK_CAPABILITY_ID },
    version: { type: 'string', const: FEEDBACK_CAPABILITY_VERSION },
    resourceUri: { type: 'string', const: FEEDBACK_WIDGET_RESOURCE_URI },
    status: { type: 'string', const: 'ready' },
    userSubmissionRequired: { type: 'boolean', const: true },
    persisted: { type: 'boolean', const: false },
    availableActions: { type: 'array', items: { type: 'string' } },
    message: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'resourceUri', 'status', 'userSubmissionRequired', 'persisted', 'availableActions', 'message'],
  additionalProperties: false
};

const tonePackCheckoutOpenOutput = {
  type: 'object',
  properties: {
    capabilityId: { type: 'string', const: 'cognistration-tone-pack-checkout' },
    version: { type: 'string', const: '0.1.0' },
    resourceUri: { type: 'string', const: TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI },
    status: { type: 'string', const: 'ready' },
    selectedPack: publicTonePackOutput,
    userSubmissionRequired: { type: 'boolean', const: true },
    credentialsSubmitted: { type: 'boolean', const: false },
    paymentSubmitted: { type: 'boolean', const: false },
    availableActions: { type: 'array', items: { type: 'string' } },
    message: { type: 'string' }
  },
  required: ['capabilityId', 'version', 'resourceUri', 'status', 'selectedPack', 'userSubmissionRequired', 'credentialsSubmitted', 'paymentSubmitted', 'availableActions', 'message'],
  additionalProperties: false
};

export const MCP_TOOLS = [
  {
    name: 'get_agentic_capabilities',
    title: 'Get Cognistration agentic capabilities',
    description: 'Public capability discovery for selecting Cognistration tools, boundaries, skills, and fallback links.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'compose_session_score',
    title: 'Compose a Cognistration Session Score',
    description: 'Validate or deterministically compose a public full-spectrum score with up to twelve stages, constant 50–2,000 Hz carriers, 0.1–40 Hz differential paths, selectable signal modes, breath pacing, approved ambience metadata, and fades. This read-only tool never saves, renders, or starts audio.',
    inputSchema: {
      type: 'object',
      properties: {
        intention: { type: 'string', minLength: 1, maxLength: 240, description: 'Used for safe deterministic direction selection and never copied into output.' },
        direction: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], default: 'focus' },
        durationSec: { type: 'integer', minimum: 60, maximum: 3600, default: 600 },
        score: sessionScoreInput,
        sound: sessionScoreSoundInput
      },
      additionalProperties: false
    },
    outputSchema: {
      anyOf: [
        sessionScoreOutput,
        safetyRedirectOutput
      ]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'search_public_tones',
    title: 'Search public Cognistration tones',
    description: 'Public tone catalog search by intention, state, or catalog language. Results are public and non-diagnostic.',
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
    description: 'Public metadata lookup for an approved tone ID, including listening metadata and its public asset URL.',
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
    description: 'Non-diagnostic matching of a short listening intention, such as relaxation, focus, or creative reflection, to one approved public tone.',
    inputSchema: {
      type: 'object',
      properties: { intention: { type: 'string', minLength: 1, maxLength: 240 } },
      required: ['intention'],
      additionalProperties: false
    },
    outputSchema: {
      anyOf: [
        {
          type: 'object',
          properties: {
            capabilityId: { type: 'string' },
            version: { type: 'string' },
            correlationId: { type: 'string' },
            status: { type: 'string', const: 'completed' },
            tone: publicToneOutput,
            rationale: { type: 'string' }
          },
          required: ['capabilityId', 'version', 'correlationId', 'status', 'tone', 'rationale'],
          additionalProperties: false
        },
        {
          type: 'object',
          properties: {
            capabilityId: { type: 'string' },
            version: { type: 'string' },
            correlationId: { type: 'string' },
            status: { type: 'string', const: 'safety_redirect' },
            tone: { type: 'null' },
            rationale: { type: 'string' },
            safety: safetyRedirectOutput.properties.safety,
            nextAction: { type: 'string' },
            boundaries: safetyRedirectOutput.properties.boundaries
          },
          required: ['capabilityId', 'version', 'correlationId', 'status', 'tone', 'rationale', 'safety', 'nextAction', 'boundaries'],
          additionalProperties: false
        }
      ]
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'clarify_intention',
    title: 'Clarify a Cognistration listening intention',
    description: 'Guidance for a broad or unfinished listening request, returning a few simple directions without starting audio, changing controls, saving a record, or making a medical claim.',
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
    description: 'Bounded control suggestions for sensory feedback such as too intense, too quiet, too bright, too slow, too flat, or just right. The operation is audio-free and does not save a record.',
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
    description: 'Comparison of two to four approved public tone directions with practical fit and tradeoffs, without a diagnosis or guaranteed outcome.',
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
    description: 'Bounded arrive, practice, and close planning for a listener who wants more than a single tone. The operation does not start audio, save a record, or make a medical claim.',
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
    description: 'Short journaling, focus, reset, or creative cue paired with a public listening direction. The operation returns guidance only and never reads or stores diary content.',
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
    name: 'prepare_session_recipe',
    title: 'Prepare a Cognistration session recipe',
    description: 'Prepare a portable recipe containing only a safe intention label, state, carrier, beat, volume, and duration. It never includes diary text, account data, audio, or payment credentials.',
    inputSchema: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: PUBLIC_STATES, default: 'theta' },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400, default: 200 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40, default: 6 },
        volume: { type: 'integer', minimum: 0, maximum: 100, default: 72 },
        durationSec: { type: 'integer', minimum: 60, maximum: 3600, default: 120 },
        intentionLabel: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'], default: 'reflect', description: 'Safe direction label, not diary text.' }
      },
      additionalProperties: false
    },
    outputSchema: sessionRecipeOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'search_public_tone_packs',
    title: 'Search public Cognistration tone packs',
    description: 'Public finished tone-pack search for relaxation, sleep preparation, journaling, focus, creative work, or another listening direction.',
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
    description: 'Public metadata and preview-track lookup for a tone-pack slug from the approved catalog.',
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
    description: 'Canonical Cognistration policy lookup for safety, terms, privacy, cookies, AI use, pricing, or account creation, with a grounded summary and URL.',
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
    description: 'Account and access overview covering the free public preview and one-time private workspace. It collects no credentials, submits no payment, and pairs with open_account_signup for the user-controlled in-platform form.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'open_account_signup',
    title: 'Open the Cognistration account form',
    description: 'In-platform account form for a listener who has chosen to create an account. Credentials are entered and submitted directly by the user inside the widget; they are not MCP arguments, and checkout remains separate and user-reviewed.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: accountSignupOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, untrustedContentHint: true },
    authorization: 'public_read',
    sideEffect: 'renders_in_platform_signup_form',
    consent: 'user_submission_required',
    _meta: {
      ui: { resourceUri: ACCOUNT_SIGNUP_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': ACCOUNT_SIGNUP_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      untrustedContentHint: true,
      'openai/toolInvocation/invoking': 'Opening the account form…',
      'openai/toolInvocation/invoked': 'The account form is ready.'
    }
  },
  {
    name: 'get_ios_app_offer',
    title: 'Get the Cognistration iPhone app offer',
    description: 'In-platform iPhone offer for requests about the mobile app, download link, or lower-cost option. It returns the canonical listing, one-time price, full-access details, and compatibility without processing payment or claiming a purchase.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: iosAppOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'renders_in_platform_ios_app_offer',
    _meta: {
      ui: { resourceUri: IOS_APP_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': IOS_APP_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Opening the iPhone app offer…',
      'openai/toolInvocation/invoked': 'The iPhone app offer is ready.'
    }
  },
  {
    name: 'open_phone_download_options',
    title: 'Open Cognistration phone download options',
    description: 'In-platform phone download options for a current or generated tone. The card separates the fixed $0.50 no-account agent-to-agent preview from the $2.99 one-time iPhone App Store option; it never charges, accepts payment credentials, or releases audio by itself.',
    inputSchema: {
      type: 'object',
      properties: {
        toneId: { type: 'string', minLength: 1, maxLength: 120, description: 'Optional approved public tone ID from the active generation.' },
        state: { type: 'string', enum: PUBLIC_STATES },
        targetState: { type: 'string', enum: PUBLIC_STATES },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 }
      },
      additionalProperties: false
    },
    outputSchema: phoneDownloadOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'renders_in_platform_phone_download_options',
    consent: 'explicit_payment_confirmation_required_before_agent_charge',
    _meta: {
      ui: { resourceUri: PHONE_DOWNLOAD_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': PHONE_DOWNLOAD_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Preparing phone download options…',
      'openai/toolInvocation/invoked': 'Phone download options are ready.'
    }
  },
  {
    name: 'create_tone_pack_checkout',
    title: 'Create a Cognistration tone-pack checkout',
    description: 'Confirmed checkout creation for a selected published tone pack. The server resolves the approved price, creates a Stripe-hosted checkout, and returns a payment link without accepting card details or claiming payment completion.',
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
    consent: 'explicit_purchase_confirmation_required',
    _meta: {
      ui: { resourceUri: TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Creating a secure tone-pack checkout…',
      'openai/toolInvocation/invoked': 'Your secure tone-pack checkout is ready.'
    }
  },
  {
    name: 'get_tone_pack_delivery',
    title: 'Get a paid Cognistration tone-pack delivery',
    description: 'Verified delivery lookup for a completed hosted tone-pack checkout. The server verifies the Stripe session and pack slug before returning download and email-delivery fallbacks; compatible hosts can render the verified action in the same app card.',
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
    sideEffect: 'verifies_payment_and_resolves_delivery',
    _meta: {
      ui: { resourceUri: TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Verifying your tone-pack delivery…',
      'openai/toolInvocation/invoked': 'Your tone-pack download is ready.'
    }
  },
  {
    name: 'open_tone_pack_checkout',
    title: 'Open the Cognistration tone-pack checkout',
    description: 'In-platform $5.99 one-time tone-pack purchase card for a listener who wants a complete pack. The user supplies the delivery email and confirms the price, then reviews hosted Checkout; a download button appears only after payment verification.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', minLength: 1, maxLength: 120, description: 'Optional published tone-pack slug; defaults to full-spectrum-pack.' }
      },
      additionalProperties: false
    },
    outputSchema: tonePackCheckoutOpenOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'renders_in_platform_tone_pack_checkout',
    consent: 'user_submission_required',
    _meta: {
      ui: { resourceUri: TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Opening the tone-pack checkout…',
      'openai/toolInvocation/invoked': 'The tone-pack checkout is ready.'
    }
  },
  {
    name: 'create_workshop_access_checkout',
    title: 'Create a 24-hour machine workshop checkout',
    description: 'Confirmed checkout creation for the full machine workshop: a $2.99 one-time pass with a revocable 24-hour access key and sessions up to 60 minutes.',
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
    description: 'Verified access lookup for a completed hosted workshop checkout. The server verifies the Stripe Checkout Session before returning the one-time 24-hour bearer key and machine launch URL.',
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
    name: 'get_tone_pack_payment_options',
    title: 'Get Cognistration tone-pack payment options',
    description: 'Return the provider-gated $5.99 Machine Payments Protocol route for one approved tone-pack bundle, its email-delivery contract, and the reviewable hosted-checkout fallback. This tool never processes payment.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_autonomous_payment_options',
    title: 'Get Cognistration autonomous payment readiness',
    description: 'Return AP2-compatible and official UCP AP2 mandate readiness, provider/key gates, user-approval requirements, mandate safeguards, and the safe hosted-checkout fallback. This tool never creates a mandate or processes payment. For the $5.99 tone-pack agent payment, use get_tone_pack_payment_options and its MPP endpoint instead; this AP2 readiness route is not the tone-pack payment route.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: { type: 'object' },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_machine_control_contract',
    title: 'Get Cognistration machine control bounds',
    description: 'Read the published machine controls, defaults, semantic direction map, and live-audio boundary before issuing a machine command. This returns contract metadata only and does not change the visible machine.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: machineControlContractOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'set_machine_controls',
    title: 'Set Cognistration machine controls',
    description: 'Exact bounded control patch for the already-open Cognistration widget. Existing audio keeps playing while the widget applies carrier, rhythm, volume, or direction changes to its current oscillator and gain nodes.',
    inputSchema: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: PUBLIC_STATES, description: 'Visible listening direction.' },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400, description: 'Shared carrier frequency in hertz.' },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40, description: 'Difference between the two channels in hertz.' },
        volume: { type: 'integer', minimum: 0, maximum: 100, description: 'Master volume percentage.' }
      },
      additionalProperties: false
    },
    outputSchema: machineControlOperationOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls_and_live_audio',
    consent: 'none',
    _meta: {
      ...MACHINE_WIDGET_TOOL_META,
      'openai/toolInvocation/invoking': 'Tuning the live machine…',
      'openai/toolInvocation/invoked': 'The live machine is tuned.'
    }
  },
  {
    name: 'adjust_machine_controls',
    title: 'Adjust Cognistration machine controls',
    description: 'Make a relative live change to the already-open Cognistration machine. Map speed up or slow down to rhythm faster or slower, carrier smaller or larger to the shared tone, and quieter or louder to volume. Use a modest step unless the listener gives a precise amount. Playback continues without pausing.',
    inputSchema: {
      type: 'object',
      properties: {
        control: { type: 'string', enum: ['carrier', 'rhythm', 'volume'], description: 'The slider to move: carrier, rhythm, or volume.' },
        direction: { type: 'string', enum: ['smaller', 'larger', 'slower', 'faster', 'quieter', 'louder'], description: 'Semantic direction. Carrier accepts smaller/larger; rhythm accepts slower/faster; volume accepts quieter/louder.' },
        step: { type: 'number', minimum: 0.5, maximum: 50, description: 'Optional magnitude in the control units. Defaults are modest: carrier 24 Hz, rhythm 1 Hz, volume 8 percentage points.' },
        currentControls: {
          type: 'object',
          properties: {
            targetState: { type: 'string', enum: PUBLIC_STATES },
            carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
            beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
            volume: { type: 'integer', minimum: 0, maximum: 100 }
          },
          additionalProperties: false,
          description: 'Optional last state from the widget context. The widget remains authoritative and applies the returned relative delta.'
        }
      },
      required: ['control', 'direction'],
      additionalProperties: false
    },
    outputSchema: machineControlOperationOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls_and_live_audio',
    consent: 'none',
    _meta: {
      ...MACHINE_WIDGET_TOOL_META,
      'openai/toolInvocation/invoking': 'Adjusting the live machine…',
      'openai/toolInvocation/invoked': 'The live machine is adjusted.'
    }
  },
  {
    name: 'set_machine_direction',
    title: 'Choose a Cognistration machine direction',
    description: 'Apply a published Delta, Theta, Alpha, Beta, or Gamma direction to the already-open machine. This covers the direction buttons and presets; optional controls can set a preset carrier, rhythm, or volume. Existing audio remains continuous.',
    inputSchema: {
      type: 'object',
      properties: {
        targetState: { type: 'string', enum: PUBLIC_STATES, description: 'Published direction to select.' },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400, description: 'Optional shared carrier preset.' },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40, description: 'Optional rhythm preset.' },
        volume: { type: 'integer', minimum: 0, maximum: 100, description: 'Optional volume preset.' }
      },
      required: ['targetState'],
      additionalProperties: false
    },
    outputSchema: machineControlOperationOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'updates_visible_controls_and_live_audio',
    consent: 'none',
    _meta: {
      ...MACHINE_WIDGET_TOOL_META,
      'openai/toolInvocation/invoking': 'Choosing a machine direction…',
      'openai/toolInvocation/invoked': 'The machine direction is ready.'
    }
  },
  {
    name: 'start_machine_preview',
    title: 'Start the Cognistration machine preview',
    description: 'Request local browser audio in the already-open machine after the listener explicitly confirms they want playback. The tool never navigates away. The request is not an audible-playback confirmation: wait for the widget ui/update-model-context state to report audioReady=true. Browser autoplay policy may require the listener to press the visible Start preview button.',
    inputSchema: {
      type: 'object',
      properties: {
        confirmed: { type: 'boolean', const: true, description: 'Must be true after the listener explicitly asks to start audio.' }
      },
      required: ['confirmed'],
      additionalProperties: false
    },
    outputSchema: machineControlOperationOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'requests_local_browser_audio',
    consent: 'explicit_confirmation_required',
    _meta: {
      ...MACHINE_WIDGET_TOOL_META,
      'openai/toolInvocation/invoking': 'Requesting machine playback…',
      'openai/toolInvocation/invoked': 'The machine playback request is ready.'
    }
  },
  {
    name: 'stop_machine_preview',
    title: 'Stop the Cognistration machine preview',
    description: 'Stop local machine preview audio in the already-open widget. This is safe to repeat and does not change the selected controls.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: machineControlOperationOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'stops_local_browser_audio',
    consent: 'none',
    _meta: {
      ...MACHINE_WIDGET_TOOL_META,
      'openai/toolInvocation/invoking': 'Stopping machine playback…',
      'openai/toolInvocation/invoked': 'Machine playback is stopped.'
    }
  },
  {
    name: 'open_machine_fullscreen',
    title: 'Open the Cognistration machine larger',
    description: 'Request the compatible app host to show the already-open machine in its larger display mode. It does not change controls or audio.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: machineControlOperationOutput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_session',
    sideEffect: 'requests_fullscreen_display',
    consent: 'none',
    _meta: {
      ...MACHINE_WIDGET_TOOL_META,
      'openai/toolInvocation/invoking': 'Opening the larger machine view…',
      'openai/toolInvocation/invoked': 'The larger machine view is ready.'
    }
  },
  {
    name: 'open_machine_generator',
    title: 'Open the Cognistration tone machine',
    description: 'In-platform Cognistration tone-machine renderer for an intention, public tone ID, published state, or bounded carrier, rhythm, and volume controls. It opens an interactive visual machine and never starts audio without an explicit user click.',
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
      ...MACHINE_WIDGET_TOOL_META,
      'openai/toolInvocation/invoking': 'Opening the tone machine…',
      'openai/toolInvocation/invoked': 'The tone machine is ready.'
    }
  },
  {
    name: 'open_science_guide',
    title: 'Open the Cognistration science guide',
    description: 'In-platform educational guide for a tone or machine result, covering the two-channel signal, FFR, descriptive frequency bands, evidence limits, and safe listening. It starts no audio, saves no record, and carries no diary text.',
    inputSchema: {
      type: 'object',
      properties: {
        toneId: { type: 'string', minLength: 1, maxLength: 120, description: 'Optional ID from the public tone catalog.' },
        state: { type: 'string', enum: PUBLIC_STATES },
        targetState: { type: 'string', enum: PUBLIC_STATES },
        carrierHz: { type: 'integer', minimum: 100, maximum: 400 },
        beatHz: { type: 'number', minimum: 0.5, maximum: 40 },
        volume: { type: 'integer', minimum: 0, maximum: 100 },
        intentionLabel: { type: 'string', enum: ['rest', 'reflect', 'focus', 'momentum', 'synthesis'] }
      },
      additionalProperties: false
    },
    outputSchema: scienceGuideOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'renders_in_platform_science_guide',
    _meta: {
      ui: { resourceUri: SCIENCE_GUIDE_RESOURCE_URI },
      'openai/outputTemplate': SCIENCE_GUIDE_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Opening the science guide…',
      'openai/toolInvocation/invoked': 'The science guide is ready.'
    }
  },
  {
    name: 'open_feedback',
    title: 'Open Cognistration feedback',
    description: 'Optional closing feedback form for a listener who signals they are finished. The private in-platform card accepts a rating and optional short note only after the user presses submit, and never displays feedback history.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    outputSchema: feedbackOpenOutput,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    authorization: 'public_read',
    sideEffect: 'renders_in_platform_feedback_form',
    consent: 'user_submission_required',
    _meta: {
      ui: { resourceUri: FEEDBACK_WIDGET_RESOURCE_URI },
      'openai/outputTemplate': FEEDBACK_WIDGET_RESOURCE_URI,
      'openai/widgetAccessible': true,
      'openai/toolInvocation/invoking': 'Opening a quick closing check-in…',
      'openai/toolInvocation/invoked': 'The feedback card is ready.'
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
  },
  {
    uri: SCIENCE_GUIDE_RESOURCE_URI,
    name: 'Cognistration science guide UI',
    mimeType: SCIENCE_GUIDE_RESOURCE_MIME_TYPE,
    description: 'Click-through educational guide with a vGPU FFT ocean surface, a randomized bounded sea profile per run, a quiet FFT visual reference, signal notes, research boundaries, and a Download PDF path that records the current ocean run as a static snapshot; it does not start audio.',
    _meta: SCIENCE_GUIDE_WIDGET_RESOURCE_META
  },
  {
    uri: IOS_APP_WIDGET_RESOURCE_URI,
    name: 'Cognistration iPhone app UI',
    mimeType: IOS_APP_WIDGET_RESOURCE_MIME_TYPE,
    description: 'Frosted iPhone app offer with real screenshots, current one-time pricing, compatibility notes, and an App Store Download Now badge.',
    _meta: IOS_APP_WIDGET_RESOURCE_META
  },
  {
    uri: PHONE_DOWNLOAD_WIDGET_RESOURCE_URI,
    name: 'Cognistration phone download options UI',
    mimeType: PHONE_DOWNLOAD_WIDGET_RESOURCE_MIME_TYPE,
    description: 'Frosted phone handoff card with the fixed $0.50 agent-to-agent preview path and the full iPhone App Store path; payment remains explicit and user-controlled.',
    _meta: PHONE_DOWNLOAD_WIDGET_RESOURCE_META
  },
  {
    uri: TONE_PACK_CHECKOUT_WIDGET_RESOURCE_URI,
    name: 'Cognistration tone-pack checkout UI',
    mimeType: TONE_PACK_CHECKOUT_WIDGET_RESOURCE_MIME_TYPE,
    description: 'Frosted in-platform tone-pack checkout that collects a delivery email, opens a reviewable hosted payment page, and renders a verified download button after payment.',
    _meta: TONE_PACK_CHECKOUT_WIDGET_RESOURCE_META
  },
  {
    uri: ACCOUNT_SIGNUP_WIDGET_RESOURCE_URI,
    name: 'Cognistration account signup UI',
    mimeType: ACCOUNT_SIGNUP_WIDGET_RESOURCE_MIME_TYPE,
    description: 'In-platform account form with direct user submission and no checkout side effect.',
    _meta: ACCOUNT_SIGNUP_WIDGET_RESOURCE_META
  },
  {
    uri: FEEDBACK_WIDGET_RESOURCE_URI,
    name: 'Cognistration feedback UI',
    mimeType: FEEDBACK_WIDGET_RESOURCE_MIME_TYPE,
    description: 'In-platform optional feedback form with explicit user submission and no feedback-history read path.',
    _meta: FEEDBACK_WIDGET_RESOURCE_META
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
      writes: 'bounded hosted checkout initiation, provider-gated machine-payment fulfillment, paid delivery/access issuance, workshop-key revocation, and explicit user-submitted signup/feedback widget writes; payment credentials and private account records are not exposed',
      skills: { ...skillCatalogSummary(), extension: SKILL_IMPORT_EXTENSION }
    },
    discovery: {
      agentCard: `${origin}/.well-known/agent-card.json`,
      ard: `${origin}/.well-known/ard.json`,
      apiCatalog: `${origin}/.well-known/api-catalog`,
      mcpServerCard: `${origin}/api/mcp/server-card`,
      mcpServerCardWellKnown: `${origin}/.well-known/mcp/server-card.json`,
      skillsIndex: `${origin}/.well-known/agent-skills/index.json`,
      protectedResource: `${origin}/.well-known/oauth-protected-resource`,
      authorizationServer: `${origin}/.well-known/oauth-authorization-server`,
      schemaMap: `${origin}/.well-known/schemamap.xml`
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
      tonePackPayments: tonePackPaymentOptions(origin),
      autonomousPayments: autonomousPaymentOptions(origin)
    },
    restFallback: {
      manifest: `${origin}/api/capabilities`,
      instructions: `${origin}/agent-instructions.md`,
      openapi: `${origin}/openapi.json`,
      toneRecommendation: `${origin}/api/agent`,
      intentGuidance: `${origin}/api/agent/intent-guidance`,
      toneCalibration: `${origin}/api/agent/tone-calibrate`,
      toneComparison: `${origin}/api/agent/tone-compare`,
      sessionPlan: `${origin}/api/agent/session-plan`,
      sessionCue: `${origin}/api/agent/session-cue`,
      sessionRecipe: `${origin}/api/agent/session-recipe`,
      sessionScore: `${origin}/api/agent/session-score`,
      challengeCockpit: `${origin}/try`,
      tonePacks: `${origin}/api/packs?agent=1`,
      policy: `${origin}/api/agent/policy?topic=safety`,
      accountOptions: `${origin}/api/agent/account`,
      accountSignup: `${origin}/api/agent/account/signup`,
      feedback: `${origin}/api/agent/feedback`,
      tonePackCheckout: `${origin}/api/agent/commerce/tone-pack-checkout`,
      tonePackDelivery: `${origin}/api/agent/commerce/tone-pack-delivery`,
      tonePackPayments: `${origin}/api/machine-payments/tone-pack`,
      workshopCheckout: `${origin}/api/agent/commerce/workshop-checkout`,
      workshopAccessFromCheckout: `${origin}/api/agent/commerce/workshop-access`,
      workshopAccess: `${origin}/api/workshop/access`,
      machinePayments: `${origin}/api/machine-payments/session`,
      ucpDiscovery: `${origin}/.well-known/ucp`,
      documentationMcp: `${origin}/api/docs-mcp`,
      naturalLanguage: `${origin}/ask`,
      a2a: `${origin}/a2a`,
      batch: `${origin}/api/batch`,
      sandbox: `${origin}/api/sandbox`,
      asyncStatus: `${origin}/api/jobs`,
      versionedApi: `${origin}/api/v1`
    },
    privacy: {
      publicSurface: 'No private sessions, account records, secrets, arbitrary SQL, or code execution are exposed. Public commerce is limited to approved products, fixed-price provider-gated pack payment, hosted checkout, paid delivery verification, and revocable workshop access.',
      accountCreation: 'The MCP can render an in-platform signup form. The user must review and submit credentials directly in that form, then complete any separate checkout themselves.',
      feedback: 'The MCP can render an in-platform optional feedback form after a listener signals they are done. Feedback is submitted only after the user chooses a rating and presses submit; history is not exposed.',
      skillImport: 'Skills are static public operating guidance; they never grant authorization or access to private data.'
    }
  };
}
