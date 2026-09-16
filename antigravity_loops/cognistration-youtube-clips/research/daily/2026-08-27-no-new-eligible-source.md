# Daily YouTube research — 2026-08-27

## Freshness contract
- Run local time: `2026-08-27T10:32:24.181356-05:00`
- Freshness cutoff: `2026-07-27T10:32:24.181356-05:00` (current local date/time minus 31 days)
- Authority: resolved YouTube `upload_date` from `yt-dlp`; search filters and snippets were discovery-only.
- Date-level rule: videos uploaded on or after the cutoff date and not in the future pass; missing or older dates are rejected before download or render.

## Search coverage and duplicate control
- Priority personalities searched by exact name plus interview/podcast/talk: Robert Monroe, William Buhlman, Michael Raduga, Susan Blackmore, Andrew Holecek, Tom Campbell, Donald Hoffman, Bernardo Kastrup, Dean Radin, and Jeffrey Kripal.
- Topic combinations searched: hemispheric synchronization, binaural beats, brain entrainment, frequency-following response, consciousness, meditation, attention, altered-state history, Gateway/remote-viewing/audio-training programs.
- Configured web search was attempted first but failed with `Firecrawl search failed: 'NoneType' object has no attribute 'status_code'`; no paid web-search result was used and no demand/ranking/volume claim is made.
- DDGS was used as the free web fallback: 14 queries, 34 results, and 9 query-level errors. YouTube direct search was also run with 14 queries and returned 82 discovery records.
- After URL deduplication, 107 unique YouTube candidates were discovered. `yt-dlp` resolved 105 metadata records; two candidates could not be resolved (`CBii06UyWwY` — terminated account, and `4G60YUy2zbs` — unavailable).
- Existing clip state and prior research notes were inspected. Previously published/selected sources were not reused.
- Artifacts: `20260827_ddgs_results.json`, `20260827_ddgs_youtube_metadata.json`, `20260827_ytdlp_search.json`, and `20260827_ytdlp_search_metadata.json`.

## Eligibility result
- Unique YouTube candidates discovered/resolved: `107/105`
- Fresh candidates with a verified upload date: `80`
- Fresh substantive personality/topic candidates reviewed: `21`
- Fresh candidates with a non-empty YouTube license field: `1`
- New, non-duplicate, rights-cleared candidates: `0`
- Downloads performed: `0`
- Renders performed: `0`
- YouTube uploads performed: `0`
- Drive archives performed: `0`

## Rights-cleared result rejected as duplicate
### Consequences of Meddling with Life Energies | Sadhguru
- YouTube URL: `https://www.youtube.com/watch?v=KCxspJWpOKs`
- Creator/channel: Sadhguru / Sadhguru
- Verified YouTube upload date: `2026-08-12`
- Freshness decision: `PASS` — 15 calendar days old at research time.
- Personality/topic match: meditation.
- Rights basis: `Creative Commons Attribution license (reuse allowed)` from resolved YouTube metadata.
- Duplicate decision: `REJECTED — exact source was already published and archived in the 2026-08-23 run`.
- No source media was downloaded and no clip was rendered.

## Fresh substantive candidates rejected for unknown rights
The following passed the resolved-date and substantive-format review but had no Creative Commons/public-domain declaration, documented permission, licensing grant, or explicit Cognistration/partner authorization. They remain research-only; none was downloaded or rendered.

