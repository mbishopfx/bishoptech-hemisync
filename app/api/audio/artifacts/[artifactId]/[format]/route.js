import { NextResponse } from 'next/server';
import { readRenderArtifact } from '@/lib/audio/render-artifacts';
import { createRangedFileResponse } from '@/lib/http/ranged-file-response';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { artifactId, format } = params;
    const artifact = await readRenderArtifact({ artifactId, format });
    return createRangedFileResponse({
      filePath: artifact.filePath,
      request,
      contentType: artifact.contentType,
      filename: artifact.filename
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Artifact not found' }, { status: 404 });
  }
}
