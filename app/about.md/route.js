import { markdownHeaders } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-static';

export function GET() {
  return new Response('# About Cognistration\n\nCognistration is a personal listening platform by BishopTech. It gives people a deliberate auditory cue for focus, rest, reflection, and intentional reset while keeping the tone, rhythm, volume, duration, and playback choice visible and adjustable. Every brain and every day is different, so the product is designed as a free-will generator rather than a forced frequency prescription.\n\nRead the [developer docs](/docs), [health warning](/health-warning), or [contact page](/contact).\n', { headers: markdownHeaders() });
}
