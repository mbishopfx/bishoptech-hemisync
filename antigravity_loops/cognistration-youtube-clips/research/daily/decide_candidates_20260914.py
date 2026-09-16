import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-14'

review = json.loads((OUT / f'{DATE}_candidate_review.json').read_text())
index = json.loads((OUT / f'{DATE}_candidate_index.json').read_text())
metadata = json.loads((OUT / f'{DATE}_metadata.json').read_text())

LIVE_STATUSES = {'is_live', 'is_upcoming', 'live', 'upcoming'}
NON_ENGLISH_ID = 'h_pP0ZjmZhU'
LIVE_ID = 'j_-Fl_wdISk'
LOW_VALUE_REASONS = {
    'qASQL2651Hw': 'hype-led Carl Jung repackaging rather than a clearly attributable substantive lecture/interview',
    'u71eME8kXhg': 'fiction/manhwa recap; topic mismatch and obvious low-value search noise',
    'CSiICQYl9Kw': 'audio-equipment review; topic mismatch; apparent Creative Commons wording is unrelated to reuse of the video',
    'Rfzwpga7aTM': 'gaming video; topic mismatch; apparent public-domain/CC wording is unrelated to reuse of the video',
    '4rAsPMY4fOQ': 'subliminal/audio product-style source rather than a substantive talk, interview, lecture, or explainer',
    'C7TyFVBAGOk': '77-second news snippet is below the 90-second clip minimum and is too short for this source lane',
    'bQISq9_lxMg': 'sleep/mental-health explainer rather than a requested meditation, consciousness, or related source format',
    'r4KsixMQe8Q': 'health-treatment frequency/Reiki claim; not a suitable responsible substantive source for this lane',
    'WjxlMbThbRE': 'six-hour music/audio-only source without speech or a substantive interview/lecture',
    'OVSFFdKXyjY': 'sleep/melatonin science explainer; topic mismatch for the requested source lanes',
    'uaMGglWyj1o': 'sleep-debt science explainer; topic mismatch for the requested source lanes',
    'aHsx_o18KMU': 'podcast teaser/intro says the conversation is coming soon; incomplete and low-value as a clip source',
    'OOSdsWGZLR8': 'full audiobook/audio-first source; no substantive original interview/lecture rights path',
    'Z-Az-3q13Ig': 'sleep/insomnia interview rather than a requested meditation, consciousness, or related source topic',
}


def evidence(row):
    meta = row.get('metadata') or {}
    description = meta.get('description') or ''
    license_value = (meta.get('license') or '').strip()
    result = []
    if license_value:
        result.append(f'video-level yt-dlp license: {license_value}')
    lower = description.lower()
    patterns = [
        r'creative commons', r'cc[- ]?by(?:[- ]?(?:nc|nd|sa))?', r'public domain',
        r'published with permission', r'posted with permission', r'used with permission',
        r'permission from', r'permission granted', r'reproduced with permission',
    ]
    for pattern in patterns:
        match = re.search(pattern, lower)
        if not match:
            continue
        start = max(0, match.start() - 180)
        end = min(len(description), match.end() + 320)
        snippet = ' '.join(description[start:end].split())
        result.append(f'description evidence: {snippet}')
    return result


def row_from(raw):
    meta = raw.get('metadata') or {}
    return {
        'id': raw.get('id'),
        'url': raw.get('url'),
        'title': meta.get('title'),
        'creator': meta.get('channel') or meta.get('uploader'),
        'upload_date': meta.get('upload_date'),
        'duration': meta.get('duration'),
        'license': meta.get('license'),
        'availability': meta.get('availability'),
        'live_status': meta.get('live_status'),
        'language': meta.get('language'),
        'rights_evidence': evidence(raw),
        'discovered_via': raw.get('discovered_via'),
        'query': raw.get('query'),
        'resolved': bool(raw.get('resolved')),
        'metadata_error': raw.get('error'),
    }


