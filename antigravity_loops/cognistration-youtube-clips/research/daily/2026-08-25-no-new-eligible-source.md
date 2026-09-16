# Daily YouTube research — 2026-08-25

## Freshness contract
- Run local time: `2026-08-25T10:34:01-05:00`
- Freshness cutoff: `2026-07-25T10:34:01-05:00` (current local date/time minus 31 days)
- Authority: resolved YouTube `upload_date` from `yt-dlp` metadata; search filters and snippets were discovery-only.
- Date-level rule: videos uploaded on `2026-07-25` or later and not in the future pass the date gate.
- Missing or older upload dates were rejected before any download or render.

## Search coverage and duplicate control
- Priority personalities searched by exact name plus interview/podcast/talk: Robert Monroe, William Buhlman, Michael Raduga, Susan Blackmore, Andrew Holecek, Tom Campbell, Donald Hoffman, Bernardo Kastrup, Dean Radin, and Jeffrey Kripal.
- Topic combinations searched: hemispheric synchronization, binaural beats, brain entrainment, frequency-following response, consciousness, meditation, attention, altered-state history, Gateway/remote-viewing/audio-training programs.
- Configured web search was attempted first but failed with `Firecrawl search failed: 'NoneType' object has no attribute 'status_code'`.
- DuckDuckGo/DDGS was used as the free web fallback: 5 queries, 40 results, no DDGS errors. Search-demand, ranking, and volume claims are not made.
- YouTube discovery used 14 filtered queries with `after:2026-07-25`, returning 61 unique candidates; all 61 resolved with `yt-dlp` metadata. Resolved metadata is authoritative for upload dates.
- Existing clip state and prior daily notes were inspected. Previously documented source IDs were excluded from reprocessing.
- Research artifacts: `20260825_ddgs_results.json`, `20260825_ytdlp_search.json`, `20260825_ytdlp_search_metadata.json`, and `20260825_summary.json`.

## Eligibility result
- Verified fresh candidates: `61`
- Fresh substantive candidates: `35`
- Fresh substantive candidates with a declared/documented rights basis: `1`
- New, non-duplicate rights-cleared candidates: `0`
- Downloads performed: `0`
- Renders performed: `0`
- Uploads performed: `0`

### Rights-cleared result rejected as a duplicate
#### Consequences of Meddling with Life Energies | Sadhguru
- YouTube URL: `https://www.youtube.com/watch?v=KCxspJWpOKs`
- Creator/channel: Sadhguru / Sadhguru
- Verified YouTube upload date: `2026-08-12`
- Freshness decision: PASS — 13 calendar days old at research time and inside the 31-day window.
- Personality/topic match: meditation and consciousness-adjacent spiritual-practice discussion; substantive 43-minute official-channel talk.
- Rights basis: `Creative Commons Attribution license (reuse allowed)` from resolved YouTube metadata.
- Duplicate decision: REJECTED — this exact source ID is already documented and published in the 2026-08-23 run. It was not downloaded or rendered again.

## Strong fresh personality/topic candidates rejected for unknown rights
- `https://www.youtube.com/watch?v=yuHTA9LF7KM` — **Episode 161 – Dr. Dean Radin – The Science of Spirituality, Yoga and Meditation. Experiments in Q...**; uploaded `2026-08-12`; freshness PASS; personality match: Dean Radin; topic match: meditation; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=p_evVtA93-Q` — **Tom Campbell: We're in a Simulation — But What About FREE WILL??**; uploaded `2026-08-13`; freshness PASS; personality match: Tom Campbell; topic match: consciousness; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=E1bCDMjn8DY` — **GATEWAY TAPE Builder Desktop App – Create Your Own Hemi-Sync Brainwave Tapes**; uploaded `2026-08-16`; freshness PASS; personality/topic match: Robert Monroe; binaural, consciousness, meditation, Gateway, and OBE/audio-training topics; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=fWaHz2KcuNo` — **Neuroscience, Synchronicities, & the Evidence for a Playful Universe — Dr. Marjorie Woollacott**; uploaded `2026-08-13`; freshness PASS; consciousness, meditation, attention, and altered-state-adjacent topics; rights basis: `NOT_VERIFIED`; research-only.
- `https://www.youtube.com/watch?v=fw6u54bsVbM` — **8 Hz Theta Frequency — Brain Hemisphere Synchronization & Deep Meditation**; uploaded `2026-08-07`; freshness PASS; hemispheric synchronization, binaural, meditation, and attention match; rights basis: `NOT_VERIFIED`; audio-only and not rights-cleared.

Other fresh results were rejected for absent reuse rights, weak/accidental topic matches, non-substantive format, unsupported health framing, or duplicate source IDs. No rejected candidate was downloaded, rendered, published, or archived.

## Run gate
- New eligible rights-cleared source selected: `0`
- `run.sh` invocation: not run; no source passed both freshness, non-duplicate, substantive-format, and rights gates.
- Local cleanup: no run directory was created; no generated media required cleanup.

## Next action
Repeat the priority-personality and topic search on the next scheduled run. Keep the verified metadata freshness gate, exact-source duplicate gate, and documented-rights stop condition unchanged.
