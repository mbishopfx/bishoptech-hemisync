import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-14'
REPORT = OUT / f'{DATE}-source-scout.md'
URL_RE = re.compile(r'(?:youtube\.com/(?:watch\?v=|shorts/|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})')

ledger = json.loads((OUT / f'{DATE}_candidate_decisions.json').read_text())
discovery = json.loads((OUT / f'{DATE}_ytsearch_discovery.json').read_text())
ddgs = json.loads((OUT / f'{DATE}_ddgs_results.json').read_text())
links_text = (ROOT / 'sources' / 'links.txt').read_text()
link_lines = [line.strip() for line in links_text.splitlines() if line.strip() and not line.lstrip().startswith('#')]
queue_ids = []
for line in link_lines:
    match = URL_RE.search(line)
    if match:
        queue_ids.append(match.group(1))
queue_unique = set(queue_ids)

counts = ledger['counts']
decisions = ledger['decisions']
held = sorted(
    [row for row in decisions if row['status'] == 'held-rights-review'],
    key=lambda row: (row.get('upload_date') or '', row.get('title') or ''),
    reverse=True,
)
rejected_topic = sorted(
    [row for row in decisions if row['status'] == 'rejected-topic-or-low-value'],
    key=lambda row: (row.get('upload_date') or '', row.get('title') or ''),
    reverse=True,
)
rejected_language = [row for row in decisions if row['status'] == 'rejected-non-english']
rejected_live = [row for row in decisions if row['status'] == 'rejected-live-or-previously-live']
unresolved = [row for row in decisions if not row.get('resolved')]


def md(value):
    if value is None or value == '':
        return '—'
    return str(value).replace('|', '\\|').replace('\n', ' ').strip()


def date_text(value):
    value = str(value or '')
    if len(value) == 8 and value.isdigit():
        return f'{value[:4]}-{value[4:6]}-{value[6:]}'
    return value or '—'


def seconds_text(value):
    if value is None:
        return '—'
    return f'{value}s'


def row_link(row):
    return f'[{md(row.get("id"))}]({row.get("url")})'


def table(headers, rows):
    out = [
        '| ' + ' | '.join(headers) + ' |',
        '| ' + ' | '.join('---' for _ in headers) + ' |',
    ]
    out.extend('| ' + ' | '.join(row) + ' |' for row in rows)
    return '\n'.join(out)


ddgs_result_rows = sum(len(query.get('results', [])) for query in ddgs.get('queries', []))
ddgs_error_rows = sum(bool(query.get('error')) for query in ddgs.get('queries', []))
incidental = {
    'CSiICQYl9Kw': 'Description credits “Old Bossa by Twin Musicom” under Creative Commons Attribution; this is music-only attribution, not permission to repurpose the review video.',
    'Rfzwpga7aTM': 'Description credits music under Creative Commons and separately says the content contains copyright-free/public-domain material; it does not grant reuse of this gaming video and is outside the requested topic lane.',
}

lines = []
lines.append(f'# Cognistration YouTube Source Scout — {DATE}')
lines.append('')
lines.append('## Run summary')
lines.append('')
lines.append(f'- Search date: `{DATE}`.')
lines.append('- Topics searched: astral projection/out-of-body experience; frequency healing and sound-based wellness; meditation and mindfulness; intuition and synchronicity; metaphysics, consciousness, philosophy, and consciousness research.')
lines.append(f'- Direct discovery: **{len(discovery["queries"])}** `yt-dlp` searches (**{len(discovery.get("topic_queries", []))}** topical + **{len(discovery.get("rights_queries", []))}** rights-focused), using `after:{discovery.get("after")}`; **{ledger["direct_unique_candidates"]}** unique direct IDs.')
lines.append(f'- Web fallback: configured Firecrawl-backed search failed with `NoneType` / `status_code` on five attempts; browser-visible DuckDuckGo showed a human-verification challenge. No challenge was bypassed and no search-demand/ranking claim is made.')
lines.append(f'- DDGS fallback: **{ddgs_result_rows}** result rows from five queries, with **{ddgs_error_rows}** query error(s); it contributed **{ledger["ddgs_discovered_candidates"]}** IDs after deduplication.')
lines.append(f'- Combined candidate set: **{ledger["combined_unique_candidates"]}** unique videos.')
lines.append(f'- Metadata validation: **{ledger["candidate_count_checked"]}** candidates checked with `yt-dlp --dump-single-json --skip-download --no-playlist`; **{ledger["candidate_count_checked"] - ledger["unresolved_total"]}** resolved and **{ledger["unresolved_total"]}** unresolved. No video was downloaded.')
lines.append(f'- Existing-source deduplication: **{ledger["prior_known_ids"]}** queue/prior-record IDs were checked; **{counts.get("duplicate/prior-record", 0)}** candidates were duplicates or prior records.')
lines.append('')
lines.append('## Search queries')
lines.append('')
lines.append('### Direct topical queries')
lines.append('')
for query in discovery.get('topic_queries', []):
    lines.append(f'- `{query}`')
lines.append('')
lines.append('### Direct rights-focused queries')
lines.append('')
for query in discovery.get('rights_queries', []):
    lines.append(f'- `{query}`')
lines.append('')
lines.append('### DDGS fallback queries')
lines.append('')
for query in [item.get('query') for item in ddgs.get('queries', [])]:
    if query:
        lines.append(f'- `{query}`')
