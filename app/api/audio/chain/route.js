import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireAuthenticatedUser, ensureProfile, jsonError } from '@/lib/auth/session';
import { decodeAudioFile } from '@/lib/audio/engine/import';
import { encodeOutputs } from '@/lib/audio/engine/pipeline';
import { persistRenderArtifacts } from '@/lib/audio/render-artifacts';
import { resolvePublicUrl } from '@/lib/http/public-url';
import { getLogger } from '@/lib/logging/logger';
import { randomUUID } from 'crypto';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Concatenate multiple stereo Float32Array buffers with a linear crossfade
function concatenateAudioBuffers(buffers, sampleRate, crossfadeSec = 0.5) {
  if (!buffers || buffers.length === 0) return null;
  if (buffers.length === 1) {
    return {
      left: Float32Array.from(buffers[0].left),
      right: Float32Array.from(buffers[0].right)
    };
  }

  const crossfadeSamples = Math.floor(crossfadeSec * sampleRate);

  // Calculate total duration in frames
  let totalFrames = 0;
  for (let i = 0; i < buffers.length; i++) {
    totalFrames += buffers[i].left.length;
    if (i > 0) {
      totalFrames -= crossfadeSamples;
    }
  }

  const left = new Float32Array(totalFrames);
  const right = new Float32Array(totalFrames);

  let offset = 0;
  for (let i = 0; i < buffers.length; i++) {
    const current = buffers[i];
    const currentLen = current.left.length;

    if (i === 0) {
      // First track: copy entirely
      left.set(current.left, 0);
      right.set(current.right, 0);
      offset += currentLen;
    } else {
      // Subsequent tracks: apply linear crossfade over the overlap boundary
      const overlapStart = offset - crossfadeSamples;

      for (let j = 0; j < crossfadeSamples; j++) {
        const fadeOutRatio = 1 - (j / crossfadeSamples);
        const fadeInRatio = j / crossfadeSamples;
        const idxDest = overlapStart + j;

        left[idxDest] = (left[idxDest] * fadeOutRatio) + (current.left[j] * fadeInRatio);
        right[idxDest] = (right[idxDest] * fadeOutRatio) + (current.right[j] * fadeInRatio);
      }

      // Copy the remaining non-overlapping samples of the current track
      const restLength = currentLen - crossfadeSamples;
      if (restLength > 0) {
        const sourceOffset = crossfadeSamples;
        const destOffset = overlapStart + crossfadeSamples;

        left.set(current.left.subarray(sourceOffset), destOffset);
        right.set(current.right.subarray(sourceOffset), destOffset);
      }

      offset = overlapStart + currentLen;
    }
  }

  return { left, right };
}

