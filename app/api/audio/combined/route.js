import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { pickPreset } from '@/lib/audio/presets';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import { synthesizeBinaural, encodeWavStereo, encodeMp3Stereo } from '@/lib/audio/synth';
import { generateOceanBackground } from '@/lib/audio/background';
import { WaveFile } from 'wavefile';

function dbToGain(db) { return Math.pow(10, db / 20); }

function wavToFloat32Stereo(buf) {
  const wav = new WaveFile(buf);
  const sr = wav.fmt.sampleRate;
  wav.toBitDepth('16');
  const samples = wav.getSamples(true, Int16Array);
  const ch = wav.fmt.numChannels;
  const frames = samples.length / ch;
  const left = new Float32Array(frames);
  const right = new Float32Array(frames);
  for (let i = 0; i < frames; i++) {
    const l = samples[i * ch] / 32768;
    const r = (ch > 1 ? samples[i * ch + 1] : samples[i * ch]) / 32768;
    left[i] = l; right[i] = r;
  }
  return { left, right, sampleRate: sr };
}

function resampleLinear(source, srcRate, dstRate) {
  if (srcRate === dstRate) return source;
  const ratio = dstRate / srcRate;
  const dstLen = Math.round(source.length * ratio);
  const out = new Float32Array(dstLen);
  for (let i = 0; i < dstLen; i++) {
    const srcPos = i / ratio;
    const i0 = Math.floor(srcPos);
    const i1 = Math.min(source.length - 1, i0 + 1);
    const t = srcPos - i0;
    out[i] = source[i0] * (1 - t) + source[i1] * t;
  }
  return out;
}

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
    const deltaFrom = preset.deltaHzPath?.[0]?.hz || 10;
    const deltaTo = preset.deltaHzPath?.[preset.deltaHzPath.length - 1]?.hz || 6;

    let breath = null;
    if (breathGuide?.enabled) {
      const envelope = generateBreathEnvelope(breathGuide.pattern || 'coherent-5.5', 44100, totalLength, breathGuide?.bpm);
      breath = { envelope, depth: 0.1 };
    }

    let bg = null;
    if (background?.type === 'ocean') {
      bg = generateOceanBackground(44100, totalLength, { mixDb: background.mixDb ?? -22 });
    }

    // 1) Synthesize bed for full length
    const { left: bedL, right: bedR, sampleRate } = synthesizeBinaural({
      lengthSec: totalLength,
      sampleRate: 44100,
      baseFreqHz: baseFreqHz || preset.carriers.leftHz,
      deltaHzFrom: deltaFrom,
      deltaHzTo: deltaTo,
      noise: preset.noise,
      breath,
      modes: { ...{ binaural: true, monaural: true, isochronic: false }, ...(entrainmentModes || {}), ...(preset.modes || {}) },
      background: bg
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
    const totalFrames = Math.floor(sampleRate * totalLength);
    const voiceL = new Float32Array(totalFrames);
    const voiceR = new Float32Array(totalFrames);

    for (const s of stages) {
      const script = (s.script || '').toString().slice(0, 4000);
      if (!script) continue;
      const tt = await client.audio.speech.create({ model: 'gpt-4o-mini-tts', voice: tts?.voice || 'alloy', input: script, response_format: 'wav' });
      const arrayBuffer = await tt.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);
      const wav = new WaveFile(buf);
      const sr = wav.fmt.sampleRate;
      wav.toBitDepth('16');
      const samples = wav.getSamples(true, Int16Array);
      const ch = wav.fmt.numChannels;
      const frames = samples.length / ch;
      let l = new Float32Array(frames), r = new Float32Array(frames);
      for (let i = 0; i < frames; i++) {
        const vl = samples[i * ch] / 32768; const vr = (ch>1? samples[i * ch + 1]: samples[i * ch]) / 32768;
        l[i] = vl; r[i] = vr;
      }
      if (sr !== sampleRate) { l = resampleLinear(l, sr, sampleRate); r = resampleLinear(r, sr, sampleRate); }
      const start = Math.min(totalFrames-1, Math.max(0, Math.floor((s.atSec||0) * sampleRate)));
      const gain = dbToGain(typeof tts?.mixDb === 'number' ? tts.mixDb : -16);
      for (let i = 0; i < l.length && start + i < totalFrames; i++) {
        voiceL[start+i] += gain * l[i];
        voiceR[start+i] += gain * r[i];
      }
    }

    // Apply global bed attenuation (reduce beats slightly for headroom)
    const baseBedGain = 0.92;
    for (let i = 0; i < totalFrames; i++) {
      bedL[i] *= baseBedGain;
      bedR[i] *= baseBedGain;
    }

    // 4) Duck bed while voice present, default to 25% reduction (0.75 multiplier), with smoothing; collect envelope at 1 Hz
    const targetBed = ducking?.bedPercentWhileTalking ?? 0.75;
    const attackMs = ducking?.attackMs ?? 40, releaseMs = ducking?.releaseMs ?? 220;
    const aA = 1 - Math.exp(-1 / (sampleRate * (attackMs/1000)));
    const aR = 1 - Math.exp(-1 / (sampleRate * (releaseMs/1000)));
    let env = 1.0; // 1.0 normal, 0.8 ducked
    const duckEnvSeries = new Array(totalLength).fill(1.0);
    for (let i = 0; i < totalFrames; i++) {
      const present = Math.max(Math.abs(voiceL[i]), Math.abs(voiceR[i])) > 1e-4;
      const target = present ? targetBed : 1.0;
      const a = target < env ? aA : aR; // faster to duck
      env = env + (target - env) * a;
      bedL[i] *= env;
      bedR[i] *= env;
      if (i % sampleRate === 0) {
        const sec = Math.floor(i / sampleRate);
        if (sec < duckEnvSeries.length) duckEnvSeries[sec] = Number(env.toFixed(3));
      }
    }

    // 5) Mix bed + voice and encode WAV
    for (let i = 0; i < totalFrames; i++) {
      bedL[i] = Math.max(-1, Math.min(1, bedL[i] + voiceL[i]));
      bedR[i] = Math.max(-1, Math.min(1, bedR[i] + voiceR[i]));
    }

    // 6) Build delta frequency series (piecewise based on preset path, scaled to totalLength)
    const deltaHzSeries = new Array(totalLength).fill(0);
    const path = Array.isArray(preset.deltaHzPath) && preset.deltaHzPath.length > 0 ? preset.deltaHzPath : [{ at: 0, hz: deltaFrom }, { at: totalLength, hz: deltaTo }];
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
    for (let s = 0; s < totalLength; s++) {
      const start = s * sampleRate;
      const end = Math.min(totalFrames, start + sampleRate);
      let sumB = 0, sumV = 0, present = 0;
      for (let i = start; i < end; i++) {
        const vb = (bedL[i] * bedL[i] + bedR[i] * bedR[i]) * 0.5;
        const vv = (voiceL[i] * voiceL[i] + voiceR[i] * voiceR[i]) * 0.5;
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

    // 8) Encode final WAV/MP3
    const wavBuf = encodeWavStereo({ left: bedL, right: bedR, sampleRate });
    let mp3B64 = null;
    try {
      const mp3Buf = encodeMp3Stereo({ left: bedL, right: bedR, sampleRate, kbps: 160 });
      mp3B64 = `data:audio/mpeg;base64,${mp3Buf.toString('base64')}`;
    } catch {}
    const b64 = `data:audio/wav;base64,${wavBuf.toString('base64')}`;
    return NextResponse.json({ ok: true, wav: b64, mp3: mp3B64, stages, analytics: { lengthSec: totalLength, sampleRate, deltaHzSeries, duckEnvSeries, baseFreqHz: baseFreqHz || preset.carriers.leftHz, baseBedGain, voicePresence, bedRms, voiceRms, coverage } });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}


