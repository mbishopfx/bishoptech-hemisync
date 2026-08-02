import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));

    // Quietly accept bot honeypot submissions without storing them.
    if (String(body.website || '').trim()) {
      return NextResponse.json({ ok: true });
    }

    const email = String(body.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Waitlist storage is not configured.' }, { status: 503 });
    }

    const { error } = await supabase
      .from('ios_waitlist')
      .upsert({ email, source: 'homepage' }, { onConflict: 'email', ignoreDuplicates: true });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('iOS waitlist signup failed:', error);
    return NextResponse.json({ error: 'We could not save your email right now.' }, { status: 500 });
  }
}
