import { z } from 'zod';
import { capabilityManifest } from '@/lib/agentic/mcp-contract';
import { searchPublicTonePacks } from '@/lib/agentic/pack-capability';
import { getPolicyInfo } from '@/lib/agentic/policy-capability';
import { clarifyIntention } from '@/lib/agentic/intent-capability';

export const dynamic = 'force-dynamic';

const BatchSchema = z.object({
  operations: z.array(z.object({
    id: z.string().trim().min(1).max(80),
    method: z.enum(['GET', 'POST']),
    path: z.enum(['/api/capabilities', '/api/packs', '/api/agent/policy', '/api/agent/intent-guidance']),
    body: z.record(z.string(), z.unknown()).optional()
  }).strict()).min(1).max(20)
}).strict();

function error(code, message, status = 400) {
  return Response.json({ error: { code, message, retryable: status >= 500, resolution: 'Use one of the published read-only batch paths.' } }, { status, headers: { 'cache-control': 'no-store' } });
}

async function execute(operation) {
  if (operation.method === 'GET' && operation.path === '/api/capabilities') return { id: operation.id, ok: true, data: capabilityManifest() };
  if (operation.path === '/api/packs') return { id: operation.id, ok: true, data: { packs: searchPublicTonePacks(operation.body || {}) } };
  if (operation.path === '/api/agent/policy') {
    const topic = String(operation.body?.topic || '').trim();
    return { id: operation.id, ok: true, data: { policy: getPolicyInfo({ topic }) } };
  }
  if (operation.path === '/api/agent/intent-guidance') return { id: operation.id, ok: true, data: await clarifyIntention(operation.body || {}) };
  return { id: operation.id, ok: false, error: { code: 'UNSUPPORTED_OPERATION', message: 'This batch operation is not available.' } };
}

export async function POST(request) {
  try {
    const body = BatchSchema.parse(await request.json());
    const results = [];
    for (const operation of body.operations) results.push(await execute(operation));
    return Response.json({ ok: true, results, nextCursor: null }, { headers: { 'cache-control': 'no-store' } });
  } catch (errorValue) {
    return error('INVALID_BATCH', errorValue?.issues?.[0]?.message || 'The batch request did not match the published schema.');
  }
}
