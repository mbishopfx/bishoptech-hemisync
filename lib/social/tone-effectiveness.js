const STATE_RANGES = {
  delta: { min: 1, max: 4, label: 'Deep restoration' },
  theta: { min: 4, max: 8, label: 'Meditation and imagery' },
  alpha: { min: 8, max: 13, label: 'Calm focus' },
  beta: { min: 13, max: 30, label: 'Task engagement' },
  gamma: { min: 30, max: 40, label: 'High-frequency micro-burst' }
};

function resolveDeltaSamples(deltaPath = []) {
  if (!Array.isArray(deltaPath) || deltaPath.length === 0) {
    return [];
  }

  return deltaPath
    .map((point) => Number(point.hz ?? point.from ?? point.to))
    .filter((value) => Number.isFinite(value));
}

export function inferTargetState(deltaPath = []) {
  const samples = resolveDeltaSamples(deltaPath);
  const average = samples.length ? samples.reduce((sum, value) => sum + value, 0) / samples.length : 8;
  return Object.entries(STATE_RANGES).find(([, range]) => average >= range.min && average < range.max)?.[0] || 'alpha';
}

export function scoreToneEffectiveness({
  targetState,
  durationSec,
  baseFreqHz,
  deltaPath,
  stages,
  breathPattern
} = {}) {
  const resolvedState = targetState || inferTargetState(deltaPath);
  const range = STATE_RANGES[resolvedState] || STATE_RANGES.alpha;
  const samples = resolveDeltaSamples(deltaPath);
  const warnings = [];
  const strengths = [];
  let score = 42;

  if (Number(durationSec) >= 600) {
    score += 14;
    strengths.push('Long enough for a staged entrainment ramp.');
  } else {
    warnings.push('Short sessions are useful for previews but weaker for gradual state shifts.');
  }

  if (Number(baseFreqHz) >= 180 && Number(baseFreqHz) <= 420) {
    score += 12;
    strengths.push('Carrier frequency sits in a comfortable headphone range.');
  } else {
    warnings.push('Carrier frequency is outside the preferred 180-420 Hz planning range.');
  }

  if (samples.length >= 2 && samples.every((value) => value >= range.min && value <= range.max)) {
    score += 16;
    strengths.push(`Delta path stays inside the ${resolvedState} band.`);
  } else if (samples.length >= 2) {
    score += 8;
    warnings.push(`Delta path crosses outside the ${resolvedState} band; use this only as an intentional transition.`);
  }

  if (Array.isArray(stages) && stages.length >= 3) {
    score += 10;
    strengths.push('Multiple stages give the session a clear induction, hold, and return.');
  }

  if (breathPattern) {
    score += 6;
    strengths.push('Breath pacing can make the session easier to settle into.');
  }

  if (resolvedState === 'gamma') {
    warnings.push('Gamma should be used sparingly and at low intensity.');
  }

  warnings.push('Use headphones at moderate volume; do not use while driving or operating equipment.');

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    targetState: resolvedState,
    label: range.label,
    strengths,
    warnings,
    researchMode: 'deterministic-v1',
    futureResearchHook: 'TRIBE v2 can inform future stimulus-response research, but is not used in this generator.'
  };
}
