import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  TONE_PACKS,
  buildTonePackFromTracks,
  getTonePackPriceId
} from '@/lib/audio/tone-packs.db.mjs';
import {
  TonePackSearchInputSchema,
  TonePackSlugInputSchema,
  getPublicTonePack,
  searchPublicTonePacksPage
} from '@/lib/agentic/pack-capability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isMissingTable(error) {
  return String(error?.message || '').toLowerCase().includes('does not exist');
}

function agentHeaders() {
  return {
    'cache-control': 'public, max-age=300, s-maxage=300',
    vary: 'Accept'
  };
}

function agentCatalogResponse(requestUrl) {
  const slug = requestUrl.searchParams.get('slug');
  if (slug !== null) {
    const parsedSlug = TonePackSlugInputSchema.safeParse({ slug });
    if (!parsedSlug.success) {
      return NextResponse.json({ ok: false, code: 'INVALID_INPUT', error: 'Provide a valid public tone-pack slug.' }, { status: 400, headers: agentHeaders() });
    }

    const pack = getPublicTonePack(parsedSlug.data.slug);
    if (!pack) {
      return NextResponse.json({ ok: false, code: 'NOT_FOUND', error: 'That public tone-pack slug is not in the approved catalog.' }, { status: 404, headers: agentHeaders() });
    }

    return NextResponse.json({ ok: true, pack, source: 'agentic-public' }, { headers: agentHeaders() });
  }

  const input = {
    ...(requestUrl.searchParams.has('query') ? { query: requestUrl.searchParams.get('query') } : {}),
    ...(requestUrl.searchParams.has('state') ? { state: requestUrl.searchParams.get('state') } : {}),
    ...(requestUrl.searchParams.has('limit') ? { limit: requestUrl.searchParams.get('limit') } : {}),
    ...(requestUrl.searchParams.has('cursor') ? { cursor: requestUrl.searchParams.get('cursor') } : {})
  };
  const parsed = TonePackSearchInputSchema.safeParse(input);
  if (!parsed.success && !Object.hasOwn(input, 'cursor')) {
    return NextResponse.json({ ok: false, code: 'INVALID_INPUT', error: 'Use a short query, a published tone state, and a limit from 1 to 20.' }, { status: 400, headers: agentHeaders() });
  }

  try {
    const page = searchPublicTonePacksPage(input);
    return NextResponse.json({ ok: true, ...page, source: 'agentic-public' }, { headers: agentHeaders() });
  } catch {
    return NextResponse.json({ ok: false, code: 'INVALID_INPUT', error: 'The tone-pack cursor or search bounds are invalid.' }, { status: 400, headers: agentHeaders() });
  }
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.get('agent') === '1') return agentCatalogResponse(requestUrl);

  try {
    const fallback = TONE_PACKS.map((pack) => ({
      ...pack,
      priceId: getTonePackPriceId(pack),
      trackCount: pack.tracks.length
    }));
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ ok: true, packs: fallback, source: 'catalog' });

    const [{ data: packRows, error: packError }, { data: trackRows, error: trackError }] = await Promise.all([
      supabase.from('tone_packs').select('*').eq('published', true).order('updated_at', { ascending: false }),
      supabase.from('tone_pack_tracks').select('*').order('sort_order', { ascending: true })
    ]);

    if ((packError && !isMissingTable(packError)) || (trackError && !isMissingTable(trackError))) {
      console.error('Pack catalog refresh failed; using committed catalog fallback:', packError || trackError);
      return NextResponse.json({ ok: true, packs: fallback, source: 'catalog-fallback' });
    }

    const tracksByPack = new Map();
    for (const track of trackRows || []) {
      const list = tracksByPack.get(track.pack_slug) || [];
      list.push(track);
      tracksByPack.set(track.pack_slug, list);
    }

    const packs = (packRows || []).length
      ? packRows.map((row) => {
          const pack = buildTonePackFromTracks(row.slug, tracksByPack.get(row.slug) || []);
          return {
            ...(pack || row),
            price: pack?.price || `$${(Number(row.price_cents || 599) / 100).toFixed(2)}`,
            priceId: row.price_id || getTonePackPriceId(pack || row),
            bundleUrl: row.bundle_url || null,
            trackCount: tracksByPack.get(row.slug)?.length || row.track_count || 0,
            durationSec: row.duration_sec || pack?.durationSec,
            durationLabel: 'About 50 minutes total'
          };
        })
      : fallback;

    return NextResponse.json({ ok: true, packs, source: packRows?.length ? 'supabase' : 'catalog' });
  } catch (error) {
    console.error('Pack listing failed:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to load packs' }, { status: 500 });
  }
}
