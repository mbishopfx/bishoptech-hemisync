import os
import re
import json
import shutil
import subprocess

fps = 30
base_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/vestibular-frame-builder"
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

# 1. Parse timestamps from storyboard prompts (Part 2)
# Pattern: [00:00 - 00:09] or similar
timestamp_pattern = re.compile(r'\[(\d+):(\d+)\s*-\s*(\d+):(\d+)\]')

raw_timings = []
with open(script_path, "r", encoding="utf-8") as f:
    content = f.read()

# We parse the storyboard section (Part 2) to match the 28 frames.
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
        frame_name = f"frame_{idx+1:02d}.png"
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
        frame_name = f"frame_{idx+1:02d}.png"
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

# 3. Copy frame images to public directory, with fallback for missing frames
existing_frames = sorted([f for f in os.listdir(frames_src_dir) if f.startswith("frame_") and f.endswith(".png")])
if not existing_frames:
    print("No frames found in source directory!")
    exit(1)

last_existing_frame = existing_frames[-1]

for item in timings:
    dest_name = item["img"]
    src_path = os.path.join(frames_src_dir, dest_name)
    dest_path = os.path.join(public_dir, dest_name)
    
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
    else:
        # Fallback to the latest available frame
        fallback_src_path = os.path.join(frames_src_dir, last_existing_frame)
        shutil.copy2(fallback_src_path, dest_path)
        print(f"Frame {dest_name} not found. Fallback to {last_existing_frame}")

# 4. Render the Remotion video
print("Rendering video using Remotion...")
video1_dir = os.path.join(base_dir, "video1")
result = subprocess.run(
    ["npx", "remotion", "render", "MyComp", "../output.mp4"],
    cwd=video1_dir,
    capture_output=True,
    text=True
)

print("STDOUT:")
print(result.stdout)
print("STDERR:")
print(result.stderr)

if result.returncode == 0:
    print("Video rendered successfully: output.mp4")
    src_video = os.path.join(base_dir, "output.mp4")
    slug = os.path.basename(base_dir)
    dest_dir = os.path.join("/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG", slug)
    dest_video = os.path.join(dest_dir, f"{slug}.mp4")
    dest_stills_dir = os.path.join(dest_dir, "stills")
    dest_script = os.path.join(dest_dir, "script.md")
    
    os.makedirs(dest_stills_dir, exist_ok=True)
    
    # 1. Move the video file
    if os.path.exists(src_video):
        if os.path.exists(dest_video):
            os.remove(dest_video)
        shutil.move(src_video, dest_video)
        print(f"Moved video to: {dest_video}")
    else:
        print(f"Rendered video file not found at {src_video}")
        
    # 2. Move the still frame photos (cleaning up locally)
    moved_stills = 0
    if os.path.exists(public_dir):
        for filename in os.listdir(public_dir):
            if filename.startswith("frame_") and filename.endswith(".png"):
                src_still = os.path.join(public_dir, filename)
                dest_still = os.path.join(dest_stills_dir, filename)
                if os.path.exists(dest_still):
                    os.remove(dest_still)
                shutil.move(src_still, dest_still)
                moved_stills += 1
    print(f"Moved {moved_stills} still frames to: {dest_stills_dir}")
    
    # 3. Copy the script file for easy reading
    if os.path.exists(script_path):
        if os.path.exists(dest_script):
            os.remove(dest_script)
        shutil.copy2(script_path, dest_script)
        print(f"Copied script to: {dest_script}")
else:
    print(f"Video render failed with code {result.returncode}")
