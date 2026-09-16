# Daily YouTube research — 2026-08-24

## Freshness contract
- Run local time: `2026-08-24T10:32:11-05:00`
- Freshness cutoff: `2026-07-24T10:32:11-05:00` (current local date/time minus 31 days)
- Authority: resolved YouTube `upload_date` from `yt-dlp` metadata; search filters/snippets were discovery only.
- Date-level rule: videos uploaded on `2026-07-24` or later and not in the future pass the date gate.
- Missing or older upload dates were rejected before download/render.

## Search coverage and duplicate control
- Priority personalities searched by exact name plus interview/podcast/talk: Robert Monroe, William Buhlman, Michael Raduga, Susan Blackmore, Andrew Holecek, Tom Campbell, Donald Hoffman, Bernardo Kastrup, Dean Radin, and Jeffrey Kripal.
- Topic combinations searched: hemispheric synchronization, binaural beats, brain entrainment, frequency-following response, consciousness, meditation, attention, altered-state history, Gateway/remote-viewing/audio-training programs.
- Configured web search was attempted first but failed with `Firecrawl search failed: 'NoneType' object has no attribute 'status_code'`.
- DuckDuckGo/DDGS was used as the free web fallback for web discovery. Results were noisy and one query returned a protocol error; no search-demand, ranking, or volume claims are made.
- YouTube discovery used 14 filtered queries with `after:2026-07-24`, returning 60 discovered results; 58 resolved with `yt-dlp` metadata. Resolved metadata is authoritative for upload dates.
- Existing clip state and prior daily notes were inspected. Previously documented sources were excluded from reprocessing.
- Research artifacts: `20260824_ddgs_results.json`, `20260824_ytdlp_search.json`, `20260824_ytdlp_search_metadata.json`, and `20260824_summary.json`.

## Selected eligible source

### Episode 116: From Dreams to OBEs
- YouTube URL: `https://www.youtube.com/watch?v=Ujza1Auexh4`
- Creator/channel: Shaks Talks / Shaks Talks
- Verified YouTube upload date: `2026-07-26`
- Freshness decision: PASS — 29 calendar days old at research time and inside the 31-day window.
- Personality/topic match: direct Tom Campbell match in the episode description, with an out-of-body experience / consciousness / altered-state explainer angle. The source is a substantive 29-minute educational talk.
- Rights basis: `NOT_VERIFIED` — the description contains a generic fair-use disclaimer, which is not documented permission or a platform reuse license. This source is therefore research-only and must not be downloaded, rendered, or republished.
- Selection decision: not eligible for the clip pipeline because reuse rights are not verified.

## Alternate fresh rights-cleared result not selected

### Guiding Your Attention — Dhamma Talk, Guided Meditation, Q&A
- YouTube URL: `https://www.youtube.com/watch?v=rXmkl19WXY4`
- Creator/channel: Anukampa Bhikkhuni Project / Anukampa Bhikkhuni Project
- Verified YouTube upload date: `2026-08-04`
- Freshness decision: PASS — 20 calendar days old at research time and inside the 31-day window.
- Personality/topic match: meditation and attention; a substantive 86-minute guided meditation, practical talk, and Q&A.
- Rights basis: `Creative Commons Attribution license (reuse allowed)` from resolved YouTube metadata.
- Selection decision: eligible and selected for the established Cognistration pipeline. The clip will use a 90-second speech-led segment and produce both required variants.

## Other fresh candidates reviewed and rejected
- Candidates with a missing/older date, weak or accidental personality/topic match, insufficient duration, duplicate source ID, unsupported health claims, or no verified rights basis were rejected.
- No rejected candidate was downloaded or rendered.

## Run gate
- Eligible rights-cleared source selected: `1`
- Planned duration: `90` seconds (within the required 45–120 second range).
- Invocation: `./run.sh 'https://www.youtube.com/watch?v=rXmkl19WXY4' '' 90`

## Verified publish result
- Run ID: `20260824_103436`
- Standard full-bleed YouTube upload: `https://www.youtube.com/watch?v=VCQkuv552BU`
- Landscape-letterbox YouTube upload: `https://www.youtube.com/watch?v=DufZuSMj9Zc`
- YouTube read-back: both uploads are public, belong to the Cognistration channel (`UCGZsEX2J-R9NN2EE4Lx9xfw`), are 90 seconds, and contain the App Store, web, machine, bundled tone-pack, responsible non-medical wording, and original-source attribution sections.
- Standard Drive video: `https://drive.google.com/file/d/1rQAaLoQcBMn8B12QNFAIN9gQm4PL9A-m/view?usp=drivesdk`
- Landscape-letterbox Drive video: `https://drive.google.com/file/d/18852vcb-Ax3jsGR7K8-_Izss0QhKBRIT/view?usp=drivesdk`
- Drive metadata: `https://drive.google.com/file/d/1P96NeeJZf5fCO7tamXIRFdNVC7UTFb4q/view?usp=drivesdk`
- Drive transcript: `https://drive.google.com/file/d/1vE7hP7ptk4V2Oh_kB1Wh1ko9mG5DzUT9/view?usp=drivesdk`
- Drive description: `https://drive.google.com/file/d/1iO8wz2FQea4FX6TW9YJwTIOH8ZM_O0P4/view?usp=drivesdk`
- Drive YouTube proof: `https://drive.google.com/file/d/1T3DJX7VGdju13spjByEXIDADo2m8Gu4e/view?usp=drivesdk`
- Drive read-back: all six files were read back with non-zero sizes: `51,207,407`, `12,213,594`, `38,512`, `857,744`, `1,694`, and `1,193` bytes.
- Render/publish contract: both verified uploads are public 1080×1920 videos with 90-second duration; the runner completed its dual-variant render and YouTube/Drive verification gates.
- Local cleanup: run directory `20260824_103436` was removed after the YouTube and Drive checks passed.
