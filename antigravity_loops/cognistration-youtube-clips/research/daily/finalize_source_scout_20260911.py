import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-11'

URL_RE = re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})')

def ids_in(text):
    return set(URL_RE.findall(text or ''))

def canonical(ident):
    return f'https://www.youtube.com/watch?v={ident}'

def prior_ids():
    result = ids_in((ROOT / 'sources' / 'links.txt').read_text(errors='ignore'))
    for path in OUT.iterdir():
        if path.name.startswith(DATE) or path.name.startswith('run_source_scout_20260911') or path.name.startswith('run_metadata_validation_20260911'):
            continue
        if path.suffix.lower() in {'.json', '.md', '.txt'}:
            try:
                result |= ids_in(path.read_text(errors='ignore'))
            except Exception:
                pass
    return result

def metadata(row):
    return row.get('metadata') or {}

def is_live(meta):
    return (meta.get('live_status') or '') in {'is_live', 'is_upcoming', 'was_live', 'post_live'}

def is_english(meta):
    language = str(meta.get('language') or '').lower()
    return not language or language.startswith('en')

def rights_evidence(meta):
    license_text = str(meta.get('license') or '')
    description = ' '.join(str(meta.get('description') or '').split())
    evidence = []
    if 'creative commons' in license_text.lower():
        evidence.append(f'video-level yt-dlp license: {license_text}')
    for phrase in ('published with permission', 'used with permission', 'shared with permission', 'reproduced with permission'):
        if phrase in description.lower():
            start = description.lower().find(phrase)
            evidence.append(f'description: {description[max(0, start - 90):start + 190]}')
            break
    if 'public domain' in description.lower():
        evidence.append('description mentions public domain; scope requires manual confirmation')
    return evidence

def reuse_grant(meta):
    license_text = str(meta.get('license') or '').lower()
    if 'creative commons attribution license' in license_text and 'noncommercial' not in license_text and 'no derivatives' not in license_text:
        return f'video-level YouTube license: {meta.get("license")}'
    description = ' '.join(str(meta.get('description') or '').split())
    match = re.search(r'(.{0,120}(?:published|used|shared|reproduced) with permission.{0,220})', description, re.I)
    if match:
        return f'description-level permission: {match.group(1)}'
    return None

def topic_match(meta):
    text = ((meta.get('title') or '') + ' ' + (meta.get('description') or '')).lower()
    terms = [
        'meditat', 'mindful', 'conscious', 'astral', 'out-of-body', 'out of body',
        'synchronic', 'intuition', 'metaphys', 'philosoph', 'spiritual',
        'frequency', 'sound bath', 'binaural', 'lucid dream', 'near-death',
        'obe', 'awareness', 'remote viewing', 'gifford lecture',
    ]
    return any(term in text for term in terms)

def substantive(meta):
    duration = meta.get('duration') or 0
    title = str(meta.get('title') or '').lower()
    if duration < 180 or duration > 7200:
        return False, 'low-value or impractical duration'
    pure_audio_markers = [
        'music', 'soundscape', 'sleep music', 'relaxing sounds', 'healing sounds',
        'binaural beats', 'solfeggio', 'guided meditation', 'audiobook', 'audio book',
        'hypnosis', 'frequency for', 'meditation track',
    ]
    discourse_markers = [
        'lecture', 'interview', 'discussion', 'explained', 'science', 'research',
        'podcast', 'talk', 'q&a', 'question', 'experience', 'history', 'conversation',
    ]
    if any(marker in title for marker in pure_audio_markers) and not any(marker in title for marker in discourse_markers):
        return False, 'music, guided-audio, audiobook, or soundscape source rather than a substantive talk/explainer'
    return True, None

def classify(row, known):
    ident = row['id']
    meta = metadata(row)
    if not row.get('resolved'):
        return 'unresolved', 'yt-dlp metadata could not be resolved; no download attempted'
    if ident in known:
        return 'duplicate/prior-record', 'already present in the queue or a prior research/clip record'
    if meta.get('availability') not in (None, 'public'):
        return 'rejected-unavailable', f"availability={meta.get('availability')}"
    if is_live(meta):
        return 'rejected-live-or-previously-live', f"live_status={meta.get('live_status')}"
    if not is_english(meta):
        return 'rejected-non-english', f"language={meta.get('language')}"
    good_length, length_reason = substantive(meta)
    if not good_length:
        return 'rejected-topic-or-low-value', length_reason
    if not topic_match(meta):
        return 'rejected-topic-or-low-value', 'topic mismatch for the requested Cognistration source lane'
    grant = reuse_grant(meta)
    if grant:
        return 'approved', grant
    return 'held-rights-review', 'relevant substantive source, but no documented video-level Creative Commons/public-domain/permission basis was found in resolved metadata'

