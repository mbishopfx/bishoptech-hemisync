import { readFile } from 'fs/promises';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const TEMPLATE_SAMPLE_BUCKET_ID = 'template-samples';
const TEMPLATE_SAMPLE_MANIFEST_PATH = 'manifest.json';
const TEMPLATE_SAMPLE_VERSION = 'v1';
const TEMPLATE_SAMPLE_ALLOWED_MIME_TYPES = ['application/json', 'audio/mpeg', 'audio/wav'];

function parseArgs(argv) {
  return {
    force: argv.includes('--force')
  };
}

function stripWrappingQuotes(value) {
  if (!value) {
    return value;
  }

  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();

      if (!process.env[key]) {
        process.env[key] = stripWrappingQuotes(rawValue);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Supabase admin environment variables are not configured');
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function isMissingBucketError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.status === 404 || message.includes('not found');
}

function isMissingObjectError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.status === 400 || error?.status === 404 || message.includes('not found');
}

async function ensureTemplateSampleBucket(supabase) {
  const { data, error } = await supabase.storage.getBucket(TEMPLATE_SAMPLE_BUCKET_ID);

  if (data) {
    if (!data.public) {
      const { error: updateError } = await supabase.storage.updateBucket(TEMPLATE_SAMPLE_BUCKET_ID, {
        public: true,
        allowedMimeTypes: TEMPLATE_SAMPLE_ALLOWED_MIME_TYPES
      });

      if (updateError) {
        throw updateError;
      }
    }

    return data;
  }

  if (error && !isMissingBucketError(error)) {
    throw error;
  }

  const { error: createError } = await supabase.storage.createBucket(TEMPLATE_SAMPLE_BUCKET_ID, {
    public: true,
    allowedMimeTypes: TEMPLATE_SAMPLE_ALLOWED_MIME_TYPES
  });

  if (createError) {
    throw createError;
  }
}

async function readManifest(supabase) {
  const { data, error } = await supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).download(TEMPLATE_SAMPLE_MANIFEST_PATH);
  if (error) {
    if (isMissingObjectError(error)) {
      return {
        version: TEMPLATE_SAMPLE_VERSION,
        generatedAt: null,
        samples: {}
      };
    }
    throw error;
  }

  return JSON.parse(await data.text());
}

async function writeManifest(supabase, manifest) {
  const { error } = await supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).upload(
    TEMPLATE_SAMPLE_MANIFEST_PATH,
    JSON.stringify(manifest, null, 2),
    {
      upsert: true,
      contentType: 'application/json',
      cacheControl: '60'
    }
  );

  if (error) {
    throw error;
  }
}

function buildTemplateSamplePath(templateId, format) {
  return `${TEMPLATE_SAMPLE_VERSION}/${templateId}/sample.${format}`;
}

function buildTemplateSampleUrls(supabase, templateId) {
  const wavPath = buildTemplateSamplePath(templateId, 'wav');
  const mp3Path = buildTemplateSamplePath(templateId, 'mp3');

  return {
    wavPath,
    mp3Path,
    wavUrl: supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).getPublicUrl(wavPath).data.publicUrl,
    mp3Url: supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).getPublicUrl(mp3Path).data.publicUrl
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch (error) {
    throw new Error(`Invalid JSON response from ${url}: ${text.slice(0, 240)}`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `Request failed for ${url} with status ${response.status}`);
  }

  return data;
}

async function downloadBuffer(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download artifact from ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function shouldSkipTemplate(existingEntry, template, force) {
  if (force || !existingEntry) {
    return false;
  }

  return (
    existingEntry.version === TEMPLATE_SAMPLE_VERSION &&
    existingEntry.sampleLengthSec === template.sampleLengthSec &&
    Boolean(existingEntry.wavUrl) &&
    Boolean(existingEntry.mp3Url)
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await loadEnvFile(path.resolve(process.cwd(), '.env.local'));

  const supabase = createSupabaseAdmin();
  const origin = process.env.PRERENDER_ORIGIN || process.env.BACKEND_ORIGIN || 'https://hemisync.bishoptech.dev';

  requiredEnv('SUPABASE_SERVICE_ROLE_KEY');
  requiredEnv('NEXT_PUBLIC_SUPABASE_URL');

  await ensureTemplateSampleBucket(supabase);
  const manifest = await readManifest(supabase);
  const catalog = await fetchJson(`${origin.replace(/\/+$/, '')}/api/template-catalog`);
  const templates = catalog.templates || [];
  const failures = [];

  for (const [index, template] of templates.entries()) {
    const existingEntry = manifest.samples?.[template.id];
    if (shouldSkipTemplate(existingEntry, template, args.force)) {
      console.log(`[${index + 1}/${templates.length}] Skip ${template.title}`);
      continue;
    }

    try {
      console.log(`[${index + 1}/${templates.length}] Render ${template.title}`);

      const payload = {
        journeyPresetId: template.journeyPresetId,
        focusLevel: template.focusLevel,
        lengthSec: template.sampleLengthSec,
        baseFreqHz: template.baseFreqHz,
        exportProfile: 'standard',
        entrainmentModes: {
          binaural: true,
          monaural: false,
          isochronic: false
        }
      };

      const render = await fetchJson(`${origin.replace(/\/+$/, '')}/api/audio/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const wavBuffer = await downloadBuffer(render.wav);
      const mp3Buffer = await downloadBuffer(render.mp3);
      const { wavPath, mp3Path, wavUrl, mp3Url } = buildTemplateSampleUrls(supabase, template.id);

      const { error: wavUploadError } = await supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).upload(wavPath, wavBuffer, {
        upsert: true,
        contentType: 'audio/wav',
        cacheControl: '31536000'
      });
      if (wavUploadError) {
        throw wavUploadError;
      }

      const { error: mp3UploadError } = await supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).upload(mp3Path, mp3Buffer, {
        upsert: true,
        contentType: 'audio/mpeg',
        cacheControl: '31536000'
      });
      if (mp3UploadError) {
        throw mp3UploadError;
      }

      const timestamp = new Date().toISOString();
      manifest.samples[template.id] = {
        templateId: template.id,
        title: template.title,
        shortLabel: template.shortLabel,
        category: template.category,
        accent: template.accent,
        version: TEMPLATE_SAMPLE_VERSION,
        sampleLengthSec: template.sampleLengthSec,
        journeyPresetId: template.journeyPresetId,
        focusLevel: template.focusLevel,
        baseFreqHz: template.baseFreqHz,
        wavPath,
        mp3Path,
        wavUrl,
        mp3Url,
        updatedAt: timestamp,
        createdAt: existingEntry?.createdAt || timestamp
      };

      manifest.generatedAt = timestamp;
      await writeManifest(supabase, manifest);
    } catch (error) {
      console.error(`Failed ${template.title}: ${error.message}`);
      failures.push({ templateId: template.id, error: error.message });
    }
  }

  console.log(`Rendered ${templates.length - failures.length}/${templates.length} template samples.`);

  if (failures.length > 0) {
    console.error(JSON.stringify({ failures }, null, 2));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
