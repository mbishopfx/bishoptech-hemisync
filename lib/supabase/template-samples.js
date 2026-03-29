import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const TEMPLATE_SAMPLE_BUCKET_ID = 'template-samples';
export const TEMPLATE_SAMPLE_MANIFEST_PATH = 'manifest.json';
export const TEMPLATE_SAMPLE_VERSION = 'v1';

const TEMPLATE_SAMPLE_ALLOWED_MIME_TYPES = ['application/json', 'audio/mpeg', 'audio/wav'];

function isMissingBucketError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.status === 404 || message.includes('not found');
}

function isMissingObjectError(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.status === 400 || error?.status === 404 || message.includes('not found');
}

function getSupabaseStorageBaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!url) {
    return null;
  }

  return `${url.replace(/\/+$/, '')}/storage/v1/object/public`;
}

export function buildTemplateSamplePublicObjectUrl(objectPath) {
  const storageBaseUrl = getSupabaseStorageBaseUrl();
  if (!storageBaseUrl) {
    return null;
  }

  return `${storageBaseUrl}/${TEMPLATE_SAMPLE_BUCKET_ID}/${objectPath}`;
}

export function buildTemplateSamplePath(templateId, format, version = TEMPLATE_SAMPLE_VERSION) {
  return `${version}/${templateId}/sample.${format}`;
}

export async function ensureTemplateSampleBucket(supabase = getSupabaseAdmin()) {
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

  const { data: created, error: createError } = await supabase.storage.createBucket(TEMPLATE_SAMPLE_BUCKET_ID, {
    public: true,
    allowedMimeTypes: TEMPLATE_SAMPLE_ALLOWED_MIME_TYPES
  });

  if (createError) {
    throw createError;
  }

  return created;
}

export function buildTemplateSamplePublicUrls(supabase, templateId, version = TEMPLATE_SAMPLE_VERSION) {
  const wavPath = buildTemplateSamplePath(templateId, 'wav', version);
  const mp3Path = buildTemplateSamplePath(templateId, 'mp3', version);

  return {
    wavPath,
    mp3Path,
    wavUrl: supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).getPublicUrl(wavPath).data.publicUrl,
    mp3Url: supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).getPublicUrl(mp3Path).data.publicUrl
  };
}

export async function readTemplateSampleManifest(supabase = getSupabaseAdmin()) {
  await ensureTemplateSampleBucket(supabase);

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

  const content = await data.text();
  const parsed = JSON.parse(content);
  return {
    version: parsed.version || TEMPLATE_SAMPLE_VERSION,
    generatedAt: parsed.generatedAt || null,
    samples: parsed.samples || {}
  };
}

export async function readTemplateSampleManifestPublic() {
  const publicUrl = buildTemplateSamplePublicObjectUrl(TEMPLATE_SAMPLE_MANIFEST_PATH);
  if (!publicUrl) {
    return {
      version: TEMPLATE_SAMPLE_VERSION,
      generatedAt: null,
      samples: {}
    };
  }

  try {
    const response = await fetch(publicUrl, {
      next: { revalidate: 60 }
    });

    if (response.status === 404) {
      return {
        version: TEMPLATE_SAMPLE_VERSION,
        generatedAt: null,
        samples: {}
      };
    }

    if (!response.ok) {
      throw new Error(`Template sample manifest request failed with status ${response.status}`);
    }

    const parsed = await response.json();
    return {
      version: parsed.version || TEMPLATE_SAMPLE_VERSION,
      generatedAt: parsed.generatedAt || null,
      samples: parsed.samples || {}
    };
  } catch (error) {
    return {
      version: TEMPLATE_SAMPLE_VERSION,
      generatedAt: null,
      samples: {}
    };
  }
}

export async function writeTemplateSampleManifest(manifest, supabase = getSupabaseAdmin()) {
  await ensureTemplateSampleBucket(supabase);

  const body = JSON.stringify(
    {
      version: manifest.version || TEMPLATE_SAMPLE_VERSION,
      generatedAt: manifest.generatedAt || new Date().toISOString(),
      samples: manifest.samples || {}
    },
    null,
    2
  );

  const { error } = await supabase.storage.from(TEMPLATE_SAMPLE_BUCKET_ID).upload(TEMPLATE_SAMPLE_MANIFEST_PATH, body, {
    upsert: true,
    contentType: 'application/json',
    cacheControl: '60'
  });

  if (error) {
    throw error;
  }

  return manifest;
}
