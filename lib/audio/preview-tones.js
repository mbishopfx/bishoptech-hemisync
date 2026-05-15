const PREVIEW_TONE_CATALOG = [
  {
    id: 'deep-focus-alpha-bass-boost',
    name: 'Deep Focus Alpha',
    shortLabel: 'Bass Boost',
    fileName: 'Deep Focus Alpha (Bass Boost).mp3',
    summary: 'A warmer alpha preview with a stronger low-end bed for a grounded hemisync-style feel.',
    state: 'alpha',
    targetState: 'alpha',
    targetHz: 10,
    baseFreqHz: 220,
    durationSec: 180,
    modeLabel: 'Bi-directional stereo preview',
    sourceType: 'audiotemplate'
  },
  {
    id: 'deep-focus-alpha-rhythmic-panning',
    name: 'Deep Focus Alpha',
    shortLabel: 'Rhythmic Panning',
    fileName: 'Deep Focus Alpha (Rhythmic Panning).mp3',
    summary: 'Stereo motion with rhythmic panning that highlights the left/right field and makes the preview feel alive.',
    state: 'alpha',
    targetState: 'alpha',
    targetHz: 10,
    baseFreqHz: 218,
    durationSec: 180,
    modeLabel: 'Bi-directional stereo • rhythmic panning',
    sourceType: 'audiotemplate'
  },
  {
    id: 'escape',
    name: 'Escape',
    shortLabel: 'Escape',
    fileName: 'Escape.mp3',
    summary: 'A float-out style preview for deep relaxation, separation, and a softer late-stage descent.',
    state: 'theta',
    targetState: 'theta',
    targetHz: 6,
    baseFreqHz: 210,
    durationSec: 180,
    modeLabel: 'Bi-directional stereo preview',
    sourceType: 'audiotemplate'
  },
  {
    id: 'focus-state',
    name: 'Focus State',
    shortLabel: 'Focus State',
    fileName: 'Focus State.mp3',
    summary: 'A clean attention bed for presence, concentration, and a crisp entry into work mode.',
    state: 'beta',
    targetState: 'beta',
    targetHz: 16,
    baseFreqHz: 228,
    durationSec: 180,
    modeLabel: 'Bi-directional stereo preview',
    sourceType: 'audiotemplate'
  }
];

export function buildPreviewToneUrl(fileName) {
  return `/api/audio/preview-tone?file=${encodeURIComponent(fileName)}`;
}

export function getPreviewToneCatalog() {
  return PREVIEW_TONE_CATALOG.map((tone) => ({
    ...tone,
    mp3Url: buildPreviewToneUrl(tone.fileName),
    mp3_url: buildPreviewToneUrl(tone.fileName),
    wavUrl: null,
    wav_url: null,
    webmUrl: null,
    webm_url: null,
    target_hz: tone.targetHz,
    target_state: tone.targetState,
    baseFreqHz: tone.baseFreqHz,
    base_freq_hz: tone.baseFreqHz,
    duration_sec: tone.durationSec,
    durationSec: tone.durationSec
  }));
}

export function getPrimaryPreviewTone() {
  const catalog = getPreviewToneCatalog();
  return catalog.find((tone) => tone.id === 'deep-focus-alpha-rhythmic-panning') || catalog[0] || null;
}

export function buildPreviewToneLibraryEntries() {
  return getPreviewToneCatalog().map((tone) => ({
    id: tone.id,
    name: tone.name,
    description: tone.summary,
    target_state: tone.target_state,
    targetState: tone.target_state,
    state: tone.state,
    target_hz: tone.target_hz,
    targetHz: tone.target_hz,
    base_freq_hz: tone.base_freq_hz,
    baseFreqHz: tone.base_freq_hz,
    duration_sec: tone.duration_sec,
    durationSec: tone.duration_sec,
    delta_path: [],
    wav_url: tone.wav_url,
    wavUrl: tone.wavUrl,
    mp3_url: tone.mp3_url,
    mp3Url: tone.mp3Url,
    webm_url: null,
    webmUrl: null,
    visibility: 'public',
    source_type: tone.sourceType,
    sourceType: tone.sourceType,
    mode_label: tone.modeLabel,
    modeLabel: tone.modeLabel,
    short_label: tone.shortLabel,
    shortLabel: tone.shortLabel
  }));
}
