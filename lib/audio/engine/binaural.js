import { dbToGain, clamp, softClip, lerp } from './utils';

function createPinkNoiseGenerator() {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return () => {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
    return pink;
  };
}

function createBrownNoiseGenerator() {
  let last = 0;
  return () => {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    return last * 3.5; // normalize rough gain
  };
}

function getNoiseGenerator(type = 'pink') {
  switch (type) {
    case 'brown':
      return createBrownNoiseGenerator();
    case 'white':
      return () => Math.random() * 2 - 1;
    case 'pink':
    default:
      return createPinkNoiseGenerator();
  }
}

function resolveDeltaPath(deltaHzFrom, deltaHzTo, shape = null) {
  if (shape && Array.isArray(shape) && shape.length > 0) {
    return shape.map(({ at = 0, hz = deltaHzFrom }) => ({ at, hz }));
  }
  return [
    { at: 0, hz: deltaHzFrom },
    { at: 1, hz: deltaHzTo }
  ];
}

export function renderBinauralBed({
  lengthSec,
  sampleRate = 44100,
  baseFreqHz = 220,
  carrierLeftHz,
  carrierRightHz,
  deltaHzFrom = 10,
  deltaHzTo = 6,
  deltaCurve = null,
  noise = { type: 'pink', mixDb: -24 },
  breath = null,
  modes = { binaural: true, monaural: false, isochronic: false },
  background = null,
  onProgress = null
}) {
  const totalSamples = Math.floor(lengthSec * sampleRate);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const hasBinaural = !!modes?.binaural;
  const hasMonaural = !!modes?.monaural;
  const hasIsochronic = !!modes?.isochronic;

  const deltaPath = resolveDeltaPath(deltaHzFrom, deltaHzTo, deltaCurve);
  const maxDeltaAt = Math.max(...deltaPath.map((p) => p.at || 0), 1);

  const noiseGain = noise ? dbToGain(noise.mixDb ?? -24) : 0;
  const noiseGenerator = noise && getNoiseGenerator(noise.type);

  const pinkL = noiseGenerator ? getNoiseGenerator(noise.type) : null;
  const pinkR = noiseGenerator ? getNoiseGenerator(noise.type) : null;

  const baseLeftHz = Number.isFinite(carrierLeftHz) ? carrierLeftHz : baseFreqHz;
  const baseRightHz = Number.isFinite(carrierRightHz) ? carrierRightHz : baseFreqHz;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const norm = lengthSec > 0 ? t / lengthSec : 0;

    // delta interpolation
    let deltaHz = deltaHzFrom;
    if (deltaPath.length > 1) {
      const scaledT = norm * maxDeltaAt;
      let idx = 0;
      for (let k = 0; k < deltaPath.length; k++) {
        if ((deltaPath[k].at || 0) <= scaledT) idx = k;
      }
      const p1 = deltaPath[idx];
      const p2 = deltaPath[Math.min(deltaPath.length - 1, idx + 1)];
      const span = Math.max(1e-6, (p2.at || 0) - (p1.at || 0));
      const localT = Math.min(1, Math.max(0, (scaledT - (p1.at || 0)) / span));
      deltaHz = lerp(p1.hz ?? deltaHzFrom, p2.hz ?? deltaHzTo, localT);
    } else {
      deltaHz = lerp(deltaHzFrom, deltaHzTo, norm);
    }

    const leftHz = baseLeftHz;
    const rightHz = baseRightHz + (hasBinaural ? deltaHz : 0);

    let lSample = hasBinaural ? Math.sin(2 * Math.PI * leftHz * t) : 0;
    let rSample = hasBinaural ? Math.sin(2 * Math.PI * rightHz * t) : 0;

    if (hasMonaural) {
      const mono = Math.sin(2 * Math.PI * baseFreqHz * t) + Math.sin(2 * Math.PI * (baseFreqHz + deltaHz) * t);
      lSample += 0.5 * mono;
      rSample += 0.5 * mono;
    }

    if (hasIsochronic) {
      const gate = 0.5 * (1 + Math.sin(2 * Math.PI * deltaHz * t));
      lSample *= gate;
      rSample *= gate;
    }

    if (noiseGenerator) {
      const nL = pinkL?.() ?? 0;
      const nR = pinkR?.() ?? 0;
      lSample += noiseGain * nL;
      rSample += noiseGain * nR;
    }

    if (breath?.envelope) {
      const depth = breath.depth ?? 0.1;
      const env = breath.envelope[Math.min(breath.envelope.length - 1, i)] ?? 0.5;
      const am = 1 - depth + depth * env;
      lSample *= am;
      rSample *= am;
    }

    if (background?.left && background?.right) {
      lSample += background.left[i] || 0;
      rSample += background.right[i] || 0;
    }

    left[i] = softClip(lSample);
    right[i] = softClip(rSample);

    if (onProgress && i % (sampleRate * 5) === 0) {
      onProgress(Math.min(1, i / totalSamples));
    }
  }

  if (onProgress) onProgress(1);

  return { left, right, sampleRate };
}

export function applyDucking({
  bedL,
  bedR,
  voiceL,
  voiceR,
  sampleRate,
  duckPercent = 0.75,
  attackMs = 40,
  releaseMs = 220
}) {
  const totalFrames = bedL.length;
  const attack = 1 - Math.exp(-1 / (sampleRate * (attackMs / 1000)));
  const release = 1 - Math.exp(-1 / (sampleRate * (releaseMs / 1000)));
  let env = 1;
  const duckEnvSeries = new Float32Array(Math.ceil(totalFrames / sampleRate));

  for (let i = 0; i < totalFrames; i++) {
    const hasVoice = Math.max(Math.abs(voiceL[i] || 0), Math.abs(voiceR[i] || 0)) > 1e-4;
    const target = hasVoice ? duckPercent : 1;
    const coeff = target < env ? attack : release;
    env = env + (target - env) * coeff;
    bedL[i] *= env;
    bedR[i] *= env;
    if (i % sampleRate === 0) {
      duckEnvSeries[Math.floor(i / sampleRate)] = env;
    }
  }

  return { duckEnvSeries: Array.from(duckEnvSeries) };
}

export function mixStereo({ targetL, targetR, addL, addR, gain = 1 }) {
  const frames = targetL.length;
  for (let i = 0; i < frames; i++) {
    const l = targetL[i] + gain * (addL[i] || 0);
    const r = targetR[i] + gain * (addR[i] || 0);
    targetL[i] = clamp(l);
    targetR[i] = clamp(r);
  }
}


