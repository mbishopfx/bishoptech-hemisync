import json, re, subprocess, sys, time
from datetime import datetime
from pathlib import Path
try:
    from ddgs import DDGS
except Exception:
    DDGS = None

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-02'
RUN_AT = datetime.now().astimezone().isoformat()

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

url_re = re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})')
def vid(value):
    value = value or ''
    if re.fullmatch(r'[A-Za-z0-9_-]{11}', value):
        return value
    m = url_re.search(value)
    return m.group(1) if m else None
def canonical(i):
    return f'https://www.youtube.com/watch?v={i}'

def run_search(q):
    term = f'ytsearch10:{q} after:2026-08-01'
    p = subprocess.run(['yt-dlp','--flat-playlist','--dump-single-json','--skip-download','--no-warnings',term], capture_output=True, text=True, timeout=180)
    rec = {'query': q, 'term': term, 'returncode': p.returncode, 'stderr': p.stderr[-1200:]}
    if p.returncode == 0:
        try:
            d = json.loads(p.stdout)
            rec['entries'] = [{k:e.get(k) for k in ('id','title','channel','uploader','url','webpage_url')} for e in (d.get('entries') or []) if e and e.get('id')]
        except Exception as ex:
            rec['parse_error'] = repr(ex)
    return rec

def prior_ids():
    ids = set()
    for p in OUT.glob('*'):
        if p.name == f'run_source_scout_{DATE.replace("-","")}.py':
            continue
        if p.suffix.lower() not in {'.json','.md','.txt'}:
            continue
        try: text = p.read_text(errors='ignore')
        except Exception: continue
        ids.update(re.findall(r'(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})', text))
    return ids

def ddgs_search():
    rows=[]
    if DDGS is None:
        return rows, 'ddgs unavailable'
    for q in DDGS_QUERIES:
        row={'query':q,'results':[]}
        try:
            for r in DDGS().text(q, max_results=10):
                row['results'].append({k:r.get(k) for k in ('title','href','body')})
        except Exception as ex:
            row['error']=repr(ex)
        rows.append(row)
    return rows, None

print('running direct discovery', len(TOPIC_QUERIES)+len(RIGHTS_QUERIES), 'queries', flush=True)
direct=[]
for idx,q in enumerate(TOPIC_QUERIES+RIGHTS_QUERIES,1):
    try: r=run_search(q)
    except Exception as ex: r={'query':q,'returncode':-1,'error':repr(ex),'entries':[]}
    direct.append(r)
    print(idx, q, len(r.get('entries',[])), r.get('returncode'), flush=True)

(ddgs, ddgs_error) = ddgs_search()
(OUT/f'{DATE}_ytsearch_discovery.json').write_text(json.dumps({'generated_at':RUN_AT,'topic_queries':TOPIC_QUERIES,'rights_queries':RIGHTS_QUERIES,'queries':direct},indent=2,ensure_ascii=False)+'\n')
(OUT/f'{DATE}_ddgs_results.json').write_text(json.dumps({'generated_at':RUN_AT,'queries':ddgs,'error':ddgs_error},indent=2,ensure_ascii=False)+'\n')

all_rows=[]; seen=set()
for r in direct:
    for e in r.get('entries',[]):
        i=vid(e.get('id') or e.get('url') or e.get('webpage_url'))
        if i and i not in seen:
            seen.add(i); all_rows.append({'id':i,'url':canonical(i),'discovered_via':'yt-dlp','query':r['query'],'flat':e})
for r in ddgs:
    for e in r.get('results',[]):
        i=vid(e.get('href') or '')
        if i and i not in seen:
            seen.add(i); all_rows.append({'id':i,'url':canonical(i),'discovered_via':'ddgs','query':r['query'],'flat':e})
prior=prior_ids()
(OUT/f'{DATE}_candidate_index.json').write_text(json.dumps({'generated_at':RUN_AT,'candidates':all_rows,'prior_ids_count':len(prior)},indent=2,ensure_ascii=False)+'\n')
print('direct unique',len({vid(e.get('id') or e.get('url') or e.get('webpage_url')) for r in direct for e in r.get('entries',[]) if vid(e.get('id') or e.get('url') or e.get('webpage_url'))}), 'combined unique',len(all_rows),'prior ids',len(prior), 'ddgs rows',sum(len(r.get('results',[])) for r in ddgs), flush=True)
