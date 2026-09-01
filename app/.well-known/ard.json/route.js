import { ardManifest, jsonDiscoveryHeaders } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(ardManifest()), { headers: jsonDiscoveryHeaders() });
}
