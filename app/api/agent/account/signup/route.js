import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';
import { applyCors, resolveAllowedOrigin } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 8 * 1024;
const SignupSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,32}$/),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128)
}).strict();

function json(request, body, status = 200) {
  return applyCors(request, NextResponse.json(body, {
    status,
    headers: { 'cache-control': 'no-store' }
  }));
}

function originAllowed(request) {
  const origin = request.headers.get('origin');
  return !origin || Boolean(resolveAllowedOrigin(origin));
}

export function OPTIONS(request) {
  return applyCors(request, new NextResponse(null, { status: 204 }));
}

function anonymousAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) return null;
  try {
    return SignupSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export async function POST(request) {
  if (!originAllowed(request)) {
    return json(request, { ok: false, code: 'ORIGIN_NOT_ALLOWED', error: 'This form can only be submitted from Cognistration.' }, 403);
  }

  if (commerceRateLimited(request, { scope: 'agent-account-signup', limit: 6 })) {
    return json(request, { ok: false, code: 'RATE_LIMITED', error: 'Account creation is temporarily rate limited. Try again shortly.' }, 429);
  }

  const input = await parseBody(request);
  if (!input) {
    return json(request, { ok: false, code: 'INVALID_INPUT', error: 'Enter a valid username, email address, and password.' }, 400);
  }

  try {
    const admin = getSupabaseAdmin();
    if (!admin) {
      return json(request, { ok: false, code: 'SIGNUP_UNAVAILABLE', error: 'Account creation is temporarily unavailable. Try again later.' }, 503);
    }

    const { data: existing, error: usernameError } = await admin
      .from('profiles')
      .select('id')
      .eq('username', input.username)
      .maybeSingle();
    if (usernameError) throw usernameError;
    if (existing) {
      return json(request, { ok: false, code: 'USERNAME_TAKEN', error: 'That username is already taken. Choose another one.' }, 409);
    }

    const auth = anonymousAuthClient();
    if (!auth) {
      return json(request, { ok: false, code: 'SIGNUP_UNAVAILABLE', error: 'Account creation is temporarily unavailable. Try again later.' }, 503);
    }

    const { data, error } = await auth.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          username: input.username,
          requested_plan: 'lifetime'
        }
      }
    });

    if (error) {
      return json(request, { ok: false, code: 'SIGNUP_FAILED', error: 'The account could not be created. Check the fields and try again.' }, 400);
    }

    const message = data?.session
      ? 'Account created. Sign in when you are ready to review the private workspace checkout. No payment was submitted.'
      : 'Account created. Check your email if confirmation is enabled, then sign in to review the private workspace checkout. No payment was submitted.';

    return json(request, {
      ok: true,
      status: data?.session ? 'created' : 'verification_required',
      message,
      verificationRequired: !data?.session,
      paymentSubmitted: false
    });
  } catch (error) {
    console.error('Agent account signup failed:', error?.message || 'unknown failure');
    return json(request, { ok: false, code: 'SIGNUP_UNAVAILABLE', error: 'Account creation is temporarily unavailable. Try again later.' }, 503);
  }
}
