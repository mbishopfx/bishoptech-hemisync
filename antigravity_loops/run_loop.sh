#!/bin/bash

# Check if URL is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <blog-post-url>"
  exit 1
fi

URL="$1"
SLUG=$(basename "$URL")
DATE_STR=$(date +%Y_%m_%d)

echo "Starting Antigravity Loop for: $URL"
echo "Target Slug: $SLUG"
echo "Target Date: $DATE_STR"

/Users/matthewbishop/.local/bin/agy --dangerously-skip-permissions --prompt "You are in loop mode. Please read the blog post at $URL, write a 7-9 minute conversational YouTube script in antigravity_loops/$SLUG/script.md with relative timestamps. Under the script, generate 30-40 storyboard prompts with the style: plain white background, stick figure sketch, thick bold chalkboard writing in all caps, and no frame numbers/timestamps. Then spawn a subagent to generate the landscape style photos using generate_image tool, saving them to antigravity_loops/$SLUG/output_$DATE_STR/ in order. Once the images are successfully generated, copy the Remotion project template 'video1' from antigravity_loops/posterior-parietal-coordinate-engine/video1/ into antigravity_loops/$SLUG/video1/ (excluding node_modules to avoid copying time, and then run npm install or link node_modules to save space/time, or simply copy it), and then run: python3 antigravity_loops/build_video.py antigravity_loops/$SLUG output_$DATE_STR"
