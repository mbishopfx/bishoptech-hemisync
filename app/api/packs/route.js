import { NextResponse } from 'next/server';
import { TONE_PACKS } from '@/lib/audio/tone-packs.db.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const FOUNDATIONS_PACK = TONE_PACKS[0];
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
        tracks: FOUNDATIONS_PACK.tracks
      }],
      ownedPackSlugs: []
    });
  } catch (error) {
    console.error('Pack listing failed:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Failed to load packs' }, { status: 500 });
  }
}
