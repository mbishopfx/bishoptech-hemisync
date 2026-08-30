export const MACHINE_CONTROL_CAPABILITY_ID = 'cognistration-machine-controls';
export const MACHINE_CONTROL_CAPABILITY_VERSION = '0.2.0';

export const MACHINE_CONTROL_DEFAULTS = Object.freeze({
  targetState: 'theta',
  carrierHz: 200,
  beatHz: 6,
  volume: 72,
  isPlaying: false,
  stateVersion: 1
});

export const MACHINE_CONTROL_BOUNDS = Object.freeze({
  carrierHz: Object.freeze({ min: 100, max: 400, step: 1, unit: 'Hz' }),
  beatHz: Object.freeze({ min: 0.5, max: 40, step: 0.5, unit: 'Hz' }),
  volume: Object.freeze({ min: 0, max: 100, step: 1, unit: '%' })
});

export const MACHINE_CONTROL_DEFAULT_STEPS = Object.freeze({
  carrier: 24,
  rhythm: 1,
  volume: 8
});

export const MACHINE_CONTROL_STATE_BEATS = Object.freeze({
  delta: 3,
  theta: 6,
  alpha: 10,
  beta: 18,
  gamma: 39.5
});

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];
const CONTROL_KEYS = ['targetState', 'carrierHz', 'beatHz', 'volume'];
const CONTROL_TO_FIELD = Object.freeze({ carrier: 'carrierHz', rhythm: 'beatHz', volume: 'volume' });
const CONTROL_DIRECTIONS = Object.freeze({
  carrier: ['smaller', 'larger'],
  rhythm: ['slower', 'faster'],
  volume: ['quieter', 'louder']
});

function machineControlError(code, safeMessage) {
  const error = new Error(safeMessage);
  error.code = code;
  error.safeMessage = safeMessage;
  error.retryable = false;
  return error;
}

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function validateBoundedNumber(value, field, { integer = false } = {}) {
  const number = Number(value);
  const bounds = MACHINE_CONTROL_BOUNDS[field];
  if (!Number.isFinite(number) || (integer && !Number.isInteger(number)) || number < bounds.min || number > bounds.max) {
    throw machineControlError(
      `INVALID_${field.replace('Hz', '').toUpperCase()}`,
      `${field === 'carrierHz' ? 'Carrier frequency' : field === 'beatHz' ? 'Rhythm' : 'Volume'} must stay between ${bounds.min} and ${bounds.max}${bounds.unit === '%' ? ' percent' : ` ${bounds.unit}`}.`
    );
  }
  return field === 'beatHz' ? roundToStep(number, bounds.step) : number;
}

export function normalizeMachineControlPatch(input = {}, { allowEmpty = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw machineControlError('INVALID_CONTROL', 'Machine controls must be an object.');
  }

  const unknownKey = Object.keys(input).find((key) => !CONTROL_KEYS.includes(key));
  if (unknownKey) throw machineControlError('INVALID_CONTROL', `The machine control '${unknownKey}' is not published.`);

  const keys = Object.keys(input);
  if (!allowEmpty && keys.length === 0) throw machineControlError('EMPTY_CONTROL_PATCH', 'Provide at least one machine control to change.');

  const patch = {};
  if (input.targetState !== undefined) {
    if (!PUBLIC_STATES.includes(input.targetState)) {
      throw machineControlError('INVALID_STATE', 'Choose delta, theta, alpha, beta, or gamma.');
    }
    patch.targetState = input.targetState;
  }
  if (input.carrierHz !== undefined) patch.carrierHz = validateBoundedNumber(input.carrierHz, 'carrierHz', { integer: true });
  if (input.beatHz !== undefined) patch.beatHz = validateBoundedNumber(input.beatHz, 'beatHz');
  if (input.volume !== undefined) patch.volume = validateBoundedNumber(input.volume, 'volume', { integer: true });
  return patch;
}

export function applyMachineControlPatch(currentControls = MACHINE_CONTROL_DEFAULTS, input = {}) {
  const patch = normalizeMachineControlPatch(input);
  const current = { ...MACHINE_CONTROL_DEFAULTS, ...(currentControls || {}) };
  return {
    ...current,
    ...patch,
    isPlaying: Boolean(current.isPlaying),
    stateVersion: Math.max(1, numberOr(current.stateVersion, 1)) + 1
  };
}

export function resolveMachineAdjustment(input = {}, currentControls = null) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw machineControlError('INVALID_ADJUSTMENT', 'Machine adjustments must be an object.');
  }

  const { control, direction } = input;
  if (!Object.prototype.hasOwnProperty.call(CONTROL_TO_FIELD, control)) {
    throw machineControlError('INVALID_ADJUSTMENT_CONTROL', 'Choose carrier, rhythm, or volume.');
  }
  if (!CONTROL_DIRECTIONS[control].includes(direction)) {
    const expected = CONTROL_DIRECTIONS[control].join(' or ');
    throw machineControlError('INVALID_ADJUSTMENT_DIRECTION', `${control} can move ${expected}.`);
  }

  const defaultStep = MACHINE_CONTROL_DEFAULT_STEPS[control];
  const requestedStep = input.step === undefined ? defaultStep : Number(input.step);
  const minimumStep = control === 'carrier' ? 1 : control === 'rhythm' ? 0.5 : 1;
  const maximumStep = control === 'carrier' ? 50 : control === 'rhythm' ? 10 : 25;
  if (!Number.isFinite(requestedStep) || requestedStep < minimumStep || requestedStep > maximumStep) {
    throw machineControlError('INVALID_ADJUSTMENT_STEP', `Use a ${control} adjustment step from ${minimumStep} to ${maximumStep}.`);
  }

  const step = control === 'rhythm' ? roundToStep(requestedStep, 0.5) : Math.round(requestedStep);
  const sign = ['smaller', 'slower', 'quieter'].includes(direction) ? -1 : 1;
  const delta = round(sign * step, control === 'rhythm' ? 1 : 0);
  const result = { control, field: CONTROL_TO_FIELD[control], direction, step, delta };

  if (currentControls && typeof currentControls === 'object') {
    const field = CONTROL_TO_FIELD[control];
    const currentValue = numberOr(currentControls[field], MACHINE_CONTROL_DEFAULTS[field]);
    const bounds = MACHINE_CONTROL_BOUNDS[field];
    const requestedValue = currentValue + delta;
    const nextValue = field === 'beatHz'
      ? roundToStep(clamp(requestedValue, bounds.min, bounds.max), bounds.step)
      : Math.round(clamp(requestedValue, bounds.min, bounds.max));
    result.previousValue = currentValue;
    result.nextValue = nextValue;
    result.clamped = nextValue !== requestedValue;
    result.controls = applyMachineControlPatch(currentControls, { [field]: nextValue });
  }

  return result;
}

export function publicMachineControlContract() {
  return {
    capabilityId: MACHINE_CONTROL_CAPABILITY_ID,
    version: MACHINE_CONTROL_CAPABILITY_VERSION,
    bounds: MACHINE_CONTROL_BOUNDS,
    defaults: MACHINE_CONTROL_DEFAULTS,
    defaultSteps: MACHINE_CONTROL_DEFAULT_STEPS,
    directionMap: {
      carrier: 'smaller/larger changes the shared carrier in hertz',
      rhythm: 'slower/faster changes the left/right difference in hertz',
      volume: 'quieter/louder changes master volume percentage'
    },
    liveBehavior: 'Control changes are applied to the existing oscillator and gain nodes without pausing playback.',
    audioBoundary: 'Starting audio still requires explicit confirmation and may require a user gesture in the browser.'
  };
}
