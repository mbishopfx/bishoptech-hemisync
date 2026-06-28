import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { TONE_PACKS } from '../lib/audio/tone-packs.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const BUCKET = 'tone-packs';
const SAMPLE_RATE = 44100;
const DURATION_SEC = 960;
const TMP_DIR = path.join('/tmp', 'cognistration-tone-pack-foundations');
const PACK = TONE_PACKS.find((item) => item.slug === 'foundations-pack');

if (!PACK) {
  throw new Error('Foundations pack catalog is missing');
}

function loadLocalEnv() {
  const envFiles = ['.env.local', '.env.production.local', '.env.development.local', '.env'];
  return Promise.all(envFiles.map(async (fileName) => {
    const filePath = path.join(ROOT, fileName);
    try {
      const text = await fs.readFile(filePath, 'utf8');
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key && process.env[key] == null) process.env[key] = value;
      }
    } catch {
      // ignore missing env files
    }
  }));
}

async function run(command, args) {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited ${code}: ${stderr.trim()}`));
    });
  });
}

function tonePlan(track) {
  const baseFreq = track.baseFreqHz;
  const targetHz = track.targetHz;
  return {
    leftFreq: baseFreq,
    rightFreq: Number((baseFreq + targetHz).toFixed(2)),
    description: `${track.name} — ${track.shortLabel}`
  };
}

async function renderTrack(track, outputPath) {
  const plan = tonePlan(track);
  const args = [
    '-y',
    '-f', 'lavfi',
    '-i', `sine=frequency=${plan.leftFreq}:sample_rate=${SAMPLE_RATE}:duration=${DURATION_SEC}`,
    '-f', 'lavfi',
    '-i', `sine=frequency=${plan.rightFreq}:sample_rate=${SAMPLE_RATE}:duration=${DURATION_SEC}`,
    '-filter_complex', [
      `[0:a]volume=0.18,afade=t=in:st=0:d=4,afade=t=out:st=${DURATION_SEC - 4}:d=4[a0]`,
      `[1:a]volume=0.18,afade=t=in:st=0:d=4,afade=t=out:st=${DURATION_SEC - 4}:d=4[a1]`,
      `[a0][a1]amerge=inputs=2,aresample=${SAMPLE_RATE}[aout]`
    ].join(';'),
    '-map', '[aout]',
    '-c:a', 'libopus',
    '-b:a', '64k',
    outputPath
  ];

  await run('ffmpeg', args);
}

async function main() {
  await loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase credentials');

  const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  await fs.mkdir(TMP_DIR, { recursive: true });
  await supabase.storage.createBucket(BUCKET, { public: true, allowedMimeTypes: ['audio/webm', 'audio/opus', 'audio/mp3', 'audio/mpeg'] }).catch(() => {});

  const created = [];
  for (const track of PACK.tracks) {
    const localPath = path.join(TMP_DIR, `${track.id}.webm`);
    const storagePath = `foundations/${track.state}/${track.id}.webm`;
    process.stdout.write(`Rendering ${track.name}\n`);
    await renderTrack(track, localPath);
    const file = await fs.readFile(localPath);
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
      contentType: 'audio/webm',
      upsert: true
    });
    if (uploadError) throw uploadError;

    const webmUrl = supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
    created.push({
      ...track,
      webmUrl,
      webm_url: webmUrl,
      mp3Url: webmUrl,
      mp3_url: webmUrl,
      durationSec: DURATION_SEC,
      duration_sec: DURATION_SEC,
      metadata: {
        ...(track.metadata || {}),
        webmUrl,
        sourceType: 'tone-pack'
      }
    });
  }

  const outModule = `export const TONE_PACK_FOUNDATIONS = ${JSON.stringify({
    ...PACK,
    tracks: created
  }, null, 2)};\n`;
  await fs.writeFile(path.join(ROOT, 'lib', 'audio', 'tone-pack-foundations.js'), outModule);

  console.log(JSON.stringify({ ok: true, inserted: created.length, pack: PACK.slug, sample: created.slice(0, 3) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
