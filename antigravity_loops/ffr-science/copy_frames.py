import os
import sys
import shutil
import re

# Usage: python3 copy_frames.py <source-dir> [target-dir]
source_dir = "/Users/matthewbishop/.gemini/antigravity/brain/3ca98e6f-273c-4f73-b0aa-80f56a594d3e"
if len(sys.argv) > 1:
    source_dir = sys.argv[1]

target_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/ffr-science/output_2026_06_22"
if len(sys.argv) > 2:
    target_dir = sys.argv[2]

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

print(f"Copying files from {source_dir} to {target_dir}...")

pattern = re.compile(r'^frame_(\d{2})(_\d+)?\.png$')

copied_count = 0
for filename in os.listdir(source_dir):
    match = pattern.match(filename)
    if match:
        frame_num = match.group(1)
        src_path = os.path.join(source_dir, filename)
        dest_filename = f"frame_{frame_num}.png"
        dest_path = os.path.join(target_dir, dest_filename)
        
        shutil.copy2(src_path, dest_path)
        print(f"Copied: {filename} -> {dest_filename}")
        copied_count += 1

print(f"Successfully copied {copied_count} frames to {target_dir}")
