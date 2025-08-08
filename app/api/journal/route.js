import { NextResponse } from 'next/server';
import { validate, JournalInputSchema } from '@/lib/validation/schemas';
import { summarizeAndClassify, mapIntentToTarget } from '@/lib/ai/journal';
import { getLogger } from '@/lib/logging/logger';

export async function POST(req) {
  const logger = getLogger();
  try {
    const body = await req.json();
    const input = validate(JournalInputSchema, body);
    const ai = await summarizeAndClassify(input.text);
    const mapping = mapIntentToTarget(ai);
    const result = { ...ai, mapping };
    return NextResponse.json(result);
  } catch (err) {
    logger.error({ err }, 'journal POST error');
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Internal error' }, { status });
  }
}

