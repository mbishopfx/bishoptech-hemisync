// Generate a normalized amplitude modulation envelope (0..1) following a breath pattern over durationSec

export function generateBreathEnvelope(pattern, sampleRate, durationSec) {
  const totalSamples = Math.floor(sampleRate * durationSec);
  const envelope = new Float32Array(totalSamples);

  let cycleSec;
  if (pattern === 'coherent-5.5') {
    cycleSec = 60 / 5.5; // ~10.9s
  } else if (pattern === '4-7-8') {
    // inhale 4, hold 7, exhale 8 → total 19s
    cycleSec = 19.0;
  } else {
    // box: 4-4-4-4 = 16s
    cycleSec = 16.0;
  }

  for (let i = 0; i < totalSamples; i += 1) {
    const t = (i / sampleRate) % cycleSec;
    let phase;
    if (pattern === '4-7-8') {
      if (t < 4) phase = t / 4; // inhale ramp 0→1
      else if (t < 11) phase = 1; // hold
      else phase = Math.max(0, 1 - (t - 11) / 8); // exhale 1→0
    } else if (pattern === 'coherent-5.5') {
      // use sinusoidal breathing proxy
      const theta = (2 * Math.PI * t) / cycleSec;
      phase = 0.5 * (1 + Math.sin(theta - Math.PI / 2)); // 0..1
    } else {
      // box: inhale 4, hold 4, exhale 4, hold 4
      if (t < 4) phase = t / 4;
      else if (t < 8) phase = 1;
      else if (t < 12) phase = Math.max(0, 1 - (t - 8) / 4);
      else phase = 0;
    }
    envelope[i] = phase;
  }
  return envelope;
}


