import { z } from 'zod';

export const JournalInputSchema = z.object({
  text: z.string().min(1).max(5000)
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