def decide(row, known_ids):
    item = row_from(row)
    ident = item['id']
    if ident in known_ids:
        item.update({
            'status': 'duplicate/prior-record',
            'reason': 'already present in the queue or a prior research/clip record',
        })
        if not item['resolved']:
            item['reason'] += '; metadata was unresolved in this pass but no queue action is needed'
        return item
    if not item['resolved']:
        item.update({
            'status': 'rejected-unavailable-or-unresolved',
            'reason': 'yt-dlp metadata could not be resolved; source was not queued',
        })
        return item
    if item['live_status'] in LIVE_STATUSES or item['live_status'] in {'was_live'}:
        item.update({
            'status': 'rejected-live-or-previously-live',
            'reason': f'live_status={item["live_status"]}',
        })
        return item
    if (item['availability'] or '').lower() not in {'', 'public'}:
        item.update({
            'status': 'rejected-unavailable-or-private',
            'reason': f'availability={item["availability"]}',
        })
        return item
    language = (item['language'] or '').lower()
    if language and not language.startswith('en'):
        item.update({
            'status': 'rejected-non-english',
            'reason': f'language={item["language"]}',
        })
        return item
    if ident in LOW_VALUE_REASONS:
        item.update({
            'status': 'rejected-topic-or-low-value',
            'reason': LOW_VALUE_REASONS[ident],
        })
        return item
    item.update({
        'status': 'held-rights-review',
        'reason': 'relevant substantive source, but no documented video-level Creative Commons/public-domain/permission basis was found in resolved metadata',
    })
    return item


# The scout's prior-id set is stored only as a count in the index, so reproduce it
# from the same queue and historical research corpus used by the scout.
url_re = re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})')
known_ids = set(url_re.findall((ROOT / 'sources' / 'links.txt').read_text(errors='ignore')))
for path in OUT.iterdir():
    if path.name.startswith(DATE):
        continue
    if path.suffix.lower() not in {'.json', '.md', '.txt'}:
        continue
    try:
        known_ids.update(url_re.findall(path.read_text(errors='ignore')))
    except Exception:
        pass

rows = [decide(row, known_ids) for row in metadata['rows']]
rows.sort(key=lambda item: item['id'] or '')
counts = Counter(item['status'] for item in rows)
nonduplicate_resolved = [
    item for item in rows
    if item['status'] != 'duplicate/prior-record' and item['resolved']
]
expected_new_ids = {
    item['id'] for item in rows if item['status'] != 'duplicate/prior-record'
}
expected_reviewed_ids = {
    '20tSEQous7A', '8JzWoQh5jhU', 'qbXSJuCBdKs', '9ikDRrj93A8',
    'CZayydR_4ys', 'R_Syj-Wc94E', '7dWuLLq3kIo', 'gGTncdyD3pQ',
    '05rrJYrDXuo', 'R79XnGcVeCY', '7hsvA4-zWAI', 'kJ26NES0On4',
    '1KsBTVhOWsg', 'ypkB5ouStgw', 'HPuIKPGtqUI', 'lXY_-iGHnok',
    'MRmfyW4FDMc',
}
actual_held_ids = {item['id'] for item in rows if item['status'] == 'held-rights-review'}
if actual_held_ids != expected_reviewed_ids:
    raise SystemExit(f'held set mismatch: expected={sorted(expected_reviewed_ids)} actual={sorted(actual_held_ids)}')
if any(item['status'] == 'approved' for item in rows):
    raise SystemExit('unexpected approval: rights audit must be manually verified before queue append')
if len(rows) != index['prior_ids_count'] * 0 + index.get('candidates', []).__len__():
    raise SystemExit('candidate count mismatch')

summary = {
    'generated_at': datetime.now().astimezone().isoformat(),
    'candidate_count_checked': len(rows),
    'direct_unique_candidates': len({
        entry.get('id')
        for result in json.loads((OUT / f'{DATE}_ytsearch_discovery.json').read_text())['queries']
        for entry in result.get('entries', [])
        if entry.get('id')
    }),
    'combined_unique_candidates': len(index['candidates']),
    'prior_known_ids': len(known_ids),
    'counts': dict(counts),
    'approved_additions': [],
    'new_nonduplicate_resolved_count': len(nonduplicate_resolved),
    'new_nonduplicate_rights_signal_rows': sum(
        bool(item['rights_evidence']) for item in nonduplicate_resolved
    ),
    'unresolved_total': sum(not item['resolved'] for item in rows),
    'unresolved_duplicate_count': sum(
        not item['resolved'] and item['status'] == 'duplicate/prior-record' for item in rows
    ),
    'ddgs_discovered_candidates': sum(item['discovered_via'] == 'ddgs' for item in rows),
}
(OUT / f'{DATE}_candidate_decisions.json').write_text(json.dumps({
    **summary,
    'decisions': rows,
}, indent=2, ensure_ascii=False) + '\n')
print(json.dumps(summary, indent=2, ensure_ascii=False))
print('exclusive_status_total=', sum(counts.values()))
