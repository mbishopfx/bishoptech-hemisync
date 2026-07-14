import { NextResponse } from 'next/server';
import { getAuthenticatedAccess, jsonError } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  try {
    const { profile, access } = await getAuthenticatedAccess(req);
    return NextResponse.json({ ok: true, access, profile });
  } catch (error) {
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
