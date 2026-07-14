import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req) {
  const value = new URL(req.url).searchParams.get('value') || '';
  const username = value.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, 32);
  if (username.length < 3) {
    return NextResponse.json({ available: false, error: 'Username must be at least 3 characters' }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from('profiles')
    .select('id')
    .eq('username', username)
    .maybeSingle();
  if (error) return NextResponse.json({ available: false, error: 'Could not check username' }, { status: 500 });
  return NextResponse.json({ available: !data });
}
