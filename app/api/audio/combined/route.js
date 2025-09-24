import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { pickPreset } from '@/lib/audio/presets';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import {
  buildSessionBed,
  renderAndMixVoice,
  mixProgram,
  encodeOutputs
} from '@/lib/audio/engine/pipeline';
import { generateOceanBackground } from '@/lib/audio/background';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      text,
      focusLevel = 'F12',
      lengthSec = 300,
      baseFreqHz,
      entrainmentModes = { binaural: true, monaural: true, isochronic: false },
      breathGuide,
      background,
      ducking = { enabled: true, bedPercentWhileTalking: 0.75, attackMs: 50, releaseMs: 200 },
      tts = { voice: 'alloy' }
    } = body || {};

    const totalLength = Number(lengthSec) || 300;
    const voiceTotal = Math.floor(totalLength / 2); // 50% guidance = 2.5 minutes for 5-minute bed

    const preset = pickPreset({ focusLevel });
    const sampleRate = 44100;

    const breath = breathGuide?.enabled
      ? {
          envelope: generateBreathEnvelope(
            breathGuide.pattern || 'coherent-5.5',
            sampleRate,
            totalLength,
            breathGuide?.bpm
          ),
          depth: 0.1
        }
      : null;

    const backgroundLayer = background?.type === 'ocean'
      ? generateOceanBackground(sampleRate, totalLength, { mixDb: background.mixDb ?? -22 })
      : null;

    const bed = await buildSessionBed({
      lengthSec: totalLength,
      sampleRate,
      focusPreset: preset,
      baseFreqHz,
      noise: preset.noise,
      breath,
      background: null,
      modes: { ...{ binaural: true, monaural: true, isochronic: false }, ...(entrainmentModes || {}), ...(preset.modes || {}) }
    });

    // 2) Generate guidance (voiceTotal seconds) and TTS per stage
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system = `You are the Gateway Experience TTS Script Architect. Objectives: 1) Align with Monroe Institute Gateway methodology (induction → resonance → focus level stabilization → exploration → return). 2) Maintain safe, neutral language; no medical claims. 3) Emphasize hemispheric synchronization cues, gentle breath pacing, and spatial attention. 4) Output strict JSON: { stages:[{name, durationSec, script}], tone, guidanceStyle, safety } with total duration ≈ ${voiceTotal}s. Keep scripts vivid yet concise.\n\nUser Journal (append and reflect this intent in the guidance): ${text || ''}`;
    const userMsg = `Focus level: ${focusLevel}. Target voiced duration: ${voiceTotal}s. Include explicit pause markers like [pause 2s] where natural.`;
    const r = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [ { role: 'system', content: system }, { role: 'user', content: userMsg } ],
      temperature: 0.6,
      response_format: { type: 'json_object' },
      max_tokens: 3000
    });
    const guidance = JSON.parse(r.choices?.[0]?.message?.content || '{}');
    let stages = Array.isArray(guidance?.stages) ? guidance.stages : [];
    // Normalize durations to voiceTotal
    let sum = stages.reduce((a,s)=>a+(s.durationSec||0),0);
    if (sum > 0 && Math.abs(sum - voiceTotal) > 10) {
      const scale = voiceTotal / sum; stages = stages.map(s => ({...s, durationSec: Math.max(1, Math.round((s.durationSec||0)*scale)) }));
      sum = stages.reduce((a,s)=>a+(s.durationSec||0),0);
    }
    // Distribute across the bed with gaps
    const totalGap = Math.max(0, totalLength - sum);
    const gaps = stages.length + 1;
    const gapPer = gaps > 0 ? Math.floor(totalGap / gaps) : 0;
    let cursor = gapPer;
    stages = stages.map(s => { const st = { ...s, atSec: cursor|0 }; cursor += (s.durationSec||0) + gapPer; return st; });

    // 3) Synthesize TTS per stage, mix into voice arrays at positions
    // Render TTS and mix
    const { voiceL, voiceR } = await renderAndMixVoice({
      stages,
      sampleRate,
      totalLengthSec: totalLength,
      ttsClient: client,
      voiceOptions: { voice: tts?.voice, mixDb: tts?.mixDb }
    });

    const program = mixProgram({
      bed,
      voice: { voiceL, voiceR },
      ducking,
      backgroundLayers: backgroundLayer ? [backgroundLayer] : [],
      baseBedGain: 0.92
    });

    const { wavBuffer, mp3Buffer } = await encodeOutputs({
      left: program.left,
      right: program.right,
      sampleRate,
      withMp3: true,
      kbps: 160
    });

    const deltaHzSeries = new Array(totalLength).fill(0);
    const defaultDelta = [
      { at: 0, hz: 10 },
      { at: totalLength, hz: 6 }
    ];
    const path = Array.isArray(preset.deltaHzPath) && preset.deltaHzPath.length > 0
      ? preset.deltaHzPath
      : defaultDelta;
    const maxAt = Math.max(...path.map(p => p.at || 0)) || 1;
    // Scale times to totalLength
    const scaled = path.map(p => ({ at: Math.round((p.at || 0) / maxAt * totalLength), hz: p.hz }));
    for (let s = 0; s < totalLength; s++) {
      const t = s;
      let i1 = 0;
      for (let k = 0; k < scaled.length; k++) { if (scaled[k].at <= t) i1 = k; }
      const i2 = Math.min(scaled.length - 1, i1 + 1);
      const p1 = scaled[i1], p2 = scaled[i2];
      const span = Math.max(1, p2.at - p1.at);
      const f = Math.min(1, Math.max(0, (t - p1.at) / span));
      deltaHzSeries[s] = Number((p1.hz + (p2.hz - p1.hz) * f).toFixed(2));
    }

    // 6b) Voice presence and RMS per second
    const voicePresence = new Array(totalLength).fill(0);
    const bedRms = new Array(totalLength).fill(0);
    const voiceRms = new Array(totalLength).fill(0);
    const bedL = program.bedPostDuck.left;
    const bedR = program.bedPostDuck.right;
    const voiceTrackL = program.voiceTracks.left;
    const voiceTrackR = program.voiceTracks.right;
    const totalFrames = bedL.length;
    for (let s = 0; s < totalLength; s++) {
      const start = s * sampleRate;
      const end = Math.min(totalFrames, start + sampleRate);
      let sumB = 0, sumV = 0, present = 0;
      for (let i = start; i < end; i++) {
        const vb = (bedL[i] * bedL[i] + bedR[i] * bedR[i]) * 0.5;
        const vv = (voiceTrackL[i] * voiceTrackL[i] + voiceTrackR[i] * voiceTrackR[i]) * 0.5;
        sumB += vb; sumV += vv;
        if (vv > 1e-6) present = 1;
      }
      const n = Math.max(1, end - start);
      bedRms[s] = Number(Math.sqrt(sumB / n).toFixed(4));
      voiceRms[s] = Number(Math.sqrt(sumV / n).toFixed(4));
      voicePresence[s] = present;
    }

    // 7) Band classification and summary coverage
    const classify = (hz) => hz < 4 ? 'delta' : hz < 8 ? 'theta' : hz < 13 ? 'alpha' : hz < 30 ? 'beta' : 'gamma';
    const bandSeries = deltaHzSeries.map(hz => classify(hz));
    const coverage = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };
    bandSeries.forEach(b => { coverage[b] = (coverage[b] || 0) + 1; });
    Object.keys(coverage).forEach(k => coverage[k] = Number((coverage[k] / totalLength * 100).toFixed(1)));

    const wavB64 = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
    const mp3B64 = mp3Buffer ? `data:audio/mpeg;base64,${mp3Buffer.toString('base64')}` : null;

    return NextResponse.json({
      ok: true,
      wav: wavB64,
      mp3: mp3B64,
      stages,
      analytics: {
        lengthSec: totalLength,
        sampleRate,
        deltaHzSeries,
        duckEnvSeries: program.duckEnvSeries,
        baseFreqHz: baseFreqHz || preset.carriers.leftHz,
        baseBedGain: 0.92,
        voicePresence,
        bedRms,
        voiceRms,
        coverage
      }
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}


