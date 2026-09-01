import { z } from 'zod';
import { matchIntentionToTone, searchPublicTones } from '@/lib/agentic/tone-capability';
import { safetyRedirectForIntention } from '@/lib/agentic/safety-capability';
import { discoveryOrigin } from '@/lib/agentic/discovery-contract';

export const dynamic = 'force-dynamic';

const AskSchema = z.object({
  query: z.string().trim().min(1).max(240).optional(),
  q: z.string().trim().min(1).max(240).optional(),
  prefer: z.object({ streaming: z.boolean().optional() }).strict().optional()
}).strict().refine((body) => Boolean(body.query || body.q), { message: 'query is required' });

function errorResponse(code, message, status = 400) {
  return Response.json({
    error: { code, message, retryable: status >= 500, resolution: 'Send a short natural-language query in the query field.' }
  }, {
    status,
    headers: { 'cache-control': 'no-store', vary: 'Accept, Prefer' }
  });
}

function parseQuery(request, body = null) {
  if (body) return AskSchema.parse(body).query || body.q;
  const url = new URL(request.url);
  return AskSchema.parse({ query: url.searchParams.get('query') || url.searchParams.get('q') }).query;
}

async function answerFor(query) {
  const safety = safetyRedirectForIntention(query, { capabilityId: 'cognistration-nlweb-ask', version: '0.1.0' });
  if (safety) {
    return {
      _meta: { response_type: 'answer', version: '1.0' },
      query,
      answer: safety.safety.message,
      results: [],
      safety
    };
  }

  const match = await matchIntentionToTone({ intention: query, useAi: false });
  const related = searchPublicTones({ query, limit: 3 });
  return {
    _meta: { response_type: 'answer', version: '1.0' },
    query,
    answer: `${match.response} The public surface lets you preview and tune that direction without treating it as a medical prescription.`,
    results: related.map((tone) => ({
      type: 'tone',
      id: tone.id,
      name: tone.name,
      state: tone.state,
      targetHz: tone.targetHz,
      url: `${discoveryOrigin()}/#session`
    }))
  };
}

function sseResponse(payload) {
  const encoder = new TextEncoder();
  const events = [
    ['start', { _meta: { response_type: 'stream', version: '1.0' }, query: payload.query }],
    ['result', payload],
    ['complete', { _meta: { response_type: 'complete', version: '1.0' }, query: payload.query }]
  ];
  const stream = new ReadableStream({
    start(controller) {
      for (const [event, data] of events) controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      controller.close();
    }
  });
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      vary: 'Accept, Prefer'
    }
  });
}

export async function GET(request) {
  try {
    const query = parseQuery(request);
    const payload = await answerFor(query);
    const url = new URL(request.url);
    if (url.searchParams.get('stream') === '1' || url.searchParams.get('streaming') === 'true') return sseResponse(payload);
    return Response.json(payload, { headers: { 'cache-control': 'no-store', vary: 'Accept, Prefer' } });
  } catch (error) {
    return errorResponse('INVALID_QUERY', error?.issues?.[0]?.message || 'A short query is required.');
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
    const parsed = AskSchema.parse(body);
    const payload = await answerFor(parsed.query || parsed.q);
    if (parsed.prefer?.streaming === true || request.headers.get('prefer')?.includes('respond-async')) return sseResponse(payload);
    return Response.json(payload, { headers: { 'cache-control': 'no-store', vary: 'Accept, Prefer' } });
  } catch (error) {
    return errorResponse('INVALID_QUERY', error?.issues?.[0]?.message || 'A short query is required.');
  }
}