// Download a remote URL to the local temp directory
async function downloadToTemp(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download audio from: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tempDir = path.resolve(process.cwd(), 'supabase/.temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const ext = url.toLowerCase().includes('.webm') ? '.webm' : 
              url.toLowerCase().includes('.mp3') ? '.mp3' : '.wav';
  const tempPath = path.join(tempDir, `${randomUUID()}${ext}`);
  
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

export async function POST(req) {
  const logger = getLogger();

  try {
    // 1. Authenticate user
    const { user } = await requireAuthenticatedUser(req);
    await ensureProfile(user);

    const body = await req.json();
    const { toneIds, name, description, visibility } = body;

    // Validate inputs
    if (!Array.isArray(toneIds) || toneIds.length === 0) {
      return NextResponse.json({ error: 'toneIds must be a non-empty array' }, { status: 400 });
    }
    if (toneIds.length > 5) {
      return NextResponse.json({ error: 'You can chain a maximum of 5 tones together' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 2. Fetch tone metadata from DB (both pre-generated library and user-saved)
    const [{ data: libraryTones }, { data: savedTones }] = await Promise.all([
      supabase.from('agentic_tones').select('*').in('id', toneIds),
      supabase.from('saved_tones').select('*').in('id', toneIds)
    ]);

    const allTones = [...(libraryTones || []), ...(savedTones || [])];
    
    // Sort tones to match the exact order requested in toneIds
    const sortedTones = toneIds.map(id => allTones.find(t => t.id === id)).filter(Boolean);

    if (sortedTones.length !== toneIds.length) {
      return NextResponse.json({ error: 'One or more selected tones could not be found in the library' }, { status: 404 });
    }

    // 3. Download and Decode audio files in parallel
    logger.info({ toneIds: sortedTones.map(t => t.id) }, 'Session Weaver: downloading files...');
    const decodedBuffers = await Promise.all(
      sortedTones.map(async (tone) => {
        const audioUrl = tone.webm_url || tone.mp3_url || tone.wav_url || tone.wav;
        if (!audioUrl) {
          throw new Error(`Audio URL missing for tone "${tone.name}"`);
        }

        const tempPath = await downloadToTemp(audioUrl);
        try {
          const decoded = await decodeAudioFile(tempPath);
          return decoded;
        } finally {
          // Cleanup disk immediately after loading buffer into RAM
          await fs.promises.unlink(tempPath).catch(() => {});
        }
      })
    );

    // Validate that all sample rates are consistent, or pick the first one
    const sampleRate = decodedBuffers[0]?.sampleRate || 44100;

    // 4. Concatenate buffers with a 0.5s linear crossfade
    logger.info('Session Weaver: concatenating audio channels...');
    const chainedBed = concatenateAudioBuffers(decodedBuffers, sampleRate, 0.5);

    if (!chainedBed) {
      throw new Error('Failed to merge audio channels.');
    }

    // 5. Encode concatenated stereo channels
    logger.info('Session Weaver: encoding Wav and Webm...');
    const { wavBuffer, webmBuffer } = await encodeOutputs({
      left: chainedBed.left,
      right: chainedBed.right,
      sampleRate,
      wavBitDepthCode: '16',
      withWebm: true,
      kbps: 64
    });

    // 6. Persist render artifacts
    logger.info('Session Weaver: archiving files...');
    const baseName = name.trim() || 'Session Weave';
    const artifacts = await persistRenderArtifacts({
      baseName,
      wavBuffer,
      webmBuffer
    });

    const assets = Object.fromEntries(
      Object.entries(artifacts.files).map(([format, file]) => [
        format,
        file
          ? {
              ...file,
              url: resolvePublicUrl(req, file.url)
            }
          : file
      ])
    );

    const totalDuration = Math.round(chainedBed.left.length / sampleRate);
    const targetState = sortedTones[sortedTones.length - 1].state || sortedTones[sortedTones.length - 1].target_state || 'alpha';
    const firstCarrier = Number(sortedTones[0].base_freq_hz || sortedTones[0].baseFreqHz || 220);

    // Derive unified delta path if available
    const deltaPath = sortedTones.flatMap((t, idx) => {
      const path = t.delta_path || t.metadata?.deltaCurve || [];
      return path;
    });

    // 7. Inject custom tone record into saved_tones
    logger.info('Session Weaver: writing metadata to database...');
    const savePayload = {
      user_id: user.id,
      name: baseName,
      description: description.trim() || `Sequenced Session Weave: ${sortedTones.map(t => t.name).join(' ➔ ')}`,
      target_state: targetState,
      duration_sec: totalDuration,
      base_freq_hz: firstCarrier,
      delta_path: deltaPath,
      wav_url: assets.wav?.url || null,
      mp3_url: assets.webm?.url || assets.wav?.url || null,
      artifact_id: artifacts.artifactId,
      visibility: visibility || 'private',
      is_serenity: false,
      frequency_plan: {
        sourceType: 'session-weaver',
        isWeaved: true,
        weavedTones: sortedTones.map(t => ({ id: t.id, name: t.name, state: t.state || t.target_state }))
      }
    };

    const { data: savedTone, error: saveError } = await supabase
      .from('saved_tones')
      .insert(savePayload)
      .select('*')
      .single();

    if (saveError) {
      throw saveError;
    }

    logger.info({ toneId: savedTone.id }, 'Session Weaver: completed successfully.');

    return NextResponse.json({
      ok: true,
      tone: savedTone,
      assets
    });

  } catch (error) {
    logger.error({ error }, 'Session Weaver API Error');
    const { body, status } = jsonError(error);
    return NextResponse.json(body, { status });
  }
}
