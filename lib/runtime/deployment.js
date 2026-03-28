import path from 'path';
import { promises as fs } from 'fs';

export function isRailwayRuntime() {
  return Boolean(process.env.RAILWAY_PROJECT_ID || process.env.RAILWAY_ENVIRONMENT_ID);
}

export function getRenderArtifactRoot() {
  if (process.env.RENDER_ARTIFACTS_DIR) {
    return path.resolve(process.env.RENDER_ARTIFACTS_DIR);
  }

  if (isRailwayRuntime()) {
    return path.resolve('/app/data/audio-renders');
  }

  return path.join(process.cwd(), '.cache', 'audio-renders');
}

export async function ensureRenderArtifactRoot() {
  const artifactRoot = getRenderArtifactRoot();
  await fs.mkdir(artifactRoot, { recursive: true });
  return artifactRoot;
}

export async function inspectRuntimeHealth() {
  const artifactRoot = getRenderArtifactRoot();
  let artifactStorageWritable = false;
  let artifactStorageError = null;

  try {
    await fs.mkdir(artifactRoot, { recursive: true });
    const probePath = path.join(artifactRoot, '.healthcheck');
    await fs.writeFile(probePath, 'ok');
    await fs.unlink(probePath);
    artifactStorageWritable = true;
  } catch (error) {
    artifactStorageError = error.message;
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    railway: {
      detected: isRailwayRuntime(),
      projectId: process.env.RAILWAY_PROJECT_ID || null,
      environmentId: process.env.RAILWAY_ENVIRONMENT_ID || null,
      environmentName: process.env.RAILWAY_ENVIRONMENT_NAME || null,
      serviceId: process.env.RAILWAY_SERVICE_ID || null,
      serviceName: process.env.RAILWAY_SERVICE_NAME || null,
      publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || null
    },
    gitCommitSha:
      process.env.RAILWAY_GIT_COMMIT_SHA ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      null,
    artifactStorage: {
      root: artifactRoot,
      writable: artifactStorageWritable,
      error: artifactStorageError
    }
  };
}
