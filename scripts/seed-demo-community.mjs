import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createClient } from '@supabase/supabase-js';

function loadLocalEnv() {
  const envFiles = ['.env.local', '.env.production.local', '.env.development.local', '.env'];
  for (const fileName of envFiles) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(filePath)) continue;

    const text = fs.readFileSync(filePath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const index = trimmed.indexOf('=');
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] == null) {
        process.env[key] = value;
      }
    }
  }
}

loadLocalEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD || 'CognistrationDemo!2026';
const DAY_KEY = new Date().toISOString().slice(0, 10);
const AUDIO_BUCKET = 'demo-feed-audio';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL/SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_ACCOUNTS = [
  {
    email: 'mara@cognistration.dev',
    username: 'mara.vale',
    display_name: 'Mara Vale',
    bio: 'Keeps the morning window clean, tests short theta runs, and posts the useful parts back to the circle.'
  },
  {
    email: 'dax@cognistration.dev',
    username: 'dax.mercer',
    display_name: 'Dax Mercer',
    bio: 'Logs signal quality, follows the daily rhythm, and shares calm reports from the edge of the session lab.'
  },
  {
    email: 'ella@cognistration.dev',
    username: 'ella.north',
    display_name: 'Ella North',
    bio: 'Tracks what actually lands, what feels too loud, and which frequency plan stays useful the longest.'
  },
  {
    email: 'noah@cognistration.dev',
    username: 'noah.field',
    display_name: 'Noah Field',
    bio: 'Posts practical reflections, keeps the feed from going stale, and checks the collective pulse every day.'
  }
];

const COMMENT_TEMPLATES = [
  'That reads clean. The cadence feels right.',
  'Good signal. This is the kind of update that keeps the feed useful.',
  'Nice restraint here. The quieter version lands better.',
  'This feels coherent — easy to follow and worth keeping.'
];

const WORKSHOP_BLUEPRINTS = [
  {
    id: 'alpha-window',
    label: 'Alpha Window',
    targetState: 'alpha',
    journeyPresetId: 'induction-alpha-theta-integration-15',
    focusLevel: 'F10',
    baseFreqHz: 220,
    lengthSec: 180,
    breathPattern: 'coherent-5.5'
  },
  {
    id: 'theta-arc',
    label: 'Theta Arc',
    targetState: 'theta',
    journeyPresetId: 'creative-hypnagogia-15',
    focusLevel: 'F12',
    baseFreqHz: 236,
    lengthSec: 180,
    breathPattern: 'coherent-5.5'
  },
  {
    id: 'delta-anchor',
    label: 'Delta Anchor',
    targetState: 'delta',
    journeyPresetId: 'deep-reset-15',
    focusLevel: 'F15',
    baseFreqHz: 192,
    lengthSec: 180,
    breathPattern: 'box'
  },
  {
    id: 'gamma-beacon',
    label: 'Gamma Beacon',
    targetState: 'gamma',
    journeyPresetId: 'focus-15-no-time-15',
    focusLevel: 'F21',
    baseFreqHz: 320,
    lengthSec: 180,
    breathPattern: 'coherent-5.5'
  }
];

function dayOffset() {
  const iso = DAY_KEY.replace(/-/g, '');
  return Number(iso.slice(-2)) % WORKSHOP_BLUEPRINTS.length;
}

function resolveAssetUrl(pathname) {
  if (!pathname) return null;
  return pathname.startsWith('http') ? pathname : pathname;
}

const WORKSHOP_RENDER_PORT = 3012;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function probeWorkshopServer(origin) {
  try {
    const response = await fetch(`${origin}/api/health`, { cache: 'no-store' });
    if (!response.ok) return false;
    const data = await response.json().catch(() => null);
    return data?.status === 'healthy';
  } catch {
    return false;
  }
}

