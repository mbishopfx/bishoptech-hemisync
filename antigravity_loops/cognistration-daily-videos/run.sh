#!/bin/bash
set -euo pipefail

# Detect day of the week in lowercase, or use override argument
if [ -n "${1:-}" ]; then
  DAY=$(echo "$1" | tr '[:upper:]' '[:lower:]')
else
  DAY=$(date +%A | tr '[:upper:]' '[:lower:]')
fi

echo "=========================================="
echo "Starting Cognistration Daily Video Loop for: $DAY"
echo "=========================================="

base_loop_dir="/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-daily-videos"
cd "$base_loop_dir"
remotion_dir="$base_loop_dir/video1"
browser_cache="/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/.remotion-cache"
required_files=(
  "$base_loop_dir/scripts/generate_frequency_audio.mjs"
  "$base_loop_dir/scripts/compile_video.py"
  "$base_loop_dir/scripts/upload_youtube.py"
  "$base_loop_dir/scripts/update_state.py"
  "$remotion_dir/package.json"
)
for required_file in "${required_files[@]}"; do
  if [ ! -f "$required_file" ]; then
    echo "FAILSAFE: required daily-video file is missing: $required_file" >&2
    exit 2
  fi
done

lock_dir="${TMPDIR:-/tmp}/cognistration-daily-videos-${DAY}.lock"
if ! mkdir "$lock_dir" 2>/dev/null; then
  echo "FAILSAFE: another $DAY daily-video run is already active; skipping duplicate."
  exit 0
fi

# Always clean generated dependencies/assets on exit so failed or successful
# cron runs cannot consume the disk needed for the next run. Keep the final MP4
# on failed uploads so the operator can retry; delete it only after readback.
upload_verified=0
cleanup() {
  rm -f "$base_loop_dir/$DAY/audio.wav" \
    "$base_loop_dir/$DAY/render_probe.json" \
    "$remotion_dir/public/audio.wav" \
    "$remotion_dir/public/bg_combined.mp4" \
    "$remotion_dir/public/bishoptech_visual_background.mp4" \
    "$remotion_dir/public/video_metadata.json" \
    "$remotion_dir/public/app_store_badge.png"
  if [ "$upload_verified" -eq 1 ] && [[ "${COGNISTRATION_KEEP_LOCAL_COPY:-0}" =~ ^(0|false|no)$ ]]; then
    rm -f "$base_loop_dir/$DAY/output.mp4"
  fi
  if [ -d "$remotion_dir/node_modules/.remotion" ] && [ ! -L "$remotion_dir/node_modules/.remotion" ]; then
    rm -rf "$browser_cache"
    mkdir -p "$(dirname "$browser_cache")"
    mv "$remotion_dir/node_modules/.remotion" "$browser_cache"
  fi
  if [ -d "$remotion_dir/node_modules" ]; then
    rm -rf "$remotion_dir/node_modules"
  fi
  rmdir "$lock_dir" 2>/dev/null || true
}
trap cleanup EXIT

# The audio engine is owned by the Cognistration app root rather than this
# Remotion project. Cron runs must repair an incomplete root install before
# importing the shared encoder dependency.
app_root="/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration"
available_kb=$(df -Pk "$app_root" | awk 'NR==2 {print $4}')
if ! [[ "$available_kb" =~ ^[0-9]+$ ]] || [ "$available_kb" -lt 4194304 ]; then
  echo "FAILSAFE: less than 4 GiB is available for the render; refusing to start. Free KiB: ${available_kb:-unknown}" >&2
  exit 2
fi

if ! (cd "$app_root" && node -e "require.resolve('wavefile')" >/dev/null 2>&1); then
  echo "wavefile is missing from the app root; repairing Node dependencies..."
  (cd "$app_root" && npm install --no-audit --no-fund)
fi
if ! (cd "$app_root" && node -e "require.resolve('wavefile')" >/dev/null 2>&1); then
  echo "Error: wavefile is still unavailable from $app_root"
  exit 1
fi

# Keep unattended cron runs self-healing when a previous cleanup or partial
# install leaves the Remotion shim present but its CLI package missing.
remotion_dir="$base_loop_dir/video1"
remotion_entry="$remotion_dir/node_modules/@remotion/cli/remotion-cli.js"
if [ ! -f "$remotion_entry" ]; then
  echo "Remotion dependencies are missing or incomplete; repairing video1 with npm ci..."
  (cd "$remotion_dir" && npm ci --no-audit --no-fund)
fi
if [ ! -f "$remotion_entry" ]; then
  echo "Error: Remotion CLI is still unavailable at $remotion_entry"
  exit 1
fi
if [ -d "$browser_cache" ] && [ ! -e "$remotion_dir/node_modules/.remotion" ]; then
  ln -s "$browser_cache" "$remotion_dir/node_modules/.remotion"
fi
"$remotion_dir/node_modules/.bin/remotion" browser ensure

