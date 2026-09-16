# Cognistration YouTube Clip Loop

Feed this loop a curated source list and it will select the next YouTube URL,
create one vertical clip, publish it to the verified Cognistration YouTube
channel, archive the full proof package in Google Drive, verify both services,
and remove the local run.

## Usage

```bash
cd /Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips
./run.sh
```

Sources are read from `sources/links.txt` in order and advanced only after
YouTube and Drive verification succeeds. To select a specific source without
changing the queue, pass its zero-based index or an exact URL already present
in the list:

```bash
./run.sh 0
./run.sh "https://www.youtube.com/watch?v=VIDEO_ID"
```

After a successful run, `sources/selection_state.json` records the source URL,
clip start, duration, end time, job ID, and watermark variant. Automatic
highlight selection receives those prior intervals and avoids overlapping them
when another clip is generated from the same long source. Explicit timing via
`CLIP_START` or argument 2 remains an intentional override.

Optional explicit timing:

```bash
./run.sh "https://www.youtube.com/watch?v=VIDEO_ID" 92 42
```

- Argument 2: source start time in seconds. Omit it for automatic hook selection.
- Argument 3: clip duration in seconds. Default and minimum: 90 seconds (1:30).
- `CLIP_START`, `CLIP_DURATION`, `CLIP_REQUIRE_FRESH_SOURCE`, `CLIP_MAX_SOURCE_AGE_DAYS`, `CLIP_MIN_SOURCE_HEIGHT`, `CLIP_ALLOW_LOW_RES_SOURCE`, `WHISPER_MODEL`, and `WHISPER_DEVICE` are also supported. The default local fallback model is `base`; the default minimum source height is 720p. Transcripts remain internal for hook selection and archival; rendered clips contain no captions.
- English-only contract: sources with explicit non-English metadata are rejected, and downloads require an audio format whose language starts with `en`; dubbed audio tracks in other languages are never used as a fallback.
- `CLIP_SOURCE_LIST` and `CLIP_SOURCE_STATE` override the source-list paths.
- `CLIP_WATERMARK_VARIANT=logo|domain` overrides the alternating watermark choice.
- `CLIP_DRIVE_FOLDER_ID` overrides the default `YouTube Clips` folder.

The transcript is fetched before the large source download whenever YouTube
provides captions. The transcript drives hook/highlight selection. If no usable
YouTube transcript exists, the source is downloaded and Whisper becomes the
fallback.

The verified Drive archive contains:

```text
cognistration-clip-YYYYMMDD_HHMMSS.mp4
cognistration-clip-YYYYMMDD_HHMMSS-metadata.json
cognistration-clip-YYYYMMDD_HHMMSS-transcript.json
cognistration-clip-YYYYMMDD_HHMMSS-description.txt
cognistration-clip-YYYYMMDD_HHMMSS-youtube-manifest.json
cognistration-clip-YYYYMMDD_HHMMSS-source-selection.json
cognistration-clip-YYYYMMDD_HHMMSS-youtube-analytics.json
```

The publishing order is:

1. Publish one standard vertical MP4 to the verified Cognistration channel.
2. Read the YouTube upload back and verify channel ownership, public status, title, and CTA description.
3. Upload the MP4, metadata, transcript, description, source selection, analytics report, and YouTube proof to Drive.
4. Read every Drive file back and verify its size.
5. Delete the local run only after both YouTube and Drive verification pass.

After Drive read-back verifies all six archive files and their sizes, the local run
directory—including the downloaded source, render, transcript, and metadata—is
deleted to preserve system space. If YouTube upload, Drive upload, or verification fails, the local
run remains available for recovery.

## Editing profile

- 1080×1920 vertical output
- Standard version: full-bleed vertical crop with face-aware framing, punch-in cuts, and a centered watermark
- 90–120 second validation range, with a 90-second (1:30) default and hard minimum
- Hook-first automatic candidate selection from the transcript
- YouTube `json3` transcripts are preferred for hook selection; local Whisper timestamps are the fallback
- No caption overlay; source audio and visuals remain unobstructed
- Face-aware object-position tracking for humans detected in frame
- Smoothed subject movement to avoid jitter
- Punch-in/pan camera cuts every 2.5 seconds without overriding the subject track
- Center framing fallback when no face is detected
- Alternating centered watermark variants: translucent Cognistration logo, then `COGNISTRATION.COM`
- Original source audio preserved
- A selected Cognistration iOS App Store image fades in during the final 2 seconds
- Every description includes the iOS app, web platform, bundled tone packs, and original source attribution
- Titles are topic-led and timestamp-unique; the legacy `Cognistration Clip:` prefix is not used
- Public YouTube upload for one clip per run, followed by a verified Drive archive
- Successful runs record generated source timestamps in `sources/selection_state.json` so long videos can produce multiple non-overlapping clips over time
- Each run pulls recent Cognistration channel/video analytics before selecting the next source and archives the read-only report with the clip proof package

