import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import {
  TONE_PACK_DEFINITIONS,
  TONE_PACK_PRICE_ID_FALLBACK,
  TONE_PACK_TARGET_DURATION_SEC,
  getTonePackPriceId
} from '../lib/audio/tone-packs.mjs';

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMP_ROOT = path.join('/tmp', 'cognistration-weekly-tone-packs');
const BUCKET = 'tone-packs';
const MIN_DURATION_SEC = Math.round(TONE_PACK_TARGET_DURATION_SEC * 0.9);

function loadLocalEnv() {
  for (const fileName of ['.env.local', '.env.production.local', '.env']) {
    const filePath = path.join(ROOT, fileName);
    try {
      const text = readFileSync(filePath, 'utf8');
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const index = trimmed.indexOf('=');
        const key = trimmed.slice(0, index).trim();
        const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key && process.env[key] == null) process.env[key] = value;
      }
    } catch {
      // Optional env files are normal in CI/cron environments.
    }
  }
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
    noBundle: argv.includes('--no-bundle'),
    packSlug: argv.find((value) => value.startsWith('--pack='))?.slice(7) || null
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function hash(value) {
  let result = 2166136261;
  for (const char of String(value)) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function sourceUrl(tone) {
  return tone.webm_url || tone.wav_url || null;
}

function duration(tone) {
  return Math.max(30, Number(tone.duration_sec || 0));
}

function orderedCandidates(tones, packSlug, states) {
  const stateRank = new Map(states.map((state, index) => [state, index]));
  return tones
    .filter((tone) => stateRank.has(tone.state) && sourceUrl(tone))
    .sort((left, right) => {
      const stateDifference = stateRank.get(left.state) - stateRank.get(right.state);
      if (stateDifference) return stateDifference;
      const hashDifference = hash(`${packSlug}:${left.id}`) - hash(`${packSlug}:${right.id}`);
      if (hashDifference) return hashDifference;
      return String(left.id).localeCompare(String(right.id));
    });
}

function selectTracks(tones, definition) {
  const candidates = orderedCandidates(tones, definition.slug, definition.states);
  if (!candidates.length) throw new Error(`No playable tones found for ${definition.slug}`);

  const selected = [];
  const seen = new Set();
  let total = 0;
  let cursor = 0;
  while (total < TONE_PACK_TARGET_DURATION_SEC && cursor < candidates.length * 3) {
    const candidate = candidates[cursor % candidates.length];
    cursor += 1;
    if (seen.has(candidate.id)) continue;
    seen.add(candidate.id);
    selected.push(candidate);
    total += duration(candidate);
  }

  if (total < MIN_DURATION_SEC) {
    throw new Error(`${definition.slug} only reached ${total}s; need at least ${MIN_DURATION_SEC}s`);
  }

  return selected;
}

async function downloadTo(filePath, url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not fetch ${url}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, buffer);
  return buffer.length;
}

async function zipDirectory(sourceDir, outputPath) {
  await execFileAsync('zip', ['-q', '-r', outputPath, '.'], { cwd: sourceDir });
}

