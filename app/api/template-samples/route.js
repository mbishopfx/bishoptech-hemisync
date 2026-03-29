import { NextResponse } from 'next/server';
import { maybeProxyToBackend } from '@/lib/http/backend-proxy';
import { readTemplateSampleManifestPublic } from '@/lib/supabase/template-samples';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const proxied = await maybeProxyToBackend(request);
  if (proxied) {
    return proxied;
  }

  try {
    const manifest = await readTemplateSampleManifestPublic();
    const response = NextResponse.json({
      ok: true,
      version: manifest.version,
      generatedAt: manifest.generatedAt,
      samples: manifest.samples
    });
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60');
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'Template sample manifest failed' }, { status: 500 });
  }
}
