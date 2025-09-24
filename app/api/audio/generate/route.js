import { NextResponse } from 'next/server';
import { validate, GenerateAudioInputSchema } from '@/lib/validation/schemas';
import { pickPreset } from '@/lib/audio/presets';
import { generateBreathEnvelope } from '@/lib/audio/breath';
import {
  buildSessionBed,
  encodeOutputs
} from '@/lib/audio/engine/pipeline';
import { generateOceanBackground } from '@/lib/audio/background';
import { getLogger } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req) {
  const logger = getLogger();
  try {
    const body = await req.json();
    const input = validate(GenerateAudioInputSchema, body);

    const preset = pickPreset({ programPreset: input.programPreset, focusLevel: input.focusLevel });

    const deltaFrom = preset.deltaHzPath?.[0]?.hz || 10;
    const deltaTo = preset.deltaHzPath?.[preset.deltaHzPath.length - 1]?.hz || 6;

    let breath = null;
    if (input.breathGuide?.enabled) {
      const envelope = generateBreathEnvelope(input.breathGuide.pattern || 'coherent-5.5', 44100, input.lengthSec);
      breath = { envelope, depth: 0.1 };
    }

    let background = null;
    if (input.background?.type === 'ocean') {
      background = generateOceanBackground(44100, input.lengthSec, { mixDb: input.background.mixDb ?? -22 });
    }

    const bed = await buildSessionBed({
      lengthSec: input.lengthSec,
      sampleRate: 44100,
      focusPreset: preset,
      baseFreqHz: input.baseFreqHz,
      deltaOverrides: { from: deltaFrom, to: deltaTo },
      noise: preset.noise,
      breath,
      background,
      modes: { ...{ binaural: true, monaural: false, isochronic: false }, ...(input.entrainmentModes || {}), ...(preset.modes || {}) }
    });

    const { wavBuffer, mp3Buffer } = await encodeOutputs({ left: bed.left, right: bed.right, sampleRate: bed.sampleRate, withMp3: true });

    const wavB64 = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
    const mp3B64 = mp3Buffer ? `data:audio/mpeg;base64,${mp3Buffer.toString('base64')}` : null;

    return NextResponse.json({ ok: true, presetUsed: preset, wav: wavB64, mp3: mp3B64 });
  } catch (err) {
    logger.error({ err }, 'audio generate error');
    const status = err.status || 500;
    return NextResponse.json({ error: err.message || 'Internal error' }, { status });
  }
}

