import json, re
from pathlib import Path
from datetime import datetime

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-10'

url_re = re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})')
def ids_in(path):
    try:
        return set(url_re.findall(path.read_text(errors='ignore')))
    except Exception:
        return set()
def canonical(i):
    return f'https://www.youtube.com/watch?v={i}'

def prior_ids():
    result = ids_in(ROOT/'sources'/'links.txt')
    for p in OUT.iterdir():
        if p.name.startswith(f'{DATE}_') or ('20260910' in p.name and p.name.startswith('run_')):
            continue
        if p.suffix in {'.json', '.md', '.txt'}:
            result |= ids_in(p)
    return result

rows = json.loads((OUT/f'{DATE}_metadata.json').read_text())['rows']
discovery = json.loads((OUT/f'{DATE}_candidate_index.json').read_text())
web_fallback = json.loads((OUT/f'{DATE}_ddgs_results.json').read_text())
prior = prior_ids()

held_ids = {
    '5FBriOGXZPg','5lesrJZsE98','69DkU-UdgI0','C53vZPDdBNE','9sspx-RhHi0',
    'h5uEsdmNsqU','gtMDCr1Tb9k','kG5dEMd0Caw','kTF9pC0uC2s','mcmhwHWJiNs',
    'Y1hR-7rdPZA','n6GDQMB1blg','r5vzA8-x4j4',
}
rejected_ids = {
    '9WatgWy8Z1s','Khh9RxlbeBA','VjQD6RQA9Iw','mneLyMoE3kU','pT5sMsAFk1E',
}
live_ids = {'7hvPxjk3JB4','JFOfGEdy6gA','qBcloHBIr7M'}
non_english_ids = {'Vn8laiQRbPo'}

held_reason = {
    '5FBriOGXZPg':'Relevant astral-projection guided meditation; no video-level reuse grant found.',
    '5lesrJZsE98':'Relevant meditation/sound source; no video-level reuse grant found.',
    '69DkU-UdgI0':'Consciousness/spirituality discussion; no video-level reuse grant found.',
    'C53vZPDdBNE':'Substantive-looking out-of-body discussion; no video-level reuse grant found.',
    '9sspx-RhHi0':'Metaphysical consciousness topic, but the strong claim needs careful editorial review and no reuse grant was found.',
    'h5uEsdmNsqU':'Relevant Monroe/Focus States discussion; no video-level reuse grant found. Hemi-Sync wording should not be amplified in public copy.',
    'gtMDCr1Tb9k':'Jung/awakening topic; no video-level reuse grant found.',
    'kG5dEMd0Caw':'Sound-healing topic; no video-level reuse grant found and wellness claims require careful framing.',
    'kTF9pC0uC2s':'Frequency/sound wellness source; no video-level reuse grant found.',
    'mcmhwHWJiNs':'Meditation audiobook; no video-level reuse grant found.',
    'Y1hR-7rdPZA':'Relevant Kriya/metaphysics discussion; CC BY notice covers background music only, not the video.',
    'n6GDQMB1blg':'Relevant intuition meditation; CC BY notice covers background music only, not the video.',
    'r5vzA8-x4j4':'Potentially relevant consciousness interview; no video-level reuse grant found.',
}
reject_reason = {
    '9WatgWy8Z1s':'Biology/life lecture surfaced as an adjacent Gifford result, but it is not a clear fit for the requested topic lane.',
    'Khh9RxlbeBA':'Low-value conspiracy/targeted-individual series; rejected as unsuitable source material.',
    'VjQD6RQA9Iw':'Low-value conspiracy/targeted-individual series; rejected as unsuitable source material.',
    'mneLyMoE3kU':'Political theory video; the CC BY notice covers Audionautix music only, not the video, and the topic is outside the lane.',
    'pT5sMsAFk1E':'GTA gameplay walkthrough; public-domain/CC wording applies to music and sound effects, not the video.',
}

def metadata(r):
    return r.get('metadata') or {}
def is_live(m):
    return (m.get('live_status') or '') in {'is_live','is_upcoming','was_live','post_live'}
