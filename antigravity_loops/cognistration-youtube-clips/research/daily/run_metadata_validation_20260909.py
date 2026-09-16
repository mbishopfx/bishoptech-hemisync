import json, subprocess, concurrent.futures
from pathlib import Path
from datetime import datetime
ROOT=Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT=ROOT/'research'/'daily'
DATE='2026-09-09'
idx=json.loads((OUT/f'{DATE}_candidate_index.json').read_text())
candidates=idx['candidates']
def resolve(item):
    try:
        p=subprocess.run(['yt-dlp','--dump-single-json','--skip-download','--no-warnings','--no-playlist',item['url']],capture_output=True,text=True,timeout=120)
        if p.returncode==0 and p.stdout.strip():
            d=json.loads(p.stdout)
            keys=['id','title','channel','uploader','uploader_id','upload_date','timestamp','duration','description','license','live_status','availability','language','webpage_url','original_url','release_timestamp','categories','tags']
            return {'id':item['id'],'url':item['url'],'discovered_via':item.get('discovered_via'),'query':item.get('query'),'resolved':True,'metadata':{k:d.get(k) for k in keys}}
        return {'id':item['id'],'url':item['url'],'discovered_via':item.get('discovered_via'),'query':item.get('query'),'resolved':False,'returncode':p.returncode,'stderr':p.stderr[-1200:]}
    except Exception as e:
        return {'id':item['id'],'url':item['url'],'discovered_via':item.get('discovered_via'),'query':item.get('query'),'resolved':False,'error':repr(e)}
rows=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    futs=[ex.submit(resolve,c) for c in candidates]
    for n,f in enumerate(concurrent.futures.as_completed(futs),1):
        rows.append(f.result())
        if n%20==0: print('resolved',n,'/',len(candidates),flush=True)
rows.sort(key=lambda x:x['id'])
(OUT/f'{DATE}_metadata.json').write_text(json.dumps({'generated_at':datetime.now().astimezone().isoformat(),'candidate_count':len(candidates),'rows':rows},indent=2,ensure_ascii=False)+'\n')
print('candidate_count',len(candidates),'resolved',sum(r.get('resolved') for r in rows),'unresolved',sum(not r.get('resolved') for r in rows),flush=True)
