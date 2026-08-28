import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { commerceRateLimited } from '@/lib/commerce/rate-limit.mjs';
import { applyCors, resolveAllowedOrigin } from '@/lib/http/cors';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_LENGTH = 8 * 1024;
const FeedbackSchema = z.object({
  rating: z.enum(['positive', 'negative']),
  comment: z.string().trim().max(1000).optional()
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

async function parseBody(request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY_LENGTH) return null;
  try {
    return FeedbackSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

function cleanComment(comment) {
  const cleaned = String(comment || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
  return cleaned || null;
}

export async function POST(request) {
  if (!originAllowed(request)) {
    return json(request, { ok: false, code: 'ORIGIN_NOT_ALLOWED', error: 'This form can only be submitted from Cognistration.' }, 403);
  }

  if (commerceRateLimited(request, { scope: 'agent-feedback', limit: 8 })) {
    return json(request, { ok: false, code: 'RATE_LIMITED', error: 'Feedback is temporarily rate limited. Try again shortly.' }, 429);
  }

  const input = await parseBody(request);
  if (!input) {
    return json(request, { ok: false, code: 'INVALID_INPUT', error: 'Choose a thumbs-up or thumbs-down rating.' }, 400);
  }

  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return json(request, { ok: false, code: 'FEEDBACK_UNAVAILABLE', error: 'Feedback storage is temporarily unavailable.' }, 503);
    }

    const { error } = await supabase.from('agent_feedback').insert({
      rating: input.rating,
      comment: cleanComment(input.comment),
      surface: 'mcp_widget',
      source: 'cognistration_agent'
    });
    if (error) throw error;

    return json(request, { ok: true, status: 'received', message: 'Your feedback was received privately.' });
  } catch (error) {
    console.error('Agent feedback storage failed:', error?.message || 'unknown failure');
    return json(request, { ok: false, code: 'FEEDBACK_UNAVAILABLE', error: 'Feedback storage is temporarily unavailable.' }, 503);
  }
}
