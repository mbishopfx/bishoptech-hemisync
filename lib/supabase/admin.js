import { createClient } from '@supabase/supabase-js';

let adminClient = null;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Graceful handling for build-time environments
  if (!url || !serviceKey) {
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'test') {
      console.warn('Supabase admin environment variables missing during build/test phase. Returning null client.');
      return null;
    }
    throw new Error('Supabase admin environment variables are not configured');
  }

  adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return adminClient;
}


