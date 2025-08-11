import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getLogger } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  const logger = getLogger();
  try {
    const body = await req.json();
    const { text, focusLevel = 'F12', lengthSec = 180 } = body || {};
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'text is required' }, { status: 400 });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system = `You are a gentle, non-clinical meditation guide. Create a short, stage-based spoken guidance script aligned to hemispheric synchronization (induction → deepening → exploration → return). Avoid medical claims. Keep language calm and permissive. Output strictly JSON with keys: stages (array of { name, atSec, durationSec, script }), tone, reminders.`;
    const user = `User journal/context: ${text}\nFocus level: ${focusLevel}\nLength: ${lengthSec}s\nConstraints: Use simple sentences, about 30-50 words per minute. No coercive language. Include brief breath cues. Align with Alpha/Theta themes for relaxation/expansion.`;
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.6,
      response_format: { type: 'json_object' }
    });
    const json = JSON.parse(r.choices?.[0]?.message?.content || '{}');
    if (!json?.stages) json.stages = [];
    // Normalize timing to lengthSec
    let total = 0;
    json.stages.forEach((s) => (total += s.durationSec || 0));
    if (total > 0 && Math.abs(total - lengthSec) > 10) {
      const scale = lengthSec / total;
      json.stages.forEach((s) => (s.durationSec = Math.round((s.durationSec || 0) * scale)));
      let t = 0;
      json.stages.forEach((s) => ((s.atSec = t), (t += s.durationSec)));
    }
    return NextResponse.json({ ok: true, guidance: json });
  } catch (err) {
    logger.error({ err }, 'guidance error');
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Internal error' }, { status });
  }
}




