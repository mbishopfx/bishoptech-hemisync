const BrainStateDefaults = {
  delta: { label: 'Delta', from: 3.2, to: 2.4 },
  theta: { label: 'Theta', from: 7.2, to: 5.2 },
  alpha: { label: 'Alpha', from: 12, to: 9 },
  beta: { label: 'Beta', from: 14, to: 18 },
  gamma: { label: 'Gamma', from: 32, to: 36 }
};

const GuidanceDensityFactors = {
  light: 0.12,
  medium: 0.18,
  high: 0.24
};

function roundDurationsToTotal(rawDurations, totalLengthSec) {
  if (!rawDurations.length) return [];
  const safeTotal = Math.max(60, Math.round(totalLengthSec || 0));
  const rawSum = rawDurations.reduce((sum, value) => sum + Math.max(0, value || 0), 0) || rawDurations.length;
  const scaled = rawDurations.map((value) => (Math.max(0, value || 0) / rawSum) * safeTotal);
  const floored = scaled.map((value) => Math.floor(value));
  let remainder = safeTotal - floored.reduce((sum, value) => sum + value, 0);
  const rankedFractions = scaled
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let index = 0; index < rankedFractions.length && remainder > 0; index += 1) {
    floored[rankedFractions[index].index] += 1;
    remainder -= 1;
  }

  return floored;
}

function inferBrainState(deltaHz) {
  const value = Number(deltaHz || 0);
  if (value < 4) return 'delta';
  if (value < 8) return 'theta';
  if (value < 13) return 'alpha';
  if (value < 30) return 'beta';
  return 'gamma';
}

function sanitizeIntent(intentText) {
  return (intentText || '').replace(/\s+/g, ' ').trim().slice(0, 180);
}

