export const TONE_PACK_STATE_ORDER = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

export const TONE_PACK_PRICE = '$5.99';
export const TONE_PACK_PRICE_ID_FALLBACK = 'price_1TnAxaDJtpuPVfuFmN7TO2PS';
export const TONE_PACK_TARGET_DURATION_SEC = 50 * 60;

const STATE_GUIDE = {
  delta: {
    label: 'Delta',
    displayName: 'Deep Rest',
    range: '1–4 Hz',
    description: 'slow downshift, deep rest, and sleep preparation'
  },
  theta: {
    label: 'Theta',
    displayName: 'Dream & Imagery',
    range: '4–8 Hz',
    description: 'meditation, imagery, creative drift, and threshold states'
  },
  alpha: {
    label: 'Alpha',
    displayName: 'Calm Focus',
    range: '8–13 Hz',
    description: 'relaxed attention, reading, writing, and reset sessions'
  },
  beta: {
    label: 'Beta',
    displayName: 'Task Drive',
    range: '13–30 Hz',
    description: 'active work, analysis, execution, and follow-through'
  },
  gamma: {
    label: 'Gamma',
    displayName: 'Insight',
    range: '30–40 Hz',
    description: 'shorter, brighter sessions for synthesis and pattern recognition'
  }
};

const PACK_DEFINITIONS = [
  {
    slug: 'deep-rest-pack',
    name: 'Deep Rest Pack',
    eyebrow: 'Delta / Restorative',
    summary: 'A low-motion collection for shutting down the day, releasing stimulation, and settling into rest.',
    description: 'Choose this when the goal is less mental noise and a slower landing. Built around Delta tones with soft transition support.',
    bestFor: ['sleep preparation', 'post-work decompression', 'quiet recovery'],
    states: ['delta'],
    strategy: 'state',
    accent: 'cyan'
  },
  {
    slug: 'dream-threshold-pack',
    name: 'Dream Threshold Pack',
    eyebrow: 'Theta / Liminal',
    summary: 'A spacious Theta set for meditation, imagery, journaling, and the edge between waking thought and dreamlike attention.',
    description: 'Choose this when you want a softer inner environment for reflection, visualization, and creative drift.',
    bestFor: ['meditation', 'imagery', 'creative reflection'],
    states: ['theta'],
    strategy: 'state',
    accent: 'violet'
  },
  {
    slug: 'calm-focus-pack',
    name: 'Calm Focus Pack',
    eyebrow: 'Alpha / Flow',
    summary: 'A clean Alpha collection for focused work that still feels calm, spacious, and sustainable.',
    description: 'Choose this for reading, writing, planning, and steady creative output without an aggressive edge.',
    bestFor: ['reading', 'writing', 'calm productivity'],
    states: ['alpha'],
    strategy: 'state',
    accent: 'blue'
  },
  {
    slug: 'task-drive-pack',
    name: 'Task Drive Pack',
    eyebrow: 'Beta / Execution',
    summary: 'A structured Beta set for active work, problem solving, analysis, and getting important tasks over the line.',
    description: 'Choose this when you need a more present, forward-moving session for execution and follow-through.',
    bestFor: ['deep work', 'analysis', 'task completion'],
    states: ['beta'],
    strategy: 'state',
    accent: 'amber'
  },
  {
    slug: 'insight-edge-pack',
    name: 'Insight Edge Pack',
    eyebrow: 'Gamma / Synthesis',
    summary: 'A brighter, shorter-feeling collection for synthesis, pattern recognition, and deliberate high-attention sessions.',
    description: 'Choose this when you want a vivid mental edge. Use it intentionally and keep sessions shorter when needed.',
    bestFor: ['synthesis', 'pattern work', 'high-attention bursts'],
    states: ['gamma'],
    strategy: 'state',
    accent: 'fuchsia'
  },
  {
    slug: 'downshift-pack',
    name: 'Downshift Pack',
    eyebrow: 'Beta → Alpha → Theta',
    summary: 'A guided-feeling sequence that moves from active attention into calmer, more reflective territory.',
    description: 'Choose this when you want a clear transition out of work mode instead of jumping straight into silence.',
    bestFor: ['after-work reset', 'evening transition', 'stress release'],
    states: ['beta', 'alpha', 'theta'],
    strategy: 'sequence',
    accent: 'indigo'
  },
  {
    slug: 'creative-current-pack',
    name: 'Creative Current Pack',
    eyebrow: 'Alpha ↔ Theta',
    summary: 'A flexible blend for idea generation, visual thinking, drafting, and making space for unusual connections.',
    description: 'Choose this when you need enough structure to keep moving while leaving room for imagination and exploration.',
    bestFor: ['brainstorming', 'design work', 'creative sessions'],
    states: ['alpha', 'theta'],
    strategy: 'balanced',
    accent: 'purple'
  },
  {
    slug: 'sleep-descent-pack',
    name: 'Sleep Descent Pack',
    eyebrow: 'Theta → Delta',
    summary: 'A slower evening sequence designed to ease attention down toward a quieter, more sleep-ready state.',
    description: 'Choose this as a bedtime companion when you want a gradual descent rather than a sudden stop.',
    bestFor: ['bedtime', 'sleep routine', 'nighttime wind-down'],
    states: ['theta', 'delta'],
    strategy: 'sequence',
    accent: 'slate'
  },
  {
    slug: 'full-spectrum-pack',
    name: 'Full Spectrum Pack',
    eyebrow: 'All five states',
    summary: 'The broad sampler: five brain-state lanes in one collection so you can learn which sessions fit your day.',
    description: 'Choose this when you want the widest range and a simple starting point before specializing.',
    bestFor: ['first purchase', 'variety', 'daily rotation'],
    states: ['delta', 'theta', 'alpha', 'beta', 'gamma'],
    strategy: 'balanced',
    accent: 'emerald'
  },
  {
    slug: 'reset-return-pack',
    name: 'Reset & Return Pack',
    eyebrow: 'Delta → Alpha → Beta',
    summary: 'A practical reset arc for clearing space, regaining calm focus, and returning to useful work.',
    description: 'Choose this when you need to recover your attention and then re-enter the day with a steadier pace.',
    bestFor: ['midday reset', 're-entry', 'attention recovery'],
    states: ['delta', 'alpha', 'beta'],
    strategy: 'sequence',
    accent: 'teal'
  }
];

