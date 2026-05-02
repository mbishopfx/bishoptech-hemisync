import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

function getBearerToken(req) {
  const header = req.headers.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function getAuthClient(token) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase auth environment variables are missing');
  }

  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function requireAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }

  const supabase = getAuthClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user?.id) {
    const authError = new Error('Invalid or expired session');
    authError.status = 401;
    throw authError;
  }

  return { user: data.user, token };
}

export async function ensureProfile(user) {
  const supabase = getSupabaseAdmin();
  const email = user.email || null;
  const displayName = user.user_metadata?.full_name || email?.split('@')[0] || 'Member';

  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email,
      display_name: displayName,
      full_name: displayName,
      username: `member-${user.id.slice(0, 8)}`
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function jsonError(error) {
  return {
    body: { error: error.message || 'Request failed' },
    status: error.status || 500
  };
}
