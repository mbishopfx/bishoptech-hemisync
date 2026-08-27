import { MCP_SERVER_NAME, MCP_SERVER_VERSION, MCP_TOOLS } from './mcp-contract.js';

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

const toneRecommendationSchema = {
  type: 'object',
  properties: {
    ok: { type: 'boolean' },
    capabilityId: { type: 'string', const: 'cognistration-tone-intention' },
    version: { type: 'string' },
    correlationId: { type: 'string' },
    agentMessage: { type: 'string' },
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
    track: toneSchema
  },
  required: ['ok', 'capabilityId', 'version', 'correlationId', 'matchMode', 'usage', 'track'],
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

const jsonResponse = (description, schema) => ({
  description,
  content: { 'application/json': { schema } }
});

const errorSchema = {
  type: 'object',
  properties: { error: { type: 'string' }, code: { type: 'string' } },
  required: ['error'],
  additionalProperties: true
};

export function publicOpenApiDocument(origin = 'https://cognistration.com') {
  const canonicalOrigin = String(origin).replace(/\/$/, '');
  const publicTools = MCP_TOOLS.map(({ name, description, inputSchema, outputSchema, authorization, sideEffect }) => ({
    name,
    description,
    inputSchema,
    outputSchema,
    authorization,
    sideEffect
  }));

  return {
    openapi: '3.1.0',
    info: {
      title: 'Cognistration public agent API',
      version: MCP_SERVER_VERSION,
      description: 'Read-only compatibility contract for the public Cognistration tone catalog and intention matcher. Account, payment, private workspace, and arbitrary write operations are not exposed.'
    },
    servers: [{ url: canonicalOrigin }],
    externalDocs: {
      description: 'Cognistration agent instructions and safety boundaries',
      url: `${canonicalOrigin}/agent-instructions.md`
    },
    'x-cognistration': {
      serverName: MCP_SERVER_NAME,
      capabilityId: 'cognistration-agentic-platform',
      publicTools,
      mcpEndpoint: `${canonicalOrigin}/api/mcp`
    },
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
      '/api/packs': {
        get: {
          operationId: 'listPublicTonePacks',
          summary: 'Read public tone-pack metadata and preview links',
          parameters: [
            { name: 'agent', in: 'query', schema: { type: 'string', enum: ['1'] }, description: 'Return the safe agent-compatible catalog shape.' },
            { name: 'slug', in: 'query', schema: { type: 'string', maxLength: 120 }, description: 'Read one public pack by slug when agent=1.' },
            { name: 'query', in: 'query', schema: { type: 'string', maxLength: 240 }, description: 'Search pack name, purpose, state, and public description when agent=1.' },
            { name: 'state', in: 'query', schema: { type: 'string', enum: ['delta', 'theta', 'alpha', 'beta', 'gamma'] } },
            { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 20 } }
          ],
          responses: {
            200: jsonResponse('Public tone-pack metadata only.', {
              type: 'object',
              properties: { ok: { type: 'boolean' }, source: { type: 'string' }, packs: { type: 'array', items: { $ref: '#/components/schemas/TonePack' } }, pack: { $ref: '#/components/schemas/TonePack' } },
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
      '/api/mcp': {
        post: {
          operationId: 'callPublicMcp',
          summary: 'Call the bounded public MCP JSON-RPC adapter',
          description: 'Use the MCP endpoint directly when the consuming host supports Streamable HTTP. This OpenAPI entry is a compatibility reference; it does not add tools or write access.',
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
        Error: errorSchema
      }
    }
  };
}
