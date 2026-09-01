import { jsonDiscoveryHeaders, mcpCompatibilityManifest } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(mcpCompatibilityManifest()), { headers: jsonDiscoveryHeaders() });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: jsonDiscoveryHeaders() });
}
