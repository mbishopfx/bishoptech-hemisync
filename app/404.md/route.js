export const dynamic = 'force-static';

const body = `# Cognistration route not found

The requested public route is not available. Read the [developer docs](https://cognistration.com/docs.md), [agent instructions](https://cognistration.com/agent-instructions.md), or [API contract](https://cognistration.com/openapi.json) to discover supported surfaces.
`;

export function GET() {
  return new Response(body, {
    status: 404,
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=60, s-maxage=60'
    }
  });
}
