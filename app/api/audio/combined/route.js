import { NextResponse } from 'next/server';
import { validate, CombinedAudioInputSchema } from '@/lib/validation/schemas';
import { pickPreset } from '@/lib/audio/presets';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import {
  buildSessionBed,
  mixProgram,
  encodeOutputs
} from '@/lib/audio/engine/pipeline';
import { persistRenderArtifacts } from '@/lib/audio/render-artifacts';
import { getLogger } from '@/lib/logging/logger';
import {
  buildJourneyBlueprint,
  buildJourneyAnalytics
} from '@/lib/audio/journeys';
import { buildBackgroundLayer } from '@/lib/audio/background-layer';
import { resolveExportProfile } from '@/lib/audio/export-profiles';
import { resolvePublicUrl } from '@/lib/http/public-url';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  const logger = getLogger();

  try {
    const body = await req.json();
    const input = validate(CombinedAudioInputSchema, body);
    const exportProfile = resolveExportProfile(input.exportProfile);
    const journey = buildJourneyBlueprint({
      journeyPresetId: input.journeyPresetId,
      totalLengthSec: input.lengthSec,
      baseFreqHz: input.baseFreqHz,
      focusLevel: input.focusLevel,
      stages: input.stageBlueprint,
      journeyName: input.journeyName
    });
    const preset = pickPreset({ programPreset: input.programPreset, focusLevel: journey.focusLevel });
    const sampleRate = exportProfile.sampleRate;

    const breath = input.breathGuide?.enabled
      ? {
          envelope: generateBreathEnvelope(
            input.breathGuide.pattern || journey.breathPattern || 'coherent-5.5',
            sampleRate,
            journey.totalLengthSec,
            input.breathGuide?.bpm
          ),
          depth: 0.1
        }
      : null;

    const backgroundLayer = await buildBackgroundLayer({
      background: input.background || journey.background,
      sampleRate,
      lengthSec: journey.totalLengthSec
    });

    const bed = await buildSessionBed({
      lengthSec: journey.totalLengthSec,
      sampleRate,
      focusPreset: {
        ...preset,
        carriers: { ...preset.carriers, leftHz: journey.baseFreqHz },
        deltaHzPath: journey.deltaHzPath
      },
      baseFreqHz: journey.baseFreqHz,
      noise: preset.noise,
      breath,
      background: null,
      modes: { ...{ binaural: true, monaural: true, isochronic: false }, ...(preset.modes || {}), ...(input.entrainmentModes || {}) }
    });

    const program = mixProgram({
      bed,
      backgroundLayers: backgroundLayer ? [backgroundLayer] : [],
      baseBedGain: 0.92
    });

    const { wavBuffer, mp3Buffer, mastering } = await encodeOutputs({
      left: program.left,
      right: program.right,
      sampleRate,
      wavBitDepthCode: exportProfile.wavBitDepthCode,
      withMp3: true,
      kbps: exportProfile.mp3Kbps,
      masteringProfile: exportProfile.mastering
    });
    const artifacts = await persistRenderArtifacts({
      baseName: `${journey.name || journey.id}-beats`,
      wavBuffer,
      mp3Buffer
    });
    const assets = Object.fromEntries(
      Object.entries(artifacts.files).map(([format, file]) => [
        format,
        file
          ? {
              ...file,
              url: resolvePublicUrl(req, file.url)
            }
          : file
      ])
    );

    return NextResponse.json({
      ok: true,
      exportProfile: exportProfile.id,
      artifactId: artifacts.artifactId,
      assets,
      wav: assets.wav?.url || null,
      mp3: assets.mp3?.url || null,
      journey,
      stages: journey.stages,
      analytics: buildJourneyAnalytics({
        journey,
        program,
        sampleRate,
        baseFreqHz: journey.baseFreqHz
      }),
      mastering
    });
  } catch (err) {
    logger.error({ err }, 'audio combined error');
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Internal error' }, { status });
  }
}
