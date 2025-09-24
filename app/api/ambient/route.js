import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileParam = searchParams.get('file');
    const fileName = fileParam ? decodeURIComponent(fileParam) : 'ES_Lumina - Valante.mp3';
    const audioDir = path.join(process.cwd(), 'audio');
    const filePath = path.join(audioDir, fileName);
    const data = await fs.readFile(filePath);
    const type = mime.lookup(fileName) || 'audio/mpeg';
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Ambient file not found' }, { status: 404 });
  }
}


