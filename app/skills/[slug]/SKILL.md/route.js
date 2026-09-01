import { markdownHeaders } from '@/lib/agentic/discovery-contract';
import { readSkillResource } from '@/lib/agentic/skill-capability';

export const dynamic = 'force-static';
export const dynamicParams = true;

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const slug = String(resolvedParams?.slug || '');
  const resource = readSkillResource(`skill://cognistration/${slug}/SKILL.md`);
  if (!resource) return new Response('# Skill not found\n', { status: 404, headers: markdownHeaders({ cacheControl: 'public, max-age=60' }) });
  return new Response(resource.text, { headers: markdownHeaders({ cacheControl: 'public, max-age=300, s-maxage=300' }) });
}
