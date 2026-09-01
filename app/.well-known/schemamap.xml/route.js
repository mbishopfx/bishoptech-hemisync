import { discoveryOrigin, schemaMapXml } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response(schemaMapXml(discoveryOrigin()), {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=300, s-maxage=300'
    }
  });
}