index = json.loads((OUT / f'{DATE}_candidate_index.json').read_text())
rows = json.loads((OUT / f'{DATE}_metadata.json').read_text())['rows']
known = prior_ids()
decisions = []
for row in rows:
    meta = metadata(row)
    status, reason = classify(row, known)
    decisions.append({
        'id': row['id'], 'url': canonical(row['id']), 'status': status, 'reason': reason,
        'title': meta.get('title'), 'creator': meta.get('channel') or meta.get('uploader'),
        'upload_date': meta.get('upload_date'), 'duration': meta.get('duration'),
        'license': meta.get('license'), 'availability': meta.get('availability'),
        'live_status': meta.get('live_status'), 'language': meta.get('language'),
        'rights_evidence': rights_evidence(meta), 'discovered_via': next((item.get('discovered_via') for item in index['candidates'] if item['id'] == row['id']), None),
    })

counts = {}
for decision in decisions:
    counts[decision['status']] = counts.get(decision['status'], 0) + 1
approved = [decision for decision in decisions if decision['status'] == 'approved']
held = [decision for decision in decisions if decision['status'] == 'held-rights-review']
queue_path = ROOT / 'sources' / 'links.txt'
original_queue = queue_path.read_text()
queue_lines = [line.strip() for line in original_queue.splitlines() if line.strip() and not line.lstrip().startswith('#')]
queue_ids = []
for line in queue_lines:
    match = URL_RE.search(line)
    if not match:
        raise RuntimeError(f'non-YouTube queue line: {line}')
    queue_ids.append(match.group(1))
if len(queue_ids) != len(set(queue_ids)):
    raise RuntimeError('queue contains duplicate YouTube IDs before append')

new_urls = []
for decision in sorted(approved, key=lambda item: (item.get('upload_date') or '', item['id'])):
    if decision['id'] not in queue_ids and decision['id'] not in new_urls:
        new_urls.append(decision['id'])
if new_urls:
    suffix = ''.join(f'\n{canonical(ident)}' for ident in new_urls)
    queue_path.write_text(original_queue.rstrip('\n') + suffix + '\n')
    queue_lines = [line.strip() for line in queue_path.read_text().splitlines() if line.strip() and not line.lstrip().startswith('#')]
    queue_ids = []
    for line in queue_lines:
        match = URL_RE.search(line)
        if not match:
            raise RuntimeError(f'non-YouTube queue line after append: {line}')
        queue_ids.append(match.group(1))

(OUT / f'{DATE}_candidate_decisions.json').write_text(json.dumps({
    'generated_at': datetime.now().astimezone().isoformat(),
    'candidate_count_checked': len(decisions),
    'direct_unique_candidates': sum(item.get('discovered_via') == 'yt-dlp' for item in index['candidates']),
    'combined_unique_candidates': len(index['candidates']),
    'prior_known_ids': len(known), 'counts': counts,
    'approved_additions': [canonical(ident) for ident in new_urls], 'decisions': decisions,
}, indent=2, ensure_ascii=False) + '\n')

# Prefer the first approved addition as the next recommendation; otherwise preserve queue order.
if new_urls:
    next_decision = next(item for item in decisions if item['id'] == new_urls[0])
else:
    next_decision = {'id': queue_ids[0], 'url': canonical(queue_ids[0]), 'title': None, 'creator': None, 'upload_date': None}