async function ensureWorkshopServer() {
  const origin = `http://127.0.0.1:${WORKSHOP_RENDER_PORT}`;
  if (await probeWorkshopServer(origin)) {
    return null;
  }

  const child = spawn('npm', ['start'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(WORKSHOP_RENDER_PORT),
      BACKEND_ORIGIN: '',
      NEXT_PUBLIC_BACKEND_ORIGIN: ''
    },
    stdio: 'ignore',
    detached: true
  });
  child.unref();

  const timeoutAt = Date.now() + 180000;
  while (Date.now() < timeoutAt) {
    if (await probeWorkshopServer(origin)) {
      return child;
    }
    await sleep(2000);
  }

  throw new Error('Timed out waiting for local workshop render server on port 3012');
}

function stopWorkshopServer(child) {
  if (!child || child.killed) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    try {
      child.kill('SIGTERM');
    } catch {
      // ignore
    }
  }
}

function buildToneName(account, plan) {
  return `${account.display_name} ${plan.label} • ${DAY_KEY}`;
}

function buildResonanceBody(account, plan) {
  return `${account.display_name} resonance update • ${DAY_KEY}: workshop-rendered ${plan.targetState} wave from the Cognistration workshop.`;
}

function buildToneDescription(account, plan, journey) {
  return `${account.display_name} built this ${plan.label.toLowerCase()} through the Cognistration workshop. ${journey.summary}`;
}

async function findAuthUserByEmail(email) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  return data?.users?.find((user) => user.email === email) || null;
}

async function ensureDemoUser(account) {
  const existing = await findAuthUserByEmail(account.email);
  if (existing?.id) return existing;

  const created = await supabase.auth.admin.createUser({
    email: account.email,
    password: DEMO_USER_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: account.display_name,
      username: account.username,
      role: 'demo-community'
    }
  });

  if (created.error) throw created.error;
  const user = created.data?.user;
  if (!user?.id) throw new Error(`Failed to create auth user for ${account.email}`);
  return user;
}

