import {
  MCP_LEGACY_PROTOCOL_VERSION,
  MCP_PROTOCOL_VERSION,
  MCP_RESOURCES,
  MCP_SERVER_NAME,
  MCP_SERVER_VERSION,
  MCP_TOOLS,
  MCP_PROMPTS,
  MCP_SUPPORTED_LEGACY_VERSIONS,
  capabilityManifest
} from './mcp-contract.js';
import { getSkill } from './skill-capability.js';
import {
  MEMBER_WEBMCP_CONTRACT_VERSION,
  WEBMCP_CONTRACT_VERSION,
  MEMBER_WEBMCP_TOOL_DEFINITIONS,
  WEBMCP_TOOL_DEFINITIONS
} from './webmcp-contract.js';

export const DISCOVERY_SCHEMA_VERSION = '2026-09-01';
export const AGENT_SKILLS_DISCOVERY_SCHEMA = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';
export const MCP_SERVER_CARD_SCHEMA = 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json';
export const MCP_SERVER_CARD_MEDIA_TYPE = 'application/mcp-server-card+json';
export const PUBLIC_AGENT_SCOPES = [
  'public.read',
  'public.session',
  'public.checkout',
  'member.read',
  'member.write'
];
// These are the scopes the configured Supabase OIDC provider can actually
// issue for a user-scoped bearer session. The member.* labels above remain
// product capability labels, not custom OAuth scopes minted for Cognistration.
export const RESOURCE_AUTH_SCOPES = ['openid', 'profile', 'email'];

const DEFAULT_ORIGIN = 'https://cognistration.com';
const PUBLIC_PAGE_PATHS = new Set([
  '/',
  '/about',
  '/pricing',
  '/packs',
  '/machine',
  '/try',
  '/docs',
  '/tutorial',
  '/contact',
  '/privacy',
  '/terms',
  '/cookies',
  '/health-warning',
  '/ai-disclosure'
]);

function normalizeOrigin(value) {
  return String(value || DEFAULT_ORIGIN).trim().replace(/\/+$/, '') || DEFAULT_ORIGIN;
}

export function discoveryOrigin(value = process.env.NEXT_PUBLIC_SITE_URL) {
  return normalizeOrigin(value);
}

