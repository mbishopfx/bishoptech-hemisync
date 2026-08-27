import { NextResponse } from 'next/server';
import { clarifyIntention, IntentClarificationInputSchema } from '@/lib/agentic/intent-capability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 16 * 1024;

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) {
    const error = new Error('The request is larger than the public intent limit.');
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
    code: isInputError ? 'INVALID_INPUT' : 'INTENT_GUIDANCE_UNAVAILABLE',
    error: isInputError ? 'Provide a short intention from 1 to 240 characters.' : 'Intent guidance could not complete that request. Try again.',
    retryable: !isInputError
  }, {
    status: isInputError ? error?.status || 400 : 503,
    headers: { 'cache-control': 'no-store' }
  });
}

export async function POST(request) {
  try {
    const input = IntentClarificationInputSchema.parse(await parseBody(request));
    const guidance = await clarifyIntention(input);
    return NextResponse.json({ ok: true, guidance }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
