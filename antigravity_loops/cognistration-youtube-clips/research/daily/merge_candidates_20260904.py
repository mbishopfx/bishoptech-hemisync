import json, re
from pathlib import Path
ROOT=Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT=ROOT/'research'/'daily'
DATE='2026-09-04'
idx=json.loads((OUT/f'{DATE}_candidate_index.json').read_text())
initial=len(idx['candidates'])
seen={x['id'] for x in idx['candidates']}
url_re=re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})')
for row in json.loads((OUT/f'{DATE}_ddgs_results.json').read_text())['queries']:
    for r in row.get('results',[]):
        m=url_re.search(r.get('href') or '')
        if m and m.group(1) not in seen:
            i=m.group(1); seen.add(i)
            idx['candidates'].append({'id':i,'url':f'https://www.youtube.com/watch?v={i}','discovered_via':'ddgs','query':row['query'],'flat':{'id':i,'title':r.get('title'),'body':r.get('body'),'href':r.get('href')}})
idx['direct_candidate_count']=initial
idx['ddgs_added']=len(idx['candidates'])-initial
(OUT/f'{DATE}_candidate_index.json').write_text(json.dumps(idx,indent=2,ensure_ascii=False)+'\n')
print('combined',len(idx['candidates']),'direct',initial,'ddgs_added',len(idx['candidates'])-initial)
