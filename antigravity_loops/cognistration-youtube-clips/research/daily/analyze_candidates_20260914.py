import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-14'
URL_RE = re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})')

TOPIC_TERMS = {
    'astral_projection_obe': [
        'astral', 'out-of-body', 'out of body', 'obe', 'lucid dream', 'monroe',
        'buhlman', 'raduga', 'near-death', 'near death',
    ],
    'meditation': [
        'meditat', 'mindful', 'mindfulness', 'breathwork', 'contemplative',
        'vipassana', 'zen', 'inner peace', 'stillness',
    ],
    'intuition_synchronicity': [
        'intuition', 'synchronic', 'jung', 'psychic', 'psi', 'esp', 'meaningful pattern',
    ],
    'metaphysics_consciousness_philosophy': [
        'consciousness', 'metaphys', 'philosoph', 'ontology', 'panpsych', 'mind',
        'idealism', 'reality', 'qualia', 'chalmers', 'hofmann', 'hoffman', 'radin',
    ],
    'frequency_sound_wellness': [
        'frequency', 'sound bath', 'singing bowl', 'binaural', 'sound healing',
        'sound meditation', 'resonance', 'reiki', '432hz', '528hz', 'wellness',
    ],
}
LOW_VALUE_TERMS = [
    'black screen', 'sleep music', 'sleep sounds', 'healing frequency', 'affirmation',
    'manifestation', 'abundance frequency', 'chakra activation', 'relaxing music',
    'meditation music', 'sound bath', 'audiobook', 'recitation', 'playlist',
]


def ids_in_text(text):
    return set(URL_RE.findall(text or ''))


def prior_ids():
    known = set(ids_in_text((ROOT / 'sources' / 'links.txt').read_text(errors='ignore')))
    for path in OUT.iterdir():
        if path.name.startswith(DATE):
            continue
        if path.suffix.lower() not in {'.json', '.md', '.txt'}:
            continue
        try:
            known.update(ids_in_text(path.read_text(errors='ignore')))
        except Exception:
            pass
    return known


def rights_signals(meta):
    description = meta.get('description') or ''
    license_value = (meta.get('license') or '').strip()
    text = f'{license_value}\n{description}'
    lower = text.lower()
    signals = []
    if license_value:
        signals.append(f'metadata license: {license_value}')
    if 'creative commons attribution' in license_value.lower() or 'cc by' in license_value.lower():
        signals.append('video-level Creative Commons Attribution metadata')
    if 'creative commons' in lower or re.search(r'\bcc[- ]?by(?:[- ]?(?:nc|nd|sa))?', lower):
        signals.append('description mentions Creative Commons/CC')
    if 'public domain' in lower:
        signals.append('description mentions public domain')
    permission_patterns = [
        r'published with permission', r'posted with permission', r'used with permission',
        r'with permission from', r'permission from', r'permission granted',
        r'reproduced with permission', r'shared with permission',
    ]
    for pattern in permission_patterns:
        if re.search(pattern, lower):
            signals.append(f'description phrase: {pattern}')
    if 'noncommercial' in lower or 'non-commercial' in lower or 'cc by-nc' in lower or 'cc by nc' in lower:
        signals.append('noncommercial restriction present')
    if 'sharealike' in lower or 'share-alike' in lower or 'cc by-sa' in lower or 'cc by sa' in lower:
        signals.append('share-alike restriction present')
    if 'no derivatives' in lower or 'cc by-nd' in lower or 'cc by nd' in lower:
        signals.append('no-derivatives restriction present')
    return signals


def topic_hits(meta):
    text = ' '.join(str(meta.get(key) or '') for key in ('title', 'channel', 'uploader', 'description')).lower()
    return {name: [term for term in terms if term in text] for name, terms in TOPIC_TERMS.items() if any(term in text for term in terms)}


def low_value_hits(meta):
    text = ' '.join(str(meta.get(key) or '') for key in ('title', 'description')).lower()
    return [term for term in LOW_VALUE_TERMS if term in text]


index = json.loads((OUT / f'{DATE}_candidate_index.json').read_text())
metadata = json.loads((OUT / f'{DATE}_metadata.json').read_text())
known = prior_ids()
rows = []
for row in metadata['rows']:
    meta = row.get('metadata') or {}
    language = (meta.get('language') or '').strip()
    live_status = (meta.get('live_status') or '').strip()
    unavailable = (meta.get('availability') or '').strip().lower() not in {'', 'public'}
    live_flags = [
        flag for flag in ('is_live', 'was_live')
        if meta.get(flag) is True
    ]
    signals = rights_signals(meta) if row.get('resolved') else []
    rows.append({
        'id': row.get('id'),
        'url': row.get('url'),
        'discovered_via': row.get('discovered_via'),
        'query': row.get('query'),
        'resolved': bool(row.get('resolved')),
        'error': row.get('error'),
        'duplicate_or_prior_record': row.get('id') in known,
        'title': meta.get('title'),
        'channel': meta.get('channel') or meta.get('uploader'),
        'upload_date': meta.get('upload_date'),
        'duration': meta.get('duration'),
        'license': meta.get('license'),
        'availability': meta.get('availability'),
        'live_status': live_status,
        'live_flags': live_flags,
        'language': language,
        'channel_id': meta.get('channel_id'),
        'webpage_url': meta.get('webpage_url'),
        'description': meta.get('description'),
        'categories': meta.get('categories'),
        'view_count': meta.get('view_count'),
        'rights_signals': signals,
        'topic_hits': topic_hits(meta) if row.get('resolved') else {},
        'low_value_hits': low_value_hits(meta) if row.get('resolved') else [],
        'candidate_bucket': 'unresolved' if not row.get('resolved') else 'resolved_pending_review',
    })

summary = {
    'generated_at': datetime.now().astimezone().isoformat(),
    'date': DATE,
    'candidate_count': len(rows),
    'resolved': sum(r['resolved'] for r in rows),
    'unresolved': sum(not r['resolved'] for r in rows),
    'prior_id_count': len(known),
    'duplicates_or_prior_records': sum(r['duplicate_or_prior_record'] for r in rows),
    'nonduplicates': sum(not r['duplicate_or_prior_record'] for r in rows),
    'public_rows': sum((r.get('availability') or '').lower() == 'public' for r in rows),
    'live_or_upcoming': sum(r.get('live_status') in {'is_live', 'is_upcoming', 'live', 'upcoming'} or bool(r.get('live_flags')) for r in rows),
    'explicit_non_english': sum(bool(r.get('language')) and not r['language'].lower().startswith('en') for r in rows),
    'with_rights_signals': sum(bool(r['rights_signals']) for r in rows),
    'ddgs_discovered': sum(r.get('discovered_via') == 'ddgs' for r in rows),
}
(OUT / f'{DATE}_candidate_review.json').write_text(json.dumps({
    'summary': summary,
    'rows': rows,
}, indent=2, ensure_ascii=False) + '\n')

nonduplicates = [r for r in rows if r['resolved'] and not r['duplicate_or_prior_record']]
nonduplicates.sort(key=lambda r: (r.get('upload_date') or '', r.get('title') or ''), reverse=True)
print(json.dumps(summary, indent=2, ensure_ascii=False))
print('\nNONDUPLICATE RESOLVED REVIEW ROWS')
for r in nonduplicates:
    print(json.dumps({
        key: r.get(key) for key in (
            'id', 'title', 'channel', 'upload_date', 'duration', 'license',
            'availability', 'live_status', 'live_flags', 'language', 'rights_signals',
            'topic_hits', 'low_value_hits', 'url',
        )
    }, ensure_ascii=False))