The downloader first tries explicit high-quality video/audio pairs (1080p H.264, then 720p H.264, then AV1 equivalents) through the supported `web_embedded` client, then automatically falls back to
the best available progressive format up to 1080p when the high-quality adaptive URL returns HTTP
403. This is intentionally a compatibility fallback for YouTube's current
SABR/client behavior.

Before transcription/rendering, the loop verifies the downloaded source height.
Sources below 720p are rejected by default instead of being silently enlarged
into a soft-looking vertical clip. Set `CLIP_ALLOW_LOW_RES_SOURCE=1` only when
an intentionally lower-quality source is acceptable.

The workflow assumes the user has permission to download and repurpose the supplied source video. The daily research job only renders a source when reuse rights or an explicit permission path is documented; otherwise it archives the candidate as research without downloading or clipping it.

## Daily research-to-clip job

The daily Hermes job can be pointed at the curated `sources/links.txt` list.
It pulls recent channel/video analytics first, then selects one source per run,
fetches a transcript before the source media,
selects a hook, renders one 90–120 second vertical clip, publishes it to YouTube, archives the verified package to Drive, and reports the
source and links back to Matt. The source list is the primary content input;
research discovery is not used when the list is present.

The publisher builds titles from the source topic and the selected clip start
time, for example `Joe McMoneagle on Remote Viewing and Consciousness —
Highlight 03:25`. This keeps multiple intervals from the same long source
distinct without adding a generic brand prefix.

## Daily source scout job

The separate Hermes job `Cognistration daily topic source scout` runs at 9:00
AM local time. It searches astral projection, frequency healing, meditation,
intuition/synchronicity, and metaphysics/consciousness topics; validates
YouTube metadata; deduplicates against the queue; and appends only sources
with a documented reuse/permission basis to `sources/links.txt`. Relevant but
unverified candidates are kept in `research/daily/` for review instead of
being silently published.

The current seven-day clipping sprint runs at 10:30 AM, 1:30 PM, 4:30 PM,
and 7:30 PM local time and consumes the updated queue. It is finite at 28
executions. Every successful post must complete YouTube and Drive read-back
verification before local cleanup; the scout does not download, publish, or
upload clips.

The live/upcoming gate is always enforced. The freshness gate is opt-in for
the curated list: set `CLIP_REQUIRE_FRESH_SOURCE=1` to require a verified
YouTube upload date within the previous 31 days. Search-discovery jobs may
enable that setting, while evergreen user-curated links can run without it.
When enabled, `upload_date` from resolved video metadata is authoritative and
missing or older dates are rejected before download/render.

Priority personality searches include Robert Monroe, William Buhlman, Michael
Raduga, Susan Blackmore, Andrew Holecek, Tom Campbell, Donald Hoffman, Bernardo
Kastrup, Dean Radin, and Jeffrey Kripal, alongside the broader topic searches.

The job is deliberately verification-first: YouTube read-back and Drive
read-back must both pass before the local run directory is removed. Unknown
licensing is a stop condition, not a reason to silently repurpose someone else's work.

Face tracking uses OpenCV YuNet detection from `requirements.txt` and the local
model under `models/`. It follows
the largest detected face as the likely speaking subject; this is a framing aid,
not identity recognition. The source audio and original broadcast graphics are
preserved.

## Research basis

YouTube currently categorizes square or vertical uploads up to three minutes as Shorts;
this loop intentionally caps clips at two minutes for a tighter review and publishing workflow:
<https://support.google.com/youtube/answer/15424877?hl=en>

The editing profile favors shorter clips, an immediate hook, and experimentation rather than automatically using the full two-minute cap:
<https://later.com/blog/youtube-shorts/>

These are starting rules, not guarantees. The next iteration should use Cognistration analytics to compare hook length, clip duration, and cut cadence.
