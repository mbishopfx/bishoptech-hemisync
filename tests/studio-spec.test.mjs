import assert from 'node:assert/strict';
import test from 'node:test';
import {
  STUDIO_MAX_DURATION_SEC,
  STUDIO_MIN_DURATION_SEC,
  createStudioSpecFromPreset,
  validateStudioSpec
} from '../lib/studio/spec.js';

test('preset projects always produce an editable stage total matching duration', () => {
  for (const durationSec of [5 * 60, 10 * 60, 15 * 60, 20 * 60]) {
    const spec = createStudioSpecFromPreset({ durationSec });
    assert.equal(spec.durationSec, durationSec);
    assert.equal(spec.stages.reduce((total, stage) => total + stage.durationSec, 0), durationSec);
    assert.ok(spec.stages.every((stage) => stage.durationSec >= 15));
  }
});

test('Studio duration stays within the 5 to 20 minute product boundary', () => {
  assert.equal(createStudioSpecFromPreset({ durationSec: 1 }).durationSec, STUDIO_MIN_DURATION_SEC);
  assert.equal(createStudioSpecFromPreset({ durationSec: 99999 }).durationSec, STUDIO_MAX_DURATION_SEC);
  assert.deepEqual(createStudioSpecFromPreset({ durationSec: 600 }).exportFormats, ['mp3']);
});

test('invalid totals, frequency bounds, and disabled modes are rejected', () => {
  const valid = createStudioSpecFromPreset({ durationSec: 600 });
  assert.throws(() => validateStudioSpec({ ...valid, stages: valid.stages.map((stage, index) => index === 0 ? { ...stage, durationSec: stage.durationSec + 1 } : stage) }), /Stage durations/);
  assert.throws(() => validateStudioSpec({ ...valid, stages: valid.stages.map((stage, index) => index === 0 ? { ...stage, carrierHz: 3000 } : stage) }), /less than or equal to 2000/);
  assert.throws(() => validateStudioSpec({ ...valid, entrainmentModes: { binaural: false, monaural: false, isochronic: false } }), /at least one entrainment mode/);
});