function configuredSupabaseAuthorizationServer() {
  const raw = String(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
  if (!raw) return null;

  try {
    const configured = new URL(raw);
    const issuer = `${configured.origin}/auth/v1`;
    return {
      issuer,
      authorization_endpoint: `${issuer}/oauth/authorize`,
      token_endpoint: `${issuer}/oauth/token`,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      userinfo_endpoint: `${issuer}/oauth/userinfo`
    };
  } catch {
    return null;
  }
}

export function markdownPathFor(pathname) {
  const path = pathname === '' ? '/' : pathname;
  if (!PUBLIC_PAGE_PATHS.has(path)) return null;
  return path === '/' ? '/index.md' : `${path}.md`;
}

export function discoveryLinks(origin = discoveryOrigin()) {
  const base = normalizeOrigin(origin);
  return {
    home: `${base}/`,
    markdownHome: `${base}/index.md`,
    pricingMarkdown: `${base}/pricing.md`,
    agentInstructions: `${base}/agent-instructions.md`,
    auth: `${base}/auth.md`,
    llms: `${base}/llms.txt`,
    docs: `${base}/docs`,
    docsMarkdown: `${base}/docs.md`,
    openapi: `${base}/openapi.json`,
    capabilities: `${base}/api/capabilities`,
    mcp: `${base}/api/mcp`,
    mcpServerCard: `${base}/api/mcp/server-card`,
    mcpManifest: `${base}/.well-known/mcp/manifest.json`,
    docsMcp: `${base}/api/docs-mcp`,
    ask: `${base}/ask`,
    a2a: `${base}/a2a`,
    agentMode: `${base}/?mode=agent`,
    batch: `${base}/api/batch`,
    sandbox: `${base}/api/sandbox`,
    jobs: `${base}/api/jobs`,
    versionedApi: `${base}/api/v1`,
    webBotAuth: `${base}/.well-known/http-message-signatures-directory`,
    ard: `${base}/.well-known/ard.json`,
    aiCatalog: `${base}/.well-known/ai-catalog.json`,
    agentCard: `${base}/.well-known/agent-card.json`,
    skills: `${base}/.well-known/agent-skills/index.json`,
    apiCatalog: `${base}/.well-known/api-catalog`,
    protectedResource: `${base}/.well-known/oauth-protected-resource`,
    authorizationServer: `${base}/.well-known/oauth-authorization-server`,
    serverCard: `${base}/.well-known/mcp/server-card.json`,
    schemaMap: `${base}/.well-known/schemamap.xml`,
    sitemap: `${base}/sitemap.xml`,
    sourceRepository: 'https://github.com/mbishopfx/bishoptech-hemisync',
    pluginManifest: 'https://github.com/mbishopfx/bishoptech-hemisync/blob/main/plugin.json',
    pluginMcpConfig: 'https://github.com/mbishopfx/bishoptech-hemisync/blob/main/mcp.json',
    sdkPackages: 'https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages'
  };
}

export function markdownHeaders({ cacheControl = 'public, max-age=300, s-maxage=300' } = {}) {
  return {
    'content-type': 'text/markdown; charset=utf-8',
    'cache-control': cacheControl,
    vary: 'Accept, Accept-Encoding, User-Agent'
  };
}

export function jsonDiscoveryHeaders({ cacheControl = 'public, max-age=300, s-maxage=300' } = {}) {
  return {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': cacheControl,
    vary: 'Accept, Accept-Encoding'
  };
}

export function mcpServerCardHeaders({ cacheControl = 'public, max-age=300, s-maxage=300' } = {}) {
  return {
    ...jsonDiscoveryHeaders({ cacheControl }),
    'content-type': `${MCP_SERVER_CARD_MEDIA_TYPE}; charset=utf-8`,
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, OPTIONS',
    'access-control-allow-headers': 'Accept, Content-Type'
  };
}

export function discoveryLinkHeader(pathname = '/', origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  const markdown = markdownPathFor(pathname) || links.markdownHome;
  return [
    `<${links.sitemap}>; rel="sitemap"`,
    `<${markdown}>; rel="alternate"; type="text/markdown"`,
    `<${links.apiCatalog}>; rel="api-catalog"`,
    `<${links.openapi}>; rel="service-desc"; type="application/vnd.oai.openapi+json"`,
    `<${links.ard}>; rel="ard"`,
    `<${links.mcpServerCard}>; rel="mcp-server-card"; type="${MCP_SERVER_CARD_MEDIA_TYPE}"`
  ].join(', ');
}

export function publicAgentCard(origin = discoveryOrigin()) {
  const base = normalizeOrigin(origin);
  return {
    name: 'Cognistration agentic listening platform',
    description: 'A bounded listening and tone-session platform. Agents can help a person find a public direction, tune the visible machine, read the science guide, and open user-controlled product flows.',
    supportedInterfaces: [{
      url: `${base}/a2a`,
      protocolBinding: 'HTTP+JSON',
      protocolVersion: '1.0'
    }],
    provider: {
      organization: 'BishopTech',
      url: base
    },
    version: MCP_SERVER_VERSION,
    documentationUrl: `${base}/docs`,
    capabilities: {
      streaming: false,
      pushNotifications: false,
      extendedAgentCard: false,
      extensions: [{
        uri: 'https://cognistration.com/extensions/mcp-bridge',
        description: 'The A2A-facing entry point delegates executable product actions to the public Cognistration MCP surface.',
        required: false
      }]
    },
    defaultInputModes: ['text/plain', 'application/json'],
    defaultOutputModes: ['text/plain', 'application/json'],
    skills: [
      {
        id: 'public-tone-guidance',
        name: 'Public tone guidance',
        description: 'Match a short listening intention to an approved public tone or compare bounded directions.',
        tags: ['listening', 'tone', 'intention'],
        examples: ['Find a calm direction for winding down.', 'Compare two focus-oriented tone directions.'],
        inputModes: ['text/plain', 'application/json'],
        outputModes: ['application/json']
      },
      {
        id: 'live-machine-controls',
        name: 'Live machine controls',
        description: 'Set or adjust bounded visible carrier, rhythm, volume, and state controls without pausing existing local audio.',
        tags: ['WebMCP', 'controls', 'audio'],
        examples: ['Make the rhythm a little slower.', 'Set the visible machine to gamma at 246 Hz.'],
        inputModes: ['text/plain', 'application/json'],
        outputModes: ['application/json']
      },
      {
        id: 'science-guide',
        name: 'Science guide',
        description: 'Explain the two-channel signal, frequency-following response, evidence limits, and safe listening boundaries.',
        tags: ['science', 'FFR', 'education'],
        examples: ['Explain what the beat frequency means without making a medical claim.'],
        inputModes: ['text/plain', 'application/json'],
        outputModes: ['application/json', 'text/html']
      },
      {
        id: 'user-controlled-commerce',
        name: 'User-controlled product flows',
        description: 'Open account, App Store, and tone-pack checkout surfaces while keeping credential and payment submission with the user.',
        tags: ['account', 'checkout', 'MCP Apps'],
        examples: ['Show the full tone-pack purchase card.', 'Open the account form.'],
        inputModes: ['text/plain', 'application/json'],
        outputModes: ['application/json', 'text/html']
      }
    ],
    securitySchemes: {
      bearerAuth: { http: { scheme: 'bearer', bearerFormat: 'JWT', description: 'Optional user-scoped bearer session for private member operations; public discovery and preview routes are anonymous.' } }
    },
    securityRequirements: []
  };
}

export function agentSkillsIndex(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  const base = normalizeOrigin(origin);
  const skills = [
    {
      id: 'cognistration-agentic-routing',
      name: 'Cognistration agentic routing',
      description: 'Routes natural-language listening requests to bounded public MCP, REST, or WebMCP actions.',
      protocol: 'MCP',
      examples: ['Open a tone machine for a bedtime direction.', 'Find a public tone for a writing session.']
    },
    {
      id: 'cognistration-tone-orchestration',
      name: 'Cognistration tone orchestration',
      description: 'Maps intention and sensory feedback to bounded tone settings while leaving playback under user control.',
      protocol: 'MCP',
      examples: ['Make the sound less bright.', 'Keep the current audio running while adjusting rhythm.']
    },
    {
      id: 'cognistration-account-safety',
      name: 'Cognistration account safety',
      description: 'Keeps credentials, verification, private records, and payment details in user-controlled first-party surfaces.',
      protocol: 'MCP Apps',
      examples: ['Open the signup form without collecting credentials in chat.']
    },
    {
      id: 'cognistration-agent-evaluation',
      name: 'Cognistration agent evaluation',
      description: 'Provides a read-only checklist for testing discovery, schemas, UI resources, safety boundaries, and payment challenges.',
      protocol: 'MCP',
      examples: ['Check the public MCP contract before a release.']
    },
    {
      id: 'cognistration-feedback',
      name: 'Cognistration feedback',
      description: 'Opens an optional closing feedback card and writes only after the user explicitly submits it.',
      protocol: 'MCP Apps',
      examples: ['Offer a feedback card after the listener says they are done.']
    }
  ].map((skill) => {
    const resource = getSkill(`skill://cognistration/${skill.id}/SKILL.md`);
    const digest = resource?.resources?.[0]?.digest;
    if (!digest) throw new Error(`Missing digest for public skill ${skill.id}.`);
    return {
      name: skill.id,
      id: skill.id,
      type: 'skill-md',
      description: skill.description,
      url: `${base}/.well-known/agent-skills/${skill.id}/SKILL.md`,
      digest,
      protocol: skill.protocol,
      source: `${base}/skills/${skill.id}/SKILL.md`,
      endpoint: links.mcp,
      examples: skill.examples
    };
  });

  return {
    $schema: AGENT_SKILLS_DISCOVERY_SCHEMA,
    schemaVersion: DISCOVERY_SCHEMA_VERSION,
    service: 'Cognistration',
    skills
  };
}

export function apiCatalogLinkset(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  const anchor = links.apiCatalog;
  const item = [
    { href: links.openapi, rel: ['service-desc'], type: 'application/vnd.oai.openapi+json', title: 'Cognistration REST/OpenAPI contract' },
    { href: links.mcp, rel: ['item'], type: 'application/json', title: 'Cognistration product MCP server' },
    { href: links.mcpServerCard, rel: ['describedby'], type: MCP_SERVER_CARD_MEDIA_TYPE, title: 'Cognistration MCP Server Card' },
    { href: links.mcpManifest, rel: ['item'], type: 'application/json', title: 'Cognistration MCP compatibility manifest' },
    { href: links.docsMcp, rel: ['item'], type: 'application/json', title: 'Cognistration documentation MCP server' },
    { href: links.capabilities, rel: ['describedby'], type: 'application/json', title: 'Cognistration capability manifest' },
    { href: links.agentInstructions, rel: ['describedby'], type: 'text/markdown', title: 'Agent instructions' },
    { href: links.auth, rel: ['describedby'], type: 'text/markdown', title: 'Authentication and authorization guide' },
    { href: links.ask, rel: ['item'], type: 'application/json', title: 'NLWeb natural-language query endpoint' }
  ];
  return { linkset: [{ anchor, item }] };
}

export function mcpServerCard(origin = discoveryOrigin()) {
  const base = normalizeOrigin(origin);
  return {
    $schema: MCP_SERVER_CARD_SCHEMA,
    name: 'com.cognistration/cognistration-agentic-platform',
    title: 'Cognistration',
    description: 'User-controlled tone tools and listening sessions for Cognistration.',
    version: MCP_SERVER_VERSION,
    websiteUrl: base,
    repository: {
      url: 'https://github.com/mbishopfx/bishoptech-hemisync',
      source: 'github'
    },
    remotes: [{
      type: 'streamable-http',
      url: `${base}/api/mcp`,
      supportedProtocolVersions: [MCP_PROTOCOL_VERSION, ...MCP_SUPPORTED_LEGACY_VERSIONS]
    }],
    _meta: {
      'com.cognistration/discovery': {
        documentationUrl: `${base}/docs`,
        instructionsUrl: `${base}/agent-instructions.md`,
        serverCardUrl: `${base}/api/mcp/server-card`,
        legacyServerCardUrl: `${base}/.well-known/mcp/server-card.json`,
        compatibilityManifestUrl: `${base}/.well-known/mcp/manifest.json`,
        capabilities: ['tools', 'resources', 'prompts'],
        authentication: 'public discovery and reads are anonymous; private member operations use a user-scoped bearer session',
        paymentCredentialsAccepted: false
      }
    }
  };
}

// Keep a compatibility manifest for clients that still probe /mcp.json rather
// than the standards-based Server Card. The Server Card intentionally carries
// connection metadata; this legacy shape carries the executable catalog so a
// client can discover tools before opening the Streamable HTTP endpoint.
export function mcpCompatibilityManifest(origin = discoveryOrigin()) {
  const base = normalizeOrigin(origin);
  return {
    name: MCP_SERVER_NAME,
    description: 'Cognistration’s bounded public product MCP server for intention-led listening, live machine controls, science education, and user-controlled product flows.',
    version: MCP_SERVER_VERSION,
    serverUrl: `${base}/api/mcp`,
    endpoint: `${base}/api/mcp`,
    transport: 'Streamable HTTP',
    protocolVersion: MCP_LEGACY_PROTOCOL_VERSION,
    currentProtocolVersion: MCP_PROTOCOL_VERSION,
    protocolVersions: [MCP_PROTOCOL_VERSION, ...MCP_SUPPORTED_LEGACY_VERSIONS],
    capabilities: {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
      prompts: { listChanged: false }
    },
    tools: MCP_TOOLS.map(({ name, title, description, inputSchema, annotations, authorization, sideEffect }) => ({
      name,
      title,
      description,
      inputSchema,
      annotations,
      authorization,
      sideEffect
    })),
    resources: MCP_RESOURCES.map(({ uri, name, mimeType, description }) => ({ uri, name, mimeType, description })),
    uiResources: MCP_RESOURCES.filter(({ uri }) => uri.startsWith('ui://')).map(({ uri, mimeType }) => ({ uri, mimeType })),
    prompts: MCP_PROMPTS.map(({ name, title, description, arguments: promptArguments }) => ({
      name,
      title,
      description,
      arguments: promptArguments
    })),
    documentationUrl: `${base}/docs`,
    instructionsUrl: `${base}/agent-instructions.md`,
    serverCardUrl: `${base}/api/mcp/server-card`,
    authentication: {
      public: 'anonymous',
      private: 'authenticated member bearer token',
      paymentCredentialsAccepted: false
    }
  };
}

export function protectedResourceMetadata(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  const base = normalizeOrigin(origin);
  const authorizationServer = configuredSupabaseAuthorizationServer();
  return {
    // This metadata is published at the origin-level well-known path, so RFC
    // 9728 requires the resource identifier to match the origin exactly.
    resource: base,
    resource_name: 'Cognistration',
    authorization_servers: authorizationServer ? [authorizationServer.issuer] : [],
    scopes_supported: [...RESOURCE_AUTH_SCOPES],
    bearer_methods_supported: ['header'],
    resource_documentation: links.auth
  };
}

export function authorizationServerMetadata(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  const base = normalizeOrigin(origin);
  const upstream = configuredSupabaseAuthorizationServer();
  return {
    // This is Cognistration's compatibility metadata surface. It is not the
    // upstream issuer listed by protected-resource metadata and remains
    // explicitly disabled until the local auth endpoints are implemented.
    issuer: base,
    authorization_server_status: 'discovery_only',
    authorization_endpoint: `${base}/auth/authorize`,
    token_endpoint: `${base}/auth/token`,
    revocation_endpoint: `${base}/auth/revoke`,
    response_types_supported: [],
    grant_types_supported: [],
    code_challenge_methods_supported: [],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [...RESOURCE_AUTH_SCOPES],
    service_documentation: links.auth,
    agent_auth: {
      status: 'discovery_only',
      skill: links.auth,
      // This is the human account-registration surface, not OAuth dynamic
      // client registration. It keeps credentials in the first-party UI.
      register_uri: `${base}/signup`,
      identity_endpoint: `${base}/agent/identity`,
      claim_endpoint: `${base}/agent/claim`,
      events_endpoint: `${base}/agent/events`,
      revocation_uri: `${base}/auth/revoke`,
      identity_types_supported: [],
      credential_types_supported: ['bearer'],
      identity_assertion: {
        assertion_types_supported: []
      },
      events_supported: []
    },
    ...(upstream ? { upstream_authorization_server: upstream } : {}),
    implementationNote: 'OAuth endpoints on this Cognistration origin are published for compatibility discovery but are not enabled. Protected-resource metadata points to the configured Supabase OIDC issuer for user-controlled sign-in. Public discovery and preview routes are anonymous; agents must never request or transmit a password, service key, card, or payment credential.'
  };
}

export function ardManifest(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  const base = normalizeOrigin(origin);
  return {
    specVersion: '1.0',
    host: {
      displayName: 'Cognistration',
      identifier: 'cognistration.com',
      documentationUrl: links.docs
    },
    entries: [
      {
        '@context': 'https://agenticresourcediscovery.org/context/v1',
        identifier: 'urn:air:cognistration.com:server:product-mcp',
        displayName: 'Cognistration product MCP server',
        type: 'application/mcp-server-card+json',
        url: links.mcpServerCard,
        description: 'Bounded product tools for public tone guidance, live machine controls, science education, and user-controlled commerce surfaces.',
        representativeQueries: ['open a tone machine for sleep preparation', 'make the live rhythm a little slower', 'explain the FFR science guide'],
        capabilities: ['MCP', 'MCP Apps', 'WebMCP'],
        metadata: { endpoint: links.mcp, documentation: links.docs }
      },
      {
        '@context': 'https://agenticresourcediscovery.org/context/v1',
        identifier: 'urn:air:cognistration.com:server:documentation-mcp',
        displayName: 'Cognistration documentation MCP server',
        type: 'application/mcp-server-card+json',
        url: `${base}/.well-known/mcp/docs-server-card.json`,
        description: 'Read-only documentation search and retrieval over MCP.',
        representativeQueries: ['how does Cognistration handle privacy', 'what tools are available for live controls'],
        capabilities: ['MCP', 'documentation'],
        metadata: { endpoint: links.docsMcp, documentation: links.docs }
      },
      {
        '@context': 'https://agenticresourcediscovery.org/context/v1',
        identifier: 'urn:air:cognistration.com:skills:operating-guides',
        displayName: 'Cognistration operating skills',
        type: 'application/ai-skill+md',
        url: links.skills,
        description: 'Static public guidance for routing and safely using the Cognistration agent surfaces.',
        representativeQueries: ['how should an agent use Cognistration', 'what must stay user-controlled'],
        capabilities: ['skills', 'MCP', 'WebMCP']
      },
      {
        '@context': 'https://agenticresourcediscovery.org/context/v1',
        identifier: 'urn:air:cognistration.com:api:public-agent-api',
        displayName: 'Cognistration public agent API',
        type: 'application/openapi+json',
        url: links.openapi,
        description: 'REST fallback for public tone guidance, catalogs, machine payment discovery, and bounded product operations.',
        representativeQueries: ['find a public tone for focused writing', 'list Cognistration tone packs'],
        capabilities: ['REST', 'OpenAPI', 'JSON']
      }
    ]
  };
}

export function schemaMapXml(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<schemamap xmlns="https://nlweb.ai/schemamap/v1">\n  <feed name="cognistration-homepage" type="jsonl" href="${links.capabilities}" />\n  <feed name="cognistration-openapi" type="json" href="${links.openapi}" />\n  <feed name="cognistration-sitemap" type="xml" href="${links.sitemap}" />\n</schemamap>\n`;
}

const ROOT_MARKDOWN = `# Cognistration

Cognistration is a personal listening platform for focus, rest, reflection, and intentional reset. It treats a tone as a controllable auditory cue rather than a medical intervention or a promise of a particular brain state.

## Start here

- [Interactive homepage](/)
- [Agent instructions](/agent-instructions.md)
- [Developer docs](/docs)
- [API contract](/openapi.json)
- [Public capability manifest](/api/capabilities)
- [Product MCP server](/api/mcp)
- [Documentation MCP server](/api/docs-mcp)
- [Pricing](/pricing.md)
- [Authentication guide](/auth.md)
- [Source repository](https://github.com/mbishopfx/bishoptech-hemisync)
- [Agent Plugin manifest](https://github.com/mbishopfx/bishoptech-hemisync/blob/main/plugin.json)
- [SDK and CLI packages](https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages)

## Agent use

Use the public MCP or REST surface to match a short intention, compare listening directions, prepare a session recipe, inspect the science guide, or open the live machine. The homepage and /try route also progressively register WebMCP tools when the browser supports them. Exact controls are bounded; relative requests such as “a little slower” update the visible machine without pausing existing audio.

Account credentials, email delivery, checkout, payment credentials, private records, and final audio playback remain user-controlled. A tool response that opens a form is not proof that a submission or payment happened.

## Safety

Use headphones at a comfortable level and stop if listening causes pain, dizziness, panic, marked distress, or disorientation. Cognistration is general experience content, not diagnosis or treatment. Read the [health warning](/health-warning) and [privacy policy](/privacy) for boundaries.
`;

const PRICING_MARKDOWN = `# Cognistration pricing

## Public preview

The public intention preview is free and does not require an account. It matches a short intention to an approved tone and provides a limited browser preview.

## Lifetime workspace — $20 one time

The private Workshop and Studio include saved projects, editable listening journeys, finished MP3 exports, secure downloads, and lifetime access with no monthly cost. Account creation, email verification, and checkout are completed by the person in first-party forms.

## Machine workshop — $2.99 one time

The accountless 24-hour Machine Workshop pass unlocks bounded sessions up to 60 minutes. It exposes the carrier, rhythm, state, and volume controls. Hosted payment is user-reviewed and produces a revocable access key only after server-side payment verification.

## Tone packs — typically $5.99 one time

Finished tone packs are separate one-time purchases. A pack checkout asks for a delivery email, fixes the price from the approved catalog, and reveals a download only after payment verification. Compatible agent hosts can discover a fixed $5.99 provider-gated payment route, but Cognistration never accepts card details or payment credentials as MCP arguments.

## iPhone app — $2.99 one time

The Cognistration iPhone app is distributed through the [App Store](https://apps.apple.com/us/app/cognistration/id6780132617). It performs audio work on-device and does not require an account or subscription. Apple controls availability and regional pricing.

See the [pricing page](/pricing), [tone-pack catalog](/packs), [agent instructions](/agent-instructions.md), and [auth guide](/auth.md) for current machine-readable details.
`;

const AUTH_MARKDOWN = `# Cognistration authentication

Cognistration has two intentionally separate surfaces: public discovery and preview are anonymous, while private member workspace operations use a first-party bearer session. This guide describes the machine-readable metadata and the user-controlled path. An agent must never ask for, echo, or transmit a Cognistration password, payment credential, card number, or verification code in a tool call.

## Discover

Fetch [protected-resource metadata](/.well-known/oauth-protected-resource), [authorization-server metadata](/.well-known/oauth-authorization-server), and the [agent card](/.well-known/agent-card.json). Public MCP reads, WebMCP discovery, tone catalogs, science education, and form-opening tools do not require an access token.

## Pick a method

Use anonymous access for public discovery and preview. A signed-in member session is required for private member routes. The product labels \`member.read\` and \`member.write\` describe route policy; the configured Supabase OIDC provider issues the standard \`openid\`, \`profile\`, and \`email\` scopes listed in protected-resource metadata. Checkout operations still require explicit confirmation. No scope bypasses a form or consent step.

## Register

The public product does not issue API keys or OAuth client credentials from chat. The advertised \`register_uri\` points to first-party account registration; it is not a dynamic OAuth client-registration endpoint. If a client needs a private member session, the person must use the first-party [sign-in page](/login) and the configured identity provider. Do not invent a client secret or use a service key in a browser.

## Claim

The advertised \`agent_auth\` URLs document safe boundaries for compatible clients: [identity](/agent/identity), [claim](/agent/claim), [events](/agent/events), and [revocation](/auth/revoke). The identity, claim, event, and local OAuth routes are currently discovery-only or fail-closed; they do not accept passwords or payment data. A client must stop when a user step is required.

## Exchange

The authorization-server metadata reports Cognistration’s local endpoints as \`discovery_only\`. The \`/auth/authorize\`, \`/auth/token\`, and \`/auth/revoke\` paths are deliberate fail-closed stubs, not token issuers. Protected-resource metadata identifies the configured Supabase OIDC issuer and its user-controlled PKCE endpoints when Supabase is configured. Public calls can remain anonymous; private access is completed through the first-party sign-in flow. Never exchange a password, Supabase service-role key, Stripe key, or payment credential at an agent endpoint.

## Use the access_token

Send a user-scoped bearer token only to the private member routes that require it: \`Authorization: Bearer <access_token>\`. Keep the token in the connected host’s secure credential store, never in MCP arguments, URLs, or prompts. Public MCP requests should omit it.

## Errors

An API can return JSON with \`code\`, \`message\`, \`retryable\`, and \`resolution\` fields. A protected resource may return \`401\` with \`WWW-Authenticate: Bearer resource_metadata="/.well-known/oauth-protected-resource"\`. A \`403\` means the signed-in user or product entitlement is not allowed to perform that operation.

## Revocation

Use the configured identity provider’s sign-out/revocation controls. A Cognistration workshop access key is a separate, paid, revocable resource and must be revoked only through the explicit \`revoke_workshop_access\` confirmation flow.

The public MCP server is at [/api/mcp](/api/mcp); the read-only documentation server is at [/api/docs-mcp](/api/docs-mcp).
`;

const DOCS_MARKDOWN = `# Cognistration developer docs

Cognistration publishes a typed public MCP server, a read-only documentation MCP server, REST/OpenAPI fallbacks, native browser WebMCP tools, MCP Apps \`ui://\` resources, and static operating skills.

## Product MCP

POST JSON-RPC 2.0 requests to [/api/mcp](/api/mcp). Discover with \`tools/list\`, \`resources/list\`, \`prompts/list\`, and \`server/discover\`. The public registry contains ${MCP_TOOLS.length} bounded tools, ${MCP_RESOURCES.length} resources, and explicit behavioral annotations. Interactive resources include the machine, science guide, iPhone offer, phone handoff, tone-pack checkout, signup, and feedback cards.

## Browser WebMCP

The homepage and [/try](/try) progressively call \`document.modelContext.registerTool\` when supported. Their visible action forms also publish declarative \`toolname\` and \`tooldescription\` attributes for compatible browser agents. The public browser contract is ${WEBMCP_TOOL_DEFINITIONS.length} tools at version ${WEBMCP_CONTRACT_VERSION}; the authenticated dashboard bridge has ${MEMBER_WEBMCP_TOOL_DEFINITIONS.length} tools at version ${MEMBER_WEBMCP_CONTRACT_VERSION}. Browser support is progressive enhancement, so the human controls remain available without WebMCP.

## REST and natural language

Use [/openapi.json](/openapi.json), [/api/capabilities](/api/capabilities), or [POST /ask](/ask) for compatible clients. \`/ask\` accepts a short natural-language query, returns JSON with \`_meta.response_type\` and \`_meta.version\`, and supports \`prefer.streaming=true\` with \`start\`, \`result\`, and \`complete\` SSE events.

## Discovery, compatibility, and testing

The [agent card](/.well-known/agent-card.json), [ARD manifest](/.well-known/ard.json), [API catalog](/.well-known/api-catalog), [MCP server card](/api/mcp/server-card), [legacy server-card alias](/.well-known/mcp/server-card.json), and [skills index](/.well-known/agent-skills/index.json) are public discovery documents. The server card contains connection metadata; fetch the [MCP manifest](/api/mcp) or call \`tools/list\` for the current tool schemas and descriptions. Use the [A2A endpoint](/a2a) for a stateless JSON compatibility request, the [read-only batch endpoint](/api/batch) for grouped catalog queries, and the [sandbox](/api/sandbox) for integration tests without account, audio, checkout, or persistence side effects. Collection responses use an opaque cursor when pagination is needed. \`/api/jobs\` reports that asynchronous jobs are not part of the public agent contract.

## Skills and safety

Read [/agent-instructions.md](/agent-instructions.md) and the [skills index](/.well-known/agent-skills/index.json). Static skills are guidance, not authorization. Public routes do not expose private records, arbitrary code execution, payment credentials, or unrestricted writes. Audio, account credentials, checkout, and feedback submission remain user-controlled.
`;

export function pageMarkdown(pathname, origin = discoveryOrigin()) {
  const base = normalizeOrigin(origin);
  if (pathname === '/' || pathname === '/index.md') return markdownDocument(ROOT_MARKDOWN.replaceAll('](/', `](${base}/`), '/', base);
  if (pathname === '/pricing' || pathname === '/pricing.md') return markdownDocument(PRICING_MARKDOWN.replaceAll('](/', `](${base}/`), '/pricing', base);
  if (pathname === '/docs' || pathname === '/docs.md') return markdownDocument(DOCS_MARKDOWN.replaceAll('](/', `](${base}/`), '/docs', base);
  if (pathname === '/auth.md') return markdownDocument(AUTH_MARKDOWN.replaceAll('](/', `](${base}/`), '/auth.md', base);
  const pageContent = {
    '/about': `# About Cognistration\n\nCognistration is a personal listening platform by BishopTech. It gives people a deliberate auditory cue for focus, rest, reflection, and intentional reset while keeping the tone, rhythm, volume, duration, and playback choice visible and adjustable.\n\nEvery brain and every day is different. The product is designed as a free-will generator: a listener can map what feels useful, tune the cue in real time, save a preferred recipe, and decide when audio starts or stops. It does not prescribe a frequency, diagnose a condition, or promise a neurological result.\n\nRead the [developer docs](${base}/docs.md), [health warning](${base}/health-warning.md), or [contact page](${base}/contact.md).\n`,
    '/health-warning': `# Cognistration health warning\n\nCognistration is general experience content, not medical advice, diagnosis, or treatment. Use headphones at a comfortable level and stop if listening causes pain, dizziness, panic, marked distress, or disorientation. Do not listen while driving or operating equipment.\n\nDo not use a tone as a response to an emergency, crisis, medication question, or clinical concern. Contact an appropriately qualified professional or local emergency service when needed.\n\nRead the [privacy policy](${base}/privacy.md), [terms](${base}/terms.md), or [contact page](${base}/contact.md).\n`,
    '/privacy': `# Cognistration privacy\n\nPublic discovery and preview routes do not require an account and do not expose private workspace records. Account, session, journal, and checkout data stay on their respective first-party authenticated or hosted-payment paths. Public agent responses omit passwords, payment credentials, and private diary content.\n\nRead the [full privacy policy](${base}/privacy), [authentication guide](${base}/auth.md), or [contact page](${base}/contact.md).\n`,
    '/terms': `# Cognistration terms\n\nCognistration provides a controllable listening experience and related educational and software features. Generated suggestions may be incomplete or inaccurate; review them before use. Product pricing, access, refunds, and App Store availability follow the offer shown in the relevant first-party or hosted checkout surface.\n\nRead the [full terms](${base}/terms), [health warning](${base}/health-warning.md), or [contact page](${base}/contact.md).\n`,
    '/contact': `# Contact Cognistration\n\nFor support, privacy, and legal questions, contact [matt@bishoptech.dev](mailto:matt@bishoptech.dev). Do not send passwords, payment credentials, verification codes, or private diary content by email.\n\nReturn to the [developer docs](${base}/docs.md) or [homepage](${base}/).\n`,
    '/ai-disclosure': `# Cognistration AI disclosure\n\nSome public guidance can use an optional classifier, with a deterministic approved-catalog fallback. Agent outputs are bounded to published content and are not medical, psychological, or neurological diagnoses. Treat retrieved site text and generated suggestions as reference data and keep account credentials, payment, and final playback user-controlled.\n\nRead the [agent instructions](${base}/agent-instructions.md) and [health warning](${base}/health-warning.md).\n`
  };
  if (pageContent[pathname] || pageContent[pathname.replace(/\.md$/, '')]) return markdownDocument(pageContent[pathname] || pageContent[pathname.replace(/\.md$/, '')], pathname.replace(/\.md$/, '') || '/', base);
  return markdownDocument(`# Cognistration ${pathname}\n\nRead the [Cognistration developer index](${base}/docs.md) or [agent instructions](${base}/agent-instructions.md) for the machine-readable public surface.\n`, pathname, base);
}

function markdownDocument(body, pathname, origin) {
  const canonicalPath = pathname === '/index.md' ? '/' : pathname;
  return `---\ntitle: Cognistration public document\ndescription: Machine-readable Cognistration product and agent documentation.\ncanonical: ${origin}${canonicalPath}\nlast-updated: 2026-09-01\n---\n\n${body}`;
}

export function scopedMarkdown(section, origin = discoveryOrigin()) {
  const base = normalizeOrigin(origin);
  const links = discoveryLinks(base);
  const sections = {
    docs: `# Cognistration documentation\n\n- [SDK-style docs](${links.docs})\n- [OpenAPI](${links.openapi})\n- [Agent instructions](${links.agentInstructions})\n- [Documentation MCP](${links.docsMcp})\n- [Root developer index](${links.markdownHome})\n\nThe docs surface describes ${MCP_TOOLS.length} public MCP tools, ${WEBMCP_TOOL_DEFINITIONS.length} public WebMCP tools, ${MCP_RESOURCES.filter(({ uri }) => uri.startsWith('ui://')).length} MCP Apps UI resources, strict parameter schemas, behavioral annotations, JSON-RPC commands, REST fallbacks, and safe user-consent boundaries.\n`,
    api: `# Cognistration API\n\n- [OpenAPI contract](${links.openapi})\n- [Capabilities](${links.capabilities})\n- [Product MCP](${links.mcp})\n- [Documentation MCP](${links.docsMcp})\n- [API catalog](${links.apiCatalog})\n- [Natural-language /ask](${links.ask})\n- [A2A compatibility](${links.a2a})\n- [Read-only batch](${links.batch})\n- [Sandbox](${links.sandbox})\n- [Async status](${links.jobs})\n\nPublic API operations are bounded and return JSON errors. Use opaque cursor fields where a list endpoint provides them, honor the RateLimit headers, and retry only when \`retryable\` is true. Payment credentials and private member data are not accepted by public agent routes.\n`,
    developers: `# Cognistration developer resources\n\n- [Developer docs](${links.docs})\n- [TypeScript SDK package source](https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages/cognistration-sdk)\n- [Python SDK package source](https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages/python/cognistration)\n- [Go SDK package source](https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages/go/cognistration)\n- [Ruby SDK package source](https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages/ruby/cognistration)\n- [CLI package source](https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages/cognistration-cli)\n- [Agent Plugin manifest](${links.pluginManifest})\n- [Agent Plugin MCP configuration](${links.pluginMcpConfig})\n- [Agent rules](https://github.com/mbishopfx/bishoptech-hemisync/blob/main/AGENTS.md)\n\nThe packages are source distributions prepared for registry publication; registry publication remains a release operation and must use the project’s authenticated publisher account.\n`
  };
  return markdownDocument(sections[section] || sections.docs, `/${section}/llms.txt`, base);
}

export function publicDiscoverySummary(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  return {
    service: 'Cognistration',
    version: DISCOVERY_SCHEMA_VERSION,
    manifest: capabilityManifest(origin),
    links,
    webmcp: { public: WEBMCP_CONTRACT_VERSION, member: MEMBER_WEBMCP_CONTRACT_VERSION },
    scopes: [...PUBLIC_AGENT_SCOPES]
  };
}
