import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ error: 'Download access is temporarily unavailable' }, { status: 503 });
}
