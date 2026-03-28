import { clamp, dbToGain } from './utils';

function measurePeak(left, right) {
  let peak = 0;
  for (let i = 0; i < left.length; i += 1) {
    peak = Math.max(peak, Math.abs(left[i] || 0), Math.abs(right[i] || 0));
  }
  return peak;
}

function applyDcBlockInPlace(buffer, sampleRate, cutoffHz = 18) {
  const dt = 1 / sampleRate;
  const rc = 1 / (2 * Math.PI * cutoffHz);
  const alpha = rc / (rc + dt);
  let prevX = 0;
  let prevY = 0;

  for (let i = 0; i < buffer.length; i += 1) {
    const x = buffer[i] || 0;
    const y = alpha * (prevY + x - prevX);
    buffer[i] = y;
    prevX = x;
    prevY = y;
  }
}

function applyLimiterInPlace({
  left,
  right,
  sampleRate,
  ceilingDb = -1.0,
  lookaheadMs = 5,
  attackMs = 2,
  releaseMs = 160
}) {
  const ceiling = dbToGain(ceilingDb);
  const lookaheadFrames = Math.max(1, Math.round(sampleRate * (lookaheadMs / 1000)));
  const attackCoeff = 1 - Math.exp(-1 / Math.max(1, sampleRate * (attackMs / 1000)));
  const releaseCoeff = 1 - Math.exp(-1 / Math.max(1, sampleRate * (releaseMs / 1000)));
  let gain = 1;
  let minimumGain = 1;

  for (let i = 0; i < left.length; i += 1) {
    const futureIndex = Math.min(left.length - 1, i + lookaheadFrames);
    const currentPeak = Math.max(
      Math.abs(left[i] || 0),
      Math.abs(right[i] || 0),
      Math.abs(left[futureIndex] || 0),
      Math.abs(right[futureIndex] || 0)
    );
    const targetGain = currentPeak > ceiling ? ceiling / currentPeak : 1;
    const coeff = targetGain < gain ? attackCoeff : releaseCoeff;
    gain += (targetGain - gain) * coeff;
    minimumGain = Math.min(minimumGain, gain);
    left[i] *= gain;
    right[i] *= gain;
  }

  return {
    ceiling,
    minimumGain
  };
}

export function applyMasteringChain({
  left,
  right,
  sampleRate,
  profile = {}
}) {
  const masteredLeft = Float32Array.from(left);
  const masteredRight = Float32Array.from(right);

  applyDcBlockInPlace(masteredLeft, sampleRate, profile.dcBlockHz ?? 18);
  applyDcBlockInPlace(masteredRight, sampleRate, profile.dcBlockHz ?? 18);

  const prePeak = measurePeak(masteredLeft, masteredRight);
  const limiterMeta = applyLimiterInPlace({
    left: masteredLeft,
    right: masteredRight,
    sampleRate,
    ceilingDb: profile.ceilingDb ?? -1.0,
    lookaheadMs: profile.lookaheadMs ?? 5,
    attackMs: profile.attackMs ?? 2,
    releaseMs: profile.releaseMs ?? 160
  });

  const postLimitPeak = measurePeak(masteredLeft, masteredRight);
  if (postLimitPeak > limiterMeta.ceiling && postLimitPeak > 0) {
    const safetyGain = limiterMeta.ceiling / postLimitPeak;
    for (let i = 0; i < masteredLeft.length; i += 1) {
      masteredLeft[i] *= safetyGain;
      masteredRight[i] *= safetyGain;
    }
  }

  for (let i = 0; i < masteredLeft.length; i += 1) {
    masteredLeft[i] = clamp(masteredLeft[i], -1, 1);
    masteredRight[i] = clamp(masteredRight[i], -1, 1);
  }

  const postPeak = measurePeak(masteredLeft, masteredRight);

  return {
    left: masteredLeft,
    right: masteredRight,
    metadata: {
      prePeak,
      postPeak,
      ceilingDb: profile.ceilingDb ?? -1.0,
      limiterMinGain: limiterMeta.minimumGain
    }
  };
}
