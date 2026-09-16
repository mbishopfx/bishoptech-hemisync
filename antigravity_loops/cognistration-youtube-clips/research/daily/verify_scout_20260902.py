import json, re
from pathlib import Path
ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
links = ROOT/'sources'/'links.txt'
text = links.read_text()
lines = [x.strip() for x in text.splitlines() if x.strip() and not x.lstrip().startswith('#')]
ids=[]; invalid=[]
for line in lines:
    m = re.fullmatch(r'(?:https://www\.youtube\.com/watch\?v=|https://youtu\.be/)([A-Za-z0-9_-]{11})(?:[?&].*)?', line)
    if m: ids.append(m.group(1))
    else: invalid.append(line)
expected=['3lW3K-_Sjd0','2QazKP2d1Lc','W_Ihk1N6yeQ','89qrD-8KbXo']
report=ROOT/'research'/'daily'/'2026-09-02-source-scout.md'
decisions=json.loads((ROOT/'research'/'daily'/'2026-09-02_candidate_decisions.json').read_text())
assert not invalid, invalid
assert len(ids)==len(set(ids))
assert all(x in ids for x in expected)
assert len(lines)==21
assert report.stat().st_size > 0
assert decisions['candidate_count']==181
print(json.dumps({'non_comment_lines':len(lines),'unique_ids':len(set(ids)),'invalid_lines':len(invalid),'new_urls_present':len([x for x in expected if x in ids]),'report_bytes':report.stat().st_size,'decision_candidates':decisions['candidate_count']},indent=2))
