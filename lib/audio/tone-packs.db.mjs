import { TONE_PACKS as CATALOG_PACKS } from './tone-pack-catalog.mjs';
import { GENERATED_TONE_PACKS } from './tone-pack-generated.mjs';
import { TONE_PACKS as LEGACY_TONE_PACKS } from './legacy-tone-pack-previews.mjs';

const LEGACY_TRACKS = LEGACY_TONE_PACKS?.[0]?.tracks || [];

function stateName(state) {
  return typeof state === 'string' ? state : state?.state;
}

function buildPreviewFallback(pack) {
  const tracks = [];
  for (const state of pack.states || []) {
    const stateKey = stateName(state);
    for (const track of LEGACY_TRACKS.filter((item) => item.state === stateKey).slice(0, 5)) {
      tracks.push({
        ...track,
        pack_slug: pack.slug,
        pack_name: pack.name,
        track_id: `${pack.slug}-${track.track_id}`,
        track_name: `${pack.name} · ${track.track_name}`,
        metadata: {
          ...(track.metadata || {}),
          source: 'legacy-pack-preview-fallback',
          fallbackPackSlug: pack.slug
        }
      });
    }
  }
  return tracks;
}

const hasGeneratedTracks = GENERATED_TONE_PACKS?.some((pack) => pack.tracks?.length);

export const TONE_PACKS = hasGeneratedTracks
  ? GENERATED_TONE_PACKS
  : CATALOG_PACKS.map((pack) => ({ ...pack, tracks: buildPreviewFallback(pack), trackCount: buildPreviewFallback(pack).length }));

export * from './tone-pack-catalog.mjs';