async function run() {
  loadLocalEnv();
  const args = parseArgs(process.argv.slice(2));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('Missing Supabase credentials');

  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const definitions = TONE_PACK_DEFINITIONS.filter((definition) => !args.packSlug || definition.slug === args.packSlug);
  if (!definitions.length) throw new Error(`Unknown pack filter: ${args.packSlug}`);

  const { data: tones, error: toneError } = await supabase
    .from('agentic_tones')
    .select('id,name,state,target_hz,base_freq_hz,duration_sec,wav_url,webm_url,description,summary,metadata,created_at')
    .order('created_at', { ascending: true });
  if (toneError) throw toneError;
  if (!tones?.length) throw new Error('The agentic_tones table returned no tones');

  const playableCount = tones.filter((tone) => sourceUrl(tone)).length;
  console.log(JSON.stringify({ phase: 'source-inventory', tones: tones.length, playable: playableCount, packs: definitions.length }));
  if (args.dryRun) {
    for (const definition of definitions) {
      const selected = selectTracks(tones, definition);
      console.log(JSON.stringify({ pack: definition.slug, tracks: selected.length, durationSec: selected.reduce((sum, tone) => sum + duration(tone), 0), states: selected.map((tone) => tone.state) }));
    }
    return;
  }

  const { error: bucketError } = await supabase.storage.createBucket(BUCKET, { public: true });
  if (bucketError && !String(bucketError.message || '').toLowerCase().includes('already exists')) throw bucketError;
  await fs.mkdir(TEMP_ROOT, { recursive: true });
  const results = [];
  const generatedPacks = [];

  for (const definition of definitions) {
    const selected = selectTracks(tones, definition);
    const packDir = path.join(TEMP_ROOT, definition.slug);
    const tracksDir = path.join(packDir, 'tracks');
    const bundleDir = path.join(packDir, 'bundle');
    await fs.rm(packDir, { recursive: true, force: true });
    await fs.mkdir(tracksDir, { recursive: true });
    await fs.mkdir(bundleDir, { recursive: true });

    const trackRows = [];
    for (const [sortOrder, tone] of selected.entries()) {
      const extension = tone.webm_url ? 'webm' : 'wav';
      const trackId = `${definition.slug}-${slugify(tone.id)}`;
      const fileName = `${slugify(tone.name || tone.id)}.${extension}`;
      const localPath = path.join(tracksDir, fileName);
      const bytes = await downloadTo(localPath, sourceUrl(tone));
      const storagePath = `packs/${definition.slug}/${fileName}`;
      const file = await fs.readFile(localPath);
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
        contentType: extension === 'webm' ? 'audio/webm' : 'audio/wav',
        upsert: true
      });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
      await fs.copyFile(localPath, path.join(bundleDir, fileName));
      trackRows.push({
        pack_slug: definition.slug,
        pack_name: definition.name,
        track_id: trackId,
        track_name: tone.name || tone.id,
        short_label: tone.metadata?.variantLabel || tone.name || tone.id,
        state: tone.state,
        target_state: tone.state,
        target_hz: Number(tone.target_hz || 0),
        base_freq_hz: Number(tone.base_freq_hz || 0),
        duration_sec: Math.round(duration(tone)),
        preview_seconds: 30,
        preview_url: publicUrl,
        download_url: publicUrl,
        file_name: storagePath,
        sort_order: sortOrder,
        source_tone_id: tone.id,
        source_url: sourceUrl(tone),
        file_extension: extension,
        metadata: {
          source: 'agentic_tones',
          sourceToneId: tone.id,
          sourceToneName: tone.name,
          sourceToneSummary: tone.summary || null,
          sourceBytes: bytes,
          packStrategy: definition.strategy
        }
      });
    }

    let bundleUrl = null;
    if (!args.noBundle) {
      const bundlePath = path.join(packDir, `${definition.slug}.zip`);
      await zipDirectory(bundleDir, bundlePath);
      const bundleStoragePath = `bundles/${definition.slug}.zip`;
      const bundle = await fs.readFile(bundlePath);
      const { error: bundleError } = await supabase.storage.from(BUCKET).upload(bundleStoragePath, bundle, {
        contentType: 'application/zip',
        upsert: true
      });
      if (bundleError) throw bundleError;
      bundleUrl = supabase.storage.from(BUCKET).getPublicUrl(bundleStoragePath).data.publicUrl;
    }

    const totalDuration = trackRows.reduce((sum, track) => sum + track.duration_sec, 0);
    const priceId = getTonePackPriceId(definition) || TONE_PACK_PRICE_ID_FALLBACK;
    const { error: packError } = await supabase.from('tone_packs').upsert({
      slug: definition.slug,
      name: definition.name,
      price_id: priceId,
      price_cents: 599,
      duration_sec: totalDuration,
      track_count: trackRows.length,
      description: definition.description,
      summary: definition.summary,
      states: definition.states,
      bundle_url: bundleUrl,
      published: true,
      metadata: {
        eyebrow: definition.eyebrow,
        bestFor: definition.bestFor,
        strategy: definition.strategy,
        generatedFrom: 'agentic_tones',
        generatedAt: new Date().toISOString()
      },
      updated_at: new Date().toISOString()
    }, { onConflict: 'slug' });
    if (packError) throw packError;

    const { error: tracksError } = await supabase.from('tone_pack_tracks').upsert(trackRows, { onConflict: 'pack_slug,track_id' });
    if (tracksError) throw tracksError;

    generatedPacks.push({
      ...definition,
      price: '$5.99',
      priceId,
      checkoutPlanId: definition.slug,
      billingMode: 'payment',
      targetDurationSec: TONE_PACK_TARGET_DURATION_SEC,
      durationSec: totalDuration,
      durationLabel: 'About 50 minutes total',
      trackCount: trackRows.length,
      bundleUrl,
      features: [
        `${trackRows.length} full-length audio sessions`,
        'About 50 minutes total',
        'MP3/WebM audio download after payment',
        'No account required'
      ],
      tracks: trackRows
    });
    results.push({ slug: definition.slug, tracks: trackRows.length, durationSec: totalDuration, bundleUrl });
    console.log(JSON.stringify({ phase: 'pack-published', ...results.at(-1) }));
  }

  if (!args.packSlug) {
    const generatedModule = `export const GENERATED_TONE_PACKS = ${JSON.stringify(generatedPacks, null, 2)};\n`;
    await fs.writeFile(path.join(ROOT, 'lib', 'audio', 'tone-pack-generated.mjs'), generatedModule);
  }

  console.log(JSON.stringify({ ok: true, sourceToneCount: tones.length, packs: results }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
