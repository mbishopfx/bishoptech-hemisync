import { NextResponse } from 'next/server';
import { buildSessionRecipe, SessionRecipeInputSchema } from '@/lib/agentic/recipe-capability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 16 * 1024;

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) {
    const error = new Error('The request is larger than the public recipe limit.');
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
    code: isInputError ? 'INVALID_INPUT' : 'SESSION_RECIPE_UNAVAILABLE',
    error: isInputError ? 'Use published state, intention label, control, and duration bounds.' : 'The private recipe could not be prepared. Try again.',
    retryable: !isInputError
  }, {
    status: isInputError ? error?.status || 400 : 503,
    headers: { 'cache-control': 'no-store' }
  });
}

export async function POST(request) {
  try {
    const input = SessionRecipeInputSchema.parse(await parseBody(request));
    return NextResponse.json({ ok: true, ...buildSessionRecipe(input) }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return errorResponse(error);
  }
}
