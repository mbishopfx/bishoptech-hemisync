import json
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-12'
index = json.loads((OUT / f'{DATE}_candidate_index.json').read_text())
candidates = index['candidates']

def resolve(item):
    try:
        proc = subprocess.run(
            ['yt-dlp', '--dump-single-json', '--skip-download', '--no-warnings', '--no-playlist', item['url']],
            capture_output=True, text=True, timeout=120,
        )
        if proc.returncode == 0 and proc.stdout.strip():
            data = json.loads(proc.stdout)
            return {'id': item['id'], 'url': item['url'], 'resolved': True, 'metadata': {
                key: data.get(key) for key in (
                    'id', 'title', 'channel', 'uploader', 'upload_date', 'timestamp',
                    'duration', 'license', 'availability', 'live_status', 'language',
                    'channel_id', 'webpage_url', 'description', 'categories', 'view_count',
                )
            }}
        return {'id': item['id'], 'url': item['url'], 'resolved': False, 'error': proc.stderr[-1600:]}
    except Exception as exc:
        return {'id': item['id'], 'url': item['url'], 'resolved': False, 'error': repr(exc)}

rows = []
with ThreadPoolExecutor(max_workers=8) as pool:
    futures = {pool.submit(resolve, item): item for item in candidates}
    for number, future in enumerate(as_completed(futures), 1):
        rows.append(future.result())
        if number % 25 == 0:
            print(f'resolved {number}/{len(candidates)}', flush=True)
rows.sort(key=lambda row: row['id'])
(OUT / f'{DATE}_metadata.json').write_text(json.dumps({
    'generated_at': datetime.now().astimezone().isoformat(),
    'candidate_count': len(candidates), 'rows': rows,
}, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({
    'candidate_count': len(candidates),
    'resolved': sum(bool(row.get('resolved')) for row in rows),
    'unresolved': sum(not row.get('resolved') for row in rows),
}, indent=2), flush=True)
