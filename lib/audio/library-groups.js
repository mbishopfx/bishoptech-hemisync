export const BRAIN_STATE_ORDER = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

export const BRAIN_STATE_META = {
  delta: {
    label: 'Delta',
    description: 'Deep restoration, release, and sleep prep',
    range: '1–4 Hz'
  },
  theta: {
    label: 'Theta',
    description: 'Meditation, imagery, and threshold states',
    range: '4–8 Hz'
  },
  alpha: {
    label: 'Alpha',
    description: 'Calm focus, reset, and light flow',
    range: '8–13 Hz'
  },
  beta: {
    label: 'Beta',
    description: 'Task engagement and alert work mode',
    range: '13–30 Hz'
  },
  gamma: {
    label: 'Gamma',
    description: 'Fast, high-frequency micro-burst sessions',
    range: '30–40 Hz'
  }
};

export function resolveBrainState(tone = {}) {
  const candidate = tone.target_state
    || tone.targetState
    || tone.state
    || tone.frequency_plan?.effectiveness?.targetState
    || tone.frequency_plan?.effectiveness?.target_state
    || 'alpha';

  return String(candidate).toLowerCase();
}

export function getBrainStateMeta(brainState) {
  return BRAIN_STATE_META[brainState] || BRAIN_STATE_META.alpha;
}

export function normalizeLibraryTone(tone = {}) {
  const brainState = resolveBrainState(tone);
  const playUrl = tone.playUrl || tone.webm_url || tone.wav_url || tone.mp3_url || tone.mp3Url || null;
  const sourceType = tone.sourceType || tone.source_type || (tone.user_id ? 'user-saved' : 'agentic-generated');
  const description = tone.description
    || tone.summary
    || (sourceType === 'agentic-generated'
      ? `${getBrainStateMeta(brainState).label} binaural session generated for ${tone.target_hz || tone.targetHz || 'target'} Hz entrainment.`
      : '');

  return {
    ...tone,
    brainState,
    state: tone.state || brainState,
    target_state: tone.target_state || tone.targetState || brainState,
    targetState: tone.targetState || tone.target_state || brainState,
    stateMeta: getBrainStateMeta(brainState),
    playUrl,
    mp3_url: tone.mp3_url || tone.mp3Url || null,
    mp3Url: tone.mp3Url || tone.mp3_url || null,
    wav_url: tone.wav_url || tone.wavUrl || null,
    wavUrl: tone.wavUrl || tone.wav_url || null,
    webm_url: tone.webm_url || tone.webmUrl || null,
    webmUrl: tone.webmUrl || tone.webm_url || null,
    sourceType,
    source_type: sourceType,
    description,
    summary: description,
    durationSec: Number(tone.durationSec || tone.duration_sec || 0),
    duration_sec: Number(tone.duration_sec || tone.durationSec || 0),
    baseFreqHz: Number(tone.baseFreqHz || tone.base_freq_hz || 0),
    base_freq_hz: Number(tone.base_freq_hz || tone.baseFreqHz || 0)
  };
}

export function sortLibraryTones(tones = []) {
  const sourcePriority = {
    'agentic-generated': 0,
    'user-saved': 1,
    public: 0,
    private: 1
  };

  return [...tones].sort((a, b) => {
    const brainA = BRAIN_STATE_ORDER.indexOf(resolveBrainState(a));
    const brainB = BRAIN_STATE_ORDER.indexOf(resolveBrainState(b));
    if (brainA !== brainB) return brainA - brainB;

    const sourceA = sourcePriority[a.sourceType || a.source_type || 'user-saved'] ?? 9;
    const sourceB = sourcePriority[b.sourceType || b.source_type || 'user-saved'] ?? 9;
    if (sourceA !== sourceB) return sourceA - sourceB;

    const createdA = new Date(a.created_at || a.createdAt || 0).getTime();
    const createdB = new Date(b.created_at || b.createdAt || 0).getTime();
    if (createdA !== createdB) return createdB - createdA;

    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

export function groupLibraryTonesByState(tones = []) {
  const grouped = Object.fromEntries(BRAIN_STATE_ORDER.map((state) => [state, []]));

  for (const tone of sortLibraryTones(tones.map(normalizeLibraryTone))) {
    const brainState = resolveBrainState(tone);
    if (!grouped[brainState]) {
      grouped[brainState] = [];
    }
    grouped[brainState].push(tone);
  }

  return grouped;
}
