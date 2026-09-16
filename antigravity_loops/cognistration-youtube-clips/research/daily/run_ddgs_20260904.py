import json
from datetime import datetime
from pathlib import Path
from ddgs import DDGS
OUT=Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips/research/daily')
DATE='2026-09-04'
queries=[
 'site:youtube.com/watch meditation consciousness lecture "Creative Commons"',
 'site:youtube.com/watch astral projection lecture "published with permission"',
 'site:youtube.com/watch synchronicity consciousness interview permission',
 'site:youtube.com/watch metaphysics lecture "Creative Commons Attribution"',
 'site:youtube.com/watch sound healing frequency lecture permission',
]
rows=[]
for q in queries:
    row={'query':q,'results':[]}
    try:
        for r in DDGS().text(q,max_results=10):
            row['results'].append({k:r.get(k) for k in ('title','href','body')})
    except Exception as e:
        row['error']=repr(e)
    print(q, len(row['results']), row.get('error',''), flush=True)
    rows.append(row)
(OUT/f'{DATE}_ddgs_results.json').write_text(json.dumps({'generated_at':datetime.now().astimezone().isoformat(),'queries':rows,'error':None},indent=2,ensure_ascii=False)+'\n')
print('total',sum(len(x['results']) for x in rows),flush=True)