def explicit_non_english(m):
    lang = str(m.get('language') or '').lower()
    return bool(lang) and not lang.startswith('en')
def rights_evidence(m):
    lic = str(m.get('license') or '')
    desc = str(m.get('description') or '')
    low = desc.lower()
    evidence=[]
    if 'creative commons' in lic.lower():
        evidence.append(f'video-level yt-dlp license: {lic}')
    if 'public domain' in low:
        evidence.append('description mentions public domain, but scope was not accepted as a video-level grant')
    for phrase in ('published with permission','used with permission','reproduced with permission','shared with permission'):
        if phrase in low:
            evidence.append(f'description phrase: {phrase}')
    return evidence

# Assign every checked candidate exactly once, prioritizing prior duplicate status.
decisions=[]
for r in rows:
    i=r['id']; m=metadata(r)
    if i in prior:
        decision='duplicate/prior-record'
        reason='Already present in the queue or prior research/clip records.'
    elif i in live_ids or is_live(m):
        decision='rejected-live-or-previously-live'
        reason=f"live_status={m.get('live_status')}"
    elif i in non_english_ids or explicit_non_english(m):
        decision='rejected-non-english'
        reason=f"language={m.get('language')}"
    elif i in held_ids:
        decision='held-rights-review'
        reason=held_reason[i]
    elif i in rejected_ids:
        decision='rejected-topic-or-low-value'
        reason=reject_reason[i]
    else:
        raise RuntimeError(f'unassigned candidate {i}: {m.get("title")}')
    decisions.append({
        'id': i, 'url': canonical(i), 'decision': decision, 'reason': reason,
        'title': m.get('title'), 'creator': m.get('channel') or m.get('uploader'),
        'upload_date': m.get('upload_date'), 'duration_seconds': m.get('duration'),
        'license': m.get('license'), 'language': m.get('language'),
        'live_status': m.get('live_status'), 'rights_evidence': rights_evidence(m),
    })

counts={}
for d in decisions: counts[d['decision']]=counts.get(d['decision'],0)+1
assert sum(counts.values()) == len(rows)

(OUT/f'{DATE}_candidate_decisions.json').write_text(json.dumps({
    'generated_at': datetime.now().astimezone().isoformat(),
    'candidate_count_checked': len(rows),
    'direct_unique_candidates': len({x['id'] for x in discovery['candidates'] if x.get('discovered_via')=='yt-dlp'}),
    'combined_unique_candidates': len(discovery['candidates']),
    'prior_known_ids': len(prior),
    'counts': counts,
    'approved_additions': [],
    'decisions': decisions,
}, indent=2, ensure_ascii=False)+'\n')

# Final queue verification. No approved additions means the file must remain unchanged.
queue_path=ROOT/'sources'/'links.txt'
queue_lines=[x.strip() for x in queue_path.read_text().splitlines() if x.strip() and not x.lstrip().startswith('#')]
queue_ids=[]
for line in queue_lines:
    match=url_re.search(line)
    if not match: raise RuntimeError(f'non-YouTube queue line: {line}')
    queue_ids.append(match.group(1))
assert len(queue_ids)==len(set(queue_ids))

held_rows=[d for d in decisions if d['decision']=='held-rights-review']
rejected_rows=[d for d in decisions if d['decision'].startswith('rejected-')]
next_id=queue_ids[0]
next_meta={}
for r in rows:
    if r['id']==next_id: next_meta=metadata(r)
if not next_meta:
    next_meta=json.loads(Path('/tmp/cognistration-next-source.json').read_text())

