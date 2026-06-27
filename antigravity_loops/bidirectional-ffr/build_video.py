import os
import re
import json
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor

fps = 30
base_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/bidirectional-ffr"
script_path = os.path.join(base_dir, "script_and_storyboard.md")
public_dir = os.path.join(base_dir, "video1/public")
timings_path = os.path.join(public_dir, "timings.json")
frames_src_dir = os.path.join(base_dir, "output_2026_06_22")

def get_duration(path):
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path
    ]
    try:
        return float(subprocess.check_output(cmd).decode().strip())
    except Exception as e:
        print(f"Error getting duration for {path}: {e}")
        return 0.0

# 1. Parse timestamps from storyboard prompts (Part 2)
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
if not os.path.exists(audio_path):
    print("audio.mp3 not found in public folder. Copying from Downloads...")
    downloads_dir = "/Users/matthewbishop"
    audio_filename = "Downloads/ElevenLabs_2026-06-23T05_40_34_Joey Patel - Deep and Engaging_pvc_sp97_s50_sb16_v3.mp3"
    src_audio = os.path.join(downloads_dir, audio_filename)
    if os.path.exists(src_audio):
        shutil.copy2(src_audio, audio_path)
        print(f"Successfully copied audio: {audio_filename} -> {audio_path}")
    else:
        # fallback: search for ElevenLabs*.mp3 in Downloads
        search_dir = "/Users/matthewbishop/Downloads"
        for f in os.listdir(search_dir):
            if f.startswith("ElevenLabs_") and f.endswith(".mp3"):
                src_audio = os.path.join(search_dir, f)
                shutil.copy2(src_audio, audio_path)
                print(f"Successfully copied fallback audio: {f} -> {audio_path}")
                break

audio_duration = get_duration(audio_path)

timings = []
if audio_duration > 0:
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

# Write timings.json (using .png still images)
if not os.path.exists(public_dir):
    os.makedirs(public_dir)

with open(timings_path, "w", encoding="utf-8") as f:
    json.dump(timings, f, indent=2)

print(f"Wrote timings.json to {timings_path}")

# Copy frame still assets to public directory
for item in timings:
    dest_name = item["img"]
    src_path = os.path.join(frames_src_dir, dest_name)
    dest_path = os.path.join(public_dir, dest_name)
    
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
    else:
        print(f"Warning: still asset {dest_name} not found in source directory!")

# Render Horizontal Remotion Video (Video 2: Landscape Stills)
print("Rendering Video 2 (Landscape Stills) using Remotion...")
video1_dir = os.path.join(base_dir, "video1")
result_horiz = subprocess.run(
    ["npx", "remotion", "render", "MyComp", "../output_landscape_stills.mp4"],
    cwd=video1_dir,
    capture_output=True,
    text=True
)
print("LANDSCAPE STDOUT:")
print(result_horiz.stdout)
if result_horiz.returncode != 0:
    print("LANDSCAPE STDERR:")
    print(result_horiz.stderr)

# Render Vertical Remotion Video (Video 1: Vertical Stills)
print("Rendering Video 1 (Vertical Stills) using Remotion...")
result_vert = subprocess.run(
    ["npx", "remotion", "render", "MyCompVertical", "../output_vertical_stills.mp4"],
    cwd=video1_dir,
    capture_output=True,
    text=True
)
print("VERTICAL STDOUT:")
print(result_vert.stdout)
if result_vert.returncode != 0:
    print("VERTICAL STDERR:")
    print(result_vert.stderr)

# Compile Video 3 (Clips Version with mixed audio)
print("Compiling Video 3 (Clips Version) with FFMpeg...")
temp_clips_dir = os.path.join(base_dir, "temp_clips")
os.makedirs(temp_clips_dir, exist_ok=True)

# Build a list of ffmpeg respeeding commands
render_tasks = []
rescaled_clips = []
for idx, item in enumerate(timings):
    target_dur = item["duration"] / fps
    src_clip_path = os.path.join(frames_src_dir, f"frame_{idx+1:02d}.mp4")
    temp_clip_path = os.path.join(temp_clips_dir, f"rescaled_{idx+1:02d}.mp4")
    rescaled_clips.append(temp_clip_path)
    
    clip_dur = get_duration(src_clip_path)
    if clip_dur == 0.0:
        clip_dur = 6.02  # fallback
        
    speed_factor = target_dur / clip_dur
    
    # ffmpeg command to scale and adjust speed of both video and audio
    cmd = [
        "ffmpeg", "-y",
        "-i", src_clip_path,
        "-vf", f"scale=720:1280,setpts={speed_factor}*PTS",
        "-af", f"asetrate=44100*{1.0/speed_factor},aresample=44100",
        "-r", "30",
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        temp_clip_path
    ]
    render_tasks.append(cmd)

