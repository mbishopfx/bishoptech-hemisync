export const DEFAULT_OCEAN_PARAMS = Object.freeze({
  windSpeed: 24,
  windAngle: 18,
  amplitude: 4,
  patchSize: 265,
  heightScale: 34,
  choppyScale: 14,
  foamScale: 0.5,
  sunElevation: 6.5,
  sunAzimuth: 236,
  timeScale: 1
});

const OCEAN_STATE_ANGLES = Object.freeze({
  delta: 8,
  theta: 34,
  alpha: 96,
  beta: 168,
  gamma: 228,
  custom: 300
});

function finiteNumber(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hash32(value) {
  let next = value >>> 0;
  next ^= next >>> 16;
  next = Math.imul(next, 0x7feb352d);
  next ^= next >>> 15;
  next = Math.imul(next, 0x846ca68b);
  next ^= next >>> 16;
  return next >>> 0;
}

function unit(seed, salt) {
  return hash32((seed ^ Math.imul(salt, 0x9e3779b9)) >>> 0) / 0x100000000;
}

function rounded(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function normalizeOceanSeed(seed) {
  if (seed !== null && seed !== undefined && seed !== '') {
    const numeric = Number(seed);
    if (Number.isFinite(numeric)) return Math.trunc(numeric) >>> 0;
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0];
  }

  return Math.floor(Math.random() * 0x100000000) >>> 0;
}

export function createOceanProfile(seed) {
  const normalizedSeed = normalizeOceanSeed(seed);
  const runLabel = normalizedSeed.toString(16).padStart(8, '0').toUpperCase();

  return {
    seed: normalizedSeed,
    runLabel,
    windSpeed: rounded(12 + unit(normalizedSeed, 1) * 34, 1),
    windAngle: rounded(unit(normalizedSeed, 2) * 360),
    amplitude: rounded(1.5 + unit(normalizedSeed, 3) * 10.5, 1),
    patchSize: rounded(150 + unit(normalizedSeed, 4) * 330),
    heightScale: rounded(20 + unit(normalizedSeed, 5) * 42, 1),
    choppyScale: rounded(7 + unit(normalizedSeed, 6) * 24, 1),
    foamScale: rounded(0.2 + unit(normalizedSeed, 7) * 0.8, 2),
    sunElevation: rounded(4 + unit(normalizedSeed, 8) * 28, 1),
    sunAzimuth: rounded(unit(normalizedSeed, 9) * 360),
    timeScale: rounded(0.6 + unit(normalizedSeed, 10) * 1.2, 2)
  };
}

/**
 * Map the live listening controls onto the visual simulation while keeping
 * the seed-driven personality of each ocean run intact.
 */
export function createOceanProfileFromControls(seed, controls = {}) {
  const base = createOceanProfile(seed);
  const carrierHz = rounded(clamp(finiteNumber(controls.carrierFreq ?? controls.carrierHz, 200), 100, 400));
  const beatHz = rounded(clamp(finiteNumber(controls.beatFreq ?? controls.beatHz, 6), 0.5, 30), 1);
  const volume = rounded(clamp(finiteNumber(controls.volume, 80), 0, 100));
  const brainState = String(controls.brainState ?? controls.state ?? 'theta').toLowerCase();
  const carrierRatio = (carrierHz - 100) / 300;
  const beatRatio = (beatHz - 0.5) / 29.5;
  const energy = volume / 100;
  const stateAngle = OCEAN_STATE_ANGLES[brainState] ?? OCEAN_STATE_ANGLES.custom;

  return {
    ...base,
    windSpeed: rounded(clamp(14 + beatRatio * 22 + carrierRatio * 6, 12, 46), 1),
    windAngle: rounded((base.windAngle + stateAngle + carrierRatio * 40) % 360),
    amplitude: rounded(clamp(1.8 + energy * 6.4 + carrierRatio * 2.5, 1.5, 12), 1),
    patchSize: rounded(clamp(210 + (1 - carrierRatio) * 80 - beatRatio * 20, 150, 480)),
    heightScale: rounded(clamp(22 + energy * 24 + beatRatio * 10, 20, 62), 1),
    choppyScale: rounded(clamp(8 + carrierRatio * 12 + beatRatio * 8, 7, 31), 1),
    foamScale: rounded(clamp(0.85 - energy * 0.45 - beatRatio * 0.2, 0.2, 1), 2),
    timeScale: rounded(clamp(0.58 + beatRatio * 1.18, 0.58, 1.8), 2),
    sourceControls: { carrierHz, beatHz, volume, brainState }
  };
}
