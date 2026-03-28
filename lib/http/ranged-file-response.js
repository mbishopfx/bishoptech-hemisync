import { promises as fs } from 'fs';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { NextResponse } from 'next/server';

function parseRange(rangeHeader, size) {
  if (!rangeHeader) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
  if (!match) return 'invalid';

  const startToken = match[1];
  const endToken = match[2];
  let start = startToken === '' ? undefined : Number(startToken);
  let end = endToken === '' ? undefined : Number(endToken);

  if (Number.isNaN(start) || Number.isNaN(end)) return 'invalid';

  if (start === undefined && end === undefined) return 'invalid';

  if (start === undefined) {
    const suffixLength = end;
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) return 'invalid';
    start = Math.max(0, size - suffixLength);
    end = size - 1;
  } else {
    if (end === undefined || end >= size) end = size - 1;
  }

  if (start < 0 || start >= size || end < start) return 'invalid';
  return { start, end };
}

export async function createRangedFileResponse({
  filePath,
  request,
  contentType,
  filename,
  cacheControl = 'private, no-store'
}) {
  const stats = await fs.stat(filePath);
  const range = parseRange(request.headers.get('range'), stats.size);

  if (range === 'invalid') {
    return new NextResponse(null, {
      status: 416,
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes */${stats.size}`
      }
    });
  }

  const headers = {
    'Accept-Ranges': 'bytes',
    'Cache-Control': cacheControl,
    'Content-Disposition': `inline; filename="${filename}"`,
    'Content-Type': contentType
  };

  if (!range) {
    headers['Content-Length'] = String(stats.size);
    return new NextResponse(Readable.toWeb(createReadStream(filePath)), {
      status: 200,
      headers
    });
  }

  const { start, end } = range;
  headers['Content-Length'] = String(end - start + 1);
  headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;

  return new NextResponse(
    Readable.toWeb(
      createReadStream(filePath, {
        start,
        end
      })
    ),
    {
      status: 206,
      headers
    }
  );
}
