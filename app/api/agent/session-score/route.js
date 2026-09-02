import { NextResponse } from 'next/server';
import { composeSessionScore } from '@/lib/agentic/session-score-capability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const raw = await request.text();
    if (raw.length > 32 * 1024) return NextResponse.json({ ok: false, code: 'INVALID_INPUT', error: 'The score request is too large.' }, { status: 413 });
    const result = composeSessionScore(JSON.parse(raw));
    return NextResponse.json({ ok: true, score: result }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const invalid = error?.name === 'ZodError' || error instanceof SyntaxError;
    return NextResponse.json({
      ok: false,
      code: invalid ? 'INVALID_INPUT' : 'SESSION_SCORE_UNAVAILABLE',
      error: invalid ? 'Use 1–6 stages, exact duration totals, and the published frequency bounds.' : 'The public score composer could not complete that request.',
      retryable: !invalid
    }, { status: invalid ? 400 : 503, headers: { 'cache-control': 'no-store' } });
  }
}
