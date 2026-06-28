export const TONE_PACK_STATE_ORDER = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

const PACK_VARIANTS = [
  {
    slug: 'bass-bloom',
    label: 'Bass Bloom',
    summary: 'A deeper low-end carrier with a grounded, weighty feel.',
    carrierOffsetHz: 0,
    targetOffsetHz: 0,
    noiseType: 'brown',
    noiseMixDb: -30,
    backgroundType: 'ocean',
    backgroundMixDb: -26,
    breathPattern: '4-7-8',
    breathBpm: 6,
    breathDepth: 0.08
  },
  {
    slug: 'orbital-drift',
    label: 'Orbital Drift',
    summary: 'A wider stereo drift that feels like slow motion through space.',
    carrierOffsetHz: 6,
    targetOffsetHz: 0.4,
    noiseType: 'pink',
    noiseMixDb: -28,
    backgroundType: 'asset',
    backgroundAssetId: 'lumina',
    backgroundMixDb: -25,
    breathPattern: 'coherent-5.5',
    breathBpm: 5.5,
    breathDepth: 0.1
  },
  {
    slug: 'halo-mist',
    label: 'Halo Mist',
    summary: 'A soft halo with airy presence and a polished upper texture.',
    carrierOffsetHz: 12,
    targetOffsetHz: 0.8,
    noiseType: 'pink',
    noiseMixDb: -29,
    backgroundType: 'asset',
    backgroundAssetId: 'scatter',
    backgroundMixDb: -24,
    breathPattern: 'coherent-5.5',
    breathBpm: 5.6,
    breathDepth: 0.08
  },
  {
    slug: 'pulse-weave',
    label: 'Pulse Weave',
    summary: 'A gently rhythmic weave that keeps attention engaged without feeling busy.',
    carrierOffsetHz: 18,
    targetOffsetHz: 1.2,
    noiseType: 'white',
    noiseMixDb: -30,
    backgroundType: 'asset',
    backgroundAssetId: 'papa',
    backgroundMixDb: -25,
    breathPattern: null,
    breathBpm: null,
    breathDepth: 0
  },
  {
    slug: 'horizon-wash',
    label: 'Horizon Wash',
    summary: 'A broad horizon feel with a stable field and spacious forward motion.',
    carrierOffsetHz: 24,
    targetOffsetHz: 1.6,
    noiseType: 'pink',
    noiseMixDb: -27,
    backgroundType: 'asset',
    backgroundAssetId: 'mindsEyes',
    backgroundMixDb: -27,
    breathPattern: 'coherent-5.5',
    breathBpm: 5.8,
    breathDepth: 0.05
  }
];

const STATE_CONFIG = {
  delta: {
    label: 'Delta',
    displayName: 'Restorative',
    baseFreqHz: 108,
    targetHz: 3.2,
    description: 'Deep restoration, release, and sleep prep',
    range: '1–4 Hz'
  },
  theta: {
    label: 'Theta',
    displayName: 'Liminal',
    baseFreqHz: 186,
    targetHz: 5.4,
    description: 'Meditation, imagery, and threshold states',
    range: '4–8 Hz'
  },
  alpha: {
    label: 'Alpha',
    displayName: 'Calm Focus',
    baseFreqHz: 228,
    targetHz: 8.8,
    description: 'Calm focus, reset, and light flow',
    range: '8–13 Hz'
  },
  beta: {
    label: 'Beta',
    displayName: 'Task Mode',
    baseFreqHz: 286,
    targetHz: 16.2,
    description: 'Task engagement and alert work mode',
    range: '13–30 Hz'
  },
  gamma: {
    label: 'Gamma',
    displayName: 'Insight',
    baseFreqHz: 392,
    targetHz: 38.6,
    description: 'Fast, high-frequency micro-burst sessions',
    range: '30–40 Hz'
  }
};

