import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireUserId } from '@/lib/auth/user';
import { SessionSpecSchema, ChatMessageSchema } from '@/lib/validation/schemas';
import { deepMerge } from '@/lib/utils/deepmerge';
import { createPortalClient } from '@/lib/openai/client';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function ensureUserProfile(supabase, userId, email) {
    const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (data) return;
  await supabase.from('profiles').insert({ id: userId, email });
}

async function ensureUserBucket(supabase, userId) {
  const bucketId = `renders-${userId}`;
  const { data: existing } = await supabase.storage.getBucket(bucketId);
  if (existing) return bucketId;
  await supabase.storage.createBucket(bucketId, { public: false });
  return bucketId;
}

export async function POST(req) {
  try {
    const userId = requireUserId(req);
    const body = await req.json();
    const { sessionSpec, messages } = body || {};

    const parsedSpec = sessionSpec ? SessionSpecSchema.parse(sessionSpec) : SessionSpecSchema.parse({});

    const supabase = getSupabaseAdmin();
    await ensureUserProfile(supabase, userId, body?.email);
    await ensureUserBucket(supabase, userId);

    let sessionId = body?.sessionId;

    if (!sessionId) {
      const { data, error } = await supabase
        .from('session_specs')
        .insert({
          user_id: userId,
          name: body?.sessionName || 'New Session',
          focus_level: parsedSpec.focusLevel,
          spec: parsedSpec
        })
        .select('id')
        .single();
      if (error) throw error;
      sessionId = data.id;
    }

    const parsedMessages = Array.isArray(messages)
      ? messages.map((msg) => ChatMessageSchema.parse({ ...msg, sessionId }))
      : [];

    if (parsedMessages.length > 0) {
      const rows = parsedMessages.map((msg) => ({
        session_id: sessionId,
        user_id: userId,
        role: msg.role,
        content: msg.content,
        spec_patch: msg.specPatch || null
      }));
      await supabase.from('chat_messages').insert(rows);
    }

    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content, spec_patch, created_at')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
      .limit(50);

    const client = createPortalClient();

    const systemPrompt = `You are the Session Architect for a hemispheric synchronization audio engine. Your job is to understand the user's intent and produce updates to a JSON session spec. Always answer with valid JSON in this shape:
{
  "reply": "assistant response",
  "specPatch": { ... changes to merge with session spec ... }
}

Rules:
- Keep language calm, encouraging, professional.
- Focus on describing binaural ramps, background textures, breath cues, guidance themes.
- Keep specPatch minimal; only include keys that changed.
- If specPatch is empty, return {}.
- specPatch should follow the SessionSpec schema.`;

    const chatHistory = history?.map((msg) => ({
      role: msg.role,
      content: msg.content,
      specPatch: msg.spec_patch
    })) || [];

    const messagesForAi = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((entry) => ({
        role: entry.role,
        content: entry.role === 'assistant' && entry.specPatch
          ? `${entry.content}
Spec patch: ${JSON.stringify(entry.specPatch)}`
          : entry.content
      })),
      { role: 'user', content: body.prompt || 'Help me design a session.' }
    ];

    const response = await client.responses.create({
      model: 'gpt-4.1-mini',
      input: messagesForAi
    });

    const content = response.output_text || '{}';
    const parsed = JSON.parse(content);
    const assistantReply = typeof parsed.reply === 'string' ? parsed.reply : 'Here is an updated session plan.';
    const specPatch = parsed.specPatch || {};

    const nextSpec = deepMerge(parsedSpec, specPatch);

    await supabase
      .from('session_specs')
      .update({ spec: nextSpec })
      .eq('id', sessionId);

    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: userId,
      role: 'assistant',
      content: assistantReply,
      spec_patch: specPatch
    });

    return NextResponse.json({
      ok: true,
      sessionId,
      reply: assistantReply,
      spec: nextSpec,
      specPatch
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Chat error' }, { status: 500 });
  }
}


