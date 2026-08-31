import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

test('the published header uses the MCP menu and protects the ChatGPT setup modal', async () => {
  const header = await readFile(new URL('../components/layout/LiquidHeader.jsx', import.meta.url), 'utf8');

  assert.match(header, /aria-controls="site-menu"/);
  assert.match(header, /Add to ChatGPT/);
  assert.match(header, /MCP ready/);
  assert.match(header, /body\.style\.overflow = 'hidden'/);
  assert.match(header, /documentElement\.style\.overflow = 'hidden'/);
  assert.match(header, /!overflow-y-auto overscroll-contain/);
  assert.match(header, /data-testid="chatgpt-connect-scroll"/);
  assert.match(header, /createPortal/);
  assert.match(header, /document\.body/);
  assert.match(header, /!absolute right-5 top-5 z-10/);
  assert.match(header, /setShowPluginInstructions\(true\)/);
  assert.match(header, /aria-expanded=\{showPluginInstructions\}/);
  assert.doesNotMatch(header, /<Sparkle/);

  for (const asset of ['openai.svg', 'claude-color.svg', 'cursor.svg', 'geminicli-color.svg', 'codex-color.svg']) {
    const svg = await readFile(new URL(`../public/images/ai-logos/${asset}`, import.meta.url), 'utf8');
    assert.match(svg, /^<svg/);
  }
});
