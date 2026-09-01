import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('member dashboard keeps the navigation focused on five first-class surfaces', async () => {
  const dashboard = await source('app/dashboard/page.jsx');

  const navBlock = dashboard.match(/const navItems = \[(.*?)\];/s)?.[1] || '';
  assert.deepEqual(
    [...navBlock.matchAll(/id: '([^']+)', label: '([^']+)'/g)].map((match) => [match[1], match[2]]),
    [['today', 'Today'], ['journal', 'Journal'], ['agent', 'Sync'], ['studio', 'Studio'], ['library', 'Library']]
  );
  assert.doesNotMatch(navBlock, /Workshop|workshop/);
  assert.match(dashboard, /<StudioView\s+mode="studio"/);
  assert.match(dashboard, /<WorkshopComposer/);
  assert.match(dashboard, /<DailyView\s+onOpenStudio=/);
  assert.match(dashboard, /<JournalView/);
});

test('member practice and journal surfaces use durable APIs and light glass primitives', async () => {
  const daily = await source('components/dashboard/DailyView.jsx');
  const journal = await source('components/dashboard/JournalView.jsx');
  const trackerRoute = await source('app/api/member/tracker/route.js');
  const journalRoute = await source('app/api/journal/route.js');

  assert.match(daily, /\/api\/member\/tracker/);
  assert.match(daily, /workspace-glass-card/);
  assert.match(daily, /workspace-glass-button/);
  assert.match(daily, /const updateTarget = async/);
  assert.match(daily, /targetMinutes: target/);
  assert.match(journal, /\/api\/journal/);
  assert.match(journal, /workspace-glass-card/);
  assert.match(journal, /Save privately/);
  assert.match(journal, /Shape a session/);
  assert.match(journal, /mood: form\.mood \|\| undefined/);
  assert.match(trackerRoute, /requirePlatformSubscriber/);
  assert.match(trackerRoute, /summarizePracticeDays/);
  assert.match(journalRoute, /is_favorite/);
  assert.match(journalRoute, /fallbackJournalAnalysis/);
});

test('the complete member workspace shares hoverable glass treatment', async () => {
  const studio = await source('components/dashboard/StudioView.jsx');
  const liveControls = await source('components/dashboard/WorkshopComposer.jsx');
  const library = await source('components/dashboard/LibraryBrowser.jsx');
  const player = await source('components/audio/LibraryPlayer.jsx');
  const css = await source('app/globals.css');

  assert.match(studio, /STUDIO_MAX_DURATION_SEC/);
  assert.match(studio, /workspace-glass-button/);
  assert.match(liveControls, /await ctx\.resume\(\)/);
  assert.match(library, /workspace-library-card/);
  assert.match(library, /workspace-library-tab/);
  assert.match(player, /workspace-library-player/);
  assert.match(css, /\.workspace-glass-card\s*\{/);
  assert.match(css, /\.workspace-glass-button:hover:not\(:disabled\)/);
  assert.match(css, /\.workspace-library-card:hover\s*\{/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});

test('member workspace keeps visual affordances separated and contextual', async () => {
  const dashboard = await source('app/dashboard/page.jsx');
  const bridge = await source('components/agent/MemberWebMcpBridge.jsx');
  const daily = await source('components/dashboard/DailyView.jsx');
  const journal = await source('components/dashboard/JournalView.jsx');
  const studio = await source('components/dashboard/StudioView.jsx');
  const tryCockpit = await source('components/challenge/TryCockpit.jsx');

  assert.match(journal, /workspace-leading-input/);
  assert.match(journal, /workspace-leading-select/);
  assert.match(journal, /CaretDown/);
  assert.doesNotMatch(journal, /Sparkle/);
  assert.match(daily, /daily-progress-ring/);
  assert.doesNotMatch(daily, /conic-gradient/);
  assert.match(bridge, /workspace-member-bridge/);
  assert.doesNotMatch(dashboard, /absolute right-6 top-24/);
  assert.match(studio, /studio-header/);
  assert.match(studio, /min-h-\[4\.25rem\]/);
  assert.doesNotMatch(tryCockpit, /Sparkle/);
});
