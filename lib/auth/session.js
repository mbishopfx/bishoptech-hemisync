import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getPlatformAccessState, hasPlatformAccess } from '@/lib/billing/entitlements';

export const PROFILE_BOOTSTRAP_SELECT = 'id,email,username,display_name,avatar_url,plan,subscription_tier,entitlement_type,billing_status,stripe_customer_id,stripe_subscription_id,payment_method_attached,grandfathered_at,trial_expires_at,created_at,updated_at';

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

export async function tryGetAuthenticatedUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    return { user: null, token: null };
  }

  try {
    const supabase = getAuthClient(token);
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user?.id) {
      return { user: null, token: null };
    }

    return { user: data.user, token };
  } catch (err) {
    return { user: null, token: null };
  }
}

export async function ensureProfile(user) {
  const supabase = getSupabaseAdmin();
  const email = user.email || null;
  const requestedUsername = String(user.user_metadata?.username || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]/g, '')
    .slice(0, 32);
  const displayName = user.user_metadata?.full_name || requestedUsername || email?.split('@')[0] || 'Member';

  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select(PROFILE_BOOTSTRAP_SELECT)
    .eq('id', user.id)
    .maybeSingle();

  if (readError) {
    throw readError;
  }

  if (existing) {
    return existing;
  }

  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email,
        username: requestedUsername || null,
        display_name: displayName,
        plan: 'free',
        subscription_tier: 'none',
        entitlement_type: 'none',
        billing_status: 'inactive'
      },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  if (upsertError) {
    throw upsertError;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_BOOTSTRAP_SELECT)
    .eq('id', user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getAuthenticatedAccess(req) {
  const { user, token } = await requireAuthenticatedUser(req);
  const profile = await ensureProfile(user);
  return { user, token, profile, access: getPlatformAccessState(profile) };
}

export async function requirePlatformSubscriber(req) {
  const context = await getAuthenticatedAccess(req);
  if (!hasPlatformAccess(context.profile)) {
    const error = new Error('An active Cognistration membership is required');
    error.status = 403;
    error.code = 'SUBSCRIPTION_REQUIRED';
    throw error;
  }
  return context;
}

export function jsonError(error) {
  return {
    body: { error: error.message || 'Request failed', ...(error.code ? { code: error.code } : {}) },
    status: error.status || 500
  };
}
