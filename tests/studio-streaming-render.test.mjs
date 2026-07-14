import assert from 'node:assert/strict';
import test from 'node:test';
import { renderStudioWithFfmpeg } from '../lib/studio/ffmpeg-render.js';

test('streaming Studio renderer produces a storage-safe MP3 master without building a session in memory', async () => {
  const durationSec = 2;
  const result = await renderStudioWithFfmpeg({
    durationSec,
    stages: [{ durationSec, carrierHz: 220, deltaHz: { from: 10, to: 6 } }],
    entrainmentModes: { binaural: true, monaural: false, isochronic: false },
    background: { type: 'none' },
    breathGuide: { enabled: false, pattern: 'coherent-5.5', bpm: 5.5 },
    fades: { inSec: 0.25, outSec: 0.25 },
    exportFormats: ['mp3']
  });

  assert.equal(result.wavBuffer, null);
  assert.equal(result.mp3Buffer.subarray(0, 3).toString('ascii'), 'ID3');
  assert.equal(result.mastering.renderer, 'ffmpeg-streaming');
});
