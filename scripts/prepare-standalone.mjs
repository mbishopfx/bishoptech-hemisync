import { cp, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const standaloneDir = path.join(root, '.next', 'standalone');
const publicDir = path.join(root, 'public');
const staticDir = path.join(root, '.next', 'static');

await access(standaloneDir);
await cp(publicDir, path.join(standaloneDir, 'public'), { recursive: true });
await cp(staticDir, path.join(standaloneDir, '.next', 'static'), { recursive: true });

process.stdout.write('Prepared standalone public and static assets.\n');