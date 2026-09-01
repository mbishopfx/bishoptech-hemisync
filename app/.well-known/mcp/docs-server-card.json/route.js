import { jsonDiscoveryHeaders, discoveryLinks } from '@/lib/agentic/discovery-contract';
import { DOCS_MCP_RESOURCES, DOCS_MCP_SERVER_NAME, DOCS_MCP_SERVER_VERSION, DOCS_MCP_TOOLS } from '@/lib/agentic/docs-mcp-contract';

export const dynamic = 'force-static';

export function GET() {
  const links = discoveryLinks();
  return new Response(JSON.stringify({
    name: DOCS_MCP_SERVER_NAME,
    description: 'Read-only documentation search and retrieval for Cognistration agent integrations.',
    version: DOCS_MCP_SERVER_VERSION,
    serverUrl: links.docsMcp,
    transport: 'Streamable HTTP',
    tools: DOCS_MCP_TOOLS,
    resources: DOCS_MCP_RESOURCES,
    documentationUrl: links.docs,
    authentication: { public: 'anonymous', writes: false }
  }), { headers: jsonDiscoveryHeaders() });
}
