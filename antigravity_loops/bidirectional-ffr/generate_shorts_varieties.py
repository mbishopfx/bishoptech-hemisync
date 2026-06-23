#!/usr/bin/env python3
import os
import random
import subprocess
import shutil

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

def main():
    base_icloud_dir = "/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG"
    stills_dir = os.path.join(base_icloud_dir, "CognistrationStills")
    shorts_dir = os.path.join(base_icloud_dir, "CognistrationShorts")
    tts_dir = os.path.join(base_icloud_dir, "CognistrationTTS")
    output_dir = os.path.join(base_icloud_dir, "shorts_varieties")
    
    # 1. Gather files
    stills = [os.path.join(stills_dir, f) for f in os.listdir(stills_dir) if f.lower().endswith(('.jpeg', '.jpg', '.png'))]
    shorts = [os.path.join(shorts_dir, f) for f in os.listdir(shorts_dir) if f.lower().endswith(('.mp4', '.mov', '.avi'))]
    tts_files = [os.path.join(tts_dir, f) for f in os.listdir(tts_dir) if f.lower().endswith(('.mp3', '.wav'))]
    
    print(f"Discovered: {len(stills)} stills, {len(shorts)} shorts, {len(tts_files)} TTS files")
    if not stills or not shorts or not tts_files:
        print("Error: Missing required assets in stills, shorts, or TTS folders.")
        return

    os.makedirs(output_dir, exist_ok=True)
    
    # Clean out any previous outputs to overwrite them
    print("Clearing previous short outputs from target directory...")
    for f in os.listdir(output_dir):
        if f.startswith("shorts_variety_") and f.endswith(".mp4"):
            file_path = os.path.join(output_dir, f)
            print(f"  Removing -> {f}")
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"  Failed to remove {f}: {e}")
    
    # Define target durations for the 10 variations:
    # 8 shorts (45-55s), 2 longer shorts (75-90s)
    target_durations = [random.uniform(45, 55) for _ in range(8)] + [random.uniform(75, 90) for _ in range(2)]
    random.shuffle(target_durations)
    
    from concurrent.futures import ThreadPoolExecutor
    
    for idx, target_dur in enumerate(target_durations):
        var_num = idx + 1
        final_output = os.path.join(output_dir, f"shorts_variety_{var_num:02d}.mp4")
        
        print(f"\n==========================================")
        print(f"Generating Short Variation {var_num}/10 (Target Duration: {target_dur:.2f}s)")
        print(f"==========================================")
        
        # Create temp folder for intermediate clips
        temp_var_dir = os.path.join(output_dir, f"temp_var_{var_num}")
        os.makedirs(temp_var_dir, exist_ok=True)
        
        # A. Pick random TTS file and slice audio
        tts_file = random.choice(tts_files)
        tts_dur = get_duration(tts_file)
        print(f"Selected TTS: {os.path.basename(tts_file)} (Total duration: {tts_dur:.2f}s)")
        
        # Pick random start offset
        start_offset = random.uniform(0, max(0, tts_dur - target_dur))
        temp_audio = os.path.join(temp_var_dir, "audio_slice.mp3")
        
        print(f"Slicing audio from {start_offset:.2f}s to {start_offset + target_dur:.2f}s...")
        audio_cmd = [
            "ffmpeg", "-y",
            "-ss", f"{start_offset:.6f}",
            "-t", f"{target_dur:.6f}",
            "-i", tts_file,
            "-c:a", "libmp3lame", "-b:a", "192k",
            temp_audio
        ]
        subprocess.run(audio_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # B. Construct visual timeline with randomized pacing
        timeline = []
        current_dur = 0.0
        
        while current_dur < target_dur:
            # Randomly select a pacing element: quick image, image hold, or video short
            clip_choice = random.choice(["quick_image", "image_hold", "video_short"])
            
            if clip_choice == "quick_image":
                clip_dur = random.uniform(1.0, 1.8)
                timeline.append({
                    "type": "still",
                    "path": random.choice(stills),
                    "duration": clip_dur
                })
                current_dur += clip_dur
            elif clip_choice == "image_hold":
                clip_dur = random.uniform(3.0, 5.0)
                timeline.append({
                    "type": "still",
                    "path": random.choice(stills),
                    "duration": clip_dur
                })
                current_dur += clip_dur
            elif clip_choice == "video_short":
                clip_dur = random.uniform(3.0, 6.0)
                video_path = random.choice(shorts)
                video_dur = get_duration(video_path)
                # Pick a random starting offset in the video loop
                vid_offset = random.uniform(0, max(0, video_dur - clip_dur))
                timeline.append({
                    "type": "video",
                    "path": video_path,
                    "offset": vid_offset,
                    "duration": clip_dur
                })
                current_dur += clip_dur
                
        # Trim the last clip to fit the target duration exactly
        overage = current_dur - target_dur
        if overage > 0:
            timeline[-1]["duration"] -= overage
            
        print(f"Generated timeline with {len(timeline)} visual segments.")
        
        # C. Render intermediate clips in parallel
        clip_paths = []
        
        # Image filter: Scale image to width 1080 (preserving aspect ratio), pad to 1080x1920 with a white background
        image_vf = "scale=1080:-1,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=white"
        # Video filter: Scale video directly to 1080x1920 (no padding needed as they are already vertical)
        video_vf = "scale=1080:1920"
        
        render_tasks = []
        for c_idx, clip in enumerate(timeline):
            temp_clip_path = os.path.join(temp_var_dir, f"clip_{c_idx:03d}.mp4")
            clip_paths.append(temp_clip_path)
            
            dur = clip["duration"]
            if clip["type"] == "still":
                render_cmd = [
                    "ffmpeg", "-y",
                    "-loop", "1",
                    "-i", clip["path"],
                    "-t", f"{dur:.6f}",
                    "-vf", image_vf,
                    "-r", "30",
                    "-c:v", "libx264",
                    "-pix_fmt", "yuv420p",
                    "-an",
                    temp_clip_path
                ]
            else:
                render_cmd = [
                    "ffmpeg", "-y",
                    "-ss", f"{clip['offset']:.6f}",
                    "-t", f"{dur:.6f}",
                    "-i", clip["path"],
                    "-vf", video_vf,
                    "-r", "30",
                    "-c:v", "libx264",
                    "-pix_fmt", "yuv420p",
                    "-an",
                    temp_clip_path
                ]
            render_tasks.append((render_cmd, c_idx + 1, len(timeline), clip["type"], dur))
            
        def run_render_task(task):
            cmd, idx, total, c_type, dur = task
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
        print(f"Rendering {len(timeline)} clips in parallel using 8 workers...")
        with ThreadPoolExecutor(max_workers=8) as executor:
            executor.map(run_render_task, render_tasks)
        print("All clips rendered successfully!")

        # D. Concatenate clips
        list_file = os.path.join(temp_var_dir, "clips.txt")
        with open(list_file, "w") as f:
            for p in clip_paths:
                f.write(f"file '{os.path.basename(p)}'\n")
                
        temp_silent_video = os.path.join(temp_var_dir, "silent_full.mp4")
        print("Concatenating visual segments...")
        concat_cmd = [
            "ffmpeg", "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", list_file,
            "-c", "copy",
            temp_silent_video
        ]
        subprocess.run(concat_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # E. Merge video and audio
        print(f"Merging audio and saving final video...")
        merge_cmd = [
            "ffmpeg", "-y",
            "-i", temp_silent_video,
            "-i", temp_audio,
            "-c:v", "copy",
            "-c:a", "aac",
            "-shortest",
            final_output
        ]
        subprocess.run(merge_cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # F. Clean up temp files for this variation
        shutil.rmtree(temp_var_dir)
        print(f"Variation {var_num} complete!")
        
    print("\nAll 10 short variations generated successfully!")

if __name__ == "__main__":
    main()
