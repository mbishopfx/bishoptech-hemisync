import { z } from 'zod';
import { TONE_PACKS, TONE_PACK_STATE_ORDER } from '../audio/tone-packs.db.mjs';

export const PACK_CAPABILITY_ID = 'cognistration-tone-packs';
export const PACK_CAPABILITY_VERSION = '0.1.0';

const PUBLIC_STATES = ['delta', 'theta', 'alpha', 'beta', 'gamma'];

export const TonePackSearchInputSchema = z
  .object({
    query: z.string().trim().max(240).optional().default(''),
    state: z.enum(PUBLIC_STATES).optional(),
    limit: z.coerce.number().int().min(1).max(20).optional().default(8)
  })
  .strict();

export const TonePackSlugInputSchema = z
  .object({
    slug: z.string().trim().min(1).max(120)
  })
  .strict();

const PACK_INTENT_BUCKETS = [
  { keywords: ['relax', 'relaxation', 'calm', 'quiet', 'sleep', 'bedtime', 'wind down', 'decompress', 'rest'], states: ['delta', 'theta'] },
  { keywords: ['diary', 'journal', 'reflect', 'reflection', 'imagery', 'dream', 'visualize', 'creative'], states: ['theta', 'alpha'] },
  { keywords: ['focus', 'write', 'writing', 'read', 'study', 'flow', 'plan'], states: ['alpha', 'beta'] },
  { keywords: ['energy', 'drive', 'execute', 'execution', 'momentum', 'active'], states: ['beta'] },
  { keywords: ['gamma', 'insight', 'synthesis', 'pattern', 'ideas', 'idea'], states: ['gamma', 'beta'] },
  { keywords: ['reset', 'return', 'transition', 'after work', 're-entry'], states: ['delta', 'alpha', 'beta', 'theta'] }
];

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function stateId(state) {
  return typeof state === 'string' ? state : state?.state;
}

function numberOr(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toPublicTrack(track, index) {
  const previewUrl = track?.previewUrl ?? track?.preview_url ?? null;
  const id = String(track?.id || track?.track_id || `${track?.pack_slug || 'pack'}-preview-${index + 1}`);
  const state = normalizeText(track?.state || track?.targetState || track?.target_state) || 'alpha';

  return {
    id,
    name: String(track?.name || track?.track_name || track?.short_label || 'Tone pack preview').trim(),
    state,
    targetState: state,
    targetHz: numberOr(track?.targetHz ?? track?.target_hz),
    baseFreqHz: numberOr(track?.baseFreqHz ?? track?.base_freq_hz, 220),
    durationSec: numberOr(track?.durationSec ?? track?.duration_sec, 300),
    previewSeconds: numberOr(track?.previewSeconds ?? track?.preview_seconds, 30),
    previewUrl
  };
}

export function toPublicTonePack(pack) {
  const tracks = Array.isArray(pack?.tracks) ? pack.tracks : [];
  const previewTracks = tracks
    .map(toPublicTrack)
    .filter((track) => track.previewUrl)
    .slice(0, 4);
  const states = [...new Set((pack?.states || []).map(stateId).filter((state) => PUBLIC_STATES.includes(state)))];

  return {
    slug: String(pack?.slug || '').trim(),
    name: String(pack?.name || 'Cognistration tone pack').trim(),
    summary: String(pack?.summary || '').trim(),
    description: String(pack?.description || pack?.summary || '').trim(),
    bestFor: Array.isArray(pack?.bestFor) ? pack.bestFor.map((item) => String(item)).slice(0, 8) : [],
    states,
    strategy: String(pack?.strategy || 'state'),
    price: String(pack?.price || '$5.99'),
    billingMode: 'one-time',
    durationSec: numberOr(pack?.durationSec ?? pack?.duration_sec, 3000),
    durationLabel: String(pack?.durationLabel || 'About 50 minutes total'),
    trackCount: numberOr(pack?.trackCount, tracks.length),
    previewAvailable: previewTracks.length > 0,
    previewTracks,
    purchaseUrl: '/packs'
  };
}

export const PUBLIC_TONE_PACK_CATALOG = TONE_PACKS
  .map(toPublicTonePack)
  .filter((pack) => pack.slug);

function scorePack(pack, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;

  const searchable = [pack.slug, pack.name, pack.summary, pack.description, ...(pack.bestFor || []), ...(pack.states || [])]
    .map(normalizeText)
    .join(' ');
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  let score = searchable.includes(normalizedQuery) ? 8 : 0;

  for (const token of tokens) {
    if (searchable.includes(token)) score += 2;
  }

  for (const bucket of PACK_INTENT_BUCKETS) {
    const matched = bucket.keywords.some((keyword) => normalizedQuery.includes(keyword));
    if (matched && bucket.states.some((state) => pack.states.includes(state))) score += 5;
  }

  return score;
}

export function searchPublicTonePacks(input = {}) {
  const parsed = TonePackSearchInputSchema.parse(input);
  const query = normalizeText(parsed.query);

  return PUBLIC_TONE_PACK_CATALOG
    .map((pack, index) => ({ pack, index, score: scorePack(pack, query) }))
    .filter(({ pack, score }) => (!parsed.state || pack.states.includes(parsed.state)) && (!query || score > 0))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, parsed.limit)
    .map(({ pack }) => pack);
}

export function getPublicTonePack(slug) {
  const parsed = TonePackSlugInputSchema.parse({ slug });
  return PUBLIC_TONE_PACK_CATALOG.find((pack) => pack.slug === parsed.slug) || null;
}

export function publicTonePackCatalogSummary() {
  return {
    count: PUBLIC_TONE_PACK_CATALOG.length,
    slugs: PUBLIC_TONE_PACK_CATALOG.map((pack) => pack.slug),
    states: TONE_PACK_STATE_ORDER.filter((state) => PUBLIC_TONE_PACK_CATALOG.some((pack) => pack.states.includes(state))),
    source: 'Cognistration public tone-pack catalog'
  };
}
