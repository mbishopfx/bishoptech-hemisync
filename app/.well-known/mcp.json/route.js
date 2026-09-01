import { mcpServerCard, mcpServerCardHeaders } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response(JSON.stringify(mcpServerCard()), { headers: mcpServerCardHeaders() });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: mcpServerCardHeaders() });
}