async function ensureProfile(user, account) {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      username: account.username,
      display_name: account.display_name,
      bio: account.bio,
      profile_visibility: 'public',
      onboarding_complete: true
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

async function deleteExistingDemoRows(userIds) {
  if (!userIds.length) return;

  const { error: followerError } = await supabase
    .from('follows')
    .delete()
    .in('follower_id', userIds);
  if (followerError) throw followerError;

  const { error: followingError } = await supabase
    .from('follows')
    .delete()
    .in('following_id', userIds);
  if (followingError) throw followingError;

  const { error: postError } = await supabase
    .from('feed_posts')
    .delete()
    .in('user_id', userIds);
  if (postError) throw postError;

  const { error: toneError } = await supabase
    .from('saved_tones')
    .delete()
    .in('user_id', userIds);
  if (toneError) throw toneError;
}

async function ensureFollow(followerId, followingId) {
  if (!followerId || !followingId || followerId === followingId) return;

  const { data: existing, error: readError } = await supabase
    .from('follows')
    .select('follower_id,following_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return;

  const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

async function storeWorkshopArtifacts(baseName, wavBuffer) {
  const { data: bucket, error: bucketError } = await supabase.storage.getBucket(AUDIO_BUCKET);
  if (bucketError || !bucket) {
    const { error: createError } = await supabase.storage.createBucket(AUDIO_BUCKET, {
      public: true,
      allowedMimeTypes: ['audio/wav']
    });
    if (createError) throw createError;
  }

  const artifactId = `${Date.now()}-${randomUUID()}`;
  const wavPath = `${artifactId}/master.wav`;

  const { error: uploadError } = await supabase.storage.from(AUDIO_BUCKET).upload(wavPath, wavBuffer, {
    contentType: 'audio/wav',
    upsert: true
  });
  if (uploadError) throw uploadError;

  const wavUrl = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(wavPath).data.publicUrl;

  return {
    artifactId,
    files: {
      wav: {
        filename: `${baseName}.wav`,
        contentType: 'audio/wav',
        bytes: wavBuffer.length,
        url: wavUrl
      }
    }
  };
}

async function renderWorkshopTone(account, plan) {
  const localRenderOrigin = process.env.WORKSHOP_RENDER_ORIGIN || 'http://127.0.0.1:3012';
  const payload = {
    exportProfile: 'standard',
    journeyPresetId: plan.journeyPresetId,
    focusLevel: plan.focusLevel,
    lengthSec: 120,
    baseFreqHz: plan.baseFreqHz,
    journeyName: `${account.display_name} ${plan.label}`
  };

  const response = await fetch(`${localRenderOrigin}/api/audio/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data?.error || 'Workshop render failed');
  }

  const wavSource = data.wav || data.assets?.wav?.url;
  if (!wavSource) {
    throw new Error('Workshop render did not return a WAV URL');
  }

  const wavResponse = await fetch(wavSource);
  if (!wavResponse.ok) {
    throw new Error(`Failed to fetch generated WAV: ${wavResponse.status}`);
  }
  const wavBuffer = Buffer.from(await wavResponse.arrayBuffer());
  const artifacts = await storeWorkshopArtifacts(`${account.username}-${plan.id}`, wavBuffer);

  return {
    journey: data.journey || {
      journeyPresetId: plan.journeyPresetId,
      focusLevel: plan.focusLevel,
      totalLengthSec: 120,
      baseFreqHz: plan.baseFreqHz,
      summary: `${plan.label} workshop render`
    },
    artifacts,
    mastering: data.mastering || null,
    wavUrl: artifacts.files.wav.url,
    webmUrl: null
  };
}

async function ensureTone(userId, account, plan) {
  const toneName = buildToneName(account, plan);
  const description = buildToneDescription(account, plan, plan.journey);
  const payload = {
    user_id: userId,
    name: toneName,
    description,
    target_state: plan.targetState,
    base_freq_hz: plan.baseFreqHz,
    duration_sec: plan.journey.totalLengthSec,
    wav_url: plan.wavUrl,
    mp3_url: plan.wavUrl,
    artifact_id: plan.artifacts.artifactId,
    visibility: 'public',
    is_serenity: false,
    frequency_plan: {
      seedType: 'demo-community-workshop',
      dayKey: DAY_KEY,
      planId: plan.id,
      label: plan.label,
      targetState: plan.targetState,
      focusLevel: plan.journey.focusLevel,
      journeyPresetId: plan.journey.journeyPresetId,
      baseFreqHz: plan.journey.baseFreqHz,
      breathPattern: plan.journey.breathPattern,
      background: plan.journey.background,
      stages: plan.journey.stages,
      artifactId: plan.artifacts.artifactId,
      assetUrls: {
        wav: plan.wavUrl,
        webm: plan.webmUrl
      }
    }
  };

  const { data: existing, error: readError } = await supabase
    .from('saved_tones')
    .select('id')
    .eq('user_id', userId)
    .eq('name', toneName)
    .maybeSingle();

  if (readError) throw readError;

  if (!existing) {
    const { data, error } = await supabase
      .from('saved_tones')
      .insert(payload)
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  const { data, error } = await supabase
    .from('saved_tones')
    .update(payload)
    .eq('id', existing.id)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureFeedPost({ userId, toneId, postType, body, visibility = 'public' }) {
  const { data: existing, error: readError } = await supabase
    .from('feed_posts')
    .select('id')
    .eq('user_id', userId)
    .eq('tone_id', toneId)
    .eq('post_type', postType)
    .eq('body', body)
    .eq('visibility', visibility)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('feed_posts')
    .insert({
      user_id: userId,
      tone_id: toneId,
      post_type: postType,
      body,
      visibility
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function ensureLike(postId, userId) {
  const { error } = await supabase.from('post_likes').upsert({ post_id: postId, user_id: userId });
  if (error) throw error;
}

async function ensureComment(postId, userId, body) {
  const { data: existing, error: readError } = await supabase
    .from('post_comments')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .eq('body', body)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, user_id: userId, body })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

async function syncPostCounts(postId) {
  const [{ count: likeCount, error: likeError }, { count: commentCount, error: commentError }] = await Promise.all([
    supabase.from('post_likes').select('post_id', { count: 'exact', head: true }).eq('post_id', postId),
    supabase.from('post_comments').select('post_id', { count: 'exact', head: true }).eq('post_id', postId)
  ]);

  if (likeError) throw likeError;
  if (commentError) throw commentError;

  const { error } = await supabase
    .from('feed_posts')
    .update({ like_count: likeCount || 0, comment_count: commentCount || 0, updated_at: new Date().toISOString() })
    .eq('id', postId);

  if (error) throw error;
}

async function main() {
  console.log(`[demo-community] seeding workshop-backed demo member base for ${DAY_KEY}`);
  const workshopServer = await ensureWorkshopServer();

  try {
    const users = [];
    for (const account of DEMO_ACCOUNTS) {
      const authUser = await ensureDemoUser(account);
      await ensureProfile(authUser, account);
      users.push({ ...account, id: authUser.id });
      console.log(`  ensured auth/profile: ${account.email} (${authUser.id})`);
    }

    const userIds = users.map((user) => user.id);
    await deleteExistingDemoRows(userIds);
    console.log('  cleared prior demo feed, tone, and follow rows');

    for (const follower of users) {
      for (const following of users) {
        if (follower.id !== following.id) {
          await ensureFollow(follower.id, following.id);
        }
      }
    }
    console.log('  ensured dense follow graph across demo users');

    const blueprints = users.map((user, index) => WORKSHOP_BLUEPRINTS[(index + dayOffset()) % WORKSHOP_BLUEPRINTS.length]);
    const renderPlans = [];

    for (let index = 0; index < users.length; index += 1) {
      const account = users[index];
      const blueprint = blueprints[index];
      const render = await renderWorkshopTone(account, blueprint);
      renderPlans.push({ ...blueprint, ...render });
      console.log(`  workshop-rendered ${blueprint.label} for ${account.display_name}`);
    }

    for (let index = 0; index < users.length; index += 1) {
      const account = users[index];
      const plan = renderPlans[index];
      const toneId = await ensureTone(account.id, account, plan);
      const postBody = buildResonanceBody(account, plan);
      const postId = await ensureFeedPost({
        userId: account.id,
        toneId,
        postType: 'tone',
        body: postBody,
        visibility: 'public'
      });

      const likerPool = users.filter((candidate) => candidate.id !== account.id);
      const likers = likerPool.slice(0, 2);
      for (const liker of likers) {
        await ensureLike(postId, liker.id);
      }

      const commenter = likerPool[likerPool.length - 1];
      if (commenter) {
        const commentBody = COMMENT_TEMPLATES[(index + dayOffset()) % COMMENT_TEMPLATES.length];
        await ensureComment(postId, commenter.id, commentBody);
      }

      await syncPostCounts(postId);
      console.log(`  broadcast resonance update: ${account.display_name}`);
    }

    const { count: feedCount, error: feedCountError } = await supabase
      .from('feed_posts')
      .select('id', { count: 'exact', head: true })
      .eq('visibility', 'public');
    if (feedCountError) throw feedCountError;

    const { count: toneCount, error: toneCountError } = await supabase
      .from('saved_tones')
      .select('id', { count: 'exact', head: true })
      .eq('visibility', 'public');
    if (toneCountError) throw toneCountError;

    console.log(`[demo-community] complete: ${users.length} demo users, ${toneCount || 0} public tones, ${feedCount || 0} public feed posts`);
  } finally {
    stopWorkshopServer(workshopServer);
  }
}

main().catch((error) => {
  console.error('[demo-community] failed:', error);
  process.exitCode = 1;
});
