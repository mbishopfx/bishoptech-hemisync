import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { assertDeliveryCooldown, assertStudioOwnership, getRenderClaimDecision } from '../lib/studio/lifecycle.js';

test('private Studio resources enforce owner identity', () => {
  const record = { id: 'render-1', user_id: 'subscriber-1' };
  assert.equal(assertStudioOwnership(record, 'subscriber-1'), record);
  assert.throws(() => assertStudioOwnership(record, 'subscriber-2'), (error) => error.status === 404);
});

test('render lifecycle prevents duplicate runs and permits stale retries', () => {
  const now = Date.parse('2026-07-13T12:00:00.000Z');
  assert.equal(getRenderClaimDecision({ status: 'completed', phase: 'completed' }, now), 'completed');
  assert.equal(getRenderClaimDecision({ status: 'rendering', phase: 'uploading', updated_at: '2026-07-13T11:59:30.000Z' }, now), 'running');
  assert.equal(getRenderClaimDecision({ status: 'rendering', phase: 'validating', updated_at: '2026-07-13T11:00:00.000Z' }, now), 'claim');
  assert.equal(getRenderClaimDecision({ status: 'failed', phase: 'failed', updated_at: '2026-07-13T11:59:30.000Z' }, now), 'claim');
});

test('delivery email records have a rapid-send cooldown', () => {
  const now = Date.parse('2026-07-13T12:00:00.000Z');
  assert.throws(() => assertDeliveryCooldown({ delivery_email_sent_at: '2026-07-13T11:59:30.000Z' }, now), (error) => error.status === 429);
  assert.doesNotThrow(() => assertDeliveryCooldown({ delivery_email_sent_at: '2026-07-13T11:58:00.000Z' }, now));
});

test('dashboard navigation and data flow omit social surfaces while preserving Sync generation', async () => {
  const source = await readFile(new URL('../app/dashboard/page.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /FeedView|JournalView|SettingsView|Broadcast Wave|\/api\/feed/);
  assert.match(source, /fetch\('\/api\/agent'/);
  assert.match(source, /Save to Library/);
  assert.match(source, /id: 'studio', label: 'Studio'/);
});

test('Studio profile bootstrap does not depend on retired social counters', async () => {
  const source = await readFile(new URL('../lib/auth/session.js', import.meta.url), 'utf8');
  const migration = await readFile(new URL('../supabase/migrations/202607130003_profile_generation_counter.sql', import.meta.url), 'utf8');
  assert.match(source, /PROFILE_BOOTSTRAP_SELECT/);
  assert.doesNotMatch(source, /profileSelect\(/);
  assert.match(migration, /add column if not exists generation_count/);
  assert.match(migration, /increment_generation_count/);
});

test('Railway render endpoint accepts authenticated cross-origin starts', async () => {
  const source = await readFile(new URL('../app/api/studio/renders/[renderId]/run/route.js', import.meta.url), 'utf8');
  const corsSource = await readFile(new URL('../lib/http/cors.js', import.meta.url), 'utf8');
  assert.match(source, /export function OPTIONS/);
  assert.match(source, /Access-Control-Allow-Headers.*Authorization/);
  assert.match(source, /corsJson/);
  assert.match(corsSource, /DEFAULT_ALLOWED_HEADERS = 'Authorization,/);
});
