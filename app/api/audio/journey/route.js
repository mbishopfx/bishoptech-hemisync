import { NextResponse } from 'next/server';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import { generateOceanBackground } from '@/lib/audio/background';
import {
  buildSessionBed,
  mixProgram,
  encodeOutputs
} from '@/lib/audio/engine/pipeline';
import { FocusPresets } from '@/lib/audio/presets';
import { persistRenderArtifacts } from '@/lib/audio/render-artifacts';
import { resolveExportProfile } from '@/lib/audio/export-profiles';

async function buildRandomizedBed({ totalLength, sampleRate, baseFreqHz, modes, breath, background }) {
  const segmentTargets = [
    { from: 12, to: 8 },
    { from: 8, to: 5 },
    { from: 5, to: 2.5 },
    { from: 13, to: 18 }
  ];
  const segmentCount = Math.max(3, Math.min(8, Math.round(totalLength / 75)));
  const segmentLength = totalLength / segmentCount;
  const left = new Float32Array(Math.floor(sampleRate * totalLength));
  const right = new Float32Array(Math.floor(sampleRate * totalLength));

  for (let index = 0; index < segmentCount; index += 1) {
    const target = segmentTargets[index % segmentTargets.length];
    const bed = await buildSessionBed({
      lengthSec: segmentLength,
      sampleRate,
      focusPreset: {
        carriers: { leftHz: baseFreqHz },
        deltaHzPath: [{ at: 0, hz: target.from }, { at: segmentLength, hz: target.to }],
        noise: FocusPresets.F12.noise,
        modes
      },
      baseFreqHz,
      noise: { type: index % 2 === 0 ? 'pink' : 'brown', mixDb: -28 },
      breath,
      background,
      modes
    });

    const offsetFrames = Math.floor(index * segmentLength * sampleRate);
    const framesToCopy = Math.min(bed.left.length, left.length - offsetFrames);
    for (let frame = 0; frame < framesToCopy; frame += 1) {
      left[offsetFrames + frame] = bed.left[frame];
      right[offsetFrames + frame] = bed.right[frame];
    }
  }

  return { left, right, sampleRate };
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      perTrackSec = 300,
      baseFreqHz = 240,
      exportProfile: exportProfileId = 'premium',
      breathGuide,
      background,
      modes = { binaural: true, monaural: true, isochronic: false }
    } = body || {};

    const exportProfile = resolveExportProfile(exportProfileId);
    const sampleRate = exportProfile.sampleRate;

    // Define five tracks covering bands; 5th randomized segments
    const tracks = [
      { key: 'track1', title: 'Alpha Gateway Induction', deltaFrom: 12, deltaTo: 8, bandIntent: 'alpha 8–12 Hz' },
      { key: 'track2', title: 'Theta Deepening', deltaFrom: 8, deltaTo: 5, bandIntent: 'theta 4–7 Hz' },
      { key: 'track3', title: 'Delta Restoration', deltaFrom: 5, deltaTo: 2.5, bandIntent: 'delta <4 Hz' },
      { key: 'track4', title: 'Beta Focus Integration', deltaFrom: 13, deltaTo: 18, bandIntent: 'beta 13–30 Hz' },
    { key: 'track5', title: 'Randomized Multi-Band Exploration', randomized: true, bandIntent: 'mixed alpha/theta/delta/beta' }
    ];

    const results = [];
    for (const tr of tracks) {
      // Bed synthesis
      const totalLength = Number(perTrackSec);
      const breath = breathGuide?.enabled ? { envelope: generateBreathEnvelope(breathGuide.pattern || 'coherent-5.5', sampleRate, totalLength, breathGuide?.bpm), depth: 0.1 } : null;
      const bg = background?.type === 'ocean' ? generateOceanBackground(sampleRate, totalLength, { mixDb: background.mixDb ?? -22 }) : null;

      const bed = tr.randomized
        ? await buildRandomizedBed({ totalLength, sampleRate, baseFreqHz, modes, breath, background: bg })
        : await buildSessionBed({
            lengthSec: totalLength,
            sampleRate,
            focusPreset: {
              carriers: { leftHz: baseFreqHz },
              deltaHzPath: [{ at: 0, hz: tr.deltaFrom }, { at: totalLength, hz: tr.deltaTo }],
              noise: FocusPresets.F12.noise,
              modes
            },
            baseFreqHz,
            noise: { type: 'pink', mixDb: -26 },
            breath,
            background: bg,
            modes
          });

      const program = mixProgram({
        bed,
        backgroundLayers: bg ? [bg] : [],
        baseBedGain: 0.92
      });

      const { wavBuffer, mp3Buffer, mastering } = await encodeOutputs({
        left: program.left,
        right: program.right,
        sampleRate,
        wavBitDepthCode: exportProfile.wavBitDepthCode,
        withMp3: true,
        kbps: exportProfile.mp3Kbps,
        masteringProfile: exportProfile.mastering
      });
      const artifacts = await persistRenderArtifacts({
        baseName: tr.title,
        wavBuffer,
        mp3Buffer
      });

      results.push({
        key: tr.key,
        title: tr.title,
        artifactId: artifacts.artifactId,
        assets: artifacts.files,
        wav: artifacts.files.wav?.url || null,
        mp3: artifacts.files.mp3?.url || null,
        stages: [],
        analytics: { lengthSec: totalLength, sampleRate, bandIntent: tr.bandIntent, mastering }
      });
    }

    return NextResponse.json({ ok: true, exportProfile: exportProfile.id, tracks: results });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