function buildPack(definition, tracks = []) {
  const states = definition.states.map((state) => ({ state, ...STATE_GUIDE[state] }));
  const durationSec = tracks.length
    ? tracks.reduce((sum, track) => sum + Number(track.duration_sec || track.durationSec || 0), 0)
    : TONE_PACK_TARGET_DURATION_SEC;

  return {
    ...definition,
    price: TONE_PACK_PRICE,
    priceIdEnv: 'NEXT_PUBLIC_TONE_PACK_PRICE_ID',
    checkoutPlanId: definition.slug,
    billingMode: 'payment',
    targetDurationSec: TONE_PACK_TARGET_DURATION_SEC,
    durationSec,
    durationLabel: 'About 50 minutes total',
    trackCount: tracks.length,
    states,
    features: [
      `${tracks.length || 10} full-length audio sessions`,
      'About 50 minutes total',
      'MP3/WebM audio download after payment',
      'No account required'
    ],
    tracks
  };
}

export const TONE_PACK_DEFINITIONS = PACK_DEFINITIONS;
export const TONE_PACKS = PACK_DEFINITIONS.map((definition) => buildPack(definition));

export function getTonePackBySlug(slug) {
  return TONE_PACKS.find((pack) => pack.slug === slug) || null;
}

export function getTonePackDefinitionBySlug(slug) {
  return PACK_DEFINITIONS.find((pack) => pack.slug === slug) || null;
}

export function buildTonePackFromTracks(slug, tracks = []) {
  const definition = getTonePackDefinitionBySlug(slug);
  return definition ? buildPack(definition, tracks) : null;
}

export function getTonePackPriceId(pack) {
  const configured = process.env.TONE_PACK_PRICE_ID
    || process.env.NEXT_PUBLIC_TONE_PACK_PRICE_ID
    || process.env.NEXT_PUBLIC_TONE_PACK_FOUNDATIONS_PRICE_ID;
  return configured || (pack ? TONE_PACK_PRICE_ID_FALLBACK : null);
}

export function getTonePackCheckoutLabel(pack) {
  return `${pack?.name || 'Cognistration Tone Pack'} • ${pack?.price || TONE_PACK_PRICE}`;
}

export function getTonePackStateGuide(state) {
  return STATE_GUIDE[state] || null;
}
