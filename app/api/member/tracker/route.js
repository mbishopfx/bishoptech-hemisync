import { NextResponse } from 'next/server';
import { requirePlatformSubscriber } from '@/lib/auth/session';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import {
  PracticeDayInputSchema,
  serializePracticeDay,
  summarizePracticeDays,
  toDateKey
} from '@/lib/member/practice';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function routeError(error) {
  const status = error?.status || (error?.issues ? 400 : 500);
  return NextResponse.json(
    { error: status >= 500 ? 'The practice tracker is unavailable right now.' : error.message || 'Review the practice details and try again.' },
    { status, headers: { 'cache-control': 'no-store' } }
  );
}

export async function GET(req) {
  try {
    const { user } = await requirePlatformSubscriber(req);
    const rawDays = Number(new URL(req.url).searchParams.get('days') || 42);
    const days = Math.min(90, Math.max(7, Number.isFinite(rawDays) ? Math.round(rawDays) : 42));
    const { data, error } = await getSupabaseAdmin()
      .from('member_practice_days')
      .select('id,user_id,entry_date,status,minutes,target_minutes,session_id,note,created_at,updated_at')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(days);

    if (error) throw error;
    const rows = data || [];
    return NextResponse.json({
      ok: true,
      practiceDays: rows.map(serializePracticeDay),
      summary: summarizePracticeDays(rows)
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return routeError(error);
  }
}

export async function POST(req) {
  try {
    const { user } = await requirePlatformSubscriber(req);
    const body = await req.json();
    const input = PracticeDayInputSchema.parse({
      ...body,
      entryDate: body?.entryDate || toDateKey()
    });
    const supabase = getSupabaseAdmin();

    if (input.sessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('session_specs')
        .select('id')
        .eq('id', input.sessionId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (sessionError) throw sessionError;
      if (!session) {
        const error = new Error('That private session is not available to this account');
        error.status = 400;
        throw error;
      }
    }

    const { data, error } = await supabase
      .from('member_practice_days')
      .upsert({
        user_id: user.id,
        entry_date: input.entryDate,
        status: input.status,
        minutes: input.minutes,
        target_minutes: input.targetMinutes,
        session_id: input.sessionId || null,
        note: input.note || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,entry_date' })
      .select('id,user_id,entry_date,status,minutes,target_minutes,session_id,note,created_at,updated_at')
      .single();

    if (error) throw error;
    return NextResponse.json({ ok: true, practiceDay: serializePracticeDay(data) }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return routeError(error);
  }
}
