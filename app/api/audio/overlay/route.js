import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { WaveFile } from 'wavefile';
import { synthesizeBinaural, encodeWavStereo, encodeMp3Stereo } from '@/lib/audio/synth';
import { spawn } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

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

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      track = 'track1',
      band = 'alpha', // alpha|theta|delta|beta or numeric Hz
      bpm = 120,
      overlayDb = -10,
      baseFreqHz = 240,
      lengthSec // optional; default to full track length
    } = body || {};

    const bandHz = typeof band === 'number' ? band : (
      band === 'alpha' ? 10 : band === 'theta' ? 6 : band === 'delta' ? 3 : band === 'beta' ? 16 : 10
    );

    // 1) Resolve background file from /audio (supports .wav or .mp3). If 'trackN', pick Nth file.
    const audioDir = path.join(process.cwd(), 'audio');
    async function resolveTrack() {
      // if direct file exists
      const direct = path.join(audioDir, track);
      try { const st = await fs.stat(direct); if (st.isFile()) return direct; } catch {}
      // try with common extensions
      for (const ext of ['.wav', '.mp3']) {
        const p = path.join(audioDir, `${track}${ext}`);
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

    async function loadAsFloat32Stereo(p) {
      if (/\.wav$/i.test(p)) {
        const file = await fs.readFile(p);
        return wavToFloat32Stereo(file);
      }
      if (/\.mp3$/i.test(p)) {
        if (!ffmpegPath) throw new Error('ffmpeg binary not available to decode mp3');
        // decode mp3 to wav via ffmpeg pipe
        const chunks = [];
        await new Promise((resolve, reject) => {
          const child = spawn(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-i', p, '-f', 'wav', 'pipe:1']);
          child.stdout.on('data', (d) => chunks.push(Buffer.from(d)));
          child.on('error', reject);
          child.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`)));
        });
        const wavBuf = Buffer.concat(chunks);
        return wavToFloat32Stereo(wavBuf);
      }
      throw new Error('Unsupported audio format');
    }

    const music = await loadAsFloat32Stereo(resolvedPath);

    const targetRate = 44100;
    let musL = music.left, musR = music.right;
    if (music.sampleRate !== targetRate) {
      musL = resampleLinear(musL, music.sampleRate, targetRate);
      musR = resampleLinear(musR, music.sampleRate, targetRate);
    }

    const totalLength = Math.min(
      lengthSec ? Math.floor(lengthSec) : Math.floor(musL.length / targetRate),
      Math.floor(musL.length / targetRate)
    );
    const totalFrames = totalLength * targetRate;
    musL = musL.subarray(0, totalFrames);
    musR = musR.subarray(0, totalFrames);

    // 2) Synthesize hemisync overlay fixed delta frequency with isochronic gate at BPM
    const bed = synthesizeBinaural({
      lengthSec: totalLength,
      sampleRate: targetRate,
      baseFreqHz,
      deltaHzFrom: bandHz,
      deltaHzTo: bandHz,
      noise: null,
      breath: null,
      modes: { binaural: true, monaural: true, isochronic: true },
      background: null
    });

    const gate = makeBeatGate(targetRate, totalLength, bpm);
    for (let i = 0; i < bed.left.length; i++) { bed.left[i] *= gate[i]; bed.right[i] *= gate[i]; }

    // 3) Mix music with overlay
    const ovGain = dbToGain(overlayDb);
    const outL = new Float32Array(totalFrames);
    const outR = new Float32Array(totalFrames);
    for (let i = 0; i < totalFrames; i++) {
      const l = musL[i] + ovGain * bed.left[i];
      const r = musR[i] + ovGain * bed.right[i];
      outL[i] = Math.max(-1, Math.min(1, l));
      outR[i] = Math.max(-1, Math.min(1, r));
    }

    // 4) Encode
    const wavBuf = encodeWavStereo({ left: outL, right: outR, sampleRate: targetRate });
    let mp3B64 = null;
    try {
      const mp3Buf = encodeMp3Stereo({ left: outL, right: outR, sampleRate: targetRate, kbps: 160 });
      mp3B64 = `data:audio/mpeg;base64,${mp3Buf.toString('base64')}`;
    } catch {}
    const wavB64 = `data:audio/wav;base64,${wavBuf.toString('base64')}`;

    return NextResponse.json({ ok: true, wav: wavB64, mp3: mp3B64, meta: { bandHz, bpm, overlayDb, lengthSec: totalLength } });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}


