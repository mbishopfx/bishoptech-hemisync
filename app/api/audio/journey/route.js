import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import { generateOceanBackground } from '@/lib/audio/background';
import {
  buildSessionBed,
  renderAndMixVoice,
  mixProgram,
  encodeOutputs
} from '@/lib/audio/engine/pipeline';
import { FocusPresets } from '@/lib/audio/presets';

function dbToGain(db) { return Math.pow(10, db / 20); }

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper: build a script with master-level Gateway guidance
async function buildStages(client, { userText, trackTitle, targetSec, bandIntent }) {
  const system = `You are the Master-Level Gateway Experience Architect. Design a stage-based script with precise timing for hemispheric synchronization.
Principles: induction → resonance → focus stabilization → exploration → integration/return. Use safety-first, neutral language. Include brief [pause Xs] tags.
Output strict JSON: { stages:[{name, durationSec, script}], tone, bandIntent }. Keep total duration ≈ ${targetSec}s.

User Journal (append and reflect this intent in the guidance): ${userText || ''}`;
  const user = `Track: ${trackTitle}\nBand intent: ${bandIntent}. Focus on deeper self-understanding and calm, clear awareness.`;
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
    temperature: 0.6,
    // push high token allowance to enable rich scripts
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });
  const guidance = JSON.parse(r.choices?.[0]?.message?.content || '{}');
  let stages = Array.isArray(guidance?.stages) ? guidance.stages : [];
  // normalize sum to targetSec
  let sum = stages.reduce((a,s)=>a+(s.durationSec||0),0);
  if (sum > 0 && Math.abs(sum - targetSec) > 10) {
    const scale = targetSec / sum; stages = stages.map(s => ({...s, durationSec: Math.max(1, Math.round((s.durationSec||0)*scale)) }));
  }
  return stages;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      text,
      perTrackSec = 300,
      baseFreqHz = 240,
      breathGuide,
      background,
      ducking = { bedPercentWhileTalking: 0.75, attackMs: 40, releaseMs: 220 },
      tts = { voice: 'alloy', mixDb: -16 },
      modes = { binaural: true, monaural: true, isochronic: false }
    } = body || {};

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const sampleRate = 44100;

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
      // Build TTS stages
      const stages = await buildStages(client, { userText: text, trackTitle: tr.title, targetSec: perTrackSec/2, bandIntent: tr.bandIntent });

      // Bed synthesis
      const totalLength = Number(perTrackSec);
      const totalFrames = Math.floor(sampleRate * totalLength);
      const breath = breathGuide?.enabled ? { envelope: generateBreathEnvelope(breathGuide.pattern || 'coherent-5.5', sampleRate, totalLength, breathGuide?.bpm), depth: 0.1 } : null;
      const bg = background?.type === 'ocean' ? generateOceanBackground(sampleRate, totalLength, { mixDb: background.mixDb ?? -22 }) : null;

      const bed = tr.randomized
        ? await buildRandomizedBed({ totalLength, sampleRate, baseFreqHz, modes, breath })
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

      const totalFrames = Math.floor(sampleRate * totalLength);

      let sum = stages.reduce((a,s)=>a+(s.durationSec||0),0);
      sum = sum || Math.floor(totalLength/2);
      const totalGap = Math.max(0, totalLength - sum);
      const gaps = stages.length + 1; const gapPer = gaps>0 ? Math.floor(totalGap/gaps):0; let cursorSec = gapPer;
      const placed = stages.map(s=>({ ...s, atSec: (cursorSec|0), durationSec: s.durationSec }));
      for (const s of placed) { cursorSec += (s.durationSec||0) + gapPer; }

      const voice = await renderAndMixVoice({
        stages: placed,
        sampleRate,
        totalLengthSec: totalLength,
        ttsClient: client,
        voiceOptions: { voice: tts?.voice, mixDb: tts?.mixDb }
      });

      const program = mixProgram({
        bed,
        voice,
        ducking,
        backgroundLayers: bg ? [bg] : [],
        baseBedGain: 0.92
      });

      const { wavBuffer, mp3Buffer } = await encodeOutputs({ left: program.left, right: program.right, sampleRate, withMp3: true });
      const wavB64 = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
      const mp3B64 = mp3Buffer ? `data:audio/mpeg;base64,${mp3Buffer.toString('base64')}` : null;

      results.push({ key: tr.key, title: tr.title, wav: wavB64, mp3: mp3B64, stages: placed, analytics: { lengthSec: totalLength, duckEnvSeries: program.duckEnvSeries } });
    }

    return NextResponse.json({ ok: true, tracks: results });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}


