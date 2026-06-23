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

def generate_metadata_file(output_path, video_details):
    # Predefined title/description sets to randomly assign and customize
    metadata_templates = [
        {
            "title": "How the CIA Gated the Human Brain 🧠🔓 #shorts #cia",
            "hook": "How did declassified CIA techniques attempt to alter human consciousness? We look at the actual neuroscience of the Gateway Program and Hemi-Sync."
        },
        {
            "title": "These Neurons Can Lock onto Sound Waves 🎧 #neuroscience",
            "hook": "Inside your auditory brainstem, firing neurons lock their phase to incoming audio frequencies. This is bottom-up FFR science in action."
        },
        {
            "title": "Your Brain is NOT a Microphone! 🧠🚫 #shorts #brainhack",
            "hook": "Your brain is a live prediction engine. It doesn't just record sound—it actively predicts it using top-down cortical prediction loops."
        },
        {
            "title": "The Science Behind the CIA Gateway Experience #shorts",
            "hook": "Declassified documents reveal the CIA’s intense study of brainwave coherence, astral projection, and remote viewing. Here is the FFR science behind it."
        },
        {
            "title": "How Binaural Beats Actually Hack Your Brain #shorts #flow",
            "hook": "Binaural beats trigger a phantom 'difference tone' in the inferior colliculus, forcing the cortex to synchronize and shift your global brainwave state."
        },
        {
            "title": "Why Unexpected Sounds Instantly Alert You 🚨 #shorts",
            "hook": "When sensory input contradicts your cortical predictions, a prediction error floods your brain with noradrenaline to trigger rapid vigilance."
        },
        {
            "title": "MKUltra, Remote Viewing, and the Gateway Project #cia",
            "hook": "Tracing the declassified line from MKUltra research to the Gateway Experience and the neuroscience of altered consciousness."
        },
        {
            "title": "How to Unlock High Brainwave Coherence 🧘‍♂️ #shorts",
            "hook": "Aligning top-down prediction with bottom-up sensory input eliminates prediction errors, freeing up cognitive load for relaxed vigilance."
        },
        {
            "title": "The Science of Astral Projection Frequencies #shorts",
            "hook": "How do binaural frequencies influence the subcortical auditory pathway to trigger out-of-body states? Exploring the FFR mechanics."
        },
        {
            "title": "Tuning Your Mind On Demand (FFR Brain Hacking) #shorts",
            "hook": "By feeding the brainstem-to-cortex feedback loop precise, structured audio patterns, you can tune your focus and enter flow states on demand."
        }
    ]
    
    # 490-character keywords block
    tags = (
        "Gate program, gateway, hemisync, cia techniques, declassified, mkultra, gate project, "
        "astral projection, remote viewing, ufo, disclosure, frequency following response, "
        "ffr science, auditory brainstem, inferior colliculus, binaural beat science, "
        "phase-locking neurons, cortical prediction loop, brain prediction engine, "
        "brainwave coherence, neuromodulators, noradrenaline focus, relaxed vigilance, "
        "flow state science, cognistration, brain hacking, cognitive load, binaural beats, neurobiology"
    )
    
    random.shuffle(metadata_templates)
    
    with open(output_path, "w") as f:
        f.write("# YouTube Shorts Upload Metadata\n\n")
        f.write("Use this copy-and-paste metadata sheet to publish your generated shorts on YouTube:\n\n")
        f.write("---\n\n")
        
        for idx, video in enumerate(video_details):
            template = metadata_templates[idx % len(metadata_templates)]
            f.write(f"## 🎥 Video: {video['filename']}\n")
            f.write(f"- **Target Duration**: {video['duration']:.2f}s\n")
            f.write(f"- **Voice Track**: {video['voice_track']}\n\n")
            
            f.write("### 📌 Title\n")
            f.write(f"```text\n{template['title']}\n```\n\n")
            
            f.write("### 📝 Description\n")
            f.write("```markdown\n")
            f.write(f"{template['hook']}\n\n")
            f.write("🔗 Explore your brain's prediction loops: https://www.cognistration.com\n")
            f.write("🐦 Connect on X: https://x.com/bishentrainment\n")
            f.write("✉️ Contact: matt@bishoptech.dev\n")
            f.write("```\n\n")
            
            f.write("### 🏷️ Keywords / Tags (500 Char Limit)\n")
            f.write(f"```text\n{tags}\n```\n\n")
            f.write("---\n\n")

def main():
    base_icloud_dir = "/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG"
    stills_dir = os.path.join(base_icloud_dir, "CognistrationStills")
    shorts_dir = os.path.join(base_icloud_dir, "CognistrationShorts")
    tts_dir = os.path.join(base_icloud_dir, "CognistrationTTS")
    output_dir = os.path.join(base_icloud_dir, "shorts_varieties", "output_5_shorts")
    
    # 1. Gather files
    stills = [os.path.join(stills_dir, f) for f in os.listdir(stills_dir) if f.lower().endswith(('.jpeg', '.jpg', '.png'))]
    shorts = [os.path.join(shorts_dir, f) for f in os.listdir(shorts_dir) if f.lower().endswith(('.mp4', '.mov', '.avi'))]
    tts_files = [os.path.join(tts_dir, f) for f in os.listdir(tts_dir) if f.lower().endswith(('.mp3', '.wav'))]
    
    print(f"Discovered: {len(stills)} stills, {len(shorts)} shorts, {len(tts_files)} TTS files")
    if not stills or not shorts or not tts_files:
        print("Error: Missing required assets in stills, shorts, or TTS folders.")
        return

    os.makedirs(output_dir, exist_ok=True)
    
    # Clean out any previous outputs in this specific folder
    print("Clearing previous short outputs from target directory...")
    for f in os.listdir(output_dir):
        if f.endswith(".mp4") or f == "shorts_metadata.md":
            file_path = os.path.join(output_dir, f)
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"  Failed to remove {f}: {e}")
    
    # Define target durations for the 5 variations (e.g. 4 shorts of 45-55s, 1 longer short of 75-90s)
    target_durations = [random.uniform(45, 55) for _ in range(4)] + [random.uniform(75, 90) for _ in range(1)]
    random.shuffle(target_durations)
    
    from concurrent.futures import ThreadPoolExecutor
    video_details = []
    
    for idx, target_dur in enumerate(target_durations):
        var_num = idx + 1
        output_filename = f"shorts_variety_{var_num:02d}.mp4"
        final_output = os.path.join(output_dir, output_filename)
        
        print(f"\n==========================================")
        print(f"Generating Short Variation {var_num}/5 (Target Duration: {target_dur:.2f}s)")
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
        image_vf = "scale=1080:-1,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=white"
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
        
        # Track details for metadata generation
        video_details.append({
            "filename": output_filename,
            "duration": target_dur,
            "voice_track": os.path.basename(tts_file)
        })
        
    # 5. Write the metadata file in the same directory
    metadata_path = os.path.join(output_dir, "shorts_metadata.md")
    print(f"\nWriting Shorts metadata sheet to {metadata_path}...")
    generate_metadata_file(metadata_path, video_details)
    
    print("\nAll 5 short variations and metadata sheet generated successfully!")

if __name__ == "__main__":
    main()
