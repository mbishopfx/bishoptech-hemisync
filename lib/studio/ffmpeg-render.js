import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { getFfmpegPath } from '../audio/engine/ffmpeg.js';
import { pickAmbientAsset } from '../audio/assets.js';

function dbToGain(db) {
  return 10 ** (Number(db || 0) / 20);
}

function stageFrequency(stage, channel, binaural) {
  const carrier = Number(stage.carrierHz || 220);
  if (channel === 'left' || !binaural) return { from: carrier, to: carrier };
  return {
    from: carrier + Number(stage.deltaHz?.from || 0),
    to: carrier + Number(stage.deltaHz?.to || 0)
  };
}

function buildContinuousSignal(stages, channel, binaural) {
  let elapsed = 0;
  let cycles = 0;
  const segments = stages.map((stage) => {
    const duration = Number(stage.durationSec);
    const frequency = stageFrequency(stage, channel, binaural);
    const localTime = `(t-${elapsed})`;
    const slope = frequency.to - frequency.from;
    const phase = `${cycles}+${frequency.from}*${localTime}+(${slope})*${localTime}*${localTime}/(2*${duration})`;
    elapsed += duration;
    cycles += ((frequency.from + frequency.to) / 2) * duration;
    return { end: elapsed, sample: `sin(2*PI*(${phase}))` };
  });

  return segments.reduceRight(
    (next, segment) => `if(lt(t,${segment.end}),${segment.sample},${next})`,
    segments.at(-1)?.sample || '0'
  );
}

function buildToneExpressions(spec) {
  const binaural = spec.entrainmentModes.binaural;
  let left = buildContinuousSignal(spec.stages, 'left', binaural);
  let right = buildContinuousSignal(spec.stages, 'right', binaural);

  if (spec.entrainmentModes.monaural) {
    const center = buildContinuousSignal(spec.stages, 'left', false);
    left = `(0.82*(${left})+0.18*(${center}))`;
    right = `(0.82*(${right})+0.18*(${center}))`;
  }

  if (spec.entrainmentModes.isochronic) {
    const pulseHz = Math.max(0.1, Number(spec.stages[Math.floor(spec.stages.length / 2)]?.deltaHz?.to || 6));
    const modulation = `(0.78+0.22*gt(sin(2*PI*${pulseHz}*t),0))`;
    left = `(${left})*${modulation}`;
    right = `(${right})*${modulation}`;
  }

  return { left: `0.16*(${left})`, right: `0.16*(${right})` };
}

function breathFrequency(spec) {
  if (!spec.breathGuide.enabled) return null;
  if (spec.breathGuide.pattern === '4-7-8') return 1 / 19;
  if (spec.breathGuide.pattern === 'box') return 1 / 16;
  return Number(spec.breathGuide.bpm || 5.5) / 60;
}

function buildFilterGraph(spec, outputLabels) {
  const expressions = buildToneExpressions(spec);
  const duration = Number(spec.durationSec);
  const graph = [
    `aevalsrc=exprs='${expressions.left}|${expressions.right}':s=48000:d=${duration}:c=stereo[tone]`
  ];

  if (spec.background.type === 'asset') {
    graph.push(`[0:a]atrim=duration=${duration},asetpts=PTS-STARTPTS,aresample=48000,aformat=channel_layouts=stereo,volume=${dbToGain(spec.background.mixDb)}[background]`);
    graph.push('[tone][background]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mixed]');
  } else if (spec.background.type === 'ocean') {
    graph.push(`anoisesrc=color=pink:amplitude=${dbToGain(spec.background.mixDb) * 0.35}:s=48000:d=${duration},lowpass=f=1800,highpass=f=55,pan=stereo|c0=c0|c1=c0[background]`);
    graph.push('[tone][background]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[mixed]');
  } else {
    graph.push('[tone]anull[mixed]');
  }

  const filters = ['highpass=f=18'];
  const breathHz = breathFrequency(spec);
  if (breathHz) filters.push(`tremolo=f=${Math.max(0.1, breathHz)}:d=0.1`);
  if (spec.fades.inSec > 0) filters.push(`afade=t=in:st=0:d=${spec.fades.inSec}`);
  if (spec.fades.outSec > 0) filters.push(`afade=t=out:st=${Math.max(0, duration - spec.fades.outSec)}:d=${spec.fades.outSec}`);
  filters.push('alimiter=limit=0.891:level=disabled');
  filters.push('aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo');

  if (outputLabels.length === 2) {
    graph.push(`[mixed]${filters.join(',')},asplit=2[${outputLabels[0]}][${outputLabels[1]}]`);
  } else {
    graph.push(`[mixed]${filters.join(',')}[${outputLabels[0]}]`);
  }
  return graph.join(';\n');
}

function runFfmpeg(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    const stderr = [];
    child.stderr.on('data', (chunk) => stderr.push(chunk));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) return resolve();
      reject(new Error(Buffer.concat(stderr).toString('utf8').trim() || `ffmpeg exited with code ${code}`));
    });
  });
}

export async function renderStudioWithFfmpeg(spec) {
  const binary = getFfmpegPath();
  if (!binary) throw new Error('ffmpeg binary not available');

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cognistration-studio-'));
  const graphPath = path.join(tempDir, 'session.filter');
  const wavPath = path.join(tempDir, 'master.wav');
  const mp3Path = path.join(tempDir, 'master.mp3');
  const selected = new Set(spec.exportFormats);
  const labels = [...selected];

  try {
    await fs.writeFile(graphPath, buildFilterGraph(spec, labels), 'utf8');
    const args = ['-y', '-hide_banner', '-loglevel', 'error'];
    if (spec.background.type === 'asset') {
      const asset = pickAmbientAsset(spec.background.assetId);
      if (!asset) throw new Error('Unknown ambient asset');
      args.push('-stream_loop', '-1', '-i', path.resolve(process.cwd(), 'audio', asset.fileName));
    }
    args.push('-filter_complex_script', graphPath);
    for (const label of labels) {
      args.push('-map', `[${label}]`);
      if (label === 'wav') args.push('-c:a', 'pcm_s24le', '-ar', '48000', '-ac', '2', wavPath);
      if (label === 'mp3') args.push('-c:a', 'libmp3lame', '-b:a', '192k', '-ar', '48000', '-ac', '2', mp3Path);
    }
    await runFfmpeg(binary, args);

    return {
      wavBuffer: selected.has('wav') ? await fs.readFile(wavPath) : null,
      mp3Buffer: selected.has('mp3') ? await fs.readFile(mp3Path) : null,
      mastering: {
        ceilingDb: -1,
        postPeak: 0.891,
        renderer: 'ffmpeg-streaming'
      }
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
