import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { validate, CombinedAudioInputSchema } from '@/lib/validation/schemas';
import { pickPreset } from '@/lib/audio/presets';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import {
  buildSessionBed,
  renderAndMixVoice,
  mixProgram,
  encodeOutputs
} from '@/lib/audio/engine/pipeline';
import { persistRenderArtifacts } from '@/lib/audio/render-artifacts';
import { getLogger } from '@/lib/logging/logger';
import {
  buildJourneyBlueprint,
  buildGuidanceCueStages,
  buildFallbackGuidanceScript,
  buildJourneyAnalytics
} from '@/lib/audio/journeys';
import { buildBackgroundLayer } from '@/lib/audio/background-layer';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function buildSilentVoice(totalFrames) {
  return {
    voiceL: new Float32Array(totalFrames),
    voiceR: new Float32Array(totalFrames)
  };
}

async function enrichGuidanceStagesWithAi({ client, guidanceStages, journey, intentText }) {
  const stagePayload = guidanceStages.map((stage) => ({
    id: stage.id,
    name: stage.name,
    voiceBudgetSec: stage.durationSec,
    brainState: stage.brainState,
    focusLevel: stage.focusLevel,
    goal: stage.goal,
    notes: stage.notes,
    guidanceDensity: stage.guidanceDensity
  }));

  const system = `You write sparse, polished narration cues for stage-based hemispheric synchronization tracks. Return strict JSON in the shape { stages:[{ id, script }] }.
Rules:
- Keep the provided stage order and IDs.
- Each script must fit comfortably inside the stage's voiceBudgetSec.
- Use calm, safe, non-clinical language.
- No medical claims, no coercive phrasing.
- Use short [pause 2s] style tags sparingly.`;
  const user = `Journey: ${journey.name}\nSummary: ${journey.summary}\nGuidance style: ${journey.guidanceStyle}\nIntent: ${intentText || 'Calm, focused awareness.'}\nStages: ${JSON.stringify(stagePayload)}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' },
    max_tokens: 2200
  });
  const parsed = JSON.parse(response.choices?.[0]?.message?.content || '{}');
  const scriptsById = new Map((parsed?.stages || []).map((stage) => [stage.id, stage.script]));

  return guidanceStages.map((stage) => ({
    ...stage,
    script: scriptsById.get(stage.id) || buildFallbackGuidanceScript({ journey, stage, intentText })
  }));
}

export async function POST(req) {
  const logger = getLogger();

  try {
    const body = await req.json();
    const input = validate(CombinedAudioInputSchema, body);
    const journey = buildJourneyBlueprint({
      journeyPresetId: input.journeyPresetId,
      totalLengthSec: input.lengthSec,
      baseFreqHz: input.baseFreqHz,
      focusLevel: input.focusLevel,
      stages: input.stageBlueprint,
      journeyName: input.journeyName
    });
    const preset = pickPreset({ programPreset: input.programPreset, focusLevel: journey.focusLevel });
    const sampleRate = 44100;

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

    let guidanceStages = buildGuidanceCueStages(journey).map((stage) => ({
      ...stage,
      script: stage.script || buildFallbackGuidanceScript({ journey, stage, intentText: input.text })
    }));

    const openAiAvailable = Boolean(process.env.OPENAI_API_KEY);
    const shouldUseAiGuidance = openAiAvailable && input.guidanceMode !== 'preset';
    const shouldRenderVoice = openAiAvailable && input.tts?.enabled !== false;
    const client = openAiAvailable ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

    if (shouldUseAiGuidance && client) {
      try {
        guidanceStages = await enrichGuidanceStagesWithAi({
          client,
          guidanceStages,
          journey,
          intentText: input.text
        });
      } catch (error) {
        logger.warn({ err: error }, 'ai guidance fallback');
      }
    }

    const voice = shouldRenderVoice && client
      ? await renderAndMixVoice({
          stages: guidanceStages,
          sampleRate,
          totalLengthSec: journey.totalLengthSec,
          ttsClient: client,
          voiceOptions: {
            voice: input.tts?.voice || 'alloy',
            mixDb: input.tts?.mixDb ?? -16,
            model: input.tts?.model || 'gpt-4o-mini-tts'
          }
        })
      : buildSilentVoice(Math.floor(sampleRate * journey.totalLengthSec));

    const program = mixProgram({
      bed,
      voice,
      ducking: { enabled: true, bedPercentWhileTalking: 0.75, attackMs: 50, releaseMs: 200, ...(input.ducking || {}) },
      backgroundLayers: backgroundLayer ? [backgroundLayer] : [],
      baseBedGain: 0.92
    });

    const { wavBuffer, mp3Buffer } = await encodeOutputs({
      left: program.left,
      right: program.right,
      sampleRate,
      withMp3: true,
      kbps: 160
    });
    const artifacts = await persistRenderArtifacts({
      baseName: `${journey.name || journey.id}-guided`,
      wavBuffer,
      mp3Buffer
    });

    return NextResponse.json({
      ok: true,
      artifactId: artifacts.artifactId,
      assets: artifacts.files,
      wav: artifacts.files.wav?.url || null,
      mp3: artifacts.files.mp3?.url || null,
      journey,
      stages: journey.stages,
      guidanceStages,
      analytics: buildJourneyAnalytics({
        journey,
        program,
        sampleRate,
        baseFreqHz: journey.baseFreqHz
      }),
      guidanceMeta: {
        modeRequested: input.guidanceMode,
        modeUsed: shouldUseAiGuidance ? 'ai' : 'preset',
        voiceRendered: shouldRenderVoice
      }
    });
  } catch (err) {
    logger.error({ err }, 'audio combined error');
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Internal error' }, { status });
  }
}
