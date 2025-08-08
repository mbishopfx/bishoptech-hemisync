import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeAndClassify(text) {
  const system = `You are a meditation journaling assistant. Summarize concisely (<=120 words), classify intent/state (sleep, relax, focus, exploration), detect sentiment, and flag safety issues. Output strict JSON with keys: summary, intent, sentiment, safety.`;
  const user = `Journal:\n${text}`;
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.2,
    response_format: { type: 'json_object' }
  });
  const json = JSON.parse(r.choices[0].message.content || '{}');
  return json;
}

export function mapIntentToTarget(json) {
  const intent = (json.intent || '').toLowerCase();
  if (intent.includes('sleep')) return { state: 'delta', focusLevel: 'F15' };
  if (intent.includes('relax')) return { state: 'alpha', focusLevel: 'F10' };
  if (intent.includes('focus')) return { state: 'beta', focusLevel: 'F12' };
  return { state: 'theta', focusLevel: 'F12' };
}

