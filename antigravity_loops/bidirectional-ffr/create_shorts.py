#!/usr/bin/env python3
import os
import subprocess
import math

def split_video(input_path, output_dir, name_prefix):
    if not os.path.exists(input_path):
        print(f"Error: Input file {input_path} does not exist.")
        return

    # Get duration using ffprobe
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", input_path
    ]
    duration = float(subprocess.check_output(cmd).decode().strip())
    print(f"\nProcessing: {input_path}")
    print(f"Duration: {duration:.3f} seconds")
    
    # Aim for target chunk size around 48 seconds
    N = round(duration / 48.0)
    if N == 0:
        N = 1
    chunk_duration = duration / N
    print(f"Dividing into {N} chunks of ~{chunk_duration:.3f} seconds each.")
    
    os.makedirs(output_dir, exist_ok=True)
    
    for i in range(N):
        start_time = i * chunk_duration
        # Format filename as name_prefix_short_01.mp4, name_prefix_short_02.mp4, etc.
        output_filename = f"{name_prefix}_short_{i+1:02d}.mp4"
        output_file = os.path.join(output_dir, output_filename)
        
        print(f"[{i+1}/{N}] Cutting part {i+1} starting at {start_time:.3f}s (duration: {chunk_duration:.3f}s)...")
        
        # ffmpeg crop (center 9:16 slice 608x1080) and scale to 1080x1920
        ffmpeg_cmd = [
            "ffmpeg", "-y",
            "-i", input_path,
            "-ss", f"{start_time:.6f}",
            "-t", f"{chunk_duration:.6f}",
            "-vf", "crop=608:1080,scale=1080:1920",
            "-c:v", "libx264",
            "-crf", "18",
            "-preset", "fast",
            "-c:a", "aac",
            "-b:a", "192k",
            output_file
        ]
        
        # Execute ffmpeg command, hide excessive output but show errors if any
        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.DEVNULL)
        print(f"  Saved -> {output_filename}")

def main():
    base_icloud_dir = "/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG"
    output_dir = os.path.join(base_icloud_dir, "shorts")
    
    # Video 1
    video1_path = os.path.join(base_icloud_dir, "youtube1.mp4")
    split_video(video1_path, output_dir, "youtube1")
    
    # Video 2
    video2_path = os.path.join(base_icloud_dir, "youtube2.mp4")
    split_video(video2_path, output_dir, "youtube2")
    
    print("\nAll videos processed successfully!")

if __name__ == "__main__":
    main()
