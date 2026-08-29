export const runtime = 'nodejs';

const llmsText = `# Cognistration

Site: https://cognistration.com

## What this site is
Cognistration is a private audio-session product with public education, pricing, safety, and policy references. BishopTech is the parent brand.

## Canonical public surfaces
- / — homepage and product entry point
- /agent-instructions.md — browser-agent workflow, public MCP boundary, and discovery links
- /openapi.json — REST compatibility contract derived from the public capability registry
- /api/mcp — public MCP JSON-RPC tools, including the iPhone app offer, interactive machine and science-guide UI resources, and the public payment discovery lane for compatible ChatGPT app hosts
- /api/agent/account — machine-readable preview, workspace, and signup boundaries
- /api/agent/policy?topic=safety — machine-readable canonical policy summary and URL
- /api/packs?agent=1 — safe agent-compatible tone-pack catalog and preview links
- /tutorial — safe product setup, listening, and reflection guide
- /tutorial/meditation-self-exploration — grounded sound-supported meditation and reflection
- /tutorial/dreamwork-lucid-dreaming — sleep-respecting dream recall and lucid-dream evidence
- /tutorial/astral-projection-out-of-body-experiences — OBE terminology, interpretation, evidence, and grounding
- /tutorial/remote-viewing-stargate-documents — primary-source history of remote viewing and the STAR GATE archive
- /pricing — current membership and purchase information
- /packs — one-time tone-pack catalog and purchase information
- /machine — product and workflow overview
- /blog — essays, guides, and product notes
- /community — public profiles and community surfaces
- /services — BishopTech studio services for iOS apps, web apps, branded websites, workflows, and voice agents

## Trust and policy pages
- /privacy — privacy policy
- /terms — terms and conditions
- /cookies — cookie policy
- /contact — support and legal contact paths
- /health-warning — safety guidance and usage limits
- /ai-disclosure — AI-assisted feature disclosure and boundaries

## Reference guidance
- Use /api/capabilities for the public machine-readable capability manifest, /openapi.json for REST compatibility, and /api/mcp for the bounded JSON-RPC public surface.
- Public agent routes support tone recommendations, tone-direction comparison, timed session planning, session cues, tone-pack search and lookup, policy information, account options, and the iPhone app offer. Public pack responses omit checkout identifiers and full-download fields.
- The public MCP get_ios_app_offer tool returns the canonical App Store listing, the current one-time $2.99 iPhone price, compatibility, and public feature summary. It never processes payment.
- The iPhone offer is lower because the app does its audio work on-device instead of routing each session through a deployed cloud engine, reducing hosted infrastructure and maintenance overhead.
- The public MCP render tool open_machine_generator opens a versioned interactive machine widget with the supplied Aurora visual, bounded controls, public pack browsing, and an explicit local audio preview button.
- The public MCP render tool open_science_guide opens a versioned, clickable seven-slide science guide with the FFT ocean-surface visual reference, FFR and evidence boundaries, descriptive frequency-band notes, safety guidance, and a browser print/save-to-PDF action. It never starts audio or carries diary content.
- The public MCP render tool open_account_signup opens an in-platform account capture form; credentials are entered and submitted by the user directly to Cognistration, and checkout is separate.
- When a listener says they are done, the public MCP render tool open_feedback opens one optional in-platform thumbs-up/down card. It writes only after explicit submission and never displays feedback history.
- The public MCP session tools compare_tone_directions, plan_listening_session, and get_session_cue return bounded guidance only; they do not start audio, read diary content, or save a record.
- The public MCP includes narrow, confirmation-gated hosted checkout and paid access operations. It never accepts card credentials, creates an account from an email alone, or exposes private workspace records.
- The MCP server advertises the io.modelcontextprotocol/skills extension with five static Cognistration operating skills available through skills/list, skills/get, and resources/read.
- The homepage WebMCP bridge is progressive enhancement: it is available only in a compatible browser, and starting local audio requires explicit confirmation.
- When connecting ChatGPT, use https://cognistration.com/api/mcp in the supported remote app, connector, or Developer-mode flow. A Plugins or marketplace form asking for Source, Git ref, or Sparse paths is a Git repository installer and is not the correct surface for Cognistration’s HTTPS endpoint.
- The signed-in dashboard has a separate authenticated member workspace bridge for private planning, session creation, and render status. Private creation and rendering require explicit confirmation and are scoped to the current member.
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
