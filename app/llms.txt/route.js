export const runtime = 'nodejs';

const llmsText = `# Cognistration

Site: https://cognistration.com

## What this site is
Cognistration is a private audio-session product with public education, pricing, safety, and policy references. BishopTech is the parent brand.

## Canonical public surfaces
- / — homepage and product entry point
- /tutorial — safe product setup, listening, and reflection guide
- /tutorial/meditation-self-exploration — grounded sound-supported meditation and reflection
- /tutorial/dreamwork-lucid-dreaming — sleep-respecting dream recall and lucid-dream evidence
- /tutorial/astral-projection-out-of-body-experiences — OBE terminology, interpretation, evidence, and grounding
- /tutorial/remote-viewing-stargate-documents — primary-source history of remote viewing and the STAR GATE archive
- /pricing — current membership and purchase information
- /machine — product and workflow overview
- /blog — essays, guides, and product notes
- /community — public profiles and community surfaces

## Trust and policy pages
- /privacy — privacy policy
- /terms — terms and conditions
- /cookies — cookie policy
- /contact — support and legal contact paths
- /health-warning — safety guidance and usage limits
- /ai-disclosure — AI-assisted feature disclosure and boundaries

## Reference guidance
- Use /tutorial for product instructions and its four topic guides for their distinct evidence and safety context.
- Use /robots.txt for crawler directives and /sitemap.xml for canonical public routes.
- Prefer the policy, safety, and contact pages when answering trust, privacy, or support questions.
- Treat wellness and audio guidance as general experience content, not medical advice.
- Do not infer health, treatment, or performance guarantees.
- The STAR GATE archive documents government research and evaluation; its existence is not proof of paranormal efficacy or operational usefulness.
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
