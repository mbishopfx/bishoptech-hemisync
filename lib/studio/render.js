import { generateBreathEnvelope } from '@/lib/audio/breath';
import { buildBackgroundLayer } from '@/lib/audio/background-layer';
import { resolveExportProfile } from '@/lib/audio/export-profiles';
import { buildSessionBed, encodeOutputs } from '@/lib/audio/engine/pipeline';
import { buildJourneyBlueprint } from '@/lib/audio/journeys';
import { pickPreset } from '@/lib/audio/presets';
import { buildCarrierPathFromStages, validateStudioSpec } from '@/lib/studio/spec';

export const STUDIO_RENDER_BUCKET = 'studio-renders';

function applyFadesInPlace(left, right, sampleRate, fades = {}) {
  const fadeInFrames = Math.min(left.length, Math.round(sampleRate * Number(fades.inSec || 0)));
  const fadeOutFrames = Math.min(left.length, Math.round(sampleRate * Number(fades.outSec || 0)));

  for (let index = 0; index < fadeInFrames; index += 1) {
    const gain = index / Math.max(1, fadeInFrames - 1);
    left[index] *= gain;
    right[index] *= gain;
  }
  for (let offset = 0; offset < fadeOutFrames; offset += 1) {
    const index = left.length - 1 - offset;
    const gain = offset / Math.max(1, fadeOutFrames - 1);
    left[index] *= gain;
    right[index] *= gain;
  }
}

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
  const preset = pickPreset({ focusLevel: 'F12' });
  const breath = spec.breathGuide.enabled
    ? {
        envelope: generateBreathEnvelope(
          spec.breathGuide.pattern,
          exportProfile.sampleRate,
          spec.durationSec,
          spec.breathGuide.bpm
        ),
        depth: 0.1
      }
    : null;
  const background = spec.background.type === 'none'
    ? null
    : await buildBackgroundLayer({
        background: spec.background,
        sampleRate: exportProfile.sampleRate,
        lengthSec: spec.durationSec
      });

  const bed = await buildSessionBed({
    lengthSec: spec.durationSec,
    sampleRate: exportProfile.sampleRate,
    focusPreset: {
      ...preset,
      carriers: { ...preset.carriers, leftHz: spec.stages[0]?.carrierHz || 220 },
      deltaHzPath: journey.deltaHzPath
    },
    baseFreqHz: spec.stages[0]?.carrierHz || 220,
    carrierLeftHzFrom: spec.stages[0]?.carrierHz || 220,
    carrierLeftHzTo: spec.stages.at(-1)?.carrierHz || spec.stages[0]?.carrierHz || 220,
    carrierLeftCurve: buildCarrierPathFromStages(spec.stages),
    deltaCurve: journey.deltaHzPath,
    noise: preset.noise,
    breath,
    background,
    modes: spec.entrainmentModes
  });

  applyFadesInPlace(bed.left, bed.right, bed.sampleRate, spec.fades);

  const selected = new Set(spec.exportFormats);
  const encoded = await encodeOutputs({
    left: bed.left,
    right: bed.right,
    sampleRate: bed.sampleRate,
    wavBitDepthCode: exportProfile.wavBitDepthCode,
    withWebm: false,
    withMp3: selected.has('mp3'),
    kbps: 192,
    masteringProfile: exportProfile.mastering
  });
  const validation = validateStudioBuffers({
    spec,
    sampleRate: bed.sampleRate,
    wavBuffer: encoded.wavBuffer,
    mp3Buffer: encoded.mp3Buffer,
    mastering: encoded.mastering
  });

  return {
    spec,
    journey,
    wavBuffer: selected.has('wav') ? encoded.wavBuffer : null,
    mp3Buffer: selected.has('mp3') ? encoded.mp3Buffer : null,
    mastering: encoded.mastering,
    validation
  };
}

export async function uploadStudioRender({ supabase, userId, renderId, wavBuffer, mp3Buffer }) {
  const basePath = `${userId}/${renderId}`;
  const uploads = [];
  const paths = { wav: null, mp3: null };

  if (wavBuffer) {
    paths.wav = `${basePath}/master.wav`;
    uploads.push(supabase.storage.from(STUDIO_RENDER_BUCKET).upload(paths.wav, wavBuffer, {
      contentType: 'audio/wav',
      cacheControl: '3600',
      upsert: true
    }));
  }
  if (mp3Buffer) {
    paths.mp3 = `${basePath}/master.mp3`;
    uploads.push(supabase.storage.from(STUDIO_RENDER_BUCKET).upload(paths.mp3, mp3Buffer, {
      contentType: 'audio/mpeg',
      cacheControl: '3600',
      upsert: true
    }));
  }

  const results = await Promise.all(uploads);
  const failed = results.find((result) => result.error);
  if (failed?.error) throw failed.error;
  return paths;
}