function toTitle(value) {
  return String(value)
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function buildTrackId(packSlug, state, variantSlug) {
  return `${packSlug}-${state}-${variantSlug}`;
}

export const TONE_PACKS = [
  {
    slug: 'foundations-pack',
    name: 'Foundations Pack',
    price: '$5.99',
    priceIdEnv: 'NEXT_PUBLIC_TONE_PACK_FOUNDATIONS_PRICE_ID',
    checkoutPlanId: 'tone-pack-foundations',
    billingMode: 'payment',
    trackCount: 25,
    durationSec: 960,
    durationLabel: '15–20 min each',
    description: 'A one-time 25-tone pack spanning every brain state with five distinct carrier variants per state.',
    summary: 'Five states × five variants. Each tone is a long-form 15–20 minute session designed to feel distinct while staying within the same premium pack.',
    states: TONE_PACK_STATE_ORDER.map((state) => ({
      state,
      ...STATE_CONFIG[state]
    })),
    variants: PACK_VARIANTS,
    tracks: TONE_PACK_STATE_ORDER.flatMap((state) => {
      const stateConfig = STATE_CONFIG[state];
      return PACK_VARIANTS.map((variant, index) => {
        const targetHz = Number((stateConfig.targetHz + variant.targetOffsetHz).toFixed(1));
        const baseFreqHz = stateConfig.baseFreqHz + variant.carrierOffsetHz;
        const trackId = buildTrackId('foundations', state, variant.slug);
        const title = `Foundations ${stateConfig.label} — ${variant.label}`;
        return {
          id: trackId,
          name: title,
          shortLabel: variant.label,
          state,
          targetState: state,
          targetHz,
          baseFreqHz,
          durationSec: 960,
          summary: `${variant.summary} Rebuilt for the ${stateConfig.displayName} state.`,
          description: `${variant.summary} ${stateConfig.description}.`,
          packSlug: 'foundations-pack',
          packName: 'Foundations Pack',
          packPrice: '$5.99',
          packBillingType: 'one-time',
          packType: 'foundations-pack',
          sourceType: 'tone-pack',
          sourceToneId: trackId,
          sourceToneName: title,
          sourceToneLabel: variant.label,
          modeLabel: `Cognistration pack • ${state}`,
          fileName: `foundations/${state}/${trackId}.mp3`,
          mp3Url: `/audio/tone-packs/foundations/${state}/${trackId}.mp3`,
          mp3_url: `/audio/tone-packs/foundations/${state}/${trackId}.mp3`,
          wavUrl: null,
          wav_url: null,
          webmUrl: null,
          webm_url: null,
          target_state: state,
          target_state_label: stateConfig.label,
          target_hz: targetHz,
          base_freq_hz: baseFreqHz,
          duration_sec: 960,
          metadata: {
            packSlug: 'foundations-pack',
            packName: 'Foundations Pack',
            packType: 'foundations-pack',
            packBillingType: 'one-time',
            carrierVariant: variant.slug,
            carrierLabel: variant.label,
            stateLabel: stateConfig.label,
            sourceType: 'tone-pack'
          },
          render: {
            state,
            stateLabel: stateConfig.label,
            displayStateName: stateConfig.displayName,
            variantSlug: variant.slug,
            variantLabel: variant.label,
            targetHz,
            baseFreqHz,
            noiseType: variant.noiseType,
            noiseMixDb: variant.noiseMixDb,
            backgroundType: variant.backgroundType,
            backgroundAssetId: variant.backgroundAssetId || null,
            backgroundMixDb: variant.backgroundMixDb,
            breathPattern: variant.breathPattern,
            breathBpm: variant.breathBpm,
            breathDepth: variant.breathDepth,
            trackId
          }
        };
      });
    })
  }
];

export function getTonePackBySlug(slug) {
  return TONE_PACKS.find((pack) => pack.slug === slug) || null;
}

export function getTonePackPriceIdEnv(pack) {
  return pack?.priceIdEnv || null;
}

export function getTonePackPriceId(pack) {
  const envName = getTonePackPriceIdEnv(pack);
  return envName ? process.env[envName] || null : null;
}

export function getTonePackCheckoutLabel(pack) {
  return `${pack.name} • ${pack.price}`;
}

export function getTonePackTrackLabels(pack) {
  return pack.tracks.map((track) => ({
    ...track,
    shortTitle: `${toTitle(track.state)} — ${track.shortLabel}`
  }));
}
