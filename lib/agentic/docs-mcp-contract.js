import {
  discoveryLinks,
  discoveryOrigin,
  pageMarkdown,
  scopedMarkdown
} from './discovery-contract.js';

export const DOCS_MCP_SERVER_NAME = 'cognistration-documentation-mcp';
export const DOCS_MCP_SERVER_VERSION = '0.1.0';
export const DOCS_MCP_PROTOCOL_VERSION = '2026-07-28';

const SAFETY_MARKDOWN = `# Cognistration safety

Cognistration is general listening and reflection software, not diagnosis, treatment, or a substitute for professional care. It presents a controllable auditory cue and describes frequency-following response research with explicit evidence limits.

## Listening boundaries

Use headphones at a comfortable level. Stop if listening causes pain, dizziness, panic, marked distress, or disorientation. Do not use a tone as a response to an emergency, crisis, medication question, or clinical concern; use the [health warning](/health-warning) and contact an appropriately qualified professional or local emergency service when needed.

## Agent boundaries

Public tools do not expose private records, passwords, payment credentials, arbitrary code execution, or unrestricted writes. Account credentials stay in the first-party form. Checkout and feedback submission require a user action. A tool response that opens a widget is not proof that a form was submitted or a payment completed.
`;

function docsForOrigin(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  return [
    { id: 'overview', title: 'Cognistration overview', url: links.markdownHome, markdown: pageMarkdown('/', origin) },
    { id: 'docs', title: 'Cognistration developer docs', url: links.docsMarkdown, markdown: pageMarkdown('/docs', origin) },
    { id: 'api', title: 'Cognistration API', url: `${links.docs}/#rest-and-natural-language`, markdown: scopedMarkdown('api', origin) },
    { id: 'auth', title: 'Cognistration authentication', url: links.auth, markdown: pageMarkdown('/auth.md', origin) },
    { id: 'pricing', title: 'Cognistration pricing', url: links.pricingMarkdown, markdown: pageMarkdown('/pricing', origin) },
    { id: 'safety', title: 'Cognistration safety', url: `${origin}/health-warning.md`, markdown: SAFETY_MARKDOWN.replaceAll('](/', `](${String(origin).replace(/\/$/, '')}/`) }
  ];
}

export const DOCS_MCP_TOOLS = [
  {
    name: 'search_cognistration_docs',
    title: 'Search Cognistration docs',
    description: 'Search the published Cognistration documentation index for product, API, authentication, pricing, and safety information.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', minLength: 1, maxLength: 240 } },
      required: ['query'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: { id: { type: 'string' }, title: { type: 'string' }, url: { type: 'string', format: 'uri' }, excerpt: { type: 'string' } },
            required: ['id', 'title', 'url', 'excerpt'],
            additionalProperties: false
          }
        }
      },
      required: ['results'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, untrustedContentHint: true },
    authorization: 'public_read',
    sideEffect: 'none'
  },
  {
    name: 'get_cognistration_doc',
    title: 'Read a Cognistration doc',
    description: 'Read one named, published Cognistration documentation page as Markdown with its canonical citation URL.',
    inputSchema: {
      type: 'object',
      properties: { slug: { type: 'string', enum: ['overview', 'docs', 'api', 'auth', 'pricing', 'safety'] } },
      required: ['slug'],
      additionalProperties: false
    },
    outputSchema: {
      type: 'object',
      properties: { id: { type: 'string' }, title: { type: 'string' }, url: { type: 'string', format: 'uri' }, mimeType: { type: 'string', const: 'text/markdown' }, content: { type: 'string' } },
      required: ['id', 'title', 'url', 'mimeType', 'content'],
      additionalProperties: false
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, untrustedContentHint: true },
    authorization: 'public_read',
    sideEffect: 'none'
  }
];

export const DOCS_MCP_RESOURCES = ['overview', 'docs', 'api', 'auth', 'pricing', 'safety'].map((id) => ({
  uri: `cognistration-docs://${id}`,
  name: `Cognistration ${id} documentation`,
  mimeType: 'text/markdown',
  description: `Published ${id} documentation for Cognistration agent integrations.`
}));

export function docsMcpServerInfo(origin = discoveryOrigin()) {
  const links = discoveryLinks(origin);
  return {
    service: DOCS_MCP_SERVER_NAME,
    name: DOCS_MCP_SERVER_NAME,
    version: DOCS_MCP_SERVER_VERSION,
    endpoint: links.docsMcp,
    transport: 'Streamable HTTP',
    protocolVersion: DOCS_MCP_PROTOCOL_VERSION,
    documentation: links.docs,
    readOnly: true,
    tools: DOCS_MCP_TOOLS.map(({ name, title, description }) => ({ name, title, description })),
    resources: DOCS_MCP_RESOURCES
  };
}

export function searchCognistrationDocs(query, origin = discoveryOrigin()) {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return [];
  const terms = normalizedQuery.split(/\s+/).filter(Boolean).slice(0, 12);
  return docsForOrigin(origin)
    .map((doc) => {
      const haystack = `${doc.title} ${doc.markdown}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      const excerptStart = terms.map((term) => haystack.indexOf(term)).filter((index) => index >= 0).sort((a, b) => a - b)[0] || 0;
      const excerpt = doc.markdown.replace(/^#.*\n?/, '').replace(/\s+/g, ' ').trim().slice(Math.max(0, excerptStart - 80), Math.max(0, excerptStart - 80) + 280);
      return { doc, score, excerpt };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.doc.id.localeCompare(b.doc.id))
    .slice(0, 5)
    .map(({ doc, excerpt }) => ({ id: doc.id, title: doc.title, url: doc.url, excerpt }));
}

export function getCognistrationDoc(slug, origin = discoveryOrigin()) {
  const doc = docsForOrigin(origin).find((candidate) => candidate.id === slug);
  if (!doc) return null;
  return { id: doc.id, title: doc.title, url: doc.url, mimeType: 'text/markdown', content: doc.markdown };
}

export function getCognistrationDocResource(uri, origin = discoveryOrigin()) {
  const prefix = 'cognistration-docs://';
  if (!String(uri).startsWith(prefix)) return null;
  const slug = String(uri).slice(prefix.length);
  const doc = getCognistrationDoc(slug, origin);
  return doc ? { uri, mimeType: doc.mimeType, text: doc.content } : null;
}
