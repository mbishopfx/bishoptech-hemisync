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
    },
    {
      id: 'layer-voice',
      type: 'voice',
      params: {
        enabled: true,
        voice: 'alloy',
        mixDb: -16,
        guidanceMode: 'hybrid',
        style: defaultJourney.guidanceStyle
      }
    }
  ],
  stages: defaultJourney.stages
};
