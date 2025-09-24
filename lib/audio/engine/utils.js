export function dbToGain(db = 0) {
  return Math.pow(10, (Number.isFinite(db) ? db : 0) / 20);
}

export function gainToDb(gain = 1) {
  return 20 * Math.log10(Math.max(1e-9, gain));
}

export function clamp(value, min = -1, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function softClip(sample, threshold = 0.7071, slope = 0.1) {
  if (sample > threshold) return threshold + (sample - threshold) * slope;
  if (sample < -threshold) return -threshold + (sample + threshold) * slope;
  return sample;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function secondsToFrames(seconds, sampleRate) {
  return Math.max(0, Math.floor((Number(seconds) || 0) * sampleRate));
}

export function framesToSeconds(frames, sampleRate) {
  return (Number(frames) || 0) / (sampleRate || 1);
}


