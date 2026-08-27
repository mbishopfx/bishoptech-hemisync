import { matchIntentionToTone } from '@/lib/agentic/tone-capability';

export async function matchMoodToTone(moodInput, tones) {
  const result = await matchIntentionToTone({ intention: moodInput, tones, useAi: true });
  return {
    trackId: result.tone.id,
    response: result.response,
    matchMode: result.matchMode,
    correlationId: result.correlationId
  };
}
