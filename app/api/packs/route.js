import { NextResponse } from 'next/server';
import { TONE_PACKS } from '@/lib/audio/tone-packs.mjs';

const FOUNDATIONS_PACK = TONE_PACKS[0];

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      packs: [{
        slug: FOUNDATIONS_PACK.slug,
        name: FOUNDATIONS_PACK.name,
        price: FOUNDATIONS_PACK.price,
        trackCount: FOUNDATIONS_PACK.tracks.length,
        durationLabel: FOUNDATIONS_PACK.durationLabel,
        description: FOUNDATIONS_PACK.description,
        summary: FOUNDATIONS_PACK.summary,
        features: FOUNDATIONS_PACK.features,
        tracks: FOUNDATIONS_PACK.tracks.map((track, index) => ({
          track_id: track.id,
          track_name: track.name,
          short_label: track.shortLabel,
          state: track.state,
          target_state: track.targetState,
          target_hz: Number(track.target_hz),
          base_freq_hz: Number(track.base_freq_hz),
          duration_sec: Number(track.duration_sec),
          preview_seconds: 30,
          preview_url: track.webmUrl,
          download_url: track.webmUrl,
          file_name: track.fileName,
          metadata: track.metadata || {},
          sort_order: index
        }))
      }],
      ownedPackSlugs: []
    });
  } catch (error) {
    console.error('Pack listing failed:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to load packs' }, { status: 500 });
  }
}