- `https://www.youtube.com/watch?v=hKBhUV9hflE` — **The 7.83 Frequency That Keeps You Locked Into Reality | Consciousness Gravity Explained**; uploaded `2026-08-27`; freshness `PASS`; personality match: none; topic match: consciousness/frequency; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=FEm72b-4f5U` — **Are Magic Mushrooms a Gateway to Consciousness? | Eric Osborne**; uploaded `2026-08-25`; freshness `PASS`; personality match: none; topic match: consciousness/Gateway; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=xlp-b6FZ7qs` — **NASA Physicist SAYS FULL DISCLOSURE Is Coming—But Not How You Think | Tom Campbell**; uploaded `2026-08-22`; freshness `PASS`; personality match: Tom Campbell; topic match: consciousness/meditation/remote viewing; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=lcaY-rd9Dhc` — **UFOs, Psychics and The Afterlife with PhD Jeffrey Mishlove**; uploaded `2026-08-13`; freshness `PASS`; personality match: none; topic match: consciousness/remote viewing; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=Z72CVg0_DBw` — **If You Don't Understand Frequency, You Don't Understand Healing**; uploaded `2026-08-21`; freshness `PASS`; personality match: none; topic match: frequency/consciousness; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=kka7H5Oejvs` — **Remote Viewer 001's Classified Trip Report: The Gateway Files**; uploaded `2026-08-19`; freshness `PASS`; personality match: none; topic match: Gateway/remote viewing; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=f-ngyyvAFf4` — **Analysis Of The Gateway Process: Spirit Travel and Soul Bodies**; uploaded `2026-08-19`; freshness `PASS`; personality match: none; topic match: binaural/Gateway/remote viewing/Monroe Institute/OBE; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=sGTqrMkAhE0` — **The Gateway Process: Where the Evidence Ends**; uploaded `2026-08-17`; freshness `PASS`; personality match: Robert Monroe; topic match: binaural/consciousness/Gateway/remote viewing; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=ovIvA9Ut2gg` — **Ancient Mystics and Modern Science Just Drew the Same Map of Consciousness**; uploaded `2026-08-14`; freshness `PASS`; personality match: none; topic match: consciousness; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=yuHTA9LF7KM` — **Episode 161 – Dr. Dean Radin – The Science of Spirituality, Yoga and Meditation. Experiments in Q...**; uploaded `2026-08-12`; freshness `PASS`; personality match: Dean Radin; topic match: meditation; rights basis: `NOT_VERIFIED` (also seen in the 2026-08-25 research pass).
- `https://www.youtube.com/watch?v=Gm4_g8PgsTE` — **Essentials: Using Meditation to Focus, View Consciousness & Expand Your Mind | Dr. Sam Harris**; uploaded `2026-08-08`; freshness `PASS`; personality match: none; topic match: consciousness/meditation/attention; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=H12OMJy55gE` — **Consciousness Creates Reality: Tom Campbell on Why Your Mind Heals Before Your Body**; uploaded `2026-08-06`; freshness `PASS`; personality match: Tom Campbell; topic match: consciousness; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=E49g3zJerss` — **The Unsettling Link Between Jung’s Red Book and Tolkien**; uploaded `2026-08-03`; freshness `PASS`; personality match: none; topic match: consciousness/altered-state history; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=KK0mPXlbtRE` — **Psychology of Meditation | Dr. Daniel P. Brown (1982)**; uploaded `2026-08-02`; freshness `PASS`; personality match: none; topic match: meditation/attention; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=xkgGja2r0f0` — **The Gateway Process Explained - How Consciousness, Remote Viewing, Hemi-Sync, and The CIA Connect**; uploaded `2026-08-02`; freshness `PASS`; personality match: Robert Monroe; topic match: binaural/consciousness/Gateway/remote viewing/Monroe Institute; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=80VN5ID_bgI` — **J Johnson's Frequency Technology is Insane**; uploaded `2026-07-31`; freshness `PASS`; personality match: none; topic match: binaural/consciousness/meditation; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=RB6wG0abwnM` — **Robert Monroe's Secret Connection to Antigravity - Featuring T. Townsend Brown & Agnew Bahnson**; uploaded `2026-07-31`; freshness `PASS`; personality match: Robert Monroe; topic match: altered-state history; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=q7f4U-Pp5Zc` — **The CIA Wrote a Guide to Escaping Your Physical Body (Analysis and Assessment of Gateway Process)**; uploaded `2026-07-30`; freshness `PASS`; personality match: none; topic match: binaural/consciousness/Gateway/remote viewing; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=heuSaNhGd_Y` — **He Entered “Mall World”… Then They Asked Him to Sign a Reincarnation Contract | Tony**; uploaded `2026-07-28`; freshness `PASS`; personality match: none; topic match: consciousness/altered states/OBE; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=m3uANfpB3LY` — **The Monroe Institute's Remote Viewing Protocol Explained**; uploaded `2026-08-11`; freshness `PASS`; personality match: Robert Monroe; topic match: remote viewing/Monroe Institute; rights basis: `NOT_VERIFIED`.
- `https://www.youtube.com/watch?v=fWaHz2KcuNo` — **Neuroscience, Synchronicities, & the Evidence for a Playful Universe — Dr. Marjorie Woollacott**; uploaded `2026-08-13`; freshness `PASS`; personality match: none; topic match: consciousness/meditation/attention; rights basis: `NOT_VERIFIED` (also seen in prior research).

## Run gate
- New eligible rights-cleared source selected: `0`
- `run.sh` invocation: not run; no source passed freshness, non-duplicate, substantive-format, and documented-rights gates.
- Local cleanup: no candidate run directory remains; the metadata-only directory created by the initial invalid `--help` probe was removed. No generated media required cleanup.

## Next action
Repeat the priority-personality and topic search on the next scheduled run. Keep the resolved metadata freshness gate, exact-source duplicate gate, and documented-rights stop condition unchanged. Do not download any listed research-only candidate without a documented rights basis.
