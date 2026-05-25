import fs from 'node:fs';
import path from 'node:path';
import { decodeAudioFile } from '../lib/audio/engine/import.js';
import { encodeOutputs } from '../lib/audio/engine/pipeline.js';
import { randomUUID } from 'crypto';

// Replicate the concatenation function from route.js
function concatenateAudioBuffers(buffers, sampleRate, crossfadeSec = 0.5) {
  if (!buffers || buffers.length === 0) return null;
  if (buffers.length === 1) {
    return {
      left: Float32Array.from(buffers[0].left),
      right: Float32Array.from(buffers[0].right)
    };
  }

  const crossfadeSamples = Math.floor(crossfadeSec * sampleRate);

  // Calculate total duration in frames
  let totalFrames = 0;
  for (let i = 0; i < buffers.length; i++) {
    totalFrames += buffers[i].left.length;
    if (i > 0) {
      totalFrames -= crossfadeSamples;
    }
  }

  const left = new Float32Array(totalFrames);
  const right = new Float32Array(totalFrames);

  let offset = 0;
  for (let i = 0; i < buffers.length; i++) {
    const current = buffers[i];
    const currentLen = current.left.length;

    if (i === 0) {
      // First track: copy entirely
      left.set(current.left, 0);
      right.set(current.right, 0);
      offset += currentLen;
    } else {
      // Subsequent tracks: apply linear crossfade over the overlap boundary
      const overlapStart = offset - crossfadeSamples;

      for (let j = 0; j < crossfadeSamples; j++) {
        const fadeOutRatio = 1 - (j / crossfadeSamples);
        const fadeInRatio = j / crossfadeSamples;
        const idxDest = overlapStart + j;

        left[idxDest] = (left[idxDest] * fadeOutRatio) + (current.left[j] * fadeInRatio);
        right[idxDest] = (right[idxDest] * fadeOutRatio) + (current.right[j] * fadeInRatio);
      }

      // Copy the remaining non-overlapping samples of the current track
      const restLength = currentLen - crossfadeSamples;
      if (restLength > 0) {
        const sourceOffset = crossfadeSamples;
        const destOffset = overlapStart + crossfadeSamples;

        left.set(current.left.subarray(sourceOffset), destOffset);
        right.set(current.right.subarray(sourceOffset), destOffset);
      }

      offset = overlapStart + currentLen;
    }
  }

  return { left, right };
}

async function downloadToTemp(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download audio from: ${url}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const tempDir = path.resolve(process.cwd(), 'supabase/.temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const ext = url.toLowerCase().includes('.webm') ? '.webm' : 
              url.toLowerCase().includes('.mp3') ? '.mp3' : '.wav';
  const tempPath = path.join(tempDir, `${randomUUID()}${ext}`);
  
  await fs.promises.writeFile(tempPath, buffer);
  return tempPath;
}

async function runVerify() {
  console.log('Initiating Session Weaver DSP verification pipeline...');

  // Tone 1: Phased State Transitions: Alpha to Theta Lucid Drift
  const url1 = 'https://thlpuqurpjisipxzbuav.supabase.co/storage/v1/object/public/agentic-tones/35a78a8d-31b5-49cd-9052-ea27aec00a37/master.webm';
  // Tone 2: Phased State Transitions: Beta to Alpha Focus Shift
  const url2 = 'https://thlpuqurpjisipxzbuav.supabase.co/storage/v1/object/public/agentic-tones/0b313ca5-e092-442c-b3df-74b40d3f1c72/master.webm';

  console.log('Downloading WebM assets in parallel...');
  const paths = await Promise.all([downloadToTemp(url1), downloadToTemp(url2)]);
  console.log(`Downloaded to temporary paths: ${paths.join(', ')}`);

  try {
    console.log('Decoding WebM files to raw PCM arrays using custom FFmpeg interface...');
    const decoded1 = await decodeAudioFile(paths[0]);
    const decoded2 = await decodeAudioFile(paths[1]);

    console.log(`Asset 1: ${decoded1.left.length} samples, Sample Rate: ${decoded1.sampleRate} Hz`);
    console.log(`Asset 2: ${decoded2.left.length} samples, Sample Rate: ${decoded2.sampleRate} Hz`);

    const crossfadeSec = 0.5;
    const sampleRate = decoded1.sampleRate;
    const crossfadeSamples = Math.floor(crossfadeSec * sampleRate);

    console.log(`Concatenating tracks with a ${crossfadeSec}s linear crossfade (${crossfadeSamples} samples overlap)...`);
    const chained = concatenateAudioBuffers([decoded1, decoded2], sampleRate, crossfadeSec);

    const expectedFrames = decoded1.left.length + decoded2.left.length - crossfadeSamples;
    console.log(`Expected total output frames: ${expectedFrames}`);
    console.log(`Actual total output frames: ${chained.left.length}`);

    if (chained.left.length !== expectedFrames) {
      throw new Error(`Frame count mismatch: expected ${expectedFrames}, got ${chained.left.length}`);
    }

    console.log('Encoding concatenated Float32 arrays into master outputs (WAV)...');
    const { wavBuffer } = await encodeOutputs({
      left: chained.left,
      right: chained.right,
      sampleRate,
      wavBitDepthCode: '16',
      withWebm: false
    });

    const outPath = path.resolve(process.cwd(), 'supabase/.temp/verify-weaved-output.wav');
    await fs.promises.writeFile(outPath, wavBuffer);

    console.log(`\n🎉 Verification Completed Successfully!`);
    console.log(`Output WAV size: ${(wavBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`Saved output file to: ${outPath}\n`);

  } finally {
    // Clean up temporary downloaded WebM files
    console.log('Cleaning up temp files...');
    await Promise.all(paths.map(p => fs.promises.unlink(p).catch(() => {})));
  }
}

runVerify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
