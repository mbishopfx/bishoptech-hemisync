import { getSupabaseAdmin } from '@/lib/supabase/admin';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

function getGeminiUrl(model = GEMINI_MODEL) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
}

export async function matchMoodToTone(moodInput) {
  const supabase = getSupabaseAdmin();
  const { data: tones, error } = await supabase
    .from('agentic_tones')
    .select('id, name, state, target_hz, noise_type, description, summary');

  if (error) throw error;
  if (!tones || tones.length === 0) {
    throw new Error('No tones available in the library. Please run generation first.');
  }

  const prompt = `
You are an expert bio-acoustic agent. Your goal is to match a user's emotional or cognitive state to the most effective brainwave entrainment frequency from our library.

USER INPUT: "${moodInput}"

AVAILABLE TONES (ID | NAME | STATE | FREQUENCY | SUMMARY):
${tones.map(t => `${t.id} | ${t.name} | ${t.state} | ${t.target_hz}Hz | ${t.summary}`).join('\n')}

INSTRUCTIONS:
1. Analyze the user's mood/need.
2. Select the SINGLE most appropriate Tone ID from the list above by matching their emotional state to the "Summary" of each track.
   - Delta (0.5-4Hz): Deep sleep, physical recovery, unconscious reset.
   - Theta (4-8Hz): Creativity, deep meditation, hypnagogia, emotional processing.
   - Alpha (8-14Hz): Focus, relaxation, stress reduction, flow state.
   - Beta (14-30Hz): Analytical thinking, problem solving, high alertness.
   - Gamma (30-50Hz): Cognitive peak, hyper-awareness, clear insight.
3. Provide a brief, agentic 1-sentence response explaining exactly why this specific frequency was chosen for their unique situation.
4. Return ONLY a JSON object in this format:
   {
     "trackId": "uuid",
     "response": "Your 1-sentence agentic message."
   }
`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(getGeminiUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini matcher failed: ${errorText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse Gemini response', text);
    return {
      trackId: tones[0].id,
      response: "I've selected a grounding frequency to help you stabilize."
    };
  }
}
