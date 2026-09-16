#!/bin/bash
set -euo pipefail

SOURCE_INPUT="${1:-}"
REQUESTED_START="${CLIP_START:-${2:-}}"
REQUESTED_DURATION="${CLIP_DURATION:-${3:-90}}"
REQUIRE_FRESH_SOURCE="${CLIP_REQUIRE_FRESH_SOURCE:-0}"
MIN_SOURCE_HEIGHT="${CLIP_MIN_SOURCE_HEIGHT:-720}"
ALLOW_LOW_RES_SOURCE="${CLIP_ALLOW_LOW_RES_SOURCE:-0}"

base_dir="/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-youtube-clips"
project_dir="$base_dir/clip-video"
source_list_path="${CLIP_SOURCE_LIST:-$base_dir/sources/links.txt}"
source_selector_script="$base_dir/scripts/select_source.py"
selection_state_path="${CLIP_SOURCE_STATE:-$base_dir/sources/selection_state.json}"
analytics_script="$base_dir/scripts/fetch_youtube_analytics.py"
python_bin="${CLIP_PYTHON:-/usr/bin/python3}"
google_api_script="${GOOGLE_API_SCRIPT:-/Users/matthewbishop/.hermes/skills/productivity/google-workspace/scripts/google_api.py}"
youtube_publisher_script="${YOUTUBE_PUBLISHER_SCRIPT:-$base_dir/scripts/publish_youtube.py}"
drive_folder_id="${CLIP_DRIVE_FOLDER_ID:-1-lmsr-SCMQTcOqp8qZTH-ucpvALVl70f}"
app_icon_path="${CLIP_APP_ICON_PATH:-$base_dir/../../public/images/cognistrationlogosmall.png}"
job_id="$(date +%Y%m%d_%H%M%S)"
run_dir="$base_dir/runs/$job_id"
transcript_dir="$run_dir/transcript"
mkdir -p "$run_dir" "$transcript_dir"
source_info_path="$run_dir/source_info.json"
description_path="$run_dir/clip_description.txt"
selection_path="$run_dir/source_selection.json"

render_verified=0
source_path=""
cleanup() {
  rm -f "$project_dir/public/source.mp4" "$project_dir/public/clip_metadata.json"
  rm -f "$project_dir/public/closing_card.png"
  rm -f "$project_dir/public/cognistration-app-icon.png"
  if [ -d "$project_dir/node_modules" ]; then
    rm -rf "$project_dir/node_modules"
  fi
  if [ "$render_verified" -eq 1 ]; then
    [ -n "$source_path" ] && rm -f "$source_path"
    rm -f "$run_dir/clip-source.mp4"
  fi
}
trap cleanup EXIT

if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "yt-dlp is required. Install it with: brew install yt-dlp" >&2
  exit 1
fi
if ! command -v whisper >/dev/null 2>&1; then
  echo "Whisper is required but was not found on PATH." >&2
  exit 1
fi
if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "FFmpeg and FFprobe are required." >&2
  exit 1
fi
if [ ! -f "$google_api_script" ]; then
  echo "Google Workspace API helper was not found: $google_api_script" >&2
  exit 1
fi
if [ ! -f "$youtube_publisher_script" ]; then
  echo "YouTube publisher was not found: $youtube_publisher_script" >&2
  exit 1
fi
if [ ! -f "$source_selector_script" ]; then
  echo "Source selector was not found: $source_selector_script" >&2
  exit 1
fi
if [ ! -f "$analytics_script" ]; then
  echo "Analytics collector was not found: $analytics_script" >&2
  exit 1
fi
if [ ! -f "$source_list_path" ]; then
  echo "YouTube source list was not found: $source_list_path" >&2
  exit 1
fi
if [ ! -f "$app_icon_path" ]; then
  echo "Cognistration app icon was not found: $app_icon_path" >&2
  exit 1
fi

analytics_path="$run_dir/youtube_analytics.json"
echo "Step 0: Pulling recent Cognistration YouTube analytics before source selection..."
"$python_bin" "$analytics_script" --output "$analytics_path"

selection_args=(--links "$source_list_path" --state "$selection_state_path" --select)
if [[ "$SOURCE_INPUT" =~ ^https?:// ]]; then
  selection_args+=(--url "$SOURCE_INPUT")
elif [[ "$SOURCE_INPUT" =~ ^[0-9]+$ ]]; then
  selection_args+=(--index "$SOURCE_INPUT")
elif [ -n "$SOURCE_INPUT" ]; then
  echo "Usage: ./run.sh [source-index|youtube-url] [start-seconds] [duration-seconds]" >&2
  exit 2
fi
"$python_bin" "$source_selector_script" "${selection_args[@]}" > "$selection_path"
URL=$("$python_bin" - "$selection_path" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["url"])
PY
)
SOURCE_INDEX=$("$python_bin" - "$selection_path" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["sourceIndex"])
PY
)
WATERMARK_VARIANT=$("$python_bin" - "$selection_path" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["watermarkVariant"])
PY
)

