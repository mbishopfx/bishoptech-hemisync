export const AmbientAssetPresets = {
  lumina: {
    id: 'lumina',
    fileName: 'ES_Lumina - Valante.mp3',
    name: 'Lumina',
    summary: 'Airy shimmer bed for induction, uplift, and return.',
    defaultMixDb: -24,
    loopCrossfadeSec: 2.5,
    tags: ['airy', 'induction', 'integration']
  },
  mindsEyes: {
    id: 'mindsEyes',
    fileName: "ES_Mind's Eyes - The Yard Woman.mp3",
    name: "Mind's Eyes",
    summary: 'Textured, spacious pad for inner imagery and theta work.',
    defaultMixDb: -25,
    loopCrossfadeSec: 2.5,
    tags: ['imagery', 'theta', 'spacious']
  },
  nattkatt: {
    id: 'nattkatt',
    fileName: 'ES_Nattkatt (Slowed Version) - Chibi Power.mp3',
    name: 'Nattkatt Slowed',
    summary: 'Slow nocturnal drift for deeper descent and dreamlike pacing.',
    defaultMixDb: -26,
    loopCrossfadeSec: 3,
    tags: ['night', 'descent', 'deep']
  },
  papa: {
    id: 'papa',
    fileName: 'ES_Papa - Jones Meadow.mp3',
    name: 'Papa',
    summary: 'Warm acoustic pulse for grounded arrivals and integration.',
    defaultMixDb: -27,
    loopCrossfadeSec: 2,
    tags: ['grounding', 'warm', 'integration']
  },
  scatter: {
    id: 'scatter',
    fileName: 'ES_Scatter - The Yard Woman.mp3',
    name: 'Scatter',
    summary: 'Diffuse, modern shimmer for creative and liminal states.',
    defaultMixDb: -25,
    loopCrossfadeSec: 2.5,
    tags: ['creative', 'liminal', 'modern']
  }
};

export const AMBIENT_ASSET_IDS = Object.keys(AmbientAssetPresets);
export const AmbientAssetOptions = Object.values(AmbientAssetPresets);

export function pickAmbientAsset(assetIdOrFileName) {
  if (!assetIdOrFileName) return null;
  if (AmbientAssetPresets[assetIdOrFileName]) {
    return AmbientAssetPresets[assetIdOrFileName];
  }
  return AmbientAssetOptions.find((asset) => asset.fileName === assetIdOrFileName) || null;
}

export function buildAmbientAssetUrl(assetIdOrFileName) {
  const asset = pickAmbientAsset(assetIdOrFileName);
  if (!asset) return null;
  return `/api/ambient?file=${encodeURIComponent(asset.fileName)}`;
}
