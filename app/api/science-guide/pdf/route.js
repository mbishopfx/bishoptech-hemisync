import { NextResponse } from 'next/server';
import { applyCors, resolveAllowedOrigin } from '@/lib/http/cors';
import {
  buildScienceGuidePdf,
  normalizeScienceGuidePdfInput,
  scienceGuidePdfFilename
} from '@/lib/agentic/science-pdf';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 16 * 1024;

function json(request, body, status = 200) {
  return applyExportCors(request, NextResponse.json(body, {
    status,
    headers: { 'cache-control': 'no-store' }
  }));
}

function applyExportCors(request, response) {
  const result = applyCors(request, response);
  // MCP Apps may render the widget in an opaque sandboxed origin. This export
  // contains only public, bounded guide data, so a null-origin CORS response
  // is safe and keeps the in-platform download usable.
  if (request.headers.get('origin') === 'null') result.headers.set('Access-Control-Allow-Origin', 'null');
  return result;
}

function originAllowed(request) {
  const origin = request.headers.get('origin');
  return !origin || origin === 'null' || Boolean(resolveAllowedOrigin(origin));
}

export function OPTIONS(request) {
  return applyExportCors(request, new NextResponse(null, { status: 204 }));
}

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) {
    const error = new Error('The science guide export request is too large.');
    error.status = 413;
    throw error;
  }

  try {
    return JSON.parse(raw || '{}');
  } catch {
    const error = new Error('The science guide export request must be valid JSON.');
    error.status = 400;
    throw error;
  }
}

function queryInput(request) {
  const searchParams = new URL(request.url).searchParams;
  const value = (name) => searchParams.has(name) ? searchParams.get(name) : undefined;

  return {
    toneId: value('toneId'),
    controls: {
      targetState: value('targetState'),
      carrierHz: value('carrierHz'),
      beatHz: value('beatHz'),
      volume: value('volume')
    },
    ocean: { seed: value('oceanSeed') }
  };
}

function pdfResponse(request, model) {
  const pdf = buildScienceGuidePdf(model);
  const response = new NextResponse(pdf, {
    status: 200,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="${scienceGuidePdfFilename(model)}"`,
      'content-length': String(pdf.byteLength)
    }
  });
  return applyExportCors(request, response);
}

function exportPdf(request, input) {
  const model = normalizeScienceGuidePdfInput(input);
  return pdfResponse(request, model);
}

export async function GET(request) {
  if (!originAllowed(request)) return json(request, { ok: false, code: 'ORIGIN_NOT_ALLOWED', error: 'This export can only be requested from Cognistration.' }, 403);

  try {
    return exportPdf(request, queryInput(request));
  } catch (error) {
    return json(request, { ok: false, code: 'PDF_EXPORT_FAILED', error: error?.message || 'The science guide PDF could not be prepared.' }, 400);
  }
}

export async function POST(request) {
  if (!originAllowed(request)) return json(request, { ok: false, code: 'ORIGIN_NOT_ALLOWED', error: 'This export can only be requested from Cognistration.' }, 403);

  try {
    return exportPdf(request, await parseBody(request));
  } catch (error) {
    const status = error?.status === 413 ? 413 : 400;
    return json(request, { ok: false, code: status === 413 ? 'PAYLOAD_TOO_LARGE' : 'PDF_EXPORT_FAILED', error: error?.message || 'The science guide PDF could not be prepared.' }, status);
  }
}
