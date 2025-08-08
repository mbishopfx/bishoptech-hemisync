import { NextResponse } from 'next/server';
import OpenAI from 'openai';
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

function encodeWavStereo({ left, right, sampleRate }) {
  const interleaved = new Int16Array(left.length * 2);
  for (let i = 0, j = 0; i < left.length; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    interleaved[j++] = (l * 0x7fff) | 0;
    interleaved[j++] = (r * 0x7fff) | 0;
  }
  const wav = new WaveFile();
  wav.fromScratch(2, sampleRate, '16', interleaved);
  return Buffer.from(wav.toBuffer());
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    const body = await req.json();
    const { guidance, voice = 'alloy', lengthSec = 180, mixDb = -12 } = body || {};
    const stages = guidance?.stages || [];
    if (!Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json({ error: 'guidance.stages required' }, { status: 400 });
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const targetRate = 44100;
    const totalFrames = Math.floor(targetRate * lengthSec);
    const left = new Float32Array(totalFrames);
    const right = new Float32Array(totalFrames);

    for (const s of stages) {
      const script = s.script?.toString().slice(0, 4000) || '';
      if (!script) continue;
      const resp = await client.audio.speech.create({
        model: 'gpt-4o-mini-tts',
        voice,
        input: script,
        response_format: 'wav'
      });
      const arrayBuffer = await resp.arrayBuffer();
      const buf = Buffer.from(arrayBuffer);
      const wav = new WaveFile(buf);
      const sr = wav.fmt.sampleRate;
      wav.toBitDepth('16');
      const samples = wav.getSamples(true, Int16Array);
      const ch = wav.fmt.numChannels;
      const frames = samples.length / ch;
      let l = new Float32Array(frames), r = new Float32Array(frames);
      for (let i = 0; i < frames; i++) {
        const vl = samples[i * ch] / 32768;
        const vr = (ch > 1 ? samples[i * ch + 1] : samples[i * ch]) / 32768;
        l[i] = vl; r[i] = vr;
      }
      if (sr !== targetRate) {
        l = resampleLinear(l, sr, targetRate);
        r = resampleLinear(r, sr, targetRate);
      }
      const start = Math.min(totalFrames - 1, Math.max(0, Math.floor((s.atSec || 0) * targetRate)));
      const gain = dbToGain(mixDb);
      for (let i = 0; i < l.length && start + i < totalFrames; i++) {
        left[start + i] += gain * l[i];
        right[start + i] += gain * r[i];
      }
    }

    const wavBuf = encodeWavStereo({ left, right, sampleRate: targetRate });
    const b64 = `data:audio/wav;base64,${wavBuf.toString('base64')}`;
    return NextResponse.json({ ok: true, wav: b64 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}


