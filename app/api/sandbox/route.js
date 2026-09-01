import { z } from 'zod';
import { matchIntentionToTone } from '@/lib/agentic/tone-capability';
import { PUBLIC_TONE_CATALOG } from '@/lib/agentic/tone-capability';

export const dynamic = 'force-static';

const SandboxRequest = z.object({
  operation: z.enum(['capabilities', 'recommendation', 'controls']).default('capabilities'),
  intention: z.string().trim().min(1).max(240).optional(),
  targetState: z.enum(['delta', 'theta', 'alpha', 'beta', 'gamma']).optional(),
  carrierHz: z.number().int().min(100).max(400).optional(),
  beatHz: z.number().min(0.5).max(40).optional(),
  volume: z.number().int().min(0).max(100).optional()
}).strict();

const noWrite = {
  environment: 'sandbox',
  readOnly: true,
  persistence: 'none',
  audioStarted: false,
  paymentAttempted: false,
  credentialsAccepted: false,
  privateDataAccessed: false
};

function errorResponse(code, message, status = 400) {
  return Response.json({ ok: false, error: { code, message, retryable: status >= 500, resolution: 'Read /docs or GET /api/sandbox for the supported sandbox operations.' } }, { status, headers: { 'cache-control': 'no-store' } });
}

function capabilities() {
  return {
    ok: true,
    ...noWrite,
    version: '2026-09-01',
    operations: ['capabilities', 'recommendation', 'controls'],
    sample: { operation: 'recommendation', intention: 'a calm reset before writing' },
    contract: 'https://cognistration.com/openapi.json'
  };
}

async function execute(input) {
  if (input.operation === 'capabilities') return capabilities();
  if (input.operation === 'recommendation') {
    const intention = input.intention || 'a calm reset before writing';
    const result = await matchIntentionToTone({ intention, tones: PUBLIC_TONE_CATALOG, useAi: false });
    return { ok: true, ...noWrite, version: '2026-09-01', operation: input.operation, intention, tone: result.tone, matchMode: 'deterministic' };
  }
  return {
    ok: true,
    ...noWrite,
    version: '2026-09-01',
    operation: input.operation,
    controls: {
      targetState: input.targetState || 'theta',
      carrierHz: input.carrierHz || 200,
      beatHz: input.beatHz || 6,
      volume: input.volume ?? 72
    }
  };
}

export async function GET() {
  return Response.json(capabilities(), { headers: { 'cache-control': 'public, max-age=60, s-maxage=60' } });
}

export async function POST(request) {
  try {
    return Response.json(await execute(SandboxRequest.parse(await request.json())), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    return errorResponse('INVALID_SANDBOX_REQUEST', error?.issues?.[0]?.message || 'The sandbox request did not match the published schema.');
  }
}
