import { NextResponse } from 'next/server';
import { getFeaturedHomepageTone } from '@/lib/audio/homepage-tones';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const featuredTone = getFeaturedHomepageTone();
    if (!featuredTone) {
      return NextResponse.json({ ok: false, error: 'No homepage tones are available yet' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      tone: {
        ...featuredTone,
        playUrl: featuredTone.wavUrl || featuredTone.mp3Url || featuredTone.webmUrl || null
      },
      total: 1
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Preview tone unavailable' }, { status: 500 });
  }
}
