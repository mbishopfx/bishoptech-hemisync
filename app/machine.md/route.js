import { markdownHeaders, pageMarkdown } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response(pageMarkdown('/machine'), { headers: markdownHeaders() });
}
