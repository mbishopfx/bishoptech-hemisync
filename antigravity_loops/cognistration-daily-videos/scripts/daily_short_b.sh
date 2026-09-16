#!/bin/bash
set -euo pipefail

base_loop_dir="/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-daily-videos"
cd "$base_loop_dir"
exec /Users/matthewbishop/.hermes/profiles/cognistration/scripts/cognistration-telegram-run.sh \
  daily-short-b \
  bash ./run.sh tuesday
