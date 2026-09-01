import { markdownHeaders, scopedMarkdown } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response(scopedMarkdown('docs'), { headers: markdownHeaders() });
}
