import { resolveExportProfile } from '@/lib/audio/export-profiles';
import { buildJourneyBlueprint } from '@/lib/audio/journeys';
import { renderStudioWithFfmpeg } from '@/lib/studio/ffmpeg-render';
import { validateStudioSpec } from '@/lib/studio/spec';
import * as tus from 'tus-js-client';

export const STUDIO_RENDER_BUCKET = 'studio-renders';
const RESUMABLE_UPLOAD_THRESHOLD = 6 * 1024 * 1024;

function hasWavSignature(buffer) {
  return buffer?.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer?.subarray(8, 12).toString('ascii') === 'WAVE';
}

function hasMp3Signature(buffer) {
  if (!buffer || buffer.length < 3) return false;
  return buffer.subarray(0, 3).toString('ascii') === 'ID3'
    || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0);
}

export function validateStudioBuffers({ spec, sampleRate, wavBuffer, mp3Buffer, mastering }) {
  const selected = new Set(spec.exportFormats);
  const checks = {
    durationSec: spec.durationSec,
    sampleRate,
    channels: 2,
    wavSignature: !selected.has('wav') || hasWavSignature(wavBuffer),
    mp3Signature: !selected.has('mp3') || hasMp3Signature(mp3Buffer),
    wavBytes: selected.has('wav') ? wavBuffer?.length || 0 : null,
    mp3Bytes: selected.has('mp3') ? mp3Buffer?.length || 0 : null,
    postPeak: mastering?.postPeak ?? null,
    ceilingDb: mastering?.ceilingDb ?? null
  };
  checks.passed = checks.wavSignature
    && checks.mp3Signature
    && (!selected.has('wav') || checks.wavBytes > 44)
    && (!selected.has('mp3') || checks.mp3Bytes > 1024)
    && Number.isFinite(checks.postPeak)
    && checks.postPeak <= 1;
  if (!checks.passed) {
    const error = new Error('Rendered audio did not pass export validation');
    error.validation = checks;
    throw error;
  }
  return checks;
}

export async function renderStudioProject(specInput) {
  const spec = validateStudioSpec(specInput);
  const exportProfile = resolveExportProfile('premium');
  const journey = buildJourneyBlueprint({
    journeyPresetId: spec.journeyPresetId,
    totalLengthSec: spec.durationSec,
    baseFreqHz: spec.stages[0]?.carrierHz,
    focusLevel: 'F12',
    stages: spec.stages
  });
  const encoded = await renderStudioWithFfmpeg(spec);
  const validation = validateStudioBuffers({
    spec,
    sampleRate: exportProfile.sampleRate,
    wavBuffer: encoded.wavBuffer,
    mp3Buffer: encoded.mp3Buffer,
    mastering: encoded.mastering
  });

  return {
    spec,
    journey,
    wavBuffer: encoded.wavBuffer,
    mp3Buffer: encoded.mp3Buffer,
    mastering: encoded.mastering,
    validation
  };
}

export async function uploadStudioRender({ supabase, userId, renderId, wavBuffer, mp3Buffer }) {
  const basePath = `${userId}/${renderId}`;
  const uploads = [];
  const paths = { wav: null, mp3: null };

  async function resumableUpload(objectPath, buffer, contentType) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
    if (!supabaseUrl || !serviceKey) throw new Error('Supabase resumable upload is not configured');

    await new Promise((resolve, reject) => {
      const upload = new tus.Upload(buffer, {
        endpoint: `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/upload/resumable`,
        headers: {
          authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
          'x-upsert': 'true'
        },
        metadata: {
          bucketName: STUDIO_RENDER_BUCKET,
          objectName: objectPath,
          contentType,
          cacheControl: '3600'
        },
        uploadSize: buffer.length,
        chunkSize: 6 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        removeFingerprintOnSuccess: true,
        onError: reject,
        onSuccess: resolve
      });
      upload.start();
    });
  }

  function upload(objectPath, buffer, contentType) {
    if (buffer.length > RESUMABLE_UPLOAD_THRESHOLD) {
      return resumableUpload(objectPath, buffer, contentType).then(() => ({ data: { path: objectPath }, error: null }));
    }
    return supabase.storage.from(STUDIO_RENDER_BUCKET).upload(objectPath, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: true
    });
  }

  if (wavBuffer) {
    paths.wav = `${basePath}/master.wav`;
    uploads.push(upload(paths.wav, wavBuffer, 'audio/wav'));
  }
  if (mp3Buffer) {
    paths.mp3 = `${basePath}/master.mp3`;
    uploads.push(upload(paths.mp3, mp3Buffer, 'audio/mpeg'));
  }

  const results = await Promise.all(uploads);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
  return paths;
}
