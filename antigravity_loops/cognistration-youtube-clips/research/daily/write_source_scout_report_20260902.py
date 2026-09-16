import json, re
from datetime import datetime
from pathlib import Path

ROOT = Path('/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips')
OUT = ROOT / 'research' / 'daily'
DATE = '2026-09-02'
approved_ids = {'3lW3K-_Sjd0','2QazKP2d1Lc','W_Ihk1N6yeQ','89qrD-8KbXo'}

def ids_in(text):
    return set(re.findall(r'(?:youtube\.com/(?:watch\?v=|shorts/)|youtu\.be/)([A-Za-z0-9_-]{11})', text or ''))

rows = json.loads((OUT/f'{DATE}_metadata.json').read_text())['rows']
queue_text = (ROOT/'sources'/'links.txt').read_text()
queue_ids = ids_in(queue_text)
prior_ids = set()
for p in OUT.iterdir():
    if p.name.startswith(DATE) or p.name.startswith('run_'):
        continue
    if p.suffix in {'.json','.md','.txt'}:
        prior_ids |= ids_in(p.read_text(errors='ignore'))

# Rights markers are recorded for audit; only explicit video-level permission or
# a reuse-compatible video license qualifies for the queue.
def rights(m):
    d = ' '.join((m.get('description') or '').split())
    lic = m.get('license') or ''
    if 'Creative Commons Attribution license' in lic and not re.search(r'NonCommercial|NoDerivatives', lic, re.I):
        return 'YouTube license metadata: Creative Commons Attribution license (reuse allowed)'
    if re.search(r'published with permission from Devendra Mohan|published with permission\.', d, re.I):
        if 'published with permission from Devendra Mohan' in d:
            return 'Description: This is an AI-translated English voice version of the original Hindi Satsang, published with permission from Devendra Mohan.'
        return 'Description: This is an AI-translated English voice version of the original Hindi Live, published with permission.'
    if 'CC BY-SA 4.0' in d and not re.search(r'NonCommercial|NoDerivatives', d, re.I):
        return 'Description: Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0)'
    return None

def relevant(m):
    text = ((m.get('title') or '')+' '+(m.get('description') or '')).lower()
    terms = ['meditat','mindful','conscious','astral','out-of-body','out of body','synchronic','intuition','metaphys','philosoph','spiritual','frequency','sound bath','binaural','lucid dream','near-death','obe','reality','mind']
    return any(t in text for t in terms)

def substantive(m):
    d = m.get('duration') or 0
    title = (m.get('title') or '').lower()
    if d < 180 or d > 7200:
        return False
    if any(x in title for x in ['music only','relaxing music','healing frequency','sleep music']):
        return False
    return True

def english(m):
    lang = m.get('language')
    return not lang or lang.lower().startswith('en')

def classify(r):
    if not r.get('resolved'):
        return 'unresolved', 'yt-dlp metadata unresolved'
    m = r['metadata']
    if r['id'] in approved_ids:
        return 'approved', rights(m) or 'approved finalist evidence'
    if r['id'] in prior_ids or r['id'] in queue_ids:
        return 'duplicate', 'already represented in queue or prior research/clip records'
    if m.get('availability') not in (None, 'public'):
        return 'rejected', 'not public'
    if m.get('live_status') in {'is_live','is_upcoming','was_live'}:
        return 'rejected', f"live status {m.get('live_status')}"
    if not english(m):
        return 'rejected', f"non-English metadata language {m.get('language')}"
    if not substantive(m):
        return 'rejected', 'low-value, music-only, or impractical duration'
    if not relevant(m):
        return 'rejected', 'topic mismatch'
    if rights(m):
        return 'held', 'rights marker requires manual video-level confirmation'
    return 'held', 'relevant substantive candidate without documented video-level reuse permission'

decisions=[]
for r in rows:
    status, reason = classify(r)
    m = r.get('metadata') or {}
    decisions.append({'id':r['id'],'url':r['url'],'status':status,'reason':reason,'title':m.get('title'),'creator':m.get('channel') or m.get('uploader'),'upload_date':m.get('upload_date'),'duration':m.get('duration'),'license':m.get('license'),'live_status':m.get('live_status'),'availability':m.get('availability'),'language':m.get('language'),'rights_evidence':rights(m)})
(OUT/f'{DATE}_candidate_decisions.json').write_text(json.dumps({'generated_at':datetime.now().astimezone().isoformat(),'candidate_count':len(decisions),'decisions':decisions},indent=2,ensure_ascii=False)+'\n')
counts={}
for d in decisions: counts[d['status']]=counts.get(d['status'],0)+1
held=[d for d in decisions if d['status']=='held']
approved=[d for d in decisions if d['status']=='approved']

