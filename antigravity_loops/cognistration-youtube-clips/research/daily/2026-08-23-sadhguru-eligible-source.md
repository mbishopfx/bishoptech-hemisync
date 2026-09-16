# Daily YouTube research — 2026-08-23

## Freshness contract
- Run local time: `2026-08-23T10:32:33-05:00`
- Freshness cutoff: `2026-07-23T10:32:33-05:00` (current local date/time minus 31 days)
- Authority: resolved YouTube `upload_date` from `yt-dlp` metadata; search filters/snippets were discovery only.
- Date-level rule: videos uploaded on `2026-07-23` or later and not in the future pass the date gate.
- Missing or older upload dates are rejected before download/render.

## Search coverage and duplicate control
- Priority personalities searched by exact name plus interview/podcast/talk: Robert Monroe, William Buhlman, Michael Raduga, Susan Blackmore, Andrew Holecek, Tom Campbell, Donald Hoffman, Bernardo Kastrup, Dean Radin, and Jeffrey Kripal.
- Topic combinations searched: hemispheric synchronization, binaural beats, brain entrainment, frequency-following response, consciousness, meditation, attention, altered-state history, Gateway/remote-viewing/audio-training programs.
- Configured web search was attempted first but failed with `Firecrawl search failed: 'NoneType' object has no attribute 'status_code'`.
- DuckDuckGo/DDGS was used as the free web fallback for web discovery. No search-demand, ranking, or volume claims are made.
- YouTube discovery used 14 filtered queries with `after:2026-07-23`, returning 45 unique results; all 45 were resolved with `yt-dlp` metadata and had no metadata-resolution errors.
- Existing clip state and prior daily notes were inspected. Previously documented sources were excluded from reprocessing.
- Research artifacts: `20260823_ddgs_results.json`, `20260823_ytdlp_search.json`, `20260823_ytdlp_search_metadata.json`, and `20260823_summary.json`.

## Selected eligible source

### Consequences of Meddling with Life Energies | Sadhguru
- YouTube URL: `https://www.youtube.com/watch?v=KCxspJWpOKs`
- Creator/channel: Sadhguru / Sadhguru
- Verified YouTube upload date: `2026-08-12`
- Freshness decision: PASS — 11 calendar days old at research time and inside the 31-day window.
- Personality/topic match: meditation, spiritual practice, consciousness, and the boundaries/risks of purported energy-healing practices; a substantive 43:20 official-channel talk.
- Rights basis: `Creative Commons Attribution license (reuse allowed)` from resolved YouTube metadata. This is the documented basis for download, clipping, and republishing.
- Planned action: run the established Cognistration clip pipeline for a 90-second clip, producing both the standard full-bleed and landscape-letterbox variants.

## Alternate rights-cleared result not selected

### Beta 17Hz Deep Work Block: 25-Min Pomodoro Session
- YouTube URL: `https://www.youtube.com/watch?v=eVcf9OejQa0`
- Creator/channel: BinauralMind: Unlock Your Brain's Potential
- Verified YouTube upload date: `2026-08-03`
- Freshness decision: PASS — inside the 31-day window.
- Personality/topic match: binaural beats, beta-frequency audio, frequency-following-response context, and attention/focus listening.
- Rights basis: `Creative Commons Attribution license (reuse allowed)` from resolved YouTube metadata.
- Selection decision: not used this run because it is primarily a 25-minute audio session rather than the requested interview/talk/explainer format; the Sadhguru source provides a stronger speech-led clip candidate.
- Action: no download, render, upload, or Drive archive for this alternate.

