# Cognistration MCP catalog B-roll

This folder contains the final 28-second, 16:9 voiceover-ready B-roll clip for
the end of the WebMCP demo. It uses four still captures of the live homepage
`AuroraCurrentBackground` as a slow-moving background and cycles through the
complete public MCP catalog snapshot: 37 tools and 5 skills.

The clip is rendered at 1920×1080, 30 fps, with 24 focused carousel cards.
Related tool names share a card so each card has about 0.83 seconds centered
before the next card enters from the left as the previous card exits right.
The final handoff file has no audio stream, so it can sit directly under a
voiceover or a music bed in the edit.

To re-render from this directory:

```bash
npm install --no-package-lock
npm run typecheck
npm run render
```

The catalog snapshot is in `video/src/catalog.ts`; the Remotion composition is
in `video/src/McpBroll.tsx`.
