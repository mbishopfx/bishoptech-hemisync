import { z } from 'zod';
import { JOURNEY_PRESET_IDS } from '@/lib/audio/journeys';
import { AMBIENT_ASSET_IDS } from '@/lib/audio/assets';

const BrainStateSchema = z.enum(['delta', 'theta', 'alpha', 'beta', 'gamma']);

const DeltaRangeSchema = z.object({
  from: z.number().min(0.1).max(40),
  to: z.number().min(0.1).max(40)
});

const StageBlueprintSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  atSec: z.number().min(0).optional(),
  durationSec: z.number().int().min(15).max(3600),
  brainState: BrainStateSchema.optional(),
  focusLevel: z.string().optional(),
  carrierHz: z.number().min(50).max(2000).optional(),
  deltaHz: DeltaRangeSchema.optional(),
  goal: z.string().max(240).optional(),
  notes: z.string().max(400).optional(),
  script: z.string().max(4000).optional()
});

const JourneyPresetSchema = JOURNEY_PRESET_IDS.length > 0 ? z.enum(JOURNEY_PRESET_IDS) : z.string();

const BackgroundSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('ocean'),
    mixDb: z.number().min(-60).max(-6).optional()
  }),
  z.object({
    type: z.literal('asset'),
    assetId: AMBIENT_ASSET_IDS.length > 0 ? z.enum(AMBIENT_ASSET_IDS).optional() : z.string().optional(),
    assetFile: z.string().optional(),
    mixDb: z.number().min(-60).max(-6).optional(),
    crossfadeSec: z.number().min(0).max(10).optional()
  })
]);

export const JournalInputSchema = z.object({
  text: z.string().min(1).max(5000)
});

export const SessionSpecSchema = z.object({
  version: z.number().int().min(1).default(2),
  journeyPresetId: JourneyPresetSchema.default(JOURNEY_PRESET_IDS[0] || 'induction-alpha-theta-integration-15'),
  focusLevel: z.string().default('F12'),
  lengthSec: z.number().int().min(60).max(7200).default(900),
  baseFreqHz: z.number().min(50).max(2000).default(220),
  deltaHz: z.number().min(0.1).max(40).default(8),
  volumeDb: z.number().min(-48).max(0).default(-12),
  breathRate: z.number().min(0.01).max(0.5).default(0.1),
  layers: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.enum(['binaural', 'noise', 'isochronic', 'breath', 'background']),
        params: z.record(z.any()).default({})
      })
    )
    .default([]),
  stages: z
    .array(StageBlueprintSchema)
    .default([])
});

export const ChatMessageSchema = z.object({
  sessionId: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(8000),
  specPatch: z.any().optional()
});

export const GenerateAudioInputSchema = z.object({
  entryId: z.string().optional(),
  programPreset: z.string().optional(),
  exportProfile: z.enum(['standard', 'premium']).optional(),
  journeyPresetId: JourneyPresetSchema.optional(),
  stageBlueprint: z.array(StageBlueprintSchema).max(12).optional(),
  targetState: z.enum(['delta', 'theta', 'alpha', 'beta', 'gamma']).optional(),
  focusLevel: z.string().optional(),
  lengthSec: z.number().int().min(180).max(1800).default(900),
  baseFreqHz: z.number().min(100).max(1000).default(220),
  entrainmentModes: z
    .object({
      binaural: z.boolean().default(true),
      monaural: z.boolean().default(false),
      isochronic: z.boolean().default(false)
    })
    .partial()
    .optional(),
  breathGuide: z
    .object({
      enabled: z.boolean(),
      pattern: z.enum(['box', '4-7-8', 'coherent-5.5']).optional(),
      bpm: z.number().min(1).max(20).optional()
    })
    .optional(),
  background: BackgroundSchema.optional(),
  beatPlan: z.any().optional()
});

export const CombinedAudioInputSchema = GenerateAudioInputSchema.extend({
  text: z.string().max(5000).optional(),
  journeyName: z.string().max(120).optional()
});

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    const error = new Error(msg);
    error.status = 400;
    throw error;
  }
  return parsed.data;
}
