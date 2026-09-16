# Daily YouTube research — 2026-08-28

## Freshness contract
- Run local time: `2026-08-28T11:05:14.588420-05:00`
- Freshness cutoff: `2026-07-28T11:05:14.588420-05:00` (current local date/time minus 31 days)
- Authority: resolved YouTube `upload_date` from `yt-dlp`; search snippets were discovery-only.

## Search and duplicate control
- Direct YouTube discovery covered 25 broad/personality queries plus 18 date-filtered priority/topic queries: `334` unique candidates; `332` resolved metadata records.
- Existing clip/research artifacts were scanned for exact YouTube IDs before selection. The complete per-candidate record is `20260828_candidate_decisions.json`.
- Configured Firecrawl-backed web search failed with a `NoneType/status_code` error. DDGS was retried with the installed user-site path and returned noisy/partially irrelevant results; it was used only for discovery, not for upload-date, rights, search-demand, ranking, or trend claims. Direct `yt-dlp` YouTube discovery with date filters supplied the authoritative candidate/date work.

## Selected eligible source
### A Quantum Computer Picked a Question for Dean Radin and he provides his question
- YouTube URL: `https://www.youtube.com/watch?v=aPdywHE0JRM`
- Creator/channel: `Thomas Ehmer`
- Verified YouTube upload date: `2026-08-04`
- Freshness decision: `PASS` — 24 days old at selection time; cutoff date `2026-07-28`.
- Personality/topic match: Dean Radin; consciousness, quantum-computing, AI-consciousness, and philosophy-of-mind discussion.
- Rights basis: `Creative Commons Attribution license (reuse allowed)` from resolved YouTube metadata.
- Duplicate decision: `PASS` — exact source was not present in the prior research/publish ledger.
- The source description states the quantum process selected the question, not that it validated the answer; the clip description keeps the framing educational and non-medical.

## Publish and archive result
- Requested clip duration: 90 seconds.
- Both variants rendered and published: standard full-bleed and landscape-letterbox.
- YouTube read-back: both public, owned by channel `Cognistration` (`UCGZsEX2J-R9NN2EE4Lx9xfw`), and both descriptions contain the App Store and web CTAs plus original attribution.
- Drive archive: all six files uploaded to the Cognistration Video Clips folder and read back with exact size checks.
- Local cleanup: `PASS`; run `20260828_104813` was deleted only after both external verification stages passed.

## URLs
- YouTube standard: https://www.youtube.com/watch?v=LlwDjfmi_TY
- YouTube landscape-letterbox: https://www.youtube.com/watch?v=JHitMln3zo4
- Drive standard video: https://drive.google.com/file/d/1Mtgt5kvLpF8riYp1pQ0dEBZt4Xmw0hrW/view?usp=drivesdk
- Drive landscape video: https://drive.google.com/file/d/1VZ14bSB9cvvV95VKxgB56UTZW8MXs4CY/view?usp=drivesdk
- Drive metadata: https://drive.google.com/file/d/1X8pohUk7Lvhm8dQtvJ_GOr1fqOS03s5h/view?usp=drivesdk
- Drive transcript: https://drive.google.com/file/d/1j78berq8cP8x7wQRucbDXDof0wWqXLzS/view?usp=drivesdk
- Drive description: https://drive.google.com/file/d/1Jb3hJEL-7j5UehNw66NCuLq2M-jq_ztw/view?usp=drivesdk
- Drive YouTube proof: https://drive.google.com/file/d/1FH4fcMTK7W5kD9kO5HelGp_3z4lmycS0/view?usp=drivesdk

## Other fresh rights/relevance outcomes
- Fresh candidates with verified upload dates: `165`; fresh substantive candidates reviewed: `138`; fresh candidates with declared reuse language: `2`; new rights-cleared candidates: `1`.
- The other declared Creative Commons candidate was Sadhguru’s `Consequences of Meddling with Life Energies` (`KCxspJWpOKs`, uploaded `2026-08-12`), rejected as an exact-source duplicate already published on 2026-08-23.
- Fresh priority-personality candidates without documented rights remained research-only and were not downloaded or rendered, including Tom Campbell, Donald Hoffman, Dean Radin, Susan Blackmore, Bernardo Kastrup, and Robert Monroe matches.

## Next action
Repeat the priority-personality and topic search on the next scheduled run. Keep the resolved upload-date gate, exact-source duplicate gate, documented-rights stop condition, dual-variant verification, and six-file Drive archive requirements unchanged.
