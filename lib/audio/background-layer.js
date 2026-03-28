import path from 'path';
import { generateOceanBackground } from './background';
import { importStereoBed } from './engine/pipeline';
import { dbToGain } from './engine/utils';
import { pickAmbientAsset } from './assets';

function loopStereoWithCrossfade(left, right, targetFrames, crossfadeFrames) {
  if (!left?.length || !right?.length || targetFrames <= 0) {
    return {
      left: new Float32Array(Math.max(0, targetFrames)),
      right: new Float32Array(Math.max(0, targetFrames))
    };
  }

  if (left.length >= targetFrames && right.length >= targetFrames) {
    return {
      left: left.subarray(0, targetFrames),
      right: right.subarray(0, targetFrames)
    };
  }

  const outputLeft = new Float32Array(targetFrames);
  const outputRight = new Float32Array(targetFrames);
  const overlapFrames = Math.max(0, Math.min(crossfadeFrames || 0, Math.floor(left.length * 0.25)));
  let writePosition = 0;
  let loopCount = 0;

  while (writePosition < targetFrames) {
    const remaining = targetFrames - writePosition;
    const segmentFrames = Math.min(left.length, remaining);

    if (loopCount === 0 || overlapFrames === 0) {
      for (let frame = 0; frame < segmentFrames; frame += 1) {
        outputLeft[writePosition + frame] = left[frame];
        outputRight[writePosition + frame] = right[frame];
      }
      writePosition += segmentFrames;
      loopCount += 1;
      continue;
    }

    const overlap = Math.min(overlapFrames, segmentFrames, writePosition);
    const start = writePosition - overlap;

    for (let frame = 0; frame < overlap; frame += 1) {
      const progress = frame / Math.max(1, overlap - 1);
      const fadeOut = Math.cos(progress * Math.PI * 0.5);
      const fadeIn = Math.sin(progress * Math.PI * 0.5);
      outputLeft[start + frame] = outputLeft[start + frame] * fadeOut + left[frame] * fadeIn;
      outputRight[start + frame] = outputRight[start + frame] * fadeOut + right[frame] * fadeIn;
    }

    for (let frame = overlap; frame < segmentFrames; frame += 1) {
      const destination = start + frame;
      if (destination >= targetFrames) break;
      outputLeft[destination] = left[frame];
      outputRight[destination] = right[frame];
    }

    writePosition = start + segmentFrames;
    loopCount += 1;
  }

  return { left: outputLeft, right: outputRight };
}

export async function buildBackgroundLayer({ background, sampleRate, lengthSec }) {
  if (!background) return null;

  if (background.type === 'ocean') {
    return generateOceanBackground(sampleRate, lengthSec, { mixDb: background.mixDb ?? -22 });
  }

  if (background.type === 'asset') {
    const asset = pickAmbientAsset(background.assetId || background.assetFile);
    if (!asset) {
      throw new Error('Unknown ambient asset');
    }

    const filePath = path.resolve(process.cwd(), 'audio', asset.fileName);
    const source = await importStereoBed({ filePath, sampleRate });
    const totalFrames = Math.floor(sampleRate * lengthSec);
    const looped = loopStereoWithCrossfade(
      source.left,
      source.right,
      totalFrames,
      Math.round(sampleRate * (background.crossfadeSec ?? asset.loopCrossfadeSec ?? 2.5))
    );
    const gain = dbToGain(background.mixDb ?? asset.defaultMixDb ?? -24);

    for (let frame = 0; frame < totalFrames; frame += 1) {
      looped.left[frame] *= gain;
      looped.right[frame] *= gain;
    }

    return { ...looped, sampleRate, asset };
  }

  return null;
}
