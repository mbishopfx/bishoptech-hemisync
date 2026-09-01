import { apiCatalogLinkset, discoveryLinks, jsonDiscoveryHeaders } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

function headers() {
  return {
    ...jsonDiscoveryHeaders(),
    'content-type': 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
    link: `<${discoveryLinks().apiCatalog}>; rel="api-catalog"`
  };
}

export function GET() {
  return new Response(JSON.stringify(apiCatalogLinkset()), { headers: headers() });
}

export function HEAD() {
  return new Response(null, { headers: headers() });
}
