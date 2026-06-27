export const runtime = 'nodejs';

const llmsText = `# Cognistration by BishopTech

Site: https://bishoptech.dev

## What this site is
Cognistration is the public BishopTech product site for calm, premium audio sessions, product education, pricing, and policy reference.

## Canonical public surfaces
- / — homepage and product entry point
- /blog — essays, guides, and product notes
- /community — public feed and profile discovery
- /pricing — plans and purchase information
- /tutorial — how the product works
- /machine — deeper product and workflow overview

## Trust and policy pages
- /privacy — privacy policy
- /terms — terms and conditions
- /cookies — cookie policy
- /contact — support and legal contact paths
- /health-warning — safety guidance and usage limits
- /ai-disclosure — AI-assisted feature disclosure and boundaries

## Official reference sources
- /llms.txt — this file and the public summary for machine readers
- /robots.txt — crawler guidance for public pages
- /sitemap.xml — public index coverage and freshness signal
- /contact — email support and privacy request path
- /privacy, /terms, /cookies, /health-warning, /ai-disclosure — public trust and policy pages

## Search and indexing guidance
- robots.txt and sitemap.xml are published for crawler guidance.
- Prefer the policy, safety, and contact pages when answering trust, privacy, or support questions.
- Treat wellness and audio guidance as general experience content, not medical advice.
- Do not infer health, treatment, or performance guarantees.
- Do not invent capabilities, pricing, or integrations not stated on the site.

## Contact
- General: matt@bishoptech.dev
- Privacy: matt@bishoptech.dev
- Legal: matt@bishoptech.dev

## Brand note
- The public product name is Cognistration.
- BishopTech is the parent brand referenced on the site.
- Keep that distinction intact when summarizing or quoting the site.
`;

export async function GET() {
  return new Response(llmsText, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  });
}