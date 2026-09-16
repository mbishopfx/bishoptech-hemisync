import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pipeline from '../../../lib/audio/engine/pipeline.js';

const { buildSessionBed, encodeOutputs } = pipeline;

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    lengthSec: 90,
    carrierFrom: 220,
    carrierTo: 220,
    deltaFrom: 10,
    deltaTo: 6,
    output: 'audio.wav'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--lengthSec' && next) options.lengthSec = Number(next);
    if (arg === '--carrierFrom' && next) options.carrierFrom = Number(next);
    if (arg === '--carrierTo' && next) options.carrierTo = Number(next);
    if (arg === '--deltaFrom' && next) options.deltaFrom = Number(next);
    if (arg === '--deltaTo' && next) options.deltaTo = Number(next);
    if (arg === '--output' && next) options.output = next;
  }
  return options;
}

async function run() {
  const options = parseArgs();
  console.log(`Generating frequency audio...`);
  console.log(`- Duration: ${options.lengthSec}s`);
  console.log(`- Carrier: ${options.carrierFrom}Hz -> ${options.carrierTo}Hz`);
  console.log(`- Delta: ${options.deltaFrom}Hz -> ${options.deltaTo}Hz`);
  console.log(`- Output: ${options.output}`);

  try {
    const bed = await buildSessionBed({
      lengthSec: options.lengthSec,
      sampleRate: 44100,
      carrierLeftHzFrom: options.carrierFrom,
      carrierLeftHzTo: options.carrierTo,
      deltaOverrides: { from: options.deltaFrom, to: options.deltaTo },
      // Keep this loop's default output as clean binaural carriers only.
      noise: null,
      modes: { binaural: true, monaural: false, isochronic: false }
    });

    const { wavBuffer } = await encodeOutputs({
      left: bed.left,
      right: bed.right,
      sampleRate: bed.sampleRate,
      wavBitDepthCode: '16',
      withWebm: false,
      masteringProfile: { ceilingDb: -1.1, dcBlockHz: 18, lookaheadMs: 5, attackMs: 2, releaseMs: 180 }
    });

    await fs.mkdir(path.dirname(options.output), { recursive: true });
    await fs.writeFile(options.output, wavBuffer);
    console.log(`Audio successfully written to ${options.output}`);
  } catch (err) {
    console.error(`Audio generation failed:`, err);
    process.exit(1);
  }
}

run();
