import path from 'path';
import { existsSync } from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let cachedFfmpegPath = null;

export function getFfmpegPath() {
  if (cachedFfmpegPath) {
    return cachedFfmpegPath;
  }

  const binaryName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  const candidatePaths = [
    process.env.FFMPEG_PATH,
    path.join(process.cwd(), 'bin', binaryName),
    path.join(process.cwd(), 'node_modules', 'ffmpeg-static', binaryName),
    path.join(process.cwd(), '..', 'node_modules', 'ffmpeg-static', binaryName),
    path.join(process.cwd(), '..', '..', 'node_modules', 'ffmpeg-static', binaryName),
    path.join(process.cwd(), '..', '..', '..', 'node_modules', 'ffmpeg-static', binaryName)
  ].filter(Boolean);

  for (const candidatePath of candidatePaths) {
    if (existsSync(candidatePath)) {
      cachedFfmpegPath = candidatePath;
      return cachedFfmpegPath;
    }
  }

  try {
    const resolved = require('ffmpeg-static');
    if (resolved && existsSync(resolved)) {
      cachedFfmpegPath = resolved;
      return cachedFfmpegPath;
    }
  } catch {}

  return null;
}
