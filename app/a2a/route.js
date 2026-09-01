import { matchIntentionToTone } from '@/lib/agentic/tone-capability';
import { safetyRedirectForIntention } from '@/lib/agentic/safety-capability';

export const dynamic = 'force-dynamic';

function jsonError(code, message, status = 400) {
  return Response.json({ jsonrpc: '2.0', id: null, error: { code, message } }, { status, headers: { 'cache-control': 'no-store' } });
}

function textFromMessage(message) {
  const parts = Array.isArray(message?.parts) ? message.parts : [];
  return parts
    .map((part) => part?.text || part?.content?.text || '')
    .filter(Boolean)
    .join(' ')
    .trim();
}

export function GET() {
  return Response.json({
    service: 'Cognistration A2A bridge',
    protocol: 'A2A HTTP+JSON',
    supportedMethods: ['message/send'],
    taskModel: 'stateless_completed_task',
    documentation: 'https://cognistration.com/.well-known/agent-card.json'
  }, { headers: { 'cache-control': 'public, max-age=300, s-maxage=300' } });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(-32700, 'Request body must be valid JSON.');
  }

  const method = body?.method || 'message/send';
  if (method !== 'message/send' && method !== 'SendMessage') return jsonError(-32601, 'Only message/send is supported by this stateless A2A bridge.', 404);
  const intention = textFromMessage(body?.params?.message) || String(body?.params?.text || body?.params?.query || '').trim();
  if (intention.length < 1 || intention.length > 240) return jsonError(-32602, 'A short text intention is required.');

  const safety = safetyRedirectForIntention(intention, { capabilityId: 'cognistration-a2a-bridge', version: '0.1.0' });
  const result = safety || await matchIntentionToTone({ intention, useAi: false });
  const state = safety ? 'completed' : 'completed';
  return Response.json({
    jsonrpc: '2.0',
    id: body?.id ?? null,
    result: {
      id: `cognistration-a2a-${Date.now().toString(36)}`,
      contextId: body?.params?.message?.contextId || null,
      status: { state, message: { role: 'agent', messageId: `cognistration-message-${Date.now().toString(36)}`, parts: [{ kind: 'text', text: safety ? safety.safety.message : result.response }] } },
      artifacts: safety ? [] : [{ name: 'tone-recommendation', parts: [{ kind: 'data', data: { tone: result.tone, matchMode: result.matchMode } }] }]
    }
  }, { headers: { 'cache-control': 'no-store' } });
}
