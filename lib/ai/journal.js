import { createPortalClient } from '@/lib/openai/client';

export function fallbackJournalAnalysis(text, { mood, focusArea } = {}) {
  const normalized = String(text || '').trim().replace(/\s+/g, ' ');
  const lower = normalized.toLowerCase();
  const intent = /(sleep|bed|rest|night|tired)/.test(lower)
    ? 'sleep'
    : /(focus|work|write|study|code|task|plan)/.test(lower)
      ? 'focus'
      : /(calm|relax|overwhelm|stress|settle|breathe)/.test(lower)
        ? 'relax'
        : 'exploration';

  return {
    summary: normalized.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ').slice(0, 480),
    intent,
    sentiment: mood || 'unrated',
    cognitive_shifts: 'Reflection captured without automated interpretation.',
    ai_insights: {
      source: 'local',
      focusArea: focusArea || null,
      note: 'Choose Shape a session if you want an optional listening-direction suggestion.'
    },
    safety: { flagged: false, source: 'local' }
  };
}

export async function summarizeAndClassify(text) {
  const client = createPortalClient();
  const system = `You are a meditation journaling assistant. Summarize concisely (<=120 words), classify intent/state (sleep, relax, focus, exploration), detect sentiment, analyze for cognitive_shifts, provide ai_insights, and flag safety issues. Output strict JSON with keys: summary, intent, sentiment, cognitive_shifts, ai_insights, safety.`;
  const user = `Journal:\n${text}`;
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.2
  });

  const raw = r.choices[0].message.content || '{}';
  const json = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/```$/i, '').trim());
  return json;
}

export function mapIntentToTarget(json) {
  const intent = (json.intent || '').toLowerCase();
  if (intent.includes('sleep')) return { state: 'delta', focusLevel: 'F15' };
  if (intent.includes('relax')) return { state: 'alpha', focusLevel: 'F10' };
  if (intent.includes('focus')) return { state: 'beta', focusLevel: 'F12' };
  return { state: 'theta', focusLevel: 'F12' };
}
