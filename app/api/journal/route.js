import { NextResponse } from 'next/server';
import { validate, JournalInputSchema } from '@/lib/validation/schemas';
import { summarizeAndClassify, mapIntentToTarget } from '@/lib/ai/journal';
import { getLogger } from '@/lib/logging/logger';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAuthenticatedUser, jsonError } from '@/lib/auth/session';

export async function GET(req) {
  const logger = getLogger();
  try {
    const { user } = await requireAuthenticatedUser(req);
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, entries: data });
  } catch (err) {
    logger.error({ err }, 'journal GET error');
    const { body, status } = jsonError(err);
    return NextResponse.json(body || { error: err.message || 'Internal error' }, { status: status || 500 });
  }
}

export async function POST(req) {
  const logger = getLogger();
  try {
    const { user } = await requireAuthenticatedUser(req);
    const body = await req.json();
    const input = validate(JournalInputSchema, body);
    
    const ai = await summarizeAndClassify(input.text);
    const mapping = mapIntentToTarget(ai);
    const result = { ...ai, mapping };

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        text: input.text,
        summary: ai.summary,
        intent: ai.intent,
        sentiment: ai.sentiment,
        cognitive_shifts: ai.cognitive_shifts,
        ai_insights: ai.ai_insights,
        safety: ai.safety
      })
      .select()
      .single();

    if (error) {
      logger.error({ error }, 'Failed to insert journal entry');
      throw new Error('Database error');
    }

    return NextResponse.json({ ok: true, journal_entry: data });
  } catch (err) {
    logger.error({ err }, 'journal POST error');
    const { body, status } = jsonError(err);
    return NextResponse.json(body || { error: err.message || 'Internal error' }, { status: status || 500 });
  }
}