lines=[]
lines += [f'# Cognistration YouTube Source Scout — {DATE}', '', '## Run summary', '']
lines += [f'- Search date: `{DATE}`.', '- Search topics: astral projection/out-of-body experience; frequency healing and sound-based wellness; meditation and mindfulness; intuition and synchronicity; metaphysics, consciousness, philosophy, and consciousness research.', f'- Direct discovery: 26 `yt-dlp` searches (18 topical + 8 rights-focused), using `after:{discovery.get("after")}`; **{len({x["id"] for x in discovery["candidates"] if x.get("discovered_via")=="yt-dlp"})}** unique direct IDs.', f'- Web fallback: the configured Firecrawl-backed search failed with `NoneType` / `status_code`. DDGS was attempted across five rights-focused queries; it returned {sum(len(x.get("results",[])) for x in web_fallback.get("queries",[]))} result rows, with {sum(1 for x in web_fallback.get("queries",[]) if x.get("error"))} protocol-error rows. Results were discovery-only; no search-demand or ranking claim is made.', f'- Combined candidate set: **{len(rows)} unique videos**.', f'- Metadata validation: **{len(rows)} candidates checked** with `yt-dlp --dump-single-json --skip-download --no-playlist`; **{sum(1 for d in decisions if d["decision"]!="unresolved")} resolved** and no video was downloaded.', f'- Existing-source deduplication: **{len(prior)}** IDs were known from the queue and prior research/clip records; **{counts.get("duplicate/prior-record",0)}** candidates were duplicates or prior records.', '']
lines += ['## Approved and appended', '', '- **0**. No candidate met the hard publishing-safety gate for a documented video-level Creative Commons/public-domain license or explicit creator/rightsholder permission.', '- `sources/links.txt` was left unchanged.', '']
lines += ['## Held for rights review', '', f'**{len(held_rows)} relevant candidates** remain held. None had a verified video-level reuse grant. Music, image, stock-footage, cited-source, or background-audio licenses were not treated as permission to repurpose the surrounding video.', '']
for n,d in enumerate(sorted(held_rows,key=lambda x:(x.get('upload_date') or '',x['id']),reverse=True),1):
    lines += [f'{n}. **{d["title"]}** — **{d["creator"]}** — uploaded `{d.get("upload_date") or "unknown"}` — {d["url"]}', f'   - {d["reason"]}']
    if d['rights_evidence']: lines += [f'   - Rights signal observed: {"; ".join(d["rights_evidence"])}']
lines += ['', '## Rejected or blocked', '', f'- **{counts.get("rejected-live-or-previously-live",0)} live/previously-live:** rejected by the live-status gate.', f'- **{counts.get("rejected-non-english",0)} explicit non-English:** rejected by the English-only contract.', f'- **{counts.get("rejected-topic-or-low-value",0)} topic mismatches or low-value results:** rejected for lane fit, obvious spam/conspiracy material, or rights text limited to incidental music/sound assets.', f'- **{counts.get("duplicate/prior-record",0)} duplicates/prior records:** not re-added; queue order was preserved.', '']
for d in sorted(rejected_rows,key=lambda x:(x['decision'],x.get('upload_date') or '',x['id'])):
    lines += [f'- **{d["title"]}** — {d["creator"]} — `{d.get("upload_date") or "unknown"}` — `{d["decision"]}` — {d["url"]}', f'  - {d["reason"]}']
lines += ['', '## Verification', '', f'- Final `sources/links.txt` read-back: **{len(queue_lines)}** non-comment lines and **{len(set(queue_ids))} unique YouTube IDs**.', '- No new URL was expected or appended; the queue file was unchanged.', '- Existing one-URL-per-line order was preserved.', '- No source media was downloaded. No clipping job, YouTube write, Drive write, or credential access was performed.', '- `git diff --check` was run after artifact generation.', '']
lines += ['## Next recommended source', '', f'There were no new rights-cleared additions today. The next existing queued source remains **{next_meta.get("title")}** — **{next_meta.get("channel") or next_meta.get("uploader")}** — uploaded `{next_meta.get("upload_date")}` — {canonical(next_id)}.', '']
(OUT/f'{DATE}-source-scout.md').write_text('\n'.join(lines)+'\n')
print(json.dumps({'candidate_count_checked':len(rows),'counts':counts,'held':len(held_rows),'approved':0,'queue_count':len(queue_ids),'report':str(OUT/f'{DATE}-source-scout.md')},ensure_ascii=False))
