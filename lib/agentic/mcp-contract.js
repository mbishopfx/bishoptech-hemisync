import { publicAccountOptions } from './account-capability.js';
import {
  IOS_APP_CAPABILITY_ID,
  IOS_APP_CAPABILITY_VERSION,
  IOS_APP_STORE_URL,
  publicIosAppOffer
} from './ios-capability.js';
import { memberWebMcpManifestTools } from './webmcp-contract.js';
import { publicTonePackCatalogSummary } from './pack-capability.js';
import { policyCatalogSummary } from './policy-capability.js';
import { SKILL_IMPORT_EXTENSION, skillCatalogSummary } from './skill-capability.js';
import {
  MACHINE_WIDGET_RESOURCE_META,
  MACHINE_WIDGET_RESOURCE_MIME_TYPE,
  MACHINE_WIDGET_RESOURCE_URI
} from './machine-capability.js';

export const MCP_SERVER_NAME = 'cognistration-agentic-platform';
export const MCP_SERVER_VERSION = '0.4.0';
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
      tools: 'visible homepage tone machine controls; audio start requires explicit confirmation'
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
      writes: 'not exposed by the public endpoint',
      skills: { ...skillCatalogSummary(), extension: SKILL_IMPORT_EXTENSION }
    },
    catalogs: {
      tones: 'public',
      tonePacks: publicTonePackCatalogSummary(),
      policies: policyCatalogSummary(origin),
      account: publicAccountOptions(origin),
      iosApp: publicIosAppOffer()
    },
    restFallback: {
      manifest: `${origin}/api/capabilities`,
      instructions: `${origin}/agent-instructions.md`,
      openapi: `${origin}/openapi.json`,
      toneRecommendation: `${origin}/api/agent`,
      tonePacks: `${origin}/api/packs?agent=1`,
      policy: `${origin}/api/agent/policy?topic=safety`,
      accountOptions: `${origin}/api/agent/account`
    },
    privacy: {
      publicSurface: 'No private sessions, account records, secrets, arbitrary SQL, or code execution are exposed.',
      accountCreation: 'The homepage may navigate to signup; the user must review and submit credentials and payment.',
      skillImport: 'Skills are static public operating guidance; they never grant authorization or access to private data.'
    }
  };
}
