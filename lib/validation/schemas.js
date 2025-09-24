import { z } from 'zod';

export const JournalInputSchema = z.object({
  text: z.string().min(1).max(5000)
});

export const SessionSpecSchema = z.object({
  version: z.number().int().min(1).default(1),
  focusLevel: z.string().default('F12'),
  lengthSec: z.number().int().min(60).max(7200).default(600),
  baseFreqHz: z.number().min(50).max(2000).default(220),
  deltaHz: z.number().min(0.1).max(40).default(8),
  volumeDb: z.number().min(-48).max(0).default(-12),
  breathRate: z.number().min(0.01).max(0.5).default(0.1),
  layers: z
    .array(
      z.object({
        id: z.string().optional(),
        type: z.enum(['binaural', 'noise', 'isochronic', 'breath', 'background', 'voice']),
        params: z.record(z.any()).default({})
      })
    )
    .default([]),
  stages: z
    .array(
      z.object({
        name: z.string(),
        atSec: z.number().min(0).default(0),
        durationSec: z.number().min(1).default(60),
        script: z.string().max(4000).optional()
      })
    )
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
  targetState: z.enum(['delta', 'theta', 'alpha', 'beta', 'gamma']).optional(),
  focusLevel: z.string().optional(),
  lengthSec: z.number().int().min(180).max(1800).default(600),
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
      pattern: z.enum(['box', '4-7-8', 'coherent-5.5']).optional()
    })
    .optional(),
  background: z
    .object({
      type: z.enum(['ocean']),
      mixDb: z.number().min(-60).max(-6).optional()
    })
    .optional(),
  beatPlan: z.any().optional()
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