## Other fresh substantive candidates reviewed and rejected
- `https://www.youtube.com/watch?v=yuHTA9LF7KM` — **Episode 161 – Dr. Dean Radin – The Science of Spirituality, Yoga and Meditation. Experiments in Q...**; uploaded `2026-08-12`; strong personality/topic match; rights not verified (`license` absent and no reuse permission found).
- `https://www.youtube.com/watch?v=p_evVtA93-Q` — **Tom Campbell: We're in a Simulation — But What About FREE WILL??**; uploaded `2026-08-13`; strong personality/topic match; rights not verified.
- `https://www.youtube.com/watch?v=80VN5ID_bgI` — **J Johnson's Frequency Technology is Insane**; uploaded `2026-07-31`; frequency/entrainment-adjacent; rights not verified.
- `https://www.youtube.com/watch?v=7NO6ldTZIhs` — **Heals Both Brain Hemispheres: Hemispheric Synchronization...**; uploaded `2026-08-09`; audio/frequency match, but rights not verified and the title makes an unsupported health claim.
- `https://www.youtube.com/watch?v=Unfm3kKoWJg` — **[Peak Focus] Problem Solving — 40Hz Gamma Binaural Beats**; uploaded `2026-07-28`; audio/frequency match; rights not verified.
- Other fresh results were rejected for absent rights, weak/accidental name matches, or non-substantive/short format. No rejected candidate was downloaded or rendered.

## Run gate
- Eligible rights-cleared source selected: `1`
- Planned duration: `90` seconds (within the required 45–120 second range).
- `run.sh` invocation: `./run.sh 'https://www.youtube.com/watch?v=KCxspJWpOKs' '' 90`

## Verified publish result
- Run ID: `20260823_103515`
- Standard full-bleed YouTube upload: `https://www.youtube.com/watch?v=Tx-DG-bpmCw`
- Landscape-letterbox YouTube upload: `https://www.youtube.com/watch?v=cMttwa8ZDOY`
- YouTube read-back: both uploads are public, belong to the Cognistration channel (`UCGZsEX2J-R9NN2EE4Lx9xfw`), are 90 seconds, and contain the App Store, web, machine, bundled-pack, responsible-language, and original-source attribution sections.
- Standard Drive video: `https://drive.google.com/file/d/1dWFmcflIZqgg7zIIVUIkD_hKuMbrqa8x/view?usp=drivesdk`
- Landscape-letterbox Drive video: `https://drive.google.com/file/d/1e8mqKWBT4bWJupD6yjfHj76wDFnpx1kY/view?usp=drivesdk`
- Drive metadata: `https://drive.google.com/file/d/1U3oDu1h86WU7cB0zRjRTGHj0bmVG1ihb/view?usp=drivesdk`
- Drive transcript: `https://drive.google.com/file/d/1gRS1szxNa1-37QaWMAfGhu0f7EbldXdW/view?usp=drivesdk`
- Drive description: `https://drive.google.com/file/d/17kNEBG9AjiBOC0YGe19PcYNYGaG7bVtM/view?usp=drivesdk`
- Drive YouTube proof: `https://drive.google.com/file/d/1HUSybU8wM1cJ6zZAfLvfxsM9x4p-v40Q/view?usp=drivesdk`
- Drive read-back verified all six files and non-zero sizes: standard `90,576,931` bytes; landscape `23,560,166`; metadata `37,342`; transcript `523,506`; description `1,612`; YouTube proof `1,099`.
- Render QA: both downloaded Drive videos probe as H.264/AAC, 1080×1920, 90.048 seconds, stereo 48 kHz; early/middle/closing frames were inspected. The standard variant is full-frame and ends on a clean Cognistration CTA. The landscape variant preserves the source window with the website header and iOS footer; its content CTA layout persists through the closing frame as designed.
- Audio QA: 8-second windows at 0s, 45s, and 80s contained audio in both variants; mean levels were `-16.8`, `-20.0`, and `-20.6 dB` respectively.
- Caption note: captions are present, but the sampled early/middle frames show awkward auto-caption segmentation (`HOW WHAT YOU'RE DO DOING?`, `AND BURNT THE AND`). The public render is complete and readable at a glance, but caption polish is the remaining quality caveat for a future rerun.
- Local cleanup: the verified run directory and temporary QA downloads were removed after YouTube and Drive verification.
