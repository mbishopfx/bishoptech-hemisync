import { publicOpenApiDocument } from '@/lib/agentic/openapi-contract';

export const dynamic = 'force-static';

const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';

export async function GET() {
  return Response.json(publicOpenApiDocument(canonicalOrigin), {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=300'
    }
  });
}
