import { jsonDiscoveryHeaders, mcpCompatibilityManifest } from '@/lib/agentic/discovery-contract';
import { POST as handleMcpPost } from '@/app/api/mcp/route';

export const dynamic = 'force-static';

export function GET() {
  // This established .json path is retained as a compatibility manifest for
  // clients that expect the pre-Server-Card tool catalog shape. The preferred
  // standards-based card lives at /api/mcp/server-card.
  return new Response(JSON.stringify(mcpCompatibilityManifest()), { headers: jsonDiscoveryHeaders() });
}

export function POST(request) {
  return handleMcpPost(request);
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: jsonDiscoveryHeaders() });
}
