import { buildJourneyBlueprint } from '@/lib/audio/journeys';

const defaultJourney = buildJourneyBlueprint({
  journeyPresetId: 'induction-alpha-theta-integration-15',
  totalLengthSec: 900,
  baseFreqHz: 236,
  focusLevel: 'F12'
});

export const defaultSessionSpec = {
  version: 2,
  journeyPresetId: defaultJourney.journeyPresetId,
  focusLevel: defaultJourney.focusLevel,
  lengthSec: defaultJourney.totalLengthSec,
  baseFreqHz: defaultJourney.baseFreqHz,
  deltaHz: defaultJourney.stages[0]?.deltaHz?.from ?? 8,
  volumeDb: -14,
  breathRate: 0.095,
  layers: [
    {
      id: 'layer-binaural-base',
      type: 'binaural',
      params: {
        baseFreqHz: defaultJourney.baseFreqHz,
        delta: {
          from: defaultJourney.stages[0]?.deltaHz?.from ?? 12,
          to: defaultJourney.stages[defaultJourney.stages.length - 1]?.deltaHz?.to ?? 10
        },
        mixDb: -10
      }
    },
    {
      id: 'layer-background',
      type: 'background',
      params: {
        sourceType: defaultJourney.background?.type || 'asset',
        assetId: defaultJourney.background?.assetId || 'lumina',
        mixDb: defaultJourney.background?.mixDb ?? -24
      }
    },
    {
      id: 'layer-breath',
      type: 'breath',
      params: {
        pattern: defaultJourney.breathPattern || 'coherent-5.5',
        depth: 0.12
      }
    }
  ],
  stages: defaultJourney.stages
};

export const consumerTemplateOptions = [
  {
    id: 'daily-reset',
    title: 'Daily Reset',
    shortLabel: 'Reset',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    useCase: 'Calm down and come back clear.',
    description: 'A balanced HemiSync arc for people who want to slow their nervous system, settle in, and return without feeling groggy.',
    bestFor: 'Late afternoon, post-work decompression, or a clean evening reset.',
    ritual: 'Best with lights low and headphones on.',
    intent: 'Build a calm HemiSync reset with a soft descent, gentle middle hold, and a clean clear return.',
    chatPrompt: 'Keep this soothing, lower the middle section slightly, and make the return very gentle.',
    accent: 'calm'
  },
  {
    id: 'deep-focus',
    title: 'Deep Focus',
    shortLabel: 'Focus',
    journeyPresetId: 'focus-15-no-time-15',
    useCase: 'Drop into deep work without harsh stimulation.',
    description: 'A more immersive HemiSync path that narrows attention, supports long-form concentration, and avoids the brittle feeling of overstimulation.',
    bestFor: 'Writing, coding, studying, or work that needs a long uninterrupted block.',
    ritual: 'Use before a 60 to 90 minute focus sprint.',
    intent: 'Build a HemiSync focus session that feels immersive, steady, and distraction-resistant without sounding aggressive.',
    chatPrompt: 'Make this feel more locked-in and stable, with a cleaner opening and a focused middle hold.',
    accent: 'focus'
  },
  {
    id: 'creative-drift',
    title: 'Creative Drift',
    shortLabel: 'Create',
    journeyPresetId: 'creative-hypnagogia-15',
    useCase: 'Open imagery, ideas, and intuitive drift.',
    description: 'A liminal HemiSync design for sketching, journaling, ideation, and entering the edge where images and language surface more easily.',
    bestFor: 'Creative planning, brainstorming, visual work, and idea capture.',
    ritual: 'Keep a notebook nearby for the return.',
    intent: 'Build a creative HemiSync session that feels spacious, imaginal, and softly inspiring.',
    chatPrompt: 'Lean this toward imagery and creative flow, with a more atmospheric middle section.',
    accent: 'creative'
  },
  {
    id: 'deep-recovery',
    title: 'Deep Recovery',
    shortLabel: 'Recover',
    journeyPresetId: 'deep-reset-15',
    useCase: 'Let the body soften and restore.',
    description: 'A restorative HemiSync session that trends deeper, hangs near the edge of delta, and rises back up in a slow controlled way.',
    bestFor: 'Stress recovery, nervous system downshifts, and end-of-day restoration.',
    ritual: 'Great after training, travel, or overstimulation.',
    intent: 'Build a restorative HemiSync session that trends deeper in the middle and feels grounding from start to finish.',
    chatPrompt: 'Make this more restorative, deepen the center, and keep the ending smooth and reassuring.',
    accent: 'restore'
  }
];
