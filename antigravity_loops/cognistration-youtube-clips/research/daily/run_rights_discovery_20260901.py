import json, subprocess
from pathlib import Path
from datetime import datetime
ROOT=Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT=ROOT/'research'/'daily'
queries=[
 '"Published with permission" meditation consciousness',
 '"Published with permission" astral projection',
 '"Published with permission" out of body experience',
 '"Creative Commons Attribution" consciousness lecture',
 '"Creative Commons Attribution" meditation lecture',
 '"Creative Commons Attribution" synchronicity consciousness',
 '"Creative Commons Attribution" sound frequency wellness',
 'public domain out of body experience lecture',
]
rows=[]
for q in queries:
 term='ytsearch12:'+q+' after:2026-08-01'
 p=subprocess.run(['yt-dlp','--flat-playlist','--dump-single-json','--skip-download','--no-warnings',term],capture_output=True,text=True,timeout=180)
 rec={'query':q,'term':term,'returncode':p.returncode,'stderr':p.stderr[-1000:]}
 if p.returncode==0:
  try:
   d=json.loads(p.stdout)
   rec['entries']=[{k:e.get(k) for k in ('id','title','channel','uploader','url','webpage_url')} for e in (d.get('entries') or []) if e]
  except Exception as ex: rec['parse_error']=repr(ex)
 rows.append(rec); print(q,len(rec.get('entries',[])),p.returncode)
(OUT/'2026-09-01_rights_discovery.json').write_text(json.dumps({'generated_at':datetime.now().astimezone().isoformat(),'queries':rows},indent=2,ensure_ascii=False)+'\n')
print('raw',sum(len(r.get('entries',[])) for r in rows))
