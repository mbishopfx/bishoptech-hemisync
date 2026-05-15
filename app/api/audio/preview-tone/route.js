import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';
import { maybeProxyToBackend } from '@/lib/http/backend-proxy';
import { createRangedFileResponse } from '@/lib/http/ranged-file-response';
import { getPreviewToneCatalog } from '@/lib/audio/preview-tones';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const AUDIO_DIR = path.resolve(process.cwd(), 'audiotemplates');

function resolveCatalogFileName(fileName) {
  return getPreviewToneCatalog().find((tone) => tone.fileName === fileName) || null;
}

export async function GET(request) {
  const proxied = await maybeProxyToBackend(request);
  if (proxied) {
    return proxied;
  }

  try {
    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get('file');

    if (!fileParam) {
      return NextResponse.json({
        ok: true,
        previewTones: getPreviewToneCatalog()
      });
    }

    const fileName = decodeURIComponent(fileParam);
    const previewTone = resolveCatalogFileName(fileName);
    if (!previewTone) {
      return NextResponse.json({ error: 'Unknown preview tone' }, { status: 404 });
    }

    const filePath = path.resolve(AUDIO_DIR, fileName);
    if (filePath !== AUDIO_DIR && !filePath.startsWith(`${AUDIO_DIR}${path.sep}`)) {
      return NextResponse.json({ error: 'Invalid preview tone path' }, { status: 400 });
    }

    await fs.access(filePath);

    return createRangedFileResponse({
      filePath,
      request,
      contentType: mime.lookup(fileName) || 'audio/mpeg',
      filename: path.basename(filePath),
      cacheControl: 'public, max-age=86400'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Preview tone not found' }, { status: 404 });
  }
}