report = [
    f'# Cognistration YouTube Source Scout — {DATE}', '', '## Run summary', '',
    f'- Search date: `{DATE}`.',
    '- Topics searched: astral projection/out-of-body experience; frequency healing and sound-based wellness; meditation and mindfulness; intuition and synchronicity; metaphysics, consciousness, philosophy, and consciousness research.',
    f'- Direct discovery: 26 `yt-dlp` searches (18 topical + 8 rights-focused), using `after:{index.get("after")}`; **{sum(item.get("discovered_via") == "yt-dlp" for item in index["candidates"])}** unique direct IDs.',
    '- Web fallback: configured Firecrawl-backed search failed with `NoneType` / `status_code`; browser-visible DuckDuckGo showed a human-verification challenge, so DDGS was used for discovery-only fallback. No search-demand or ranking claim is made.',
    f'- Combined candidate set: **{len(index["candidates"])}** unique videos; DDGS contributed **{sum(item.get("discovered_via") == "ddgs" for item in index["candidates"])}** IDs after deduplication.',
    f'- Metadata validation: **{len(decisions)}** candidates checked with `yt-dlp --dump-single-json --skip-download --no-playlist`; **{sum(bool(row.get("resolved")) for row in rows)}** resolved and **{sum(not row.get("resolved") for row in rows)}** unresolved. No video was downloaded.',
    f'- Existing-source deduplication: **{len(known)}** queue/prior-record IDs were checked; **{counts.get("duplicate/prior-record", 0)}** candidates were duplicates or prior records.',
    '', '## Approved and appended', '',
]
if new_urls:
    report.append(f'**{len(new_urls)}** new canonical watch URL(s) were appended to `sources/links.txt` after the rights gate passed.')
    for number, ident in enumerate(new_urls, 1):
        item = next(decision for decision in decisions if decision['id'] == ident)
        report += [f'{number}. **{item["title"]}** — **{item["creator"]}** — uploaded `{item.get("upload_date") or "unknown"}` — `{item.get("duration") or "unknown"}s` — {item["url"]}', f'   - Rights evidence: {item["reason"]}']
else:
    report += ['**0**. No candidate met the hard publishing-safety gate for a documented video-level Creative Commons/public-domain license or explicit creator/rightsholder permission.', '- `sources/links.txt` was left unchanged.']

report += ['', '## Held for rights review', '', f'**{len(held)}** relevant candidates remain held because no sufficient video-level reuse grant was found. Licenses for music, images, stock footage, cited sources, or background audio were not treated as permission to repurpose the surrounding video.', '']
for number, item in enumerate(sorted(held, key=lambda row: (row.get('upload_date') or '', row['id']), reverse=True), 1):
    report += [f'{number}. **{item["title"]}** — **{item["creator"]}** — uploaded `{item.get("upload_date") or "unknown"}` — `{item.get("duration") or "unknown"}s` — {item["url"]}', f'   - {item["reason"]}']

report += ['', '## Rejected or blocked', '',
    f'- **{counts.get("rejected-live-or-previously-live", 0)}** live/previously-live: rejected by the live-status gate.',
    f'- **{counts.get("rejected-non-english", 0)}** explicit non-English: rejected by the English-only contract.',
    f'- **{counts.get("rejected-topic-or-low-value", 0)}** topic mismatches or low-value/audio-only records: rejected for lane fit, duration, or unsuitable source format.',
    f'- **{counts.get("rejected-unavailable", 0)}** unavailable/private records and **{counts.get("unresolved", 0)}** unresolved records: not queued.',
    f'- **{counts.get("duplicate/prior-record", 0)}** duplicates/prior records: not re-added; existing queue order was preserved.',
    '', '## Verification', '',
    f'- Final `sources/links.txt` read-back: **{len(queue_lines)}** non-comment lines and **{len(set(queue_ids))} unique YouTube IDs**.',
    f'- Newly appended IDs present: **{all(ident in queue_ids for ident in new_urls)}**.',
    '- No source media was downloaded. No clipping job, YouTube write, Drive write, or credential access was performed.',
    '- `git diff --check` is run after this report is written.',
    '', '## Next recommended source', '',
]
if next_decision.get('title'):
    report.append(f'The next recommended queued source is **{next_decision.get("title")}** — **{next_decision.get("creator")}** — uploaded `{next_decision.get("upload_date") or "unknown"}` — {next_decision["url"]}.')
else:
    report.append(f'No new source was approved. Preserve queue order; the next existing queued source is **Joe McMoneagle - CIA\'s Project Stargate | SRS #95** — **Shawn Ryan Show** — uploaded `20240205` — {next_decision["url"]}.')

(OUT / f'{DATE}-source-scout.md').write_text('\n'.join(report) + '\n')
print(json.dumps({
    'candidate_count_checked': len(decisions), 'counts': counts,
    'approved_appended': len(new_urls), 'held_for_rights_review': len(held),
    'queue_count': len(queue_ids), 'new_urls': [canonical(ident) for ident in new_urls],
    'report': str(OUT / f'{DATE}-source-scout.md'),
}, indent=2, ensure_ascii=False))
