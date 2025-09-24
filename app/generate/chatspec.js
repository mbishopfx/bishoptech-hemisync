export const defaultSessionSpec = {
  version: 1,
  focusLevel: 'F12',
  lengthSec: 600,
  baseFreqHz: 240,
  deltaHz: 8,
  volumeDb: -14,
  breathRate: 0.095,
  layers: [
    {
      id: 'layer-binaural-base',
      type: 'binaural',
      params: {
        baseFreqHz: 240,
        delta: { from: 12, to: 6 },
        mixDb: -10
      }
    },
    {
      id: 'layer-noise-ocean',
      type: 'background',
      params: {
        preset: 'ocean',
        mixDb: -24
      }
    },
    {
      id: 'layer-breath',
      type: 'breath',
      params: {
        pattern: 'coherent-5.5',
        depth: 0.12
      }
    },
    {
      id: 'layer-voice',
      type: 'voice',
      params: {
        voice: 'alloy',
        mixDb: -16,
        style: 'calm-hypnagogic'
      }
    }
  ],
  stages: [
    { name: 'Induction', atSec: 0, durationSec: 180, script: '' },
    { name: 'Expansion', atSec: 180, durationSec: 240, script: '' },
    { name: 'Exploration', atSec: 420, durationSec: 150, script: '' },
    { name: 'Return', atSec: 570, durationSec: 30, script: '' }
  ]
};
