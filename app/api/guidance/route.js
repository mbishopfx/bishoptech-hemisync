import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    { error: 'Guidance generation has been removed. The platform now renders beats-only sessions.' },
    { status: 410 }
  );
}


