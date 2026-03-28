import { NextResponse } from 'next/server';
import { inspectRuntimeHealth } from '@/lib/runtime/deployment';
import { getFfmpegPath } from '@/lib/audio/engine/ffmpeg';

export async function GET() {
  const runtime = await inspectRuntimeHealth();
  const ffmpegPath = getFfmpegPath();

  return NextResponse.json({
    ok: runtime.artifactStorage.writable,
    ts: Date.now(),
    runtime,
    audio: {
      ffmpegAvailable: Boolean(ffmpegPath),
      ffmpegPath: ffmpegPath || null
    }
  });
}