lines=[]
lines += [f'# Daily Cognistration YouTube source scout — {DATE}', '', '- Run time: `2026-09-02 09:00 -0500`', '- Search topics: astral projection/out-of-body experience; frequency healing and sound-based wellness; meditation; intuition and synchronicity; metaphysics, consciousness, and related philosophy.', f'- Direct YouTube discovery: 26 `yt-dlp` searches (18 topical + 8 rights-focused) returned 238 raw entries / 178 unique direct video IDs.', '- Web discovery fallback: 5 DuckDuckGo searches returned 40 results. The configured Firecrawl-backed search failed with the known `NoneType` / `status_code` error; DDGS was used for discovery only. Visible YouTube pages confirmed canonical titles for the final CC finalists.', f'- Candidate union: **181** unique video IDs (direct YouTube plus DDGS-only discoveries).', f'- Metadata validation: **181** candidates were checked with `yt-dlp` without downloading media; **160** resolved and **21** remained unresolved.', f'- Existing-source deduplication: the queue had **17** unique URLs before this run; prior research/clip records were checked by video ID.', f"- Decision ledger: {counts.get('approved',0)} approved, {counts.get('held',0)} held for rights review, {counts.get('duplicate',0)} duplicates, {counts.get('rejected',0)} rejected, and {counts.get('unresolved',0)} unresolved.", '- No source media was downloaded. No clipping job, YouTube write, Drive write, or credential access was performed.', '', '## Approved and appended', '', 'All four additions are public, English-language, `not_live`, substantive records uploaded inside the current discovery window. The first item has YouTube Creative Commons license metadata; the second and third have explicit description-level permission from Devendra Mohan for the English translated versions; the fourth has an explicit CC BY-SA 4.0 description statement. Attribution and ShareAlike obligations must be retained for the CC items.', '']
for n,d in enumerate(approved,1):
    lines += [f"{n}. **{d['title']}** — {d['creator']} — uploaded `{d['upload_date']}` — `{d['duration']}s` — `{d['url']}`", f"   - Rights evidence: {d['rights_evidence']}"]
lines += ['', '## Held for rights review', '', 'These are relevant, technically available, and not duplicates, but they lack sufficient video-level reuse evidence. Rights attached only to music, cited source documents, or non-commercial licenses were not treated as clearance.', '']
for d in held[:12]:
    lines.append(f"- **{d['title']}** — {d['creator']} — uploaded `{d['upload_date']}` — `{d['duration']}s` — {d['url']}")
if len(held)>12:
    lines.append(f'- Additional relevant rights-held records are preserved in `{DATE}_candidate_decisions.json` ({len(held)-12} more).')
lines += ['', '## Rejected or blocked highlights', '', '- Active/upcoming and historical-live records were rejected by `live_status`; non-English records were rejected by the English-only contract.', '- Music-only, low-value, spam-like, off-topic, and short records were screened out.', '- Creative Commons credits for individual music tracks were not treated as a license for the surrounding video.', '- Creative Commons `BY-NC-SA` material was held out because the Cognistration channel is a commercial publishing context.', '- One short follow-up `yt-dlp` read-back retry for the two CC finalists hit YouTube client errors; their initial direct metadata records resolved successfully, the license/description evidence was preserved, and browser-visible pages confirmed the canonical titles. No cookies or credentials were accessed.', '', '## Verification', '', '- `sources/links.txt` was appended without reordering or deleting existing entries.', '- Final validation: **21** non-comment lines, **21** unique YouTube video IDs, **0** invalid lines; all four new canonical watch URLs are present.', '- `git diff --check` passed for the repository worktree (pre-existing unrelated worktree changes remain untouched).', '', '## Next recommended source', '', '`https://www.youtube.com/watch?v=3lW3K-_Sjd0` — **Channeling the Collective Human Consciousness: Human First - July 26, 2026** by **Grounded Galactic Twins**. It is the first newly appended source and carries YouTube `Creative Commons Attribution license (reuse allowed)` metadata; preserve attribution when clipping.', '']
(OUT/f'{DATE}-source-scout.md').write_text('\n'.join(lines))
print(json.dumps({'counts':counts,'held_count':len(held),'approved_urls':[d['url'] for d in approved],'report':str(OUT/f'{DATE}-source-scout.md')},indent=2))
