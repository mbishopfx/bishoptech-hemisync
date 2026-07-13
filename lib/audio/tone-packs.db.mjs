import { TONE_PACKS as CATALOG_PACKS } from './tone-pack-catalog.mjs';
import { GENERATED_TONE_PACKS } from './tone-pack-generated.mjs';

export const TONE_PACKS = GENERATED_TONE_PACKS?.length ? GENERATED_TONE_PACKS : CATALOG_PACKS;
export * from './tone-pack-catalog.mjs';
