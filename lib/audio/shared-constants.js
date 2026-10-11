// Single source of truth for Cognistration entrainment science constants.
// Every audio engine (server, browser widget, iOS) must consume these values.
// iOS: copy this file into the Swift codebase as BrainState+Constants.swift

export const BRAIN_STATES = ['delta', 'theta', 'alpha', 'smr', 'beta', 'gamma'];

// Clinically-validated beat frequency defaults (midpoint of each band)
export const BEAT_FREQUENCY_HZ = Object.freeze({
  delta: 2.5,   // deep sleep / restorative   (clinical: 0.5–4 Hz)
  theta: 6.0,   // meditation / creativity     (clinical: 4–8 Hz)
  alpha: 10.0,  // relaxed alertness / Berger  (clinical: 8–13 Hz)
  smr:   13.0,  // sensorimotor rhythm / focus (clinical: 12–15 Hz)
  beta:  18.0,  // active concentration        (clinical: 13–30 Hz)
  gamma: 38.0,  // cognitive binding           (clinical: 30–45 Hz)
});

// Full clinical range per state (for sweep/stage endpoints)
export const BEAT_RANGE_HZ = Object.freeze({
  delta:  { min: 0.5,  max: 4,   label: '0.5–4 Hz' },
  theta:  { min: 4,    max: 8,   label: '4–8 Hz' },
  alpha:  { min: 8,    max: 13,  label: '8–13 Hz' },
  smr:    { min: 12,   max: 15,  label: '12–15 Hz' },
  beta:   { min: 13,   max: 30,  label: '13–30 Hz' },
  gamma:  { min: 30,   max: 45,  label: '30–45 Hz' },
});

// Carrier frequency bounds (shared across all engines)
export const CARRIER_BOUNDS = Object.freeze({
  min: 100,  // below 150 Hz stereo localization weakens
  max: 400,  // above ~1000 Hz binaural beat perception weakens
  step: 1,
  unit: 'Hz',
  default: 236,
});

// Beat frequency bounds for real-time controls
export const BEAT_BOUNDS = Object.freeze({
  min: 0.5,
  max: 40,
  step: 0.5,
  unit: 'Hz',
});

// Volume bounds
export const VOLUME_BOUNDS = Object.freeze({
  min: 0,
  max: 100,
  step: 1,
  unit: '%',
  default: 72,
});

// Default sample rate (48 kHz professional standard)
export const DEFAULT_SAMPLE_RATE = 48000;

// Safety defaults
export const SAFETY = Object.freeze({
  fadeInSec:  0.010,  // 10ms click-free ramp
  fadeOutSec: 0.050,  // 50ms click-free ramp
  stageFadeSec: 2.0,  // crossfade between multi-stage transitions
  maxHeadphoneVolume: 85,  // dB SPL estimated safe limit
  noiseBedDefaultDb: -24,  // pink noise mix for comfort
});

// Isochronic gate defaults
export const ISOCHRONIC_DEFAULTS = Object.freeze({
  dutyCycle: 0.5,   // 50% duty cycle (clinical standard)
  gateShape: 'square', // square, sine, triangle
});