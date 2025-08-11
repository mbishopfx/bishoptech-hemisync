function dbToGain(db) {
  return Math.pow(10, db / 20);
}

// Simple pink noise generator (Voss-McCartney) per-channel
function createPinkNoiseGenerator() {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  return function next() {
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

export function generateOceanBackground(sampleRate, durationSec, options = {}) {
  const totalSamples = Math.floor(sampleRate * durationSec);
  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  const pinkL = createPinkNoiseGenerator();
  const pinkR = createPinkNoiseGenerator();

  // Slow swell between ~0.02 and 0.06 Hz
  const swellHz = 0.02 + Math.random() * 0.04;
  const swellDepth = 0.35; // 0..1, amplitude modulation depth

  // Gentle stereo decorrelation
  const phaseOffset = Math.random() * Math.PI * 2;

  // Basic tone shaping via simple one-pole lowpass/highpass
  const lpCut = 1200; // Hz
  const hpCut = 80;   // Hz to avoid rumble
  const lpAlpha = Math.exp(-2 * Math.PI * lpCut / sampleRate);
  const hpAlpha = Math.exp(-2 * Math.PI * hpCut / sampleRate);
  let lpL = 0, lpR = 0, hpL = 0, hpR = 0;

  const baseGain = dbToGain(options.mixDb ?? -22);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const envL = 1 - swellDepth * 0.5 + (swellDepth * 0.5) * (1 + Math.sin(2 * Math.PI * swellHz * t)) / 1.0;
    const envR = 1 - swellDepth * 0.5 + (swellDepth * 0.5) * (1 + Math.sin(2 * Math.PI * swellHz * t + phaseOffset)) / 1.0;

    // pink noise per channel
    let nl = pinkL();
    let nr = pinkR();

    // lowpass
    lpL = lpL + (nl - lpL) * (1 - lpAlpha);
    lpR = lpR + (nr - lpR) * (1 - lpAlpha);
    // highpass
    hpL = lpL - (hpL + (lpL - hpL) * hpAlpha);
    hpR = lpR - (hpR + (lpR - hpR) * hpAlpha);

    left[i] = baseGain * envL * hpL;
    right[i] = baseGain * envR * hpR;
  }

  return { left, right };
}