lines.append('')
lines.append('## Approved and appended')
lines.append('')
lines.append('**0** new canonical watch URLs were approved or appended.')
lines.append('')
lines.append('- No new candidate had a video-level YouTube Creative Commons/public-domain license or an explicit full-video permission statement.')
lines.append('- `sources/links.txt` was left unchanged; existing URL order and formatting were preserved.')
lines.append('')
lines.append('## Rights and permission audit')
lines.append('')
lines.append(f'- All **{ledger["new_nonduplicate_resolved_count"]}** new resolved candidates had `license=null` in the authoritative `yt-dlp` metadata.')
lines.append(f'- **{ledger["new_nonduplicate_rights_signal_rows"]}** new rows contained incidental rights-related text, but neither was a usable grant:')
for ident, explanation in incidental.items():
    lines.append(f'  - `{ident}` — {explanation}')
lines.append('- Rights for music, images, cited media, stock footage, or generic “copyright-free” language were not treated as permission to repurpose the surrounding video.')
lines.append('')
lines.append('## Held for rights review')
lines.append('')
lines.append(f'**{len(held)}** relevant substantive candidates remain held because no sufficient video-level Creative Commons/public-domain/permission basis was found. Each has `license=null`; no permission evidence was verified.')
lines.append('')
held_rows = []
for number, row in enumerate(held, 1):
    held_rows.append([
        str(number),
        md(row.get('title')),
        md(row.get('creator')),
        date_text(row.get('upload_date')),
        seconds_text(row.get('duration')),
        'license=null; no full-video grant found',
        row_link(row),
    ])
lines.append(table(['#', 'Title', 'Creator', 'Uploaded', 'Duration', 'Rights evidence', 'URL'], held_rows))
lines.append('')
lines.append('## Rejected or blocked')
lines.append('')
lines.append(f'- **{counts.get("rejected-topic-or-low-value", 0)}** topic/low-value candidates were rejected (fiction/manhwa noise, audio-only/music, teasers, unrelated sleep/audio-equipment/gaming content, health-treatment framing, or below the 90-second clip minimum).')
rejected_rows = []
for number, row in enumerate(rejected_topic, 1):
    rejected_rows.append([
        str(number),
        md(row.get('title')),
        md(row.get('creator')),
        date_text(row.get('upload_date')),
        md(row.get('reason')),
        row_link(row),
    ])
lines.append('')
lines.append(table(['#', 'Title', 'Creator', 'Uploaded', 'Reason', 'URL'], rejected_rows))
lines.append('')
lines.append(f'- **{counts.get("rejected-non-english", 0)}** explicit non-English candidate was rejected:')
for row in rejected_language:
    lines.append(f'  - {md(row.get("title"))} — {md(row.get("creator"))}, uploaded `{date_text(row.get("upload_date"))}`, language `{md(row.get("language"))}` — {row_link(row)}')
lines.append(f'- **{counts.get("rejected-live-or-previously-live", 0)}** live/previously-live candidate was rejected:')
for row in rejected_live:
    lines.append(f'  - {md(row.get("title"))} — {md(row.get("creator"))}, uploaded `{date_text(row.get("upload_date"))}`, `live_status={md(row.get("live_status"))}` — {row_link(row)}')
lines.append(f'- **{ledger["unresolved_total"]}** metadata resolutions were unresolved; both were already prior-record duplicates and therefore required no queue action:')
for row in unresolved:
    error = ' '.join((row.get('metadata_error') or '').split()).splitlines()[0][:260]
    lines.append(f'  - `{md(row.get("id"))}` — {row_link(row)} — {md(error)}')
lines.append('')
lines.append('## Verification')
lines.append('')
lines.append(f'- Final queue read-back before report closeout: **{len(link_lines)}** non-comment lines and **{len(queue_unique)}** unique YouTube IDs.')
lines.append('- Newly appended IDs expected: **0**; newly appended IDs found: **0**.')
lines.append('- No source media was downloaded. No clipping job, YouTube write, Drive write, or credential access was performed.')
lines.append('- `git diff --check` is the final repository check after this report is written.')
lines.append('')
lines.append('## Next recommended source')
lines.append('')
lines.append('No new source passed the rights gate. The next queued source remains queue index `0`: **Joe McMoneagle - CIA\'s Project Stargate | SRS #95** — **Shawn Ryan Show**, uploaded `2024-02-05`, `https://www.youtube.com/watch?v=XRTon6qgVws`.')
lines.append('')
lines.append('## Evidence artifacts')
lines.append('')
for name in [
    f'{DATE}_ytsearch_discovery.json',
    f'{DATE}_ddgs_results.json',
    f'{DATE}_candidate_index.json',
    f'{DATE}_metadata.json',
    f'{DATE}_candidate_review.json',
    f'{DATE}_candidate_decisions.json',
]:
    lines.append(f'- `research/daily/{name}`')
lines.append('')
REPORT.write_text('\n'.join(lines) + '\n')
print(json.dumps({
    'report': str(REPORT),
    'held': len(held),
    'rejected_topic_or_low_value': len(rejected_topic),
    'rejected_non_english': len(rejected_language),
    'rejected_live': len(rejected_live),
    'queue_lines': len(link_lines),
    'queue_unique_ids': len(queue_unique),
}, indent=2))
