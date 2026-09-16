# Daily YouTube research — 2026-08-26

## Freshness contract
- Run local time: `2026-08-26T10:39:57.624118-05:00`
- Freshness cutoff: `2026-07-26T10:39:57.624118-05:00` (current local date/time minus 31 days)
- Authority: resolved YouTube `upload_date` from `yt-dlp`; search filters/snippets were discovery-only.
- Date-level rule: videos uploaded on or after the cutoff date and not in the future pass; missing/older dates are rejected before download or render.

## Search coverage and duplicate control
- Priority personalities searched by exact name plus interview/podcast/talk: Robert Monroe, William Buhlman, Michael Raduga, Susan Blackmore, Andrew Holecek, Tom Campbell, Donald Hoffman, Bernardo Kastrup, Dean Radin, and Jeffrey Kripal.
- Topic combinations searched: hemispheric synchronization, binaural beats, brain entrainment, frequency-following response, consciousness, meditation, attention, altered-state history, Gateway/remote-viewing/audio-training programs.
- Configured web search was attempted first but failed with `Firecrawl search failed: 'NoneType' object has no attribute 'status_code'`; no Firecrawl/API key was available.
- DDGS was used as the free web fallback: 5 queries, 44 results, 0 DDGS errors. Demand/ranking/volume claims are not made.
- Targeted YouTube discovery used 14 filtered queries with `after:2026-07-26`, returning 47 unique candidates; all 47 resolved with `yt-dlp` metadata.
- DDGS yielded 26 additional unique YouTube watch links; all 26 resolved with `yt-dlp` metadata, and their older dates were checked separately.
- Existing clip state and prior daily notes were inspected; exact source IDs already documented were marked duplicates and not reprocessed.
- Artifacts: `20260826_ddgs_results.json`, `20260826_ytdlp_search.json`, `20260826_ytdlp_search_metadata.json`, and `20260826_ddgs_youtube_metadata.json`.

## Eligibility result
- Targeted YouTube candidates discovered/resolved: `47/47`
- Fresh targeted candidates: `47`
- Fresh substantive targeted candidates: `13`
- Fresh substantive candidates with a declared/documented rights basis: `1`
- New, non-duplicate rights-cleared candidates: `0`
- Downloads performed: `0`
- Renders performed: `0`
- YouTube uploads performed: `0`
- Drive archives performed: `0`

## Rights-cleared result(s)
### Consequences of Meddling with Life Energies | Sadhguru
- YouTube URL: `https://www.youtube.com/watch?v=KCxspJWpOKs`
- Creator/channel: Sadhguru / Sadhguru
- Verified YouTube upload date: `20260812`
- Freshness decision: `PASS` — 14 calendar days old at research time.
- Personality/topic match: none; meditation.
- Rights basis: `Creative Commons Attribution license (reuse allowed)`
- Duplicate decision: `REJECTED — exact source ID already documented`.

## Fresh substantive candidates rejected for unknown rights
- `https://www.youtube.com/watch?v=xlp-b6FZ7qs` — **NASA Physicist SAYS FULL DISCLOSURE Is Coming—But Not How You Think | Tom Campbell**; uploaded `20260822`; freshness `PASS` (4 days); personality match: Tom Campbell; topic match: consciousness, meditation, psychic phenomena; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=FEm72b-4f5U` — **Are Magic Mushrooms a Gateway to Consciousness? | Eric Osborne**; uploaded `20260825`; freshness `PASS` (1 days); personality match: none; topic match: consciousness, Gateway/audio training; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=tR9Q5E00oKI` — **What Binaural Beats Actually Do to Your Brain**; uploaded `20260809`; freshness `PASS` (17 days); personality match: none; topic match: binaural beats; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=nvCdJGkmEt8` — **Binaural Beats vs ASMR: Which Wins for Sleep?**; uploaded `20260731`; freshness `PASS` (26 days); personality match: none; topic match: binaural beats, brain entrainment; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=Gm4_g8PgsTE` — **Essentials: Using Meditation to Focus, View Consciousness & Expand Your Mind | Dr. Sam Harris**; uploaded `20260808`; freshness `PASS` (18 days); personality match: none; topic match: consciousness, meditation, attention; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=bT8zpW7uEIU` — **Essentials: Using Meditation to Focus, View Consciousness & Expand Your Brain | Dr. Sam Harris**; uploaded `20260810`; freshness `PASS` (16 days); personality match: none; topic match: consciousness, meditation, attention; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=sGTqrMkAhE0` — **The Gateway Process: Where the Evidence Ends**; uploaded `20260817`; freshness `PASS` (9 days); personality match: Robert Monroe; topic match: binaural beats, consciousness, remote viewing, Gateway/audio training; rights basis: `NOT_VERIFIED`; research-only.

Other fresh results were rejected for exact-source duplication, weak/accidental topic matches, non-substantive music/guided-media format, or unknown reuse rights. No rejected candidate was downloaded, rendered, published, or archived.

## Run gate
- New eligible rights-cleared source selected: `0`
- `run.sh` invocation: not run; no source passed freshness, non-duplicate, substantive-format, and documented-rights gates.
- Local cleanup: no run directory was created; no generated media required cleanup.

## Next action
Repeat the priority-personality and topic search on the next scheduled run. Keep the verified metadata freshness gate, exact-source duplicate gate, and documented-rights stop condition unchanged.
