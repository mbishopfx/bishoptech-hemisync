import json
import re
import subprocess
from datetime import datetime
from pathlib import Path

try:
    from ddgs import DDGS
except Exception:
    DDGS = None

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-11'
AFTER = '2026-08-04'

TOPIC_QUERIES = [
    'astral projection out of body experience lecture interview',
    'Robert Monroe astral projection consciousness interview',
    'William Buhlman out of body experience lecture',
    'Michael Raduga out of body experience lecture',
    'meditation consciousness lecture interview English',
    'mindfulness meditation practical lecture university',
    'intuition synchronicity consciousness lecture interview',
    'Carl Jung synchronicity philosophy lecture',
    'metaphysics consciousness philosophy lecture',
    'Donald Hoffman consciousness interview lecture',
    'Bernardo Kastrup analytic idealism consciousness interview',
    'frequency healing sound wellness responsible lecture',
    'sound meditation singing bowls lecture wellness',
    'consciousness research neuroscience philosophy discussion',
    'astral projection out of body experience Creative Commons',
    'meditation consciousness Creative Commons lecture',
    'synchronicity consciousness Creative Commons lecture',
    'metaphysics philosophy Creative Commons lecture',
]
RIGHTS_QUERIES = [
    '"Published with permission" meditation consciousness',
    '"Published with permission" astral projection',
    '"Published with permission" out of body experience',
    '"Published with permission" synchronicity consciousness',
    '"Creative Commons Attribution" consciousness lecture',
    '"Creative Commons Attribution" meditation lecture',
    '"Creative Commons Attribution" metaphysics philosophy lecture',
    '"Creative Commons Attribution" sound frequency wellness',
]
DDGS_QUERIES = [
    'site:youtube.com/watch meditation consciousness lecture "Creative Commons"',
    'site:youtube.com/watch astral projection lecture "published with permission"',
    'site:youtube.com/watch synchronicity consciousness interview permission',
    'site:youtube.com/watch metaphysics lecture "Creative Commons Attribution"',
    'site:youtube.com/watch sound healing frequency lecture permission',
]

URL_RE = re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})')

def video_id(value):
    value = value or ''
    if re.fullmatch(r'[A-Za-z0-9_-]{11}', value):
        return value
    match = URL_RE.search(value)
    return match.group(1) if match else None

def canonical(video):
    return f'https://www.youtube.com/watch?v={video}'

def run_search(query):
    term = f'ytsearch10:{query} after:{AFTER}'
    proc = subprocess.run(
        ['yt-dlp', '--flat-playlist', '--dump-single-json', '--skip-download', '--no-warnings', term],
        capture_output=True, text=True, timeout=180,
    )
    result = {'query': query, 'term': term, 'returncode': proc.returncode, 'stderr': proc.stderr[-1500:]}
    if proc.returncode == 0:
        try:
            data = json.loads(proc.stdout)
            result['entries'] = [
                {key: entry.get(key) for key in ('id', 'title', 'channel', 'uploader', 'url', 'webpage_url')}
                for entry in (data.get('entries') or []) if entry and entry.get('id')
            ]
        except Exception as exc:
            result['parse_error'] = repr(exc)
            result['entries'] = []
    else:
        result['entries'] = []
    return result

def prior_ids():
    known = set()
    for path in OUT.iterdir():
        if path.name.startswith(DATE) or path.name.startswith('run_source_scout_20260911'):
            continue
        if path.suffix.lower() not in {'.json', '.md', '.txt'}:
            continue
        try:
            known.update(URL_RE.findall(path.read_text(errors='ignore')))
        except Exception:
            pass
    try:
        known.update(URL_RE.findall((ROOT / 'sources' / 'links.txt').read_text(errors='ignore')))
    except Exception:
        pass
    return known

def ddgs_search():
    rows = []
    if DDGS is None:
        return rows, 'ddgs unavailable'
    for query in DDGS_QUERIES:
        row = {'query': query, 'results': []}
        try:
            for item in DDGS().text(query, max_results=10):
                row['results'].append({key: item.get(key) for key in ('title', 'href', 'body')})
        except Exception as exc:
            row['error'] = repr(exc)
        rows.append(row)
    return rows, None

queries = TOPIC_QUERIES + RIGHTS_QUERIES
print(f'running direct discovery: {len(queries)} queries', flush=True)
direct = []
for number, query in enumerate(queries, 1):
    try:
        result = run_search(query)
    except Exception as exc:
        result = {'query': query, 'returncode': -1, 'error': repr(exc), 'entries': []}
    direct.append(result)
    print(number, len(result.get('entries', [])), query, flush=True)

ddgs_rows, ddgs_error = ddgs_search()
run_at = datetime.now().astimezone().isoformat()
(OUT / f'{DATE}_ytsearch_discovery.json').write_text(json.dumps({
    'generated_at': run_at, 'after': AFTER, 'topic_queries': TOPIC_QUERIES,
    'rights_queries': RIGHTS_QUERIES, 'queries': direct,
}, indent=2, ensure_ascii=False) + '\n')
(OUT / f'{DATE}_ddgs_results.json').write_text(json.dumps({
    'generated_at': run_at, 'queries': ddgs_rows, 'error': ddgs_error,
}, indent=2, ensure_ascii=False) + '\n')

candidates = []
seen = set()
for result in direct:
    for entry in result.get('entries', []):
        ident = video_id(entry.get('id') or entry.get('url') or entry.get('webpage_url'))
        if ident and ident not in seen:
            seen.add(ident)
            candidates.append({'id': ident, 'url': canonical(ident), 'discovered_via': 'yt-dlp', 'query': result['query'], 'flat': entry})
for result in ddgs_rows:
    for entry in result.get('results', []):
        ident = video_id(entry.get('href') or '')
        if ident and ident not in seen:
            seen.add(ident)
            candidates.append({'id': ident, 'url': canonical(ident), 'discovered_via': 'ddgs', 'query': result['query'], 'flat': entry})

known = prior_ids()
(OUT / f'{DATE}_candidate_index.json').write_text(json.dumps({
    'generated_at': run_at, 'after': AFTER, 'candidates': candidates,
    'prior_ids_count': len(known),
}, indent=2, ensure_ascii=False) + '\n')
print(json.dumps({
    'direct_unique': len({video_id(entry.get('id') or entry.get('url') or entry.get('webpage_url')) for result in direct for entry in result.get('entries', []) if video_id(entry.get('id') or entry.get('url') or entry.get('webpage_url'))}),
    'combined_unique': len(candidates),
    'prior_ids': len(known),
    'ddgs_rows': sum(len(row.get('results', [])) for row in ddgs_rows),
    'ddgs_errors': sum(bool(row.get('error')) for row in ddgs_rows),
}, indent=2), flush=True)
