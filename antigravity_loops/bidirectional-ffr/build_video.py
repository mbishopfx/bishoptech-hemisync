import os
import re
import json
import shutil
import subprocess

fps = 30
base_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/bidirectional-ffr"
script_path = os.path.join(base_dir, "script_and_storyboard.md")
public_dir = os.path.join(base_dir, "video1/public")
timings_path = os.path.join(public_dir, "timings.json")
frames_src_dir = os.path.join(base_dir, "output_2026_06_22")

def get_audio_duration(audio_path):
    try:
        result = subprocess.run(
            ["ffprobe", "-i", audio_path, "-show_entries", "format=duration", "-v", "quiet", "-of", "csv=p=0"],
            capture_output=True,
            text=True,
            check=True
        )
        return float(result.stdout.strip())
    except Exception as e:
        print(f"Warning: Could not get audio duration via ffprobe: {e}")
        return None

def find_frame_file(frames_dir, idx):
    prefix = f"frame_{idx+1:02d}."
    for f in os.listdir(frames_dir):
        if f.lower().startswith(prefix):
            return f
    # fallback default
    return f"frame_{idx+1:02d}.png"

# 1. Parse timestamps from storyboard prompts (Part 2)
# Pattern: [00:00 - 00:06] or similar
timestamp_pattern = re.compile(r'\[(\d+):(\d+)\s*-\s*(\d+):(\d+)\]')

raw_timings = []
with open(script_path, "r", encoding="utf-8") as f:
    content = f.read()

part2 = content.split("## Part 2:")[1]
matches = list(timestamp_pattern.finditer(part2))

for m in matches:
    start_m, start_s, end_m, end_s = map(int, m.groups())
    start_time = start_m * 60 + start_s
    end_time = end_m * 60 + end_s
    raw_timings.append((start_time, end_time))

# Check for audio duration to scale
audio_path = os.path.join(public_dir, "audio.mp3")
audio_duration = None
if os.path.exists(audio_path):
    audio_duration = get_audio_duration(audio_path)

timings = []
if audio_duration:
    print(f"Audio found! Scaling timings to fit audio duration of {audio_duration:.2f} seconds.")
    total_audio_frames = int(round(audio_duration * fps))
    original_total_seconds = raw_timings[-1][1]
    
    accumulated_frames = 0
    for idx, (start_time, end_time) in enumerate(raw_timings):
        frame_name = find_frame_file(frames_src_dir, idx)
        target_end_frame = int(round((end_time / original_total_seconds) * total_audio_frames))
        
        if idx == len(raw_timings) - 1:
            target_end_frame = total_audio_frames
            
        duration_frames = target_end_frame - accumulated_frames
        timings.append({
            "img": frame_name,
            "startFrame": accumulated_frames,
            "duration": duration_frames
        })
        accumulated_frames = target_end_frame
else:
    print("No audio found or duration query failed. Using raw script timings.")
    for idx, (start_time, end_time) in enumerate(raw_timings):
        frame_name = find_frame_file(frames_src_dir, idx)
        start_frame = start_time * fps
        duration_frames = (end_time - start_time) * fps
        timings.append({
            "img": frame_name,
            "startFrame": start_frame,
            "duration": duration_frames
        })

print(f"Prepared {len(timings)} timestamp segments.")

# 2. Write timings.json
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

with open(timings_path, "w", encoding="utf-8") as f:
    json.dump(timings, f, indent=2)

print(f"Wrote timings.json to {timings_path}")

# 3. Copy frame assets (images and videos) to public directory
for item in timings:
    dest_name = item["img"]
    src_path = os.path.join(frames_src_dir, dest_name)
    dest_path = os.path.join(public_dir, dest_name)
    
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
    else:
        print(f"Warning: asset {dest_name} not found in source directory!")

# 4. Render Horizontal Remotion Video
print("Rendering Horizontal video using Remotion...")
video1_dir = os.path.join(base_dir, "video1")
result_horiz = subprocess.run(
    ["npx", "remotion", "render", "MyComp", "../output_horizontal.mp4"],
    cwd=video1_dir,
    capture_output=True,
    text=True
)

print("HORIZONTAL STDOUT:")
print(result_horiz.stdout)
print("HORIZONTAL STDERR:")
print(result_horiz.stderr)

# 5. Render Vertical Remotion Video
print("Rendering Vertical video using Remotion...")
result_vert = subprocess.run(
    ["npx", "remotion", "render", "MyCompVertical", "../output_vertical.mp4"],
    cwd=video1_dir,
    capture_output=True,
    text=True
)

print("VERTICAL STDOUT:")
print(result_vert.stdout)
print("VERTICAL STDERR:")
print(result_vert.stderr)

if result_horiz.returncode == 0 and result_vert.returncode == 0:
    print("Videos rendered successfully!")
    slug = os.path.basename(base_dir)
    dest_dir = os.path.join("/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG", slug)
    dest_video_horiz = os.path.join(dest_dir, f"{slug}.mp4")
    dest_video_vert = os.path.join(dest_dir, f"{slug}-vertical.mp4")
    dest_stills_dir = os.path.join(dest_dir, "stills")
    dest_script = os.path.join(dest_dir, "script.md")
    
    os.makedirs(dest_stills_dir, exist_ok=True)
    
    # 1. Move horizontal video file
    src_video_horiz = os.path.join(base_dir, "output_horizontal.mp4")
    if os.path.exists(src_video_horiz):
        if os.path.exists(dest_video_horiz):
            os.remove(dest_video_horiz)
        shutil.move(src_video_horiz, dest_video_horiz)
        print(f"Moved horizontal video to: {dest_video_horiz}")
        
    # 2. Move vertical video file
    src_video_vert = os.path.join(base_dir, "output_vertical.mp4")
    if os.path.exists(src_video_vert):
        if os.path.exists(dest_video_vert):
            os.remove(dest_video_vert)
        shutil.move(src_video_vert, dest_video_vert)
        print(f"Moved vertical video to: {dest_video_vert}")
        
    # 3. Move the still frame photos & dynamic clips (cleaning up locally)
    moved_assets = 0
    if os.path.exists(public_dir):
        for filename in os.listdir(public_dir):
            if filename.startswith("frame_"):
                src_asset = os.path.join(public_dir, filename)
                dest_asset = os.path.join(dest_stills_dir, filename)
                if os.path.exists(dest_asset):
                    os.remove(dest_asset)
                shutil.move(src_asset, dest_asset)
                moved_assets += 1
    print(f"Moved {moved_assets} frames/clips to: {dest_stills_dir}")
    
    # 4. Copy the script file for easy reading
    if os.path.exists(script_path):
        if os.path.exists(dest_script):
            os.remove(dest_script)
        shutil.copy2(script_path, dest_script)
        print(f"Copied script to: {dest_script}")
else:
    print(f"Video render failed. Horizontal exit code: {result_horiz.returncode}, Vertical exit code: {result_vert.returncode}")