printf 'Clip job: %s\nSource: %s\nSource index: %s\nWatermark variant: %s\n' "$job_id" "$URL" "$SOURCE_INDEX" "$WATERMARK_VARIANT"

echo "Step 1: Reading original creator and video metadata..."
if ! yt-dlp \
  --no-playlist \
  --skip-download \
  --dump-single-json \
  --extractor-args 'youtube:player_client=android' \
  "$URL" > "$source_info_path" 2>/dev/null; then
  echo "Metadata lookup failed on the default YouTube client; retrying Android metadata lookup..."
  yt-dlp \
    --no-playlist \
    --skip-download \
    --dump-single-json \
    --extractor-args 'youtube:player_client=android' \
    "$URL" > "$source_info_path"
fi
"$python_bin" - "$source_info_path" "$REQUIRE_FRESH_SOURCE" "${CLIP_MAX_SOURCE_AGE_DAYS:-31}" <<'PY'
import datetime as dt
import json
import sys

info = json.load(open(sys.argv[1], encoding="utf-8"))
upload_date = str(info.get("upload_date") or "")
live_status = str(info.get("live_status") or "")
language = str(info.get("language") or "").casefold()
if language and not language.startswith("en"):
    raise SystemExit(
        f"Source rejected for language: resolved audio language={language}; "
        "English audio is required"
    )
require_fresh = str(sys.argv[2]).casefold() in {"1", "true", "yes"}
max_age = int(sys.argv[3])
if live_status in {"is_live", "is_upcoming"}:
    raise SystemExit(
        f"Source rejected: YouTube live_status={live_status}; "
        "only finalized uploaded videos are eligible"
    )
if require_fresh:
    if len(upload_date) != 8 or not upload_date.isdigit():
        raise SystemExit("Source rejected: YouTube upload_date is missing or invalid")
    uploaded = dt.date(int(upload_date[:4]), int(upload_date[4:6]), int(upload_date[6:]))
    age_days = (dt.date.today() - uploaded).days
    if age_days < 0 or age_days > max_age:
        raise SystemExit(
            f"Source rejected: uploaded {upload_date}, age={age_days} days, "
            f"maximum={max_age} days"
        )
    print(f"Verified fresh YouTube source: upload_date={upload_date}, age={age_days} days")
else:
    print(f"Verified user-curated YouTube source: upload_date={upload_date or 'not provided'}")
PY
"$python_bin" "$base_dir/scripts/build_description.py" \
  --source-info "$source_info_path" \
  --source-url "$URL" \
  --output "$description_path"
closing_card_path=$("$python_bin" "$base_dir/scripts/select_closing_card.py" --job-id "$job_id")
echo "Selected closing CTA card: $closing_card_path"

