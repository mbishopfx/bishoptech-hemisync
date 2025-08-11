import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { WaveFile } from 'wavefile';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import { generateOceanBackground } from '@/lib/audio/background';
import { synthesizeBinaural, encodeWavStereo, encodeMp3Stereo } from '@/lib/audio/synth';

function dbToGain(db) { return Math.pow(10, db / 20); }

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Helper: build a script with master-level Gateway guidance
async function buildStages(client, { userText, trackTitle, targetSec, bandIntent }) {
  const system = `You are the Master-Level Gateway Experience Architect. Design a stage-based script with precise timing for hemispheric synchronization.
Principles: induction → resonance → focus stabilization → exploration → integration/return. Use safety-first, neutral language. Include brief [pause Xs] tags.
Output strict JSON: { stages:[{name, durationSec, script}], tone, bandIntent }. Keep total duration ≈ ${targetSec}s.`;
  const user = `User context: ${userText || ''}\nTrack: ${trackTitle}\nBand intent: ${bandIntent}. Focus on deeper self-understanding and calm, clear awareness.`;
  const r = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [ { role: 'system', content: system }, { role: 'user', content: user } ],
    temperature: 0.6,
    // push high token allowance to enable rich scripts
    max_output_tokens: 4000,
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

function resampleLinear(source, srcRate, dstRate) {
  if (srcRate === dstRate) return source;
  const ratio = dstRate / srcRate;
  const dstLen = Math.round(source.length * ratio);
  const out = new Float32Array(dstLen);
  for (let i = 0; i < dstLen; i++) {
    const srcPos = i / ratio; const i0 = Math.floor(srcPos); const i1 = Math.min(source.length-1, i0+1); const t = srcPos - i0;
    out[i] = source[i0]*(1-t) + source[i1]*t;
  }
  return out;
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

      let left = new Float32Array(totalFrames); let right = new Float32Array(totalFrames);

      if (!tr.randomized) {
        const bed = synthesizeBinaural({ lengthSec: totalLength, sampleRate, baseFreqHz, deltaHzFrom: tr.deltaFrom, deltaHzTo: tr.deltaTo, noise: { type: 'pink', mixDb: -26 }, breath, modes, background: bg });
        left = bed.left; right = bed.right;
      } else {
        // Build randomized multi-segment bed covering bands
        const segments = [
          { from: 12, to: 8 }, // alpha
          { from: 8, to: 5 },  // theta
          { from: 5, to: 3 },  // delta
          { from: 14, to: 18 } // beta
        ].sort(() => Math.random() - 0.5);
        let cursor = 0;
        for (const seg of segments) {
          const segSec = Math.floor(totalLength / segments.length);
          const bed = synthesizeBinaural({ lengthSec: segSec, sampleRate, baseFreqHz, deltaHzFrom: seg.from, deltaHzTo: seg.to, noise: { type: 'pink', mixDb: -26 }, breath, modes, background: null });
          const segFrames = bed.left.length;
          for (let i = 0; i < segFrames && cursor + i < totalFrames; i++) { left[cursor+i] += bed.left[i]; right[cursor+i] += bed.right[i]; }
          cursor += segFrames;
        }
        // add bg after
        if (bg) { for (let i = 0; i < totalFrames; i++) { left[i] += bg.left[i] || 0; right[i] += bg.right[i] || 0; } }
      }

      // Synthesize TTS and mix with ducking
      const voiceL = new Float32Array(totalFrames); const voiceR = new Float32Array(totalFrames);
      // distribute stages with equal gaps
      let sum = stages.reduce((a,s)=>a+(s.durationSec||0),0);
      sum = sum || Math.floor(totalLength/2);
      const totalGap = Math.max(0, totalLength - sum);
      const gaps = stages.length + 1; const gapPer = gaps>0 ? Math.floor(totalGap/gaps):0; let cursorSec = gapPer;
      const placed = stages.map(s=>({ ...s, atSec: (cursorSec|0), durationSec: s.durationSec }));
      for (const s of placed) { cursorSec += (s.durationSec||0) + gapPer; }

      for (const s of placed) {
        const script = (s.script || '').toString().slice(0, 4000); if (!script) continue;
        const resp = await client.audio.speech.create({ model: 'gpt-4o-mini-tts', voice: tts?.voice || 'alloy', input: script, response_format: 'wav' });
        const buf = Buffer.from(await resp.arrayBuffer());
        const wav = new WaveFile(buf); const sr = wav.fmt.sampleRate; wav.toBitDepth('16');
        const samples = wav.getSamples(true, Int16Array); const ch = wav.fmt.numChannels; const frames = samples.length / ch;
        let l = new Float32Array(frames), r = new Float32Array(frames);
        for (let i = 0; i < frames; i++) { const vl = samples[i*ch]/32768; const vr = (ch>1? samples[i*ch+1]: samples[i*ch])/32768; l[i]=vl; r[i]=vr; }
        if (sr !== sampleRate) { l = resampleLinear(l, sr, sampleRate); r = resampleLinear(r, sr, sampleRate); }
        const start = Math.min(totalFrames-1, Math.max(0, Math.floor((s.atSec||0) * sampleRate)));
        const gain = dbToGain(typeof tts?.mixDb === 'number' ? tts.mixDb : -16);
        for (let i = 0; i < l.length && start + i < totalFrames; i++) { voiceL[start+i] += gain * l[i]; voiceR[start+i] += gain * r[i]; }
      }

      // base headroom
      const baseBedGain = 0.92; for (let i = 0; i < totalFrames; i++) { left[i] *= baseBedGain; right[i] *= baseBedGain; }

      // ducking
      const targetBed = ducking?.bedPercentWhileTalking ?? 0.75; const attackMs = ducking?.attackMs ?? 40; const releaseMs = ducking?.releaseMs ?? 220;
      const aA = 1 - Math.exp(-1 / (sampleRate * (attackMs/1000))); const aR = 1 - Math.exp(-1 / (sampleRate * (releaseMs/1000)));
      let env = 1.0; const duckEnvSeries = new Array(totalLength).fill(1.0);
      for (let i = 0; i < totalFrames; i++) {
        const present = Math.max(Math.abs(voiceL[i]), Math.abs(voiceR[i])) > 1e-4; const target = present ? targetBed : 1.0; const a = target < env ? aA : aR; env = env + (target - env) * a; left[i] *= env; right[i] *= env; if (i % sampleRate === 0) { const s = Math.floor(i / sampleRate); if (s < duckEnvSeries.length) duckEnvSeries[s] = Number(env.toFixed(3)); }
      }

      // mix and encode
      for (let i = 0; i < totalFrames; i++) { left[i] = Math.max(-1, Math.min(1, left[i] + voiceL[i])); right[i] = Math.max(-1, Math.min(1, right[i] + voiceR[i])); }
      const wavBuf = encodeWavStereo({ left, right, sampleRate });
      let mp3B64 = null; try { const mp3Buf = encodeMp3Stereo({ left, right, sampleRate, kbps: 160 }); mp3B64 = `data:audio/mpeg;base64,${mp3Buf.toString('base64')}`; } catch {}
      const wavB64 = `data:audio/wav;base64,${wavBuf.toString('base64')}`;

      results.push({ key: tr.key, title: tr.title, wav: wavB64, mp3: mp3B64, stages: placed, analytics: { lengthSec: totalLength, duckEnvSeries } });
    }

    return NextResponse.json({ ok: true, tracks: results });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}


