import { jsonDiscoveryHeaders, publicAgentCard } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(publicAgentCard()), { headers: jsonDiscoveryHeaders() });
}
