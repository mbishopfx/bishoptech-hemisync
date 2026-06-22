import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    
    const { count, error } = await supabase.from('agentic_tones').select('*', { count: 'exact', head: true });
    
    if (error) throw error;

    return NextResponse.json({
      status: 'healthy',
      env: {
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_service_role: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        has_ai_gateway_key: !!(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL || process.env.OPENAI_API_KEY),
        has_stripe_secret: !!process.env.STRIPE_SECRET_KEY,
        has_stripe_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET,
        site_url: process.env.NEXT_PUBLIC_SITE_URL || 'https://bishoptech.dev'
      },
      database: {
        agentic_tones_count: count || 0
      }
    });
  } catch (err) {
    return NextResponse.json({ status: 'unhealthy', error: err.message }, { status: 500 });
  }
}
