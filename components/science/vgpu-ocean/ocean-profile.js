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
