import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';
import { createRangedFileResponse } from '@/lib/http/ranged-file-response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get('file');
    const fileName = fileParam ? decodeURIComponent(fileParam) : 'ES_Lumina - Valante.mp3';
    const audioDir = path.resolve(process.cwd(), 'audio');
    const filePath = path.resolve(audioDir, fileName);
    if (filePath !== audioDir && !filePath.startsWith(`${audioDir}${path.sep}`)) {
      return NextResponse.json({ error: 'Invalid ambient file path' }, { status: 400 });
    }
    await fs.access(filePath);
    const type = mime.lookup(fileName) || 'audio/mpeg';
    return createRangedFileResponse({
      filePath,
      request,
      contentType: type,
      filename: path.basename(filePath),
      cacheControl: 'public, max-age=86400'
    });
  } catch (err) {
    return NextResponse.json({ error: 'Ambient file not found' }, { status: 404 });
  }
}

