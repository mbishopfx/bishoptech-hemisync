import { publicDiscoverySummary } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-dynamic';

export function GET() {
  const summary = publicDiscoverySummary();
  return Response.json({
    mode: 'agent',
    service: summary.service,
    version: summary.version,
    message: 'Cognistration machine-readable discovery mode. Use the published links and schemas; interactive playback and user submissions remain user-controlled.',
    links: summary.links,
    scopes: summary.scopes,
    webmcp: summary.webmcp,
    mcp: {
      tools: summary.manifest.mcp.tools,
      resources: summary.manifest.mcp.resources,
      endpoint: summary.links.mcp,
      protocol: 'Streamable HTTP'
    }
  }, { headers: { 'cache-control': 'public, max-age=60, s-maxage=60', vary: 'Accept, User-Agent' } });
}