def run_rescale(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Rescaling 40 video clips in parallel using 8 workers...")
with ThreadPoolExecutor(max_workers=8) as executor:
    executor.map(run_rescale, render_tasks)
print("Rescaling completed!")

# Concatenate all rescaled clips
concat_list_path = os.path.join(temp_clips_dir, "clips.txt")
with open(concat_list_path, "w") as f:
    for clip_path in rescaled_clips:
        f.write(f"file '{os.path.basename(clip_path)}'\n")

temp_silent_video = os.path.join(temp_clips_dir, "concat_clips.mp4")
print("Concatenating video segments...")
concat_cmd = [
    "ffmpeg", "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_list_path,
    "-c:v", "copy",
    "-c:a", "copy",
    temp_silent_video
]
subprocess.run(concat_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Merge video and voiceover, mixing audio: clip at 50%, voiceover at 100%
print("Mixing audio and generating Video 3...")
output_clips_path = os.path.join(base_dir, "output_vertical_clips.mp4")
merge_cmd = [
    "ffmpeg", "-y",
    "-i", temp_silent_video,
    "-i", audio_path,
    "-filter_complex", "[0:a]volume=0.5[a0];[1:a]volume=1.0[a1];[a0][a1]amix=inputs=2:duration=first[out]",
    "-map", "0:v",
    "-map", "[out]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    output_clips_path
]
subprocess.run(merge_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
print("Video 3 compiled successfully!")

# Clean up temp clips
shutil.rmtree(temp_clips_dir)

# 8. Move outputs to iCloud and clean up public/ directory
if result_horiz.returncode == 0 and result_vert.returncode == 0 and os.path.exists(output_clips_path):
    print("All videos built successfully! Moving to iCloud...")
    slug = os.path.basename(base_dir)  # bidirectional-ffr
    dest_dir = os.path.join("/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG", slug)
    
    os.makedirs(dest_dir, exist_ok=True)
    dest_stills_dir = os.path.join(dest_dir, "stills")
    os.makedirs(dest_stills_dir, exist_ok=True)
    
    # Move files
    # 1. Vertical stills version
    shutil.move(os.path.join(base_dir, "output_vertical_stills.mp4"), os.path.join(dest_dir, "bidirectional-ffr-vertical-stills.mp4"))
    # 2. Landscape stills version (replaces the main horizontal file)
    shutil.move(os.path.join(base_dir, "output_landscape_stills.mp4"), os.path.join(dest_dir, "bidirectional-ffr.mp4"))
    # 3. Vertical clips version (replaces the main vertical file, no zoom)
    shutil.move(output_clips_path, os.path.join(dest_dir, "bidirectional-ffr-vertical.mp4"))
    
    # Remove old naming variants to avoid cluttering iCloud folder
    for old_file in ["bidirectional-ffr-landscape-stills.mp4", "bidirectional-ffr-vertical-clips.mp4"]:
        old_path = os.path.join(dest_dir, old_file)
        if os.path.exists(old_path):
            os.remove(old_path)
    
    # Move still frame images to stills/ on iCloud
    moved_assets = 0
    for filename in os.listdir(public_dir):
        if filename.startswith("frame_") and filename.endswith(".png"):
            src_asset = os.path.join(public_dir, filename)
            dest_asset = os.path.join(dest_stills_dir, filename)
            shutil.move(src_asset, dest_asset)
            moved_assets += 1
    print(f"Moved {moved_assets} still assets to iCloud stills folder.")
    
    # Copy script
    shutil.copy2(script_path, os.path.join(dest_dir, "script.md"))
    print("Script copied to iCloud!")
    
    # Cleanup public folder
    for filename in os.listdir(public_dir):
        file_path = os.path.join(public_dir, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)
    print("Local public/ directory cleaned up.")
else:
    print("Error: Rendering or mixing failed!")