echo "Step 2: Pulling transcript before downloading the source..."
transcript_path=""
subtitle_dir="$run_dir/subtitles"
mkdir -p "$subtitle_dir"
if yt-dlp \
  --no-playlist \
  --skip-download \
  --write-auto-subs \
  --write-subs \
  --sub-langs 'en,en-orig' \
  --sub-format json3 \
  --extractor-args 'youtube:player_client=android' \
  -o "$subtitle_dir/source.%(ext)s" \
  "$URL" >/dev/null 2>&1; then
  shopt -s nullglob
  subtitle_candidates=()
  if [ -f "$subtitle_dir/source.en.json3" ]; then
    subtitle_candidates+=("$subtitle_dir/source.en.json3")
  fi
  if [ -f "$subtitle_dir/source.en-orig.json3" ]; then
    subtitle_candidates+=("$subtitle_dir/source.en-orig.json3")
  fi
  for candidate in "$subtitle_dir"/*.json3; do
    case " ${subtitle_candidates[*]} " in *" $candidate "*) ;; *) subtitle_candidates+=("$candidate") ;; esac
  done
  if [ "${#subtitle_candidates[@]}" -gt 0 ]; then
    transcript_path="${subtitle_candidates[0]}"
    echo "Using YouTube transcript: $transcript_path"
  fi
  shopt -u nullglob
fi

echo "Step 3: Downloading source with yt-dlp..."
downloaded=0
for format_pair in \
  'bv*[height<=1080][vcodec^=avc1]+ba[language^=en]' \
  'bv*[height<=1080]+ba[language^=en]' \
  'b[height<=1080][language^=en]'; do
  echo "Trying English-audio format selector: $format_pair"
  if yt-dlp \
    --no-playlist \
    --no-part \
    --restrict-filenames \
    --merge-output-format mp4 \
    --extractor-args 'youtube:player_client=web_embedded' \
    -f "$format_pair" \
    -o "$run_dir/source.%(ext)s" \
    "$URL"; then
    downloaded=1
    break
  fi
  rm -f "$run_dir"/source.* "$run_dir"/*.part "$run_dir"/*.ytdl
done
if [ "$downloaded" -eq 0 ]; then
  echo "No downloadable English-audio format was available; refusing non-English fallback." >&2
  exit 1
fi

shopt -s nullglob
source_candidates=("$run_dir"/source.*)
for candidate in "${source_candidates[@]}"; do
  case "$candidate" in
    *.json|*.part|*.ytdl) continue ;;
  esac
  source_path="$candidate"
  break
done
shopt -u nullglob
if [ -z "$source_path" ] || [ ! -f "$source_path" ]; then
  echo "Could not locate the downloaded source file." >&2
  exit 1
fi

source_probe_path="$run_dir/source_probe.json"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height \
  -of json "$source_path" > "$source_probe_path"
"$python_bin" - "$source_probe_path" "$MIN_SOURCE_HEIGHT" "$ALLOW_LOW_RES_SOURCE" <<'PY'
import json
import sys
probe = json.load(open(sys.argv[1], encoding="utf-8"))
stream = (probe.get("streams") or [{}])[0]
width = int(stream.get("width") or 0)
height = int(stream.get("height") or 0)
allow_low_res = str(sys.argv[3]).casefold() in {"1", "true", "yes"}
minimum = int(sys.argv[2])
if not allow_low_res and height < minimum:
    raise SystemExit(
        f"Source rejected for quality: downloaded {width}x{height}; "
        f"minimum height is {minimum}. Set CLIP_ALLOW_LOW_RES_SOURCE=1 only intentionally."
    )
print(f"Verified source quality: {width}x{height}")
PY

if [ -z "$transcript_path" ]; then
  echo "No usable YouTube transcript found; transcribing locally with Whisper..."
  whisper "$source_path" \
    --model "${WHISPER_MODEL:-base}" \
    --device "${WHISPER_DEVICE:-cpu}" \
    --language English \
    --word_timestamps True \
    --output_dir "$transcript_dir" \
    --output_format json \
    --fp16 False \
    --verbose False
  transcript_path="$transcript_dir/$(basename "${source_path%.*}").json"
fi

if [ ! -f "$transcript_path" ]; then
  echo "No usable transcript was produced: $transcript_path" >&2
  exit 1
fi

# Normalize the transcript into the run folder so the Drive archive is stable
# regardless of whether it came from YouTube json3 or local Whisper.
normalized_transcript="$run_dir/transcript/source.json"
if [ "$transcript_path" != "$normalized_transcript" ]; then
  cp "$transcript_path" "$normalized_transcript"
fi
transcript_path="$normalized_transcript"

echo "Step 4: Planning hook-first highlights, attribution, and CTA closing card..."
cp "$app_icon_path" "$project_dir/public/cognistration-app-icon.png"
plan_args=(
  --source "$source_path"
  --transcript "$transcript_path"
  --source-info "$source_info_path"
  --description "$description_path"
  --closing-card "$closing_card_path"
  --watermark-variant "$WATERMARK_VARIANT"
  --avoid-ranges "$selection_path"
  --output-dir "$run_dir"
  --public-dir "$project_dir/public"
  --source-url "$URL"
  --clip-duration "$REQUESTED_DURATION"
  --analytics "$analytics_path"
)
if [ -n "$REQUESTED_START" ]; then
  plan_args+=(--clip-start "$REQUESTED_START")
fi
"$python_bin" "$base_dir/scripts/plan_clip.py" "${plan_args[@]}"

if [ ! -f "$project_dir/public/clip_metadata.json" ] || [ ! -f "$project_dir/public/source.mp4" ]; then
  echo "Clip planning did not produce Remotion assets." >&2
  exit 1
fi

echo "Step 5: Detecting and smoothing human focus points..."
"$python_bin" "$base_dir/scripts/detect_focus.py" \
  --video "$run_dir/clip-source.mp4" \
  --metadata "$run_dir/clip_metadata.json" \
  --public-metadata "$project_dir/public/clip_metadata.json"

echo "Step 6: Installing clip Remotion dependencies..."
(cd "$project_dir" && npm ci --no-audit --no-fund)
"$project_dir/node_modules/.bin/remotion" browser ensure

echo "Step 7: Rendering vertical clip with face-aware framing, watermark, punch-in cuts, and CTA fade..."
output_path="$run_dir/clip.mp4"
(cd "$project_dir" && ./node_modules/.bin/remotion render ClipComp "$output_path")

probe_path="$run_dir/render_probe.json"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height \
  -show_entries format=duration \
  -of json "$output_path" > "$probe_path"
"$python_bin" - "$probe_path" <<'PY'
import json
import sys
probe = json.load(open(sys.argv[1], encoding="utf-8"))
stream = (probe.get("streams") or [{}])[0]
duration = float((probe.get("format") or {}).get("duration") or 0)
width = int(stream.get("width") or 0)
height = int(stream.get("height") or 0)
if (width, height) != (1080, 1920):
    raise SystemExit(f"Expected 1080x1920 output, got {width}x{height}")
if not 89.5 <= duration <= 120.5:
    raise SystemExit(f"Expected 90–120 second clip, got {duration:.3f}s")
print(f"Verified clip: {width}x{height}, {duration:.3f}s")
PY
render_verified=1

echo "Step 8: Publishing one vertical clip to the verified Cognistration YouTube channel..."
youtube_manifest="$run_dir/youtube_manifest.json"
"$python_bin" "$youtube_publisher_script" \
  --standard "$output_path" \
  --metadata "$run_dir/clip_metadata.json" \
  --description "$description_path" \
  --output "$youtube_manifest"

echo "Step 9: Uploading the published clip, metadata, transcript, description, and YouTube proof to Google Drive..."
drive_manifest="$run_dir/drive_manifest.json"
"$python_bin" "$base_dir/scripts/finalize_drive.py" \
  --folder-id "$drive_folder_id" \
  --job-id "$job_id" \
  --clip "$output_path" \
  --metadata "$run_dir/clip_metadata.json" \
  --transcript "$transcript_path" \
  --description "$description_path" \
  --youtube-manifest "$youtube_manifest" \
  --source-selection "$selection_path" \
  --analytics "$analytics_path" \
  --google-api "$google_api_script" > "$drive_manifest"

youtube_standard_link=$("$python_bin" - "$youtube_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["standard"]["url"])
PY
)
clip_link=$("$python_bin" - "$drive_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["clip"]["webViewLink"])
PY
)
metadata_link=$("$python_bin" - "$drive_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["metadata"]["webViewLink"])
PY
)
transcript_link=$("$python_bin" - "$drive_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["transcript"]["webViewLink"])
PY
)
description_link=$("$python_bin" - "$drive_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["description"]["webViewLink"])
PY
)
youtube_manifest_link=$("$python_bin" - "$drive_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["youtubeManifest"]["webViewLink"])
PY
)
source_selection_link=$("$python_bin" - "$drive_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["sourceSelection"]["webViewLink"])
PY
)
analytics_link=$("$python_bin" - "$drive_manifest" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["analytics"]["webViewLink"])
PY
)
clip_start_actual=$("$python_bin" - "$run_dir/clip_metadata.json" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["clipStartSeconds"])
PY
)
clip_duration_actual=$("$python_bin" - "$run_dir/clip_metadata.json" <<'PY'
import json, sys
print(json.load(open(sys.argv[1], encoding="utf-8"))["clipDurationSeconds"])
PY
)

"$python_bin" "$source_selector_script" \
  --links "$source_list_path" \
  --state "$selection_state_path" \
  --advance \
  --index "$SOURCE_INDEX" \
  --watermark-variant "$WATERMARK_VARIANT" \
  --clip-start "$clip_start_actual" \
  --clip-duration "$clip_duration_actual" \
  --job-id "$job_id" > "$run_dir/source_selection_advanced.json"

"$python_bin" "$base_dir/scripts/update_timestamp_state.py" \
  --state "$base_dir/state.md" \
  --source-index "$SOURCE_INDEX" \
  --source-url "$URL" \
  --start "$clip_start_actual" \
  --duration "$clip_duration_actual" \
  --watermark "$WATERMARK_VARIANT" \
  --job-id "$job_id" \
  --youtube-url "$youtube_standard_link"

# YouTube read-back completed before Drive. Drive read-back and size checks
# completed inside finalize_drive.py. Only now remove the local run.
rm -rf "$run_dir"
printf '\nYouTube publish verified; Drive archive complete; local run removed.\nYouTube standard: %s\nDrive clip: %s\nDrive metadata: %s\nDrive transcript: %s\nDrive description: %s\nDrive YouTube proof: %s\nDrive source selection: %s\nDrive analytics: %s\n' "$youtube_standard_link" "$clip_link" "$metadata_link" "$transcript_link" "$description_link" "$youtube_manifest_link" "$source_selection_link" "$analytics_link"
