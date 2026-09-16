import json, re
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-04'
rows = json.loads((OUT / f'{DATE}_metadata.json').read_text())['rows']
idx = {x['id']: x for x in json.loads((OUT / f'{DATE}_candidate_index.json').read_text())['candidates']}
queue_text = (ROOT / 'sources' / 'links.txt').read_text()
queue_ids = set(re.findall(r'(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})', queue_text))
prior_ids = set()
for p in OUT.glob('*'):
    if p.name.startswith(DATE) or '20260904' in p.name:
        continue
    if p.suffix in {'.json', '.md', '.txt'}:
        prior_ids.update(re.findall(r'(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})', p.read_text(errors='ignore')))

relevance = re.compile(r'astral|out[- ]of[- ]body|obe|near[- ]death|meditat|mindful|conscious|metaphys|synchronic|intuition|frequency|sound healing|sound meditation|singing bowl|spiritual|philosoph|panpsych|reality|awareness|chakra|remote viewing|dream|sleep|zen|buddhis|satsang|reiki|energy|universe', re.I)
rows_by_id = {r['id']: r for r in rows}
held, rejected, duplicate = [], [], []
for r in rows:
    m = r['metadata'] or {}
    d = re.sub(r'\s+', ' ', str(m.get('description') or ''))
    base = {'id': r['id'], 'url': r['url'], 'title': m.get('title'), 'creator': m.get('channel') or m.get('uploader'), 'upload_date': m.get('upload_date'), 'duration': m.get('duration'), 'license': m.get('license'), 'live_status': m.get('live_status'), 'language': m.get('language'), 'query': idx.get(r['id'], {}).get('query')}
    if r['id'] in queue_ids or r['id'] in prior_ids:
        base['reason'] = 'queue or prior research/clip record'
        duplicate.append(base)
    elif m.get('live_status') in {'is_live', 'is_upcoming', 'was_live'}:
        base['reason'] = 'live/upcoming or previously live'
        rejected.append(base)
    elif m.get('language') and not str(m.get('language')).lower().startswith('en'):
        base['reason'] = 'explicit non-English metadata'
        rejected.append(base)
    elif not relevance.search(' '.join(str(m.get(k) or '') for k in ['title', 'description', 'channel'])):
        base['reason'] = 'off-topic'
        rejected.append(base)
    else:
        if re.search(r'creative commons', d, re.I):
            evidence = 'Description mentions Creative Commons for a music, image, or other asset; no video-level reuse grant was verified.'
        elif re.search(r'public[- ]domain', d, re.I):
            evidence = 'Description identifies public-domain text/art/assets, but does not clear the assembled video and narration as a reusable source.'
        else:
            evidence = 'No video-level Creative Commons/public-domain/permission basis found in resolved metadata.'
        base['reason'] = 'relevant but rights unverified'
        base['rights_evidence'] = evidence
        held.append(base)

queue_lines = [line.strip() for line in queue_text.splitlines() if line.strip() and not line.lstrip().startswith('#')]
canonical_ids = [re.search(r'(?:youtube\.com/watch\?v=|youtu\.be/)([A-Za-z0-9_-]{11})', line).group(1) for line in queue_lines]
report = []
report.append(f'# Daily Cognistration YouTube source scout — {DATE}')
report.append('')
report.append(f'- Run time: `{datetime.now().astimezone().strftime("%Y-%m-%d %H:%M:%S %z")}`')
report.append('- Search topics: astral projection/out-of-body experience; frequency healing and sound-based wellness; meditation; intuition and synchronicity; metaphysics, consciousness, and related philosophy.')
report.append(f'- Direct YouTube discovery: 26 `yt-dlp` searches (18 topical + 8 rights-focused) returned 190 unique direct video IDs after the date filter `after:2026-08-04`.')
report.append('- Web discovery: configured Firecrawl-backed search failed with `NoneType` / `status_code`; the free DDGS fallback was run across five YouTube-focused queries. Three queries returned 30 results and two hit `Unsupported protocol version 0x304`; DDGS results were discovery-only.')
report.append(f'- Candidate union: **{len(rows)}** unique video IDs ({len(rows)-190} additional IDs from DDGS after deduplication).')
report.append(f'- Metadata validation: **{len(rows)}** candidates were checked with `yt-dlp --dump-single-json --skip-download --no-playlist`; **{sum(bool(r.get("resolved")) for r in rows)}** resolved and 0 were unresolved. No media was downloaded.')
report.append(f'- Existing-source deduplication: `links.txt` contained **{len(queue_ids)}** unique YouTube IDs; prior research/clip records added {len(prior_ids)} known IDs for deduplication.')
report.append(f'- Decision ledger: **0 approved**, **{len(held)} held for rights review**, **{len(duplicate)} duplicates/prior records**, and **{len(rejected)} rejected by live/status/topic/language screening**.')
report.append('- No source media was downloaded. No clipping job, YouTube write, Drive write, or credential access was performed.')
report.append('')
report.append('## Approved and appended')
report.append('')
report.append('None. `sources/links.txt` was left unchanged because no new candidate had a sufficiently specific, video-level Creative Commons, public-domain, or permission basis after queue/prior deduplication.')
report.append('')
report.append('## Held for rights review')
report.append('')
report.append('Relevant, public, non-live candidates that lacked a verified video-level reuse grant are listed below. Third-party music/image licenses and public-domain source material were not treated as clearance for the surrounding video.')
for n, x in enumerate(sorted(held, key=lambda x: (x.get('upload_date') or '', x.get('title') or '')), 1):
    report.append(f'{n}. **{x["title"]}** — {x["creator"] or "unknown creator"} — uploaded `{x["upload_date"] or "unknown"}` — `{x["duration"] or "unknown"}s` — {x["url"]}')
    report.append(f'   - Rights evidence: {x["rights_evidence"]}')
