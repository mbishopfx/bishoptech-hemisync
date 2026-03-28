import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  buildSessionBed,
  importStereoBed,
  overlayDualFrequency,
  encodeOutputs
} from '@/lib/audio/engine/pipeline';
import { pickPreset } from '@/lib/audio/presets';
import { persistRenderArtifacts } from '@/lib/audio/render-artifacts';
import { resolveExportProfile } from '@/lib/audio/export-profiles';

function makeBeatGate(sampleRate, lengthSec, bpm) {
  const total = Math.floor(sampleRate * lengthSec);
  const gate = new Float32Array(total);
  const beatHz = Math.max(0.1, (Number(bpm) || 120) / 60);
  for (let i = 0; i < total; i++) {
    const t = i / sampleRate;
    const cyc = 0.5 * (1 + Math.sin(2 * Math.PI * beatHz * t)); // 0..1
    // accent every 8th beat slightly
    const beatIdx = Math.floor(t * beatHz);
    const accent = (beatIdx % 8 === 0) ? 1.1 : 1.0;
    gate[i] = Math.min(1, cyc * accent);
  }
  return gate;
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function resolveInsideAudioDir(audioDir, candidate) {
  const resolved = path.resolve(audioDir, candidate);
  const base = path.resolve(audioDir);
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error('Invalid audio path');
  }
  return resolved;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      track = 'track1',
      band = 'alpha', // alpha|theta|delta|beta or numeric Hz
      bpm = 120,
      overlayDb = -10,
      baseFreqHz = 240,
      exportProfile: exportProfileId = 'premium',
      lengthSec // optional; default to full track length
    } = body || {};

    const exportProfile = resolveExportProfile(exportProfileId);
    const preset = pickPreset({ focusLevel: 'F12' });
    const bandHz = typeof band === 'number' ? band : (
      band === 'alpha' ? 10 : band === 'theta' ? 6 : band === 'delta' ? 3 : band === 'beta' ? 16 : 10
    );

    // 1) Resolve background file from /audio (supports .wav or .mp3). If 'trackN', pick Nth file.
    const audioDir = path.join(process.cwd(), 'audio');
    async function resolveTrack() {
      // if direct file exists
      const direct = resolveInsideAudioDir(audioDir, String(track));
      try { const st = await fs.stat(direct); if (st.isFile()) return direct; } catch {}
      // try with common extensions
      for (const ext of ['.wav', '.mp3']) {
        const p = resolveInsideAudioDir(audioDir, `${track}${ext}`);
        try { const st = await fs.stat(p); if (st.isFile()) return p; } catch {}
      }
      // if pattern trackN, list files and pick Nth
      const m = /^track(\d+)$/i.exec(String(track));
      if (m) {
        const idx = Math.max(1, parseInt(m[1], 10));
        const files = (await fs.readdir(audioDir)).filter(f => /\.(wav|mp3)$/i.test(f)).sort();
        if (files.length >= idx) return path.join(audioDir, files[idx - 1]);
      }
      throw new Error(`Audio track not found: ${track}`);
    }

    const resolvedPath = await resolveTrack();

    const targetRate = exportProfile.sampleRate;
    const imported = await importStereoBed({ filePath: resolvedPath, sampleRate: targetRate, targetLengthSec: lengthSec });
    const totalLength = lengthSec ? Math.floor(lengthSec) : Math.floor(imported.left.length / targetRate);
    const totalFrames = totalLength * targetRate;
    const musL = imported.left.subarray(0, totalFrames);
    const musR = imported.right.subarray(0, totalFrames);

    // 2) Synthesize hemisync overlay fixed delta frequency with isochronic gate at BPM
    const bed = await buildSessionBed({
      lengthSec: totalLength,
      sampleRate: targetRate,
      focusPreset: { ...preset, deltaHzPath: [{ at: 0, hz: bandHz }, { at: totalLength, hz: bandHz }] },
      baseFreqHz,
      modes: { binaural: true, monaural: true, isochronic: true },
      noise: null,
      background: null
    });

    const gate = makeBeatGate(targetRate, totalLength, bpm);
    for (let i = 0; i < bed.left.length; i++) { bed.left[i] *= gate[i]; bed.right[i] *= gate[i]; }

    // 3) Mix music with overlay
    const outL = new Float32Array(totalFrames);
    const outR = new Float32Array(totalFrames);
    for (let i = 0; i < totalFrames; i++) {
      outL[i] = musL[i];
      outR[i] = musR[i];
    }
    overlayDualFrequency({
      targetL: outL,
      targetR: outR,
      overlay: { left: bed.left, right: bed.right },
      gainDb: overlayDb,
      channelGains: { left: 0, right: 0 }
    });

    // 4) Encode
    const { wavBuffer, mp3Buffer, mastering } = await encodeOutputs({
      left: outL,
      right: outR,
      sampleRate: targetRate,
      wavBitDepthCode: exportProfile.wavBitDepthCode,
      withMp3: true,
      kbps: exportProfile.mp3Kbps,
      masteringProfile: exportProfile.mastering
    });
    const artifacts = await persistRenderArtifacts({
      baseName: `${path.basename(resolvedPath, path.extname(resolvedPath))}-${bandHz}hz-overlay`,
      wavBuffer,
      mp3Buffer
    });

    return NextResponse.json({
      ok: true,
      artifactId: artifacts.artifactId,
      assets: artifacts.files,
      wav: artifacts.files.wav?.url || null,
      mp3: artifacts.files.mp3?.url || null,
      meta: { bandHz, bpm, overlayDb, lengthSec: totalLength, exportProfile: exportProfile.id, mastering }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
