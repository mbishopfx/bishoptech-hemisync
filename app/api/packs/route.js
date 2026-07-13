import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  TONE_PACKS,
  buildTonePackFromTracks,
  getTonePackPriceId
} from '@/lib/audio/tone-packs.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isMissingTable(error) {
  return String(error?.message || '').toLowerCase().includes('does not exist');
}

export async function GET() {
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
