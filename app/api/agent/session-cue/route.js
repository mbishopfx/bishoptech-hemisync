import { NextResponse } from 'next/server';
import { getSessionCue, SessionCueInputSchema } from '@/lib/agentic/session-capability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 16 * 1024;

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) {
    const error = new Error('The request is larger than the public cue limit.');
    error.status = 413;
    throw error;
  }

  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error('The request must be valid JSON.');
    error.status = 400;
    throw error;
  }
}
function errorResponse(error) {
  const isInputError = error?.name === 'ZodError' || error?.status === 400 || error?.status === 413;
  return NextResponse.json({
    ok: false,
    code: isInputError ? 'INVALID_INPUT' : 'SESSION_CUE_UNAVAILABLE',
    error: isInputError ? 'Provide a short intention or one of the published session modes.' : 'The session cue could not complete that request. Try again.',
    retryable: !isInputError
  }, {
    status: isInputError ? error?.status || 400 : 503,
    headers: { 'cache-control': 'no-store' }
  });
}

export async function POST(request) {
  try {
    const input = SessionCueInputSchema.parse(await parseBody(request));
    const cue = getSessionCue(input);
    return NextResponse.json({ ok: true, cue }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