function buildStageId(index, stage) {
  if (stage?.id) return stage.id;
  const slug = (stage?.name || `stage-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || `stage-${index + 1}`;
}

function resolveDeltaRange(stage) {
  if (stage?.deltaHz?.from || stage?.deltaHz?.to) {
    const from = Number(stage.deltaHz.from ?? stage.deltaHz.to ?? 8);
    const to = Number(stage.deltaHz.to ?? stage.deltaHz.from ?? from);
    return { from, to };
  }

  const fallbackState = stage?.brainState || inferBrainState(stage?.targetDeltaHz || 8);
  const defaults = BrainStateDefaults[fallbackState] || BrainStateDefaults.alpha;
  return { from: defaults.from, to: defaults.to };
}

function deriveStageName(stage, index) {
  if (stage?.name) return stage.name;
  const brainState = stage?.brainState || 'alpha';
  return `${BrainStateDefaults[brainState]?.label || 'Focus'} Stage ${index + 1}`;
}

function buildStageBudget(stage) {
  const density = stage.guidanceDensity || 'medium';
  const factor = GuidanceDensityFactors[density] || GuidanceDensityFactors.medium;
  const durationSec = Math.max(15, Math.round(stage.durationSec || 0));
  return Math.max(12, Math.min(75, Math.round(durationSec * factor)));
}

export const JourneyPresets = {
  'induction-alpha-theta-integration-15': {
    id: 'induction-alpha-theta-integration-15',
    name: 'Induction → Alpha → Theta → Integration',
    summary: 'Balanced 15-minute progression for calm induction, theta exploration, and a clear return.',
    recommendedLengthSec: 900,
    focusLevel: 'F12',
    baseFreqHz: 236,
    guidanceStyle: 'calm, spacious, lightly evocative',
    breathPattern: 'coherent-5.5',
    background: { type: 'asset', assetId: 'lumina', mixDb: -24 },
    stages: [
      {
        id: 'arrival',
        name: 'Arrival',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 12, to: 10 },
        guidanceDensity: 'medium',
        goal: 'Release surface tension and orient inward.'
      },
      {
        id: 'induction',
        name: 'Resonance',
        minutes: 3,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 10, to: 8 },
        guidanceDensity: 'medium',
        goal: 'Stabilize breath, posture, and whole-brain coherence.'
      },
      {
        id: 'descent',
        name: 'Theta Descent',
        minutes: 4,
        brainState: 'theta',
        focusLevel: 'F12',
        deltaHz: { from: 8, to: 6 },
        guidanceDensity: 'light',
        goal: 'Soften effort and widen awareness.'
      },
      {
        id: 'hold',
        name: 'Theta Hold',
        minutes: 4,
        brainState: 'theta',
        focusLevel: 'F12',
        deltaHz: { from: 6, to: 5.2 },
        guidanceDensity: 'light',
        goal: 'Rest inside a quiet, receptive field.'
      },
      {
        id: 'integration',
        name: 'Integration',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 7, to: 10 },
        guidanceDensity: 'medium',
        goal: 'Return gently with clarity, steadiness, and recall.'
      }
    ]
  },
  'focus-15-no-time-15': {
    id: 'focus-15-no-time-15',
    name: 'Focus 15 No-Time Window',
    summary: 'A deeper theta journey that lingers in a slow, timeless center before returning smoothly.',
    recommendedLengthSec: 900,
    focusLevel: 'F15',
    baseFreqHz: 224,
    guidanceStyle: 'deep, minimal, non-directive',
    breathPattern: 'coherent-5.5',
    background: { type: 'asset', assetId: 'nattkatt', mixDb: -26 },
    stages: [
      {
        id: 'settle',
        name: 'Settling',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 11, to: 9 },
        guidanceDensity: 'medium',
        goal: 'Ease the body toward stillness.'
      },
      {
        id: 'bridge',
        name: 'Bridge Downward',
        minutes: 3,
        brainState: 'theta',
        focusLevel: 'F12',
        deltaHz: { from: 9, to: 6.5 },
        guidanceDensity: 'medium',
        goal: 'Let the mind unhook from clock time and narration.'
      },
      {
        id: 'no-time',
        name: 'No-Time Center',
        minutes: 5,
        brainState: 'theta',
        focusLevel: 'F15',
        deltaHz: { from: 6, to: 4.6 },
        guidanceDensity: 'light',
        goal: 'Sustain a slow, timeless field with minimal prompting.'
      },
      {
        id: 'observe',
        name: 'Observation',
        minutes: 3,
        brainState: 'theta',
        focusLevel: 'F15',
        deltaHz: { from: 4.8, to: 5.5 },
        guidanceDensity: 'light',
        goal: 'Notice insights without chasing them.'
      },
      {
        id: 'return',
        name: 'Soft Return',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 7, to: 10 },
        guidanceDensity: 'medium',
        goal: 'Come back grounded and refreshed.'
      }
    ]
  },
  'creative-hypnagogia-15': {
    id: 'creative-hypnagogia-15',
    name: 'Creative Hypnagogia',
    summary: 'A liminal alpha-theta design for ideation, imagery, and gentle capture-ready return.',
    recommendedLengthSec: 900,
    focusLevel: 'F12',
    baseFreqHz: 242,
    guidanceStyle: 'curious, luminous, relaxed',
    breathPattern: 'box',
    background: { type: 'asset', assetId: 'scatter', mixDb: -25 },
    stages: [
      {
        id: 'arrive',
        name: 'Creative Arrival',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 12, to: 10.5 },
        guidanceDensity: 'medium',
        goal: 'Quiet the analytical edge while staying bright.'
      },
      {
        id: 'float',
        name: 'Float State',
        minutes: 3,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 10.5, to: 8.5 },
        guidanceDensity: 'medium',
        goal: 'Invite spacious attention and visual drift.'
      },
      {
        id: 'hypnagogic',
        name: 'Hypnagogic Window',
        minutes: 5,
        brainState: 'theta',
        focusLevel: 'F12',
        deltaHz: { from: 8, to: 5.8 },
        guidanceDensity: 'light',
        goal: 'Hold the threshold where images and ideas arise easily.'
      },
      {
        id: 'gather',
        name: 'Gather Insight',
        minutes: 3,
        brainState: 'theta',
        focusLevel: 'F12',
        deltaHz: { from: 6.2, to: 7.2 },
        guidanceDensity: 'medium',
        goal: 'Gently notice the strongest image, phrase, or insight.'
      },
      {
        id: 'return',
        name: 'Return Clear',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 8.5, to: 10.5 },
        guidanceDensity: 'medium',
        goal: 'Return alert enough to capture what matters.'
      }
    ]
  },
  'deep-reset-15': {
    id: 'deep-reset-15',
    name: 'Deep Reset',
    summary: 'A restorative 15-minute reset that trends theta-to-delta edge, then lifts back to coherence.',
    recommendedLengthSec: 900,
    focusLevel: 'F12',
    baseFreqHz: 228,
    guidanceStyle: 'grounded, restorative, reassuring',
    breathPattern: 'coherent-5.5',
    background: { type: 'asset', assetId: 'mindsEyes', mixDb: -25 },
    stages: [
      {
        id: 'unwind',
        name: 'Unwind',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 11, to: 9 },
        guidanceDensity: 'medium',
        goal: 'Let muscular and mental effort drop away.'
      },
      {
        id: 'descend',
        name: 'Descend',
        minutes: 4,
        brainState: 'theta',
        focusLevel: 'F12',
        deltaHz: { from: 9, to: 6 },
        guidanceDensity: 'light',
        goal: 'Follow the sound into a slower nervous-system rhythm.'
      },
      {
        id: 'restore',
        name: 'Restore',
        minutes: 4,
        brainState: 'delta',
        focusLevel: 'F12',
        deltaHz: { from: 4.5, to: 3.2 },
        guidanceDensity: 'light',
        goal: 'Stay deeply restful without fully dropping out.'
      },
      {
        id: 'lift',
        name: 'Lift Toward Theta',
        minutes: 3,
        brainState: 'theta',
        focusLevel: 'F12',
        deltaHz: { from: 4.2, to: 6.2 },
        guidanceDensity: 'light',
        goal: 'Re-enter awareness with softness and stability.'
      },
      {
        id: 'integrate',
        name: 'Coherent Return',
        minutes: 2,
        brainState: 'alpha',
        focusLevel: 'F10',
        deltaHz: { from: 7.5, to: 10 },
        guidanceDensity: 'medium',
        goal: 'Complete the reset with a calm, refreshed finish.'
      }
    ]
  }
};

export const JOURNEY_PRESET_IDS = Object.keys(JourneyPresets);
export const JourneyPresetOptions = Object.values(JourneyPresets);

export function pickJourneyPreset(journeyPresetId) {
  return JourneyPresets[journeyPresetId] || JourneyPresets['induction-alpha-theta-integration-15'];
}

export function normalizeJourneyStages(stageBlueprint, { totalLengthSec, defaultFocusLevel, baseFreqHz } = {}) {
  const sourceStages = Array.isArray(stageBlueprint) && stageBlueprint.length > 0
    ? stageBlueprint
    : pickJourneyPreset().stages;
  const durations = roundDurationsToTotal(
    sourceStages.map((stage) => stage.durationSec || (stage.minutes ? stage.minutes * 60 : 60)),
    totalLengthSec
  );

  let cursor = 0;
  return sourceStages.map((stage, index) => {
    const deltaHz = resolveDeltaRange(stage);
    const midDelta = (deltaHz.from + deltaHz.to) / 2;
    const durationSec = durations[index] || 60;
    const normalizedStage = {
      id: buildStageId(index, stage),
      name: deriveStageName(stage, index),
      atSec: cursor,
      durationSec,
      focusLevel: stage.focusLevel || defaultFocusLevel || 'F12',
      brainState: stage.brainState || inferBrainState(midDelta),
      carrierHz: Number(stage.carrierHz ?? baseFreqHz ?? 236),
      deltaHz,
      guidanceDensity: stage.guidanceDensity || 'medium',
      goal: stage.goal || '',
      notes: stage.notes || '',
      script: stage.script || ''
    };
    cursor += durationSec;
    return normalizedStage;
  });
}

export function buildDeltaPathFromStages(stages) {
  if (!Array.isArray(stages) || stages.length === 0) {
    return [
      { at: 0, hz: 10 },
      { at: 900, hz: 6 }
    ];
  }

  const points = [];
  for (const stage of stages) {
    const startAt = Math.max(0, Math.round(stage.atSec || 0));
    const endAt = Math.max(startAt, Math.round((stage.atSec || 0) + (stage.durationSec || 0)));
    const fromHz = Number(stage.deltaHz?.from ?? 8);
    const toHz = Number(stage.deltaHz?.to ?? fromHz);
    if (!points.length || points[points.length - 1].at !== startAt || points[points.length - 1].hz !== fromHz) {
      points.push({ at: startAt, hz: fromHz });
    }
    if (endAt > startAt) {
      points.push({ at: endAt, hz: toHz });
    }
  }

  return points;
}

export function buildJourneyBlueprint({
  journeyPresetId,
  totalLengthSec,
  baseFreqHz,
  focusLevel,
  stages,
  journeyName
} = {}) {
  const preset = pickJourneyPreset(journeyPresetId);
  const resolvedLength = Math.max(180, Math.round(totalLengthSec || preset.recommendedLengthSec || 900));
  const resolvedBaseFreqHz = Number(baseFreqHz ?? preset.baseFreqHz ?? 236);
  const normalizedStages = normalizeJourneyStages(stages || preset.stages, {
    totalLengthSec: resolvedLength,
    defaultFocusLevel: focusLevel || preset.focusLevel,
    baseFreqHz: resolvedBaseFreqHz
  });

  return {
    id: preset.id,
    journeyPresetId: preset.id,
    name: journeyName || preset.name,
    summary: preset.summary,
    focusLevel: focusLevel || preset.focusLevel,
    baseFreqHz: resolvedBaseFreqHz,
    guidanceStyle: preset.guidanceStyle,
    breathPattern: preset.breathPattern,
    background: preset.background,
    totalLengthSec: resolvedLength,
    stages: normalizedStages,
    deltaHzPath: buildDeltaPathFromStages(normalizedStages)
  };
}

export function buildGuidanceCueStages(journey) {
  return (journey?.stages || []).map((stage) => {
    const cueOffsetSec = Math.min(14, Math.max(4, Math.round(stage.durationSec * 0.12)));
    return {
      id: `${stage.id}-cue`,
      stageId: stage.id,
      name: stage.name,
      focusLevel: stage.focusLevel,
      brainState: stage.brainState,
      goal: stage.goal,
      notes: stage.notes,
      guidanceDensity: stage.guidanceDensity,
      atSec: Math.min((stage.atSec || 0) + cueOffsetSec, Math.max(0, (journey?.totalLengthSec || 0) - 1)),
      durationSec: buildStageBudget(stage),
      windowAtSec: stage.atSec,
      windowDurationSec: stage.durationSec,
      script: stage.script || ''
    };
  });
}

export function buildFallbackGuidanceScript({ journey, stage, intentText } = {}) {
  const stageGoal = stage?.goal || 'Let the current layer of the track do the work for you.';
  const intent = sanitizeIntent(intentText);
  const stateCue = {
    alpha: 'Allow the body to soften while the mind stays clear and comfortably awake.',
    theta: 'Let your attention widen and become quieter, slower, and more spacious.',
    delta: 'Rest close to the edge of sleep while keeping a faint thread of awareness.',
    beta: 'Gather clean alertness without tightening the body.',
    gamma: 'Notice a subtle brightness without forcing intensity.'
  }[stage?.brainState || 'alpha'];
  const closing = stage?.brainState === 'alpha'
    ? 'Return with steadiness and clean recall.'
    : 'There is nothing to force; simply notice and receive.';

  return [
    stage?.atSec < 20 ? 'Take a slow breath in, and let the exhale be easy.' : 'Notice the shift in tone and let yourself follow it without effort.',
    stateCue,
    stageGoal,
    intent ? `Keep the intention of ${intent} lightly in the background.` : null,
    journey?.guidanceStyle ? `Stay with a ${journey.guidanceStyle} tone in your inner voice.` : null,
    closing
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function classifyBrainState(deltaHz) {
  return inferBrainState(deltaHz);
}

export function interpolateDeltaPath(totalLengthSec, deltaPath) {
  const length = Math.max(1, Math.round(totalLengthSec || 0));
  const series = new Array(length).fill(0);
  const points = Array.isArray(deltaPath) && deltaPath.length > 0
    ? deltaPath
    : [{ at: 0, hz: 10 }, { at: length, hz: 6 }];

  for (let second = 0; second < length; second += 1) {
    let leftIndex = 0;
    for (let index = 0; index < points.length; index += 1) {
      if ((points[index].at || 0) <= second) {
        leftIndex = index;
      }
    }
    const rightIndex = Math.min(points.length - 1, leftIndex + 1);
    const leftPoint = points[leftIndex];
    const rightPoint = points[rightIndex];
    const span = Math.max(1, (rightPoint.at || 0) - (leftPoint.at || 0));
    const progress = Math.min(1, Math.max(0, (second - (leftPoint.at || 0)) / span));
    series[second] = Number((leftPoint.hz + (rightPoint.hz - leftPoint.hz) * progress).toFixed(2));
  }

  return series;
}

export function buildJourneyAnalytics({ journey, program, sampleRate, baseFreqHz }) {
  const totalLengthSec = Math.max(1, Math.round(journey?.totalLengthSec || 0));
  const deltaHzSeries = interpolateDeltaPath(totalLengthSec, journey?.deltaHzPath);
  const voicePresence = new Array(totalLengthSec).fill(0);
  const bedRms = new Array(totalLengthSec).fill(0);
  const voiceRms = new Array(totalLengthSec).fill(0);
  const bedL = program?.bedPostDuck?.left || new Float32Array(totalLengthSec * sampleRate);
  const bedR = program?.bedPostDuck?.right || new Float32Array(totalLengthSec * sampleRate);
  const voiceTrackL = program?.voiceTracks?.left || new Float32Array(totalLengthSec * sampleRate);
  const voiceTrackR = program?.voiceTracks?.right || new Float32Array(totalLengthSec * sampleRate);
  const totalFrames = bedL.length;

  for (let second = 0; second < totalLengthSec; second += 1) {
    const start = second * sampleRate;
    const end = Math.min(totalFrames, start + sampleRate);
    let bedPower = 0;
    let voicePower = 0;
    let present = 0;

    for (let frame = start; frame < end; frame += 1) {
      const bedValue = ((bedL[frame] || 0) ** 2 + (bedR[frame] || 0) ** 2) * 0.5;
      const voiceValue = ((voiceTrackL[frame] || 0) ** 2 + (voiceTrackR[frame] || 0) ** 2) * 0.5;
      bedPower += bedValue;
      voicePower += voiceValue;
      if (voiceValue > 1e-6) {
        present = 1;
      }
    }

    const frames = Math.max(1, end - start);
    bedRms[second] = Number(Math.sqrt(bedPower / frames).toFixed(4));
    voiceRms[second] = Number(Math.sqrt(voicePower / frames).toFixed(4));
    voicePresence[second] = present;
  }

  const bandSeries = deltaHzSeries.map((hz) => classifyBrainState(hz));
  const coverage = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };
  bandSeries.forEach((band) => {
    coverage[band] = (coverage[band] || 0) + 1;
  });
  Object.keys(coverage).forEach((band) => {
    coverage[band] = Number(((coverage[band] / totalLengthSec) * 100).toFixed(1));
  });

  return {
    lengthSec: totalLengthSec,
    sampleRate,
    deltaHzSeries,
    duckEnvSeries: program?.duckEnvSeries || [],
    baseFreqHz: baseFreqHz || journey?.baseFreqHz,
    voicePresence,
    bedRms,
    voiceRms,
    coverage,
    stageSummary: (journey?.stages || []).map((stage) => ({
      id: stage.id,
      name: stage.name,
      atSec: stage.atSec,
      durationSec: stage.durationSec,
      brainState: stage.brainState,
      focusLevel: stage.focusLevel,
      deltaFromHz: stage.deltaHz?.from,
      deltaToHz: stage.deltaHz?.to
    }))
  };
}