# Load parameters based on day
case "$DAY" in
  monday)
    CARRIER_FROM=260; CARRIER_TO=160; DELTA_FROM=15; DELTA_TO=4.8
    ;;
  tuesday)
    CARRIER_FROM=160; CARRIER_TO=280; DELTA_FROM=6; DELTA_TO=16
    ;;
  wednesday)
    CARRIER_FROM=220; CARRIER_TO=170; DELTA_FROM=10; DELTA_TO=5
    ;;
  thursday)
    CARRIER_FROM=220; CARRIER_TO=380; DELTA_FROM=10; DELTA_TO=40
    ;;
  friday)
    CARRIER_FROM=380; CARRIER_TO=220; DELTA_FROM=40; DELTA_TO=9.5
    ;;
  saturday)
    CARRIER_FROM=280; CARRIER_TO=100; DELTA_FROM=18; DELTA_TO=2.2
    ;;
  sunday)
    CARRIER_FROM=180; CARRIER_TO=120; DELTA_FROM=6.5; DELTA_TO=4
    ;;
  *)
    echo "Error: Unknown day of the week: $DAY"
    exit 1
    ;;
esac

# 1. Generate a full 90-second clean binaural frequency bed.
echo "Step 1: Generating carrier frequency audio sweep..."
node scripts/generate_frequency_audio.mjs --lengthSec 90 --carrierFrom $CARRIER_FROM --carrierTo $CARRIER_TO --deltaFrom $DELTA_FROM --deltaTo $DELTA_TO --output "$DAY/audio.wav"

# 2. Compile Remotion video (full-bleed Favorites visual + three fixed sections)
echo "Step 2: Compiling three-section Remotion video without edit effects..."
DATE_STR=$(date +%Y_%m_%d_%H%M%S)
SLUG="cognistration_${DAY}_${DATE_STR}"
python3 scripts/compile_video.py "$DAY" "$SLUG"

# 2b. Refuse upload if the rendered artifact is not the requested vertical
# 90-second format.
echo "Step 2b: Verifying rendered dimensions and duration..."
ffprobe -v error -select_streams v:0 -show_entries stream=width,height -show_entries format=duration -of json "$DAY/output.mp4" > "$DAY/render_probe.json"
python3 - "$DAY/render_probe.json" <<'PY'
import json
import sys
probe = json.load(open(sys.argv[1], encoding="utf-8"))
stream = (probe.get("streams") or [{}])[0]
duration = float((probe.get("format") or {}).get("duration") or 0)
width = int(stream.get("width") or 0)
height = int(stream.get("height") or 0)
if (width, height) != (1080, 1920):
    raise SystemExit(f"FAILSAFE: expected 1080x1920, got {width}x{height}")
if not 89.5 <= duration <= 90.5:
    raise SystemExit(f"FAILSAFE: expected ~90 seconds, got {duration:.3f}")
print(f"Verified rendered artifact: {width}x{height}, {duration:.3f}s")
PY

# Render-only mode is used for visual QA before a public upload. The generated
# output.mp4 is intentionally retained by the EXIT cleanup when upload is skipped.
if [[ "${COGNISTRATION_RENDER_ONLY:-0}" =~ ^(1|true|yes)$ ]]; then
  echo "Render-only mode enabled; retaining output.mp4 for visual QA and skipping YouTube upload."
  exit 0
fi

# 3. Read YouTube SEO metadata
echo "Step 3: Loading YouTube upload metadata..."
TITLE=$(python3 -c "import json; print(json.load(open('$DAY/youtube_metadata.json'))['title'])")
DESC=$(python3 -c "import json; print(json.load(open('$DAY/youtube_metadata.json'))['description'])")
TAGS=$(python3 -c "import json; tags=json.load(open('$DAY/youtube_metadata.json'))['tags']; print(','.join(tags) if isinstance(tags, list) else tags)")

# 4. Upload to YouTube channel
echo "Step 4: Uploading video to YouTube..."
upload_out=""
set +e
upload_out=$(python3 scripts/upload_youtube.py "$DAY/output.mp4" "$TITLE" "$DESC" "$TAGS" 2>&1)
upload_status=$?
set -e
echo "$upload_out"
if [ "$upload_status" -ne 0 ]; then
  echo "Error: YouTube upload failed with exit code $upload_status" >&2
  exit "$upload_status"
fi
# Extract success URL
youtube_url=$(echo "$upload_out" | sed -n 's/^SUCCESS_URL://p' | tail -n 1)
if [[ ! "$youtube_url" =~ ^https://www\.youtube\.com/watch\?v=[A-Za-z0-9_-]{6,}$ ]]; then
  echo "Error: YouTube upload did not return a valid verified watch URL; retaining local output.mp4." >&2
  exit 1
fi
upload_verified=1

# 5. Update CRM state.md
echo "Step 5: Updating agent CRM state.md..."
python3 scripts/update_state.py "$DAY" "$TITLE" "$youtube_url"

echo "=========================================="
echo "Cognistration Daily Video Loop Complete!"
echo "YouTube Link: $youtube_url"
echo "=========================================="
