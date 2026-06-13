export const HOMEPAGE_TONE_STATE_ORDER = ['theta', 'alpha', 'delta', 'beta', 'gamma'];

export const HOMEPAGE_STATE_TONES = [
  {
    id: 'homepage-theta-drift',
    name: 'Theta Drift',
    shortLabel: 'Theta Drift',
    state: 'theta',
    targetState: 'theta',
    targetHz: 5.2,
    baseFreqHz: 192,
    durationSec: 60,
    summary: 'A bare theta binaural tone for imagery, meditation, and liminal settling.',
    description: 'A bare theta binaural tone for imagery, meditation, and liminal settling.',
    sourceType: 'homepage-generated',
    source_type: 'homepage-generated',
    modeLabel: 'Pure binaural state tone',
    wavUrl: '/audio/homepage-state-tones/theta-drift.wav',
    wav_url: '/audio/homepage-state-tones/theta-drift.wav',
    webmUrl: null,
    webm_url: null,
    mp3Url: null,
    mp3_url: null,
    target_hz: 5.2,
    target_state: 'theta',
    base_freq_hz: 192,
    duration_sec: 60
  },
  {
    id: 'homepage-alpha-focus',
    name: 'Alpha Focus',
    shortLabel: 'Alpha Focus',
    state: 'alpha',
    targetState: 'alpha',
    targetHz: 10,
    baseFreqHz: 220,
    durationSec: 60,
    summary: 'A bare alpha binaural tone for calm concentration and clean mental presence.',
    description: 'A bare alpha binaural tone for calm concentration and clean mental presence.',
    sourceType: 'homepage-generated',
    source_type: 'homepage-generated',
    modeLabel: 'Pure binaural state tone',
    wavUrl: '/audio/homepage-state-tones/alpha-focus.wav',
    wav_url: '/audio/homepage-state-tones/alpha-focus.wav',
    webmUrl: null,
    webm_url: null,
    mp3Url: null,
    mp3_url: null,
    target_hz: 10,
    target_state: 'alpha',
    base_freq_hz: 220,
    duration_sec: 60
  },
  {
    id: 'homepage-delta-rest',
    name: 'Delta Rest',
    shortLabel: 'Delta Rest',
    state: 'delta',
    targetState: 'delta',
    targetHz: 2.8,
    baseFreqHz: 108,
    durationSec: 60,
    summary: 'A bare delta binaural tone for deep rest, downshifting, and recovery.',
    description: 'A bare delta binaural tone for deep rest, downshifting, and recovery.',
    sourceType: 'homepage-generated',
    source_type: 'homepage-generated',
    modeLabel: 'Pure binaural state tone',
    wavUrl: '/audio/homepage-state-tones/delta-rest.wav',
    wav_url: '/audio/homepage-state-tones/delta-rest.wav',
    webmUrl: null,
    webm_url: null,
    mp3Url: null,
    mp3_url: null,
    target_hz: 2.8,
    target_state: 'delta',
    base_freq_hz: 108,
    duration_sec: 60
  },
  {
    id: 'homepage-beta-drive',
    name: 'Beta Drive',
    shortLabel: 'Beta Drive',
    state: 'beta',
    targetState: 'beta',
    targetHz: 17.2,
    baseFreqHz: 286,
    durationSec: 60,
    summary: 'A bare beta binaural tone for execution, task momentum, and alert work.',
    description: 'A bare beta binaural tone for execution, task momentum, and alert work.',
    sourceType: 'homepage-generated',
    source_type: 'homepage-generated',
    modeLabel: 'Pure binaural state tone',
    wavUrl: '/audio/homepage-state-tones/beta-drive.wav',
    wav_url: '/audio/homepage-state-tones/beta-drive.wav',
    webmUrl: null,
    webm_url: null,
    mp3Url: null,
    mp3_url: null,
    target_hz: 17.2,
    target_state: 'beta',
    base_freq_hz: 286,
    duration_sec: 60
  },
  {
    id: 'homepage-gamma-clarity',
    name: 'Gamma Clarity',
    shortLabel: 'Gamma Clarity',
    state: 'gamma',
    targetState: 'gamma',
    targetHz: 39.5,
    baseFreqHz: 392,
    durationSec: 60,
    summary: 'A bare gamma binaural tone for sharpness, synthesis, and high-focus clarity.',
    description: 'A bare gamma binaural tone for sharpness, synthesis, and high-focus clarity.',
    sourceType: 'homepage-generated',
    source_type: 'homepage-generated',
    modeLabel: 'Pure binaural state tone',
    wavUrl: '/audio/homepage-state-tones/gamma-clarity.wav',
    wav_url: '/audio/homepage-state-tones/gamma-clarity.wav',
    webmUrl: null,
    webm_url: null,
    mp3Url: null,
    mp3_url: null,
    target_hz: 39.5,
    target_state: 'gamma',
    base_freq_hz: 392,
    duration_sec: 60
  }
];

export function getHomepageToneById(toneId) {
  return HOMEPAGE_STATE_TONES.find((tone) => tone.id === toneId) || null;
}

export function getHomepageToneByState(state) {
  const normalizedState = String(state || '').toLowerCase();
  return HOMEPAGE_STATE_TONES.find((tone) => tone.state === normalizedState) || null;
}

export function getFeaturedHomepageTone() {
  for (const state of HOMEPAGE_TONE_STATE_ORDER) {
    const tone = getHomepageToneByState(state);
    if (tone) {
      return tone;
    }
  }

  return HOMEPAGE_STATE_TONES[0] || null;
}

export function isHomepageGeneratedTone(tone) {
  return Boolean(tone) && (tone.sourceType === 'homepage-generated' || tone.source_type === 'homepage-generated');
}
