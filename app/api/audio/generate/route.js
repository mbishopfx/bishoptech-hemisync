import { NextResponse } from 'next/server';
import { validate, GenerateAudioInputSchema } from '@/lib/validation/schemas';
import { pickPreset } from '@/lib/audio/presets';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import { buildSessionBed, encodeOutputs } from '@/lib/audio/engine/pipeline';
import { persistRenderArtifacts } from '@/lib/audio/render-artifacts';
import { getLogger } from '@/lib/logging/logger';
import { buildJourneyBlueprint, buildJourneyAnalytics } from '@/lib/audio/journeys';
import { buildBackgroundLayer } from '@/lib/audio/background-layer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  const logger = getLogger();

  try {
    const body = await req.json();
    const input = validate(GenerateAudioInputSchema, body);
    const journey = buildJourneyBlueprint({
      journeyPresetId: input.journeyPresetId,
      totalLengthSec: input.lengthSec,
      baseFreqHz: input.baseFreqHz,
      focusLevel: input.focusLevel,
      stages: input.stageBlueprint
    });
    const preset = pickPreset({ programPreset: input.programPreset, focusLevel: journey.focusLevel });

    let breath = null;
    if (input.breathGuide?.enabled) {
      const envelope = generateBreathEnvelope(
        input.breathGuide.pattern || journey.breathPattern || 'coherent-5.5',
        44100,
        journey.totalLengthSec,
        input.breathGuide?.bpm
      );
      breath = { envelope, depth: 0.1 };
    }

    const background = await buildBackgroundLayer({
      background: input.background || journey.background,
      sampleRate: 44100,
      lengthSec: journey.totalLengthSec
    });

    const bed = await buildSessionBed({
      lengthSec: journey.totalLengthSec,
      sampleRate: 44100,
      focusPreset: {
        ...preset,
        carriers: { ...preset.carriers, leftHz: journey.baseFreqHz },
        deltaHzPath: journey.deltaHzPath
      },
      baseFreqHz: journey.baseFreqHz,
      noise: preset.noise,
      breath,
      background,
      modes: { ...{ binaural: true, monaural: false, isochronic: false }, ...(preset.modes || {}), ...(input.entrainmentModes || {}) }
    });

    const { wavBuffer, mp3Buffer } = await encodeOutputs({
      left: bed.left,
      right: bed.right,
      sampleRate: bed.sampleRate,
      withMp3: true
    });
    const artifacts = await persistRenderArtifacts({
      baseName: journey.name || input.focusLevel || input.programPreset || 'generated-session',
      wavBuffer,
      mp3Buffer
    });

    return NextResponse.json({
      ok: true,
      presetUsed: preset,
      journey,
      stages: journey.stages,
      analytics: buildJourneyAnalytics({
        journey,
        program: {
          bedPostDuck: { left: bed.left, right: bed.right },
          voiceTracks: {
            left: new Float32Array(bed.left.length),
            right: new Float32Array(bed.right.length)
          },
          duckEnvSeries: new Array(Math.ceil(bed.left.length / bed.sampleRate)).fill(1)
        },
        sampleRate: bed.sampleRate,
        baseFreqHz: journey.baseFreqHz
      }),
      artifactId: artifacts.artifactId,
      assets: artifacts.files,
      wav: artifacts.files.wav?.url || null,
      mp3: artifacts.files.mp3?.url || null
    });
  } catch (err) {
    logger.error({ err }, 'audio generate error');
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Internal error' }, { status });
  }
}
