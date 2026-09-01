import { jsonDiscoveryHeaders, mcpCompatibilityManifest } from '@/lib/agentic/discovery-contract';
import { POST as handleMcpPost } from '@/app/api/mcp/route';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(mcpCompatibilityManifest()), { headers: jsonDiscoveryHeaders() });
}

export function POST(request) {
  return handleMcpPost(request);
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: jsonDiscoveryHeaders() });
}
