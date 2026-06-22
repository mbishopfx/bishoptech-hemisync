import { createPortalClient } from '@/lib/openai/client';
import { HOMEPAGE_STATE_TONES } from '@/lib/audio/homepage-tones';

export async function matchMoodToTone(moodInput) {
  const tones = HOMEPAGE_STATE_TONES.map((tone) => ({
    id: tone.id,
    name: tone.name,
    state: tone.state,
    target_hz: tone.targetHz || tone.target_hz,
    summary: tone.summary
  }));

  if (!tones || tones.length === 0) {
    throw new Error('No tones available in the library.');
  }

  const client = createPortalClient();

  // Route through Vercel AI Gateway using the standard chat model.
  const model = 'gpt-4o-mini';

  const systemPrompt = `You are an expert bio-acoustic agent. Your goal is to analyze a user's emotional or cognitive state and match it to the most effective brainwave entrainment frequency from our library.

AVAILABLE TONES (ID | NAME | STATE | FREQUENCY | SUMMARY):
${tones.map(t => `${t.id} | ${t.name} | ${t.state} | ${t.target_hz}Hz | ${t.summary}`).join('\n')}

CLASSIFICATION & SELECTION RULES:
First, analyze the sentiment and nature of the user's input:

1. SAD OR NEGATIVE (e.g., sad, anxious, depressed, stressed, low-energy, grief, anger):
   - You MUST select a calming brain state file to soothe and reset them.
   - You MUST randomly/variably choose between:
     * Theta: "homepage-theta-drift" (Theta Drift)
     * Theta: "homepage-theta-liminal-settle" (Theta Liminal Settle)
     * Delta: "homepage-delta-rest" (Delta Rest)
   - Do NOT select alpha, beta, or gamma for sad/negative feelings. Keep it on a randomized/alternating calming setting.

2. POSITIVE (e.g., happy, motivated, excited, relaxed, content, grateful):
   - You MUST try to reinforce their positive state with positive/reinforcing tones.
   - Select either:
     * Alpha: "homepage-alpha-focus" (Alpha Focus)
     * Alpha: "homepage-alpha-clear-window" (Alpha Clear Window)
     * Theta: "homepage-theta-drift" (Theta Drift)
     * Beta: "homepage-beta-drive" (Beta Drive)

3. NEUTRAL (e.g., flat, indifferent, normal, "nothing", "okay", or ambiguous feelings):
   - You MUST try to drastically change and shift their cognitive baseline.
   - You MUST choose either:
     * Gamma: "homepage-gamma-clarity" (Gamma Clarity)
     * Beta: "homepage-beta-drive" (Beta Drive)
     * Alpha: "homepage-alpha-clear-window" (Alpha Clear Window)

OUTPUT FORMAT:
Provide a brief, agentic 1-sentence response explaining exactly why this specific frequency was chosen to support or shift their state.
Return ONLY a valid JSON object in this format:
{
  "trackId": "selected-tone-id",
  "response": "Your 1-sentence agentic message."
}`;

  const userContent = `User current state: "${moodInput}"`;

  const r = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    temperature: 0.7 // Higher temperature helper for randomization of negative states
  });

  const responseText = r.choices[0].message.content || '{}';

  try {
    const result = JSON.parse(responseText);
    // Double check that we actually returned one of the correct track IDs, otherwise fallback
    const matchedTrack = tones.find(t => t.id === result.trackId);
    if (!matchedTrack) {
      // Fallback
      return {
        trackId: 'homepage-alpha-focus',
        response: "I've selected Alpha Focus to help you find a calm, centered baseline."
      };
    }
    return result;
  } catch (e) {
    console.error('Failed to parse matchMoodToTone AI response:', responseText, e);
    return {
      trackId: 'homepage-alpha-focus',
      response: "I've selected Alpha Focus to help you find a calm, centered baseline."
    };
  }
}

