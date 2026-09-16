# Daily YouTube research — 2026-08-29

## Freshness contract
- Run local time: `2026-08-29T10:34:42.137297-05:00`
- Freshness cutoff: `2026-07-29T10:33:59.075918-05:00` (current local date/time minus 31 days)
- Authority: resolved YouTube `upload_date` from `yt-dlp`; search snippets and DDGS results were discovery-only.

## Search and duplicate control
- Direct YouTube discovery covered 20 priority/personality/topic queries and returned `120` unique candidates.
- Resolved metadata: `119`; resolution errors: `1`.
- Existing run/research artifacts were scanned for exact YouTube IDs before selection. Full decisions: `20260829_candidate_decisions.json`.
- Configured Firecrawl-backed web search failed with a `NoneType/status_code` error. DDGS was used as a free discovery fallback only; no search-demand, ranking, or trend claims were made.

## Candidate reviewed and stopped
### Sarah Starr and Max Rempel — Starseeds, Telepathy and the World After Contact
- YouTube URL: `https://www.youtube.com/watch?v=zdtrvG3u2Rg`
- Creator/channel: `Hucolo TV / Channeling`
- Verified YouTube upload date: `20260829`
- Freshness decision: `PASS` by date against cutoff `2026-07-29T10:33:59.075918-05:00`.
- Personality/topic match: consciousness; altered-state history/telepathy-related discussion. No priority-roster personality was present.
- Rights basis: `Creative Commons Attribution license (reuse allowed)` from resolved YouTube metadata.
- Duplicate decision: `PASS` — exact source ID was not present in the prior ledger.
- Final gate: `REJECT` — resolved metadata reported `live_status=is_live`, and the download URL was an active DVR/live stream rather than a finalized uploaded video.

## Failure and cleanup status
- `run.sh` was started with a 90-second requested clip duration as required.
- Partial local run preserved at `runs/20260829_103817`; size at closeout: approximately 52 MB (`source.mp4` 54,263,808 bytes), plus source metadata, description, and subtitle files.
- The process was terminated before rendering. `renders=0`, `youtube_uploads=0`, `drive_archives=0`.
- No public source material was repurposed, no YouTube upload was made, and no Drive archive was created.
- The partial run remains intact for audit/retry, per failure policy.

## Other research-only outcomes
- Fresh substantive candidates without documented reuse rights remain research-only and were not downloaded or rendered.
- The previously published Creative Commons candidates were blocked by the exact-source duplicate gate.
- Candidate-level upload date, freshness decision, personality/topic match, rights basis, and final decision are recorded in `20260829_candidate_decisions.json`.

## Next action
Repeat the search on the next scheduled run, add an explicit `live_status != is_live` eligibility gate before invoking `run.sh`, and preserve the documented-rights, freshness, duplicate, dual-variant YouTube verification, and six-file Drive archive requirements.
