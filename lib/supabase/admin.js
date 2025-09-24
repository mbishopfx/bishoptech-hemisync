import { createClient } from '@supabase/supabase-js';

let adminClient = null;

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
}

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;

  const url = getSupabaseUrl();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase admin environment variables are not configured');
  }

  adminClient = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  return adminClient;
}


