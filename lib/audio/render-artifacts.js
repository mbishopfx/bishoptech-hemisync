import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ensureRenderArtifactRoot } from '@/lib/runtime/deployment';

function slugifyBaseName(value) {
  const slug = String(value || 'session')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'session';
}

function assertSafeArtifactId(artifactId) {
  if (!/^[a-z0-9-]+$/i.test(String(artifactId || ''))) {
    throw new Error('Invalid artifact id');
  }
  return artifactId;
}

export async function persistRenderArtifacts({ baseName = 'session', wavBuffer, mp3Buffer }) {
  const artifactRoot = await ensureRenderArtifactRoot();
  const artifactId = `${Date.now()}-${randomUUID()}`;
  const safeBaseName = slugifyBaseName(baseName);
  const artifactDir = path.join(artifactRoot, artifactId);

  await fs.mkdir(artifactDir, { recursive: true });

  const files = {};

  if (wavBuffer) {
    const storedName = 'master.wav';
    await fs.writeFile(path.join(artifactDir, storedName), wavBuffer);
    files.wav = {
      filename: `${safeBaseName}.wav`,
      contentType: 'audio/wav',
      bytes: wavBuffer.length,
      url: `/api/audio/artifacts/${artifactId}/wav`
    };
  }

  if (mp3Buffer) {
    const storedName = 'master.mp3';
    await fs.writeFile(path.join(artifactDir, storedName), mp3Buffer);
    files.mp3 = {
      filename: `${safeBaseName}.mp3`,
      contentType: 'audio/mpeg',
      bytes: mp3Buffer.length,
      url: `/api/audio/artifacts/${artifactId}/mp3`
    };
  }

  await fs.writeFile(
    path.join(artifactDir, 'metadata.json'),
    JSON.stringify(
      {
        version: 1,
        artifactId,
        createdAt: new Date().toISOString(),
        files
      },
      null,
      2
    )
  );

  return { artifactId, files };
}

export async function readRenderArtifact({ artifactId, format }) {
  const artifactRoot = await ensureRenderArtifactRoot();
  const safeArtifactId = assertSafeArtifactId(artifactId);
  if (!['wav', 'mp3'].includes(format)) {
    throw new Error('Unsupported artifact format');
  }

  const artifactDir = path.join(artifactRoot, safeArtifactId);
  const metadataPath = path.join(artifactDir, 'metadata.json');
  const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf8'));
  const fileMeta = metadata?.files?.[format];

  if (!fileMeta) {
    throw new Error('Artifact not found');
  }

  return {
    artifactId: safeArtifactId,
    filePath: path.join(artifactDir, `master.${format}`),
    ...fileMeta
  };
}
