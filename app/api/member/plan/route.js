import { NextResponse } from 'next/server';
import { buildMemberSessionPlan, MemberPlanInputSchema, memberErrorResponse } from '@/lib/agentic/member-capability';
import { requirePlatformSubscriber } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  const correlationId = crypto.randomUUID();
  try {
    const { user } = await requirePlatformSubscriber(req);
    const body = await req.json();
    const input = MemberPlanInputSchema.parse(body);
    const plan = await buildMemberSessionPlan(input, { useAi: false });
    return NextResponse.json({
      ...plan,
      memberId: user.id
    }, { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    const result = memberErrorResponse(error, correlationId);
    return NextResponse.json(result.body, { status: result.status, headers: { 'cache-control': 'no-store' } });
  }
}
