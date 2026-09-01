import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  createOceanProfile,
  createOceanProfileFromControls
} from '../components/science/vgpu-ocean/ocean-profile.js';

const root = new URL('../', import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), 'utf8');
}

test('ocean profiles remain deterministic per run and respond to live controls', () => {
  const controls = { carrierFreq: 260, beatFreq: 18, volume: 64, brainState: 'beta' };
  const first = createOceanProfileFromControls(101, controls);
  const repeat = createOceanProfileFromControls(101, controls);
  const nextRun = createOceanProfileFromControls(102, controls);
  const slower = createOceanProfileFromControls(101, { ...controls, beatFreq: 3 });

  assert.deepEqual(first, repeat);
  assert.notEqual(first.runLabel, nextRun.runLabel);
  assert.notEqual(first.timeScale, slower.timeScale);
  assert.notEqual(first.windSpeed, slower.windSpeed);
  assert.equal(first.sourceControls.carrierHz, 260);
  assert.equal(first.sourceControls.beatHz, 18);
  assert.ok(first.amplitude >= 1.5 && first.amplitude <= 12);
  assert.ok(first.patchSize >= 150 && first.patchSize <= 480);
  assert.ok(first.timeScale >= 0.58 && first.timeScale <= 1.8);
  assert.equal(createOceanProfile(101).seed, 101);
});

test('immersive mode updates the existing vGPU scene without replacing audio state', async () => {
  const renderer = await source('components/science/vgpu-ocean/renderer.js');
  const canvas = await source('components/science/OceanSurfaceCanvas.jsx');
  const mode = await source('components/dashboard/ImmersiveOceanMode.jsx');
  const composer = await source('components/dashboard/WorkshopComposer.jsx');

  assert.match(renderer, /profile: initialProfile = null/);
  assert.match(renderer, /const updateProfile = \(nextProfile\)/);
  assert.match(renderer, /scene\.rebuildSpectrum\(profile\)/);
  assert.match(renderer, /updateProfile,/);
  assert.match(canvas, /profile = null/);
  assert.match(canvas, /rendererRef/);
  assert.match(canvas, /updateProfile\?\.\(profile\)/);
  assert.match(mode, /OceanSurfaceCanvas/);
  assert.match(mode, /data-testid="immersive-ocean-mode"/);
  assert.match(mode, /tone keeps running underneath/);
  assert.match(mode, /waves update without pausing the tone/);
  assert.match(composer, /ImmersiveOceanMode/);
  assert.match(composer, /data-testid="immersive-mode-button"/);
  assert.match(composer, /normalizeOceanSeed/);
});
