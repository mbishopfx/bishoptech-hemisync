import json
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-14'
review = json.loads((OUT / f'{DATE}_candidate_review.json').read_text())
rows = [r for r in review['rows'] if r['resolved'] and not r['duplicate_or_prior_record']]
rows.sort(key=lambda r: (r.get('upload_date') or '', r.get('title') or ''), reverse=True)
for i, row in enumerate(rows, 1):
    print(f'[{i}] {row["id"]} | {row.get("title")} | {row.get("channel")} | {row.get("upload_date")} | duration={row.get("duration")} | status={row.get("live_status")} | language={row.get("language")!r}')
    print(f'URL: {row.get("url")}')
    print(f'license={row.get("license")!r} rights={row.get("rights_signals")} topics={list((row.get("topic_hits") or {}).keys())} low={row.get("low_value_hits")}')
    desc = row.get('description') or ''
    print('DESC:', ' '.join(desc[:1200].split()))
    print()
print('UNRESOLVED')
for row in review['rows']:
    if not row['resolved']:
        print(json.dumps({key: row.get(key) for key in ('id','url','discovered_via','query','error')}, ensure_ascii=False))
