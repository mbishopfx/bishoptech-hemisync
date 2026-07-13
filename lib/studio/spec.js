import { z } from 'zod';
import { AMBIENT_ASSET_IDS } from '../audio/assets.js';
import { JOURNEY_PRESET_IDS, pickJourneyPreset } from '../audio/journeys.js';

export const STUDIO_MIN_DURATION_SEC = 5 * 60;
export const STUDIO_MAX_DURATION_SEC = 120 * 60;

const BrainStateSchema = z.enum(['delta', 'theta', 'alpha', 'beta', 'gamma']);

export const StudioStageSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(80),
  durationSec: z.number().int().min(15).max(STUDIO_MAX_DURATION_SEC),
  brainState: BrainStateSchema,
  carrierHz: z.number().min(50).max(2000),
  deltaHz: z.object({
    from: z.number().min(0.1).max(40),
    to: z.number().min(0.1).max(40)
  })
});

export const StudioSpecSchema = z.object({
  version: z.literal(3).default(3),
  kind: z.literal('studio').default('studio'),
  description: z.string().max(1200).default(''),
  targetState: BrainStateSchema.default('theta'),
  journeyPresetId: z.enum(JOURNEY_PRESET_IDS).default(JOURNEY_PRESET_IDS[0]),
  durationSec: z.number().int().min(STUDIO_MIN_DURATION_SEC).max(STUDIO_MAX_DURATION_SEC),
  stages: z.array(StudioStageSchema).min(1).max(12),
  entrainmentModes: z.object({
    binaural: z.boolean().default(true),
    monaural: z.boolean().default(false),
    isochronic: z.boolean().default(false)
  }),
  background: z.discriminatedUnion('type', [
    z.object({ type: z.literal('none') }),
    z.object({ type: z.literal('ocean'), mixDb: z.number().min(-60).max(-6) }),
    z.object({
      type: z.literal('asset'),
      assetId: z.enum(AMBIENT_ASSET_IDS),
      mixDb: z.number().min(-60).max(-6),
      crossfadeSec: z.number().min(0).max(10).default(2.5)
    })
  ]),
  breathGuide: z.object({
    enabled: z.boolean().default(false),
    pattern: z.enum(['coherent-5.5', '4-7-8', 'box']).default('coherent-5.5'),
    bpm: z.number().min(2).max(12).default(5.5)
  }),
  fades: z.object({
    inSec: z.number().min(0).max(60).default(8),
    outSec: z.number().min(0).max(60).default(12)
  }),
  exportFormats: z.array(z.enum(['wav', 'mp3'])).min(1).default(['wav', 'mp3']),
  exportProfile: z.literal('premium').default('premium')
}).superRefine((spec, ctx) => {
  const total = spec.stages.reduce((sum, stage) => sum + stage.durationSec, 0);
  if (total !== spec.durationSec) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['stages'],
      message: `Stage durations must total ${spec.durationSec} seconds (received ${total})`
    });
  }
  if (!Object.values(spec.entrainmentModes).some(Boolean)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['entrainmentModes'],
      message: 'Enable at least one entrainment mode'
    });
  }
});

export function validateStudioSpec(value) {
  const parsed = StudioSpecSchema.safeParse(value);
  if (!parsed.success) {
    const error = new Error(parsed.error.issues.map((issue) => issue.message).join('; '));
    error.status = 400;
    throw error;
  }
  return parsed.data;
}

function distributeDuration(stages, durationSec) {
  const source = stages.map((stage) => stage.durationSec || (stage.minutes || 1) * 60);
  const sum = source.reduce((total, value) => total + value, 0) || source.length;
  const scaled = source.map((value) => Math.floor((value / sum) * durationSec));
  let remainder = durationSec - scaled.reduce((total, value) => total + value, 0);
  let cursor = 0;
  while (remainder > 0) {
    scaled[cursor % scaled.length] += 1;
    cursor += 1;
    remainder -= 1;
  }
  return scaled;
}

export function createStudioSpecFromPreset({ presetId, durationSec = 1200 } = {}) {
  const safeDuration = Math.max(STUDIO_MIN_DURATION_SEC, Math.min(STUDIO_MAX_DURATION_SEC, Math.round(durationSec)));
  const preset = pickJourneyPreset(presetId);
  const durations = distributeDuration(preset.stages, safeDuration);
  const stages = preset.stages.map((stage, index) => ({
    id: stage.id || `stage-${index + 1}`,
    name: stage.name || `Stage ${index + 1}`,
    durationSec: durations[index],
    brainState: stage.brainState || 'theta',
    carrierHz: Number(stage.carrierHz || preset.baseFreqHz || 220),
    deltaHz: {
      from: Number(stage.deltaHz?.from ?? 8),
      to: Number(stage.deltaHz?.to ?? stage.deltaHz?.from ?? 6)
    }
  }));

  return validateStudioSpec({
    version: 3,
    kind: 'studio',
    description: preset.summary || '',
    targetState: stages[Math.floor(stages.length / 2)]?.brainState || 'theta',
    journeyPresetId: preset.id,
    durationSec: safeDuration,
    stages,
    entrainmentModes: { binaural: true, monaural: false, isochronic: false },
    background: preset.background || { type: 'none' },
    breathGuide: { enabled: false, pattern: preset.breathPattern || 'coherent-5.5', bpm: 5.5 },
    fades: { inSec: 8, outSec: 12 },
    exportFormats: ['wav', 'mp3'],
    exportProfile: 'premium'
  });
}

export function buildCarrierPathFromStages(stages = []) {
  let cursor = 0;
  const points = [];
  for (const stage of stages) {
    const hz = Number(stage.carrierHz || 220);
    points.push({ at: cursor, hz });
    cursor += Number(stage.durationSec || 0);
    points.push({ at: cursor, hz });
  }
  return points;
}
