import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    // Quick probe to see if we can talk to the DB
    const { data, error } = await supabase.from('agentic_tones').select('count', { count: 'exact', head: true });
    
    if (error) throw error;

    return NextResponse.json({
      status: 'healthy',
      env: {
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_gemini_key: !!process.env.GEMINI_API_KEY
      },
      database: {
        agentic_tones_count: data?.[0]?.count || 0
      }
    });
  } catch (err) {
    return NextResponse.json({ status: 'unhealthy', error: err.message }, { status: 500 });
  }
}
