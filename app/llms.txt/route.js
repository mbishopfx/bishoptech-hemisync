import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const runtime = 'nodejs';

export async function GET() {
  const filePath = join(process.cwd(), 'public', 'llms.txt');
  const body = await readFile(filePath, 'utf8');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate'
    }
  });
}