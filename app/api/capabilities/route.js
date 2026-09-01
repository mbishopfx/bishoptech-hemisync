import { NextResponse } from 'next/server';
import { capabilityManifest } from '@/lib/agentic/mcp-contract';
import { webMcpManifestTools } from '@/lib/agentic/webmcp-contract';
import { publicToneCatalogSummary } from '@/lib/agentic/tone-capability';
import { publicTonePackCatalogSummary } from '@/lib/agentic/pack-capability';
import { policyCatalogSummary } from '@/lib/agentic/policy-capability';
import { publicAccountOptions } from '@/lib/agentic/account-capability';
import { skillCatalogSummary } from '@/lib/agentic/skill-capability';
import { discoveryLinks } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

const canonicalOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://cognistration.com';

export async function GET() {
  const manifest = capabilityManifest(canonicalOrigin);
  return NextResponse.json({
    ...manifest,
    publicCatalog: publicToneCatalogSummary(),
    publicTonePacks: publicTonePackCatalogSummary(),
    policies: policyCatalogSummary(canonicalOrigin),
    accountOptions: publicAccountOptions(canonicalOrigin),
    skills: skillCatalogSummary(),
    webmcp: {
      ...manifest.webmcp,
      tools: webMcpManifestTools()
    },
    discovery: {
      ...discoveryLinks(canonicalOrigin),
      markdown: {
        home: `${canonicalOrigin}/index.md`,
        pricing: `${canonicalOrigin}/pricing.md`,
        docs: `${canonicalOrigin}/docs.md`,
        auth: `${canonicalOrigin}/auth.md`
      }
    }
  }, {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=300'
    }
  });
}
