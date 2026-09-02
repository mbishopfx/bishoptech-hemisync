export const runtime = 'nodejs';

const llmsText = `---
title: Cognistration agent index
description: Canonical product, API, MCP, WebMCP, and safety discovery links for Cognistration.
canonical: https://cognistration.com/llms.txt
last-updated: 2026-09-01
---

# Cognistration

Site: https://cognistration.com

## What this site is
Cognistration is a private audio-session product with public education, pricing, safety, and policy references. BishopTech is the parent brand.

## Canonical public surfaces
- [Homepage](https://cognistration.com/) — homepage and product entry point
- [Agent instructions](https://cognistration.com/agent-instructions.md) — browser-agent workflow, public MCP boundary, and discovery links
- [OpenAPI](https://cognistration.com/openapi.json) — REST compatibility contract derived from the public capability registry
- [Product MCP](https://cognistration.com/api/mcp) — public MCP JSON-RPC tools and MCP Apps UI resources
- [MCP Server Card](https://cognistration.com/api/mcp/server-card) — standard Streamable HTTP connection metadata
- [Documentation MCP](https://cognistration.com/api/docs-mcp) — read-only documentation search and retrieval
- [Source repository](https://github.com/mbishopfx/bishoptech-hemisync) — public agent configs, skills, plugin manifest, MCP configuration, and SDK source
- [Agent Plugin manifest](https://github.com/mbishopfx/bishoptech-hemisync/blob/main/plugin.json) — portable Agent Plugins metadata
- [Agent Plugin MCP configuration](https://github.com/mbishopfx/bishoptech-hemisync/blob/main/mcp.json) — product and documentation MCP server entries
- [SDK and CLI packages](https://github.com/mbishopfx/bishoptech-hemisync/tree/main/packages) — TypeScript, Python, Go, Ruby, and CLI source packages
- [Developer docs](https://cognistration.com/docs) — SDK-style reference for tools, protocol commands, resources, skills, prompts, routes, and safety boundaries
- [Capability manifest](https://cognistration.com/api/capabilities) — machine-readable platform boundaries
- [Account options](https://cognistration.com/api/agent/account) — public preview, private workspace, and user-controlled signup boundaries
- [Safety policy](https://cognistration.com/api/agent/policy?topic=safety) — machine-readable canonical safety summary and URL
- [Tone-pack catalog](https://cognistration.com/api/packs?agent=1) — safe agent-compatible tone-pack metadata and preview links
- [Natural-language endpoint](https://cognistration.com/ask) — bounded /ask query surface
- [A2A endpoint](https://cognistration.com/a2a) — stateless JSON compatibility surface
- [Deterministic sandbox](https://cognistration.com/api/sandbox) — no-write integration test surface
- [Tutorial](https://cognistration.com/tutorial) — safe product setup, listening, and reflection guide
- [Pricing](https://cognistration.com/pricing) — current membership and purchase information
- [Tone packs](https://cognistration.com/packs) — one-time tone-pack catalog and purchase information
- [Machine](https://cognistration.com/machine) — product and workflow overview
- [Blog](https://cognistration.com/blog) — essays, guides, and product notes
- [Community](https://cognistration.com/community) — public profiles and community surfaces
- [BishopTech services](https://cognistration.com/services) — studio services for iOS apps, web apps, branded websites, workflows, and voice agents

## Trust and policy pages
- /privacy — privacy policy
- /terms — terms and conditions
- /cookies — cookie policy
- /contact — support and legal contact paths
- /health-warning — safety guidance and usage limits
- /ai-disclosure — AI-assisted feature disclosure and boundaries

## Reference guidance
- Use /api/capabilities for the public machine-readable capability manifest, /openapi.json for REST compatibility, and /api/mcp for the bounded JSON-RPC public surface.
- Public agent routes support tone recommendations, tone-direction comparison, timed session planning, session cues, tone-pack search and lookup, policy information, account options, the iPhone app offer, hosted tone-pack checkout/delivery, and the fixed-price tone-pack Machine Payments Protocol route. Public catalog responses omit checkout identifiers and full-download fields.
- The public MCP get_ios_app_offer tool returns the canonical App Store listing, the current one-time $2.99 iPhone price, compatibility, and public feature summary. It never processes payment.
- The iPhone offer is lower because the app does its audio work on-device instead of routing each session through a deployed cloud engine, reducing hosted infrastructure and maintenance overhead.
- The public MCP render tool open_machine_generator opens a versioned interactive machine widget with the supplied Aurora visual, bounded controls, public pack browsing, and an explicit local audio preview button. It is the only machine command that renders a UI template. The companion MCP commands get_machine_control_contract, set_machine_controls, adjust_machine_controls, set_machine_direction, start_machine_preview, stop_machine_preview, and open_machine_fullscreen are template-free actions delivered to that same mounted widget; relative changes such as “speed it up” update the existing audio nodes without pausing playback, while browser autoplay may still require a visible user gesture. A start request is not an audible-playback confirmation: the widget must report audioReady=true.
- The public MCP render tool open_science_guide opens a versioned, clickable seven-slide science guide with a vGPU FFT ocean surface and a bounded randomized sea profile per run, a quiet FFT visual reference link, FFR and evidence boundaries, descriptive frequency-band notes, safety guidance, and a Download PDF action that exports a static snapshot with the ocean run metadata. It never starts audio or carries diary content.
- The public MCP render tool open_account_signup opens an in-platform account capture form; credentials are entered and submitted by the user directly to Cognistration, and checkout is separate.
- When a listener says they are done, the public MCP render tool open_feedback opens one optional in-platform thumbs-up/down card. It writes only after explicit submission and never displays feedback history.
- The public MCP session tools compare_tone_directions, plan_listening_session, and get_session_cue return bounded guidance only; they do not start audio, read diary content, or save a record.
- The public MCP includes narrow, confirmation-gated hosted checkout and paid access operations. The tone-pack card asks for a delivery email and reveals a download action only from server-verified delivery; a compatible agent may use the separate fixed $5.99 MPP pack route. It never accepts card credentials, creates an account from an email alone, or exposes private workspace records.
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
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  });
}
