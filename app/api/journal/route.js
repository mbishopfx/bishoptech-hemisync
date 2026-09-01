import { NextResponse } from 'next/server';
import { validate, JournalInputSchema, JournalPatchSchema } from '@/lib/validation/schemas';
import { fallbackJournalAnalysis, summarizeAndClassify, mapIntentToTarget } from '@/lib/ai/journal';
import { getLogger } from '@/lib/logging/logger';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAuthenticatedUser, jsonError } from '@/lib/auth/session';

export async function GET(req) {
  const logger = getLogger();
  try {
    const { user } = await requireAuthenticatedUser(req);
    const supabase = getSupabaseAdmin();
    
    const limit = Math.min(100, Math.max(1, Number(new URL(req.url).searchParams.get('limit') || 50)));
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

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
    
    const fallback = fallbackJournalAnalysis(input.text, input);
    let ai = fallback;
    let analysisSource = 'local';
    if (input.analyze) {
      try {
        ai = { ...fallback, ...(await summarizeAndClassify(input.text)) };
        analysisSource = 'assistant';
      } catch (analysisError) {
        logger.warn({ err: analysisError }, 'journal assistant unavailable; keeping local reflection metadata');
      }
    }
    const mapping = mapIntentToTarget(ai);
    const title = input.title || `${mapping.state.charAt(0).toUpperCase()}${mapping.state.slice(1)} reflection`;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: user.id,
        text: input.text,
        title,
        mood: input.mood || null,
        energy: input.energy || 3,
        focus_area: input.focusArea || null,
        tags: input.tags || [],
        summary: ai.summary,
        intent: ai.intent,
        sentiment: ai.sentiment,
        cognitive_shifts: ai.cognitive_shifts,
        ai_insights: ai.ai_insights,
        safety: ai.safety,
        analyzed_at: input.analyze ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      logger.error({ error }, 'Failed to insert journal entry');
      throw new Error('Database error');
    }

    return NextResponse.json({ ok: true, journal_entry: data, mapping, analysisSource });
  } catch (err) {
    logger.error({ err }, 'journal POST error');
    const { body, status } = jsonError(err);
    return NextResponse.json(body || { error: err.message || 'Internal error' }, { status: status || 500 });
  }
}

export async function PATCH(req) {
  const logger = getLogger();
  try {
    const { user } = await requireAuthenticatedUser(req);
    const input = validate(JournalPatchSchema, await req.json());
    const patch = { updated_at: new Date().toISOString() };
    if (input.title !== undefined) patch.title = input.title || 'Reflection';
    if (input.mood !== undefined) patch.mood = input.mood;
    if (input.energy !== undefined) patch.energy = input.energy;
    if (input.focusArea !== undefined) patch.focus_area = input.focusArea;
    if (input.tags !== undefined) patch.tags = input.tags;
    if (input.isFavorite !== undefined) patch.is_favorite = input.isFavorite;

    const { data, error } = await getSupabaseAdmin()
      .from('journal_entries')
      .update(patch)
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ ok: true, journal_entry: data });
  } catch (err) {
    logger.error({ err }, 'journal PATCH error');
    const { body, status } = jsonError(err);
    return NextResponse.json(body || { error: err.message || 'Internal error' }, { status: status || 500 });
  }
}