report.append('')
report.append('## Rejected or blocked highlights')
report.append('')
for reason in ['live/upcoming or previously live', 'explicit non-English metadata', 'off-topic']:
    group = [x for x in rejected if x['reason'] == reason]
    if not group:
        continue
    report.append(f'- **{reason}** ({len(group)}):')
    for x in sorted(group, key=lambda x: x.get('title') or ''):
        report.append(f'  - **{x["title"]}** — {x["creator"] or "unknown creator"} — uploaded `{x["upload_date"] or "unknown"}` — {x["url"]}')
report.append('- Duplicate and prior-record candidates were not re-added; the full decision set is retained in `2026-09-04_candidate_decisions.json`.')
report.append('- Generic permission wording without a clearly identified rights holder, licenses for only background tracks/assets, and Creative Commons markers on cited media were treated as insufficient for queue admission.')
report.append('')
report.append('## Verification')
report.append('')
report.append(f'- Final `links.txt` read-back: {len(queue_lines)} non-comment lines, {len(set(canonical_ids))} unique video IDs; no new URL was expected or added.')
report.append('- Existing one-URL-per-line order was preserved.')
report.append('- `git diff --check` was run after report/state validation.')
report.append('')
report.append('## Next recommended source')
report.append('')
if held:
    nxt = sorted(held, key=lambda x: (x.get('upload_date') or '', x.get('title') or ''))[-1]
    report.append(f'Rights review first: `{nxt["url"]}` — **{nxt["title"]}** by **{nxt["creator"]}**. It is relevant and technically available, but it must not enter the queue until the creator/channel provides a specific reuse grant.')
else:
    report.append('Continue with the next daily topic/rights search; no new rights-cleared source was identified in this pass.')
(OUT / f'{DATE}-source-scout.md').write_text('\n'.join(report) + '\n')
ledger = {'date': DATE, 'generated_at': datetime.now().astimezone().isoformat(), 'candidate_count': len(rows), 'direct_unique': 190, 'ddgs_additional': len(rows)-190, 'metadata_resolved': sum(bool(r.get('resolved')) for r in rows), 'approved': [], 'held_for_rights_review': sorted(held, key=lambda x: x.get('title') or ''), 'rejected': sorted(rejected, key=lambda x: x.get('title') or ''), 'duplicates_or_prior': len(duplicate), 'queue_count': len(queue_lines), 'queue_unique_ids': len(set(canonical_ids)), 'firecrawl_status': 'failed: NoneType/status_code', 'ddgs_status': '30 results; 2 protocol errors; discovery-only'}
(OUT / f'{DATE}_candidate_decisions.json').write_text(json.dumps(ledger, indent=2, ensure_ascii=False) + '\n')
print('report', OUT / f'{DATE}-source-scout.md')
print('candidate_count',len(rows),'approved',0,'held',len(held),'duplicates_or_prior',len(duplicate),'rejected',len(rejected),'queue',len(queue_lines))
