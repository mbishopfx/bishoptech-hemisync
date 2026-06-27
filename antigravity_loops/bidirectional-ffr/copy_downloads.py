import os
import shutil
import subprocess

downloads_dir = "/Users/matthewbishop"
clips_dir = "/Users/matthewbishop/Downloads/download"
target_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/bidirectional-ffr/output_2026_06_22"
public_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/bidirectional-ffr/video1/public"

os.makedirs(target_dir, exist_ok=True)
os.makedirs(public_dir, exist_ok=True)

# 1. Copy the voiceover audio file
audio_filename = "Downloads/ElevenLabs_2026-06-23T05_40_34_Joey Patel - Deep and Engaging_pvc_sp97_s50_sb16_v3.mp3"
src_audio = os.path.join(downloads_dir, audio_filename)
dest_audio = os.path.join(public_dir, "audio.mp3")

if os.path.exists(src_audio):
    shutil.copy2(src_audio, dest_audio)
    print(f"Copied audio: {audio_filename} -> {dest_audio}")
else:
    # fallback: search for ElevenLabs*.mp3 in Downloads
    fallback_found = False
    search_dir = "/Users/matthewbishop/Downloads"
    for f in os.listdir(search_dir):
        if f.startswith("ElevenLabs_") and f.endswith(".mp3"):
            src_audio = os.path.join(search_dir, f)
            shutil.copy2(src_audio, dest_audio)
            print(f"Copied fallback audio: {f} -> {dest_audio}")
            fallback_found = True
            break
    if not fallback_found:
        print(f"ERROR: Audio file '{audio_filename}' not found in Downloads!")

# 2. Keywords mapping to locate files in downloads/download/
keywords = {
    1: "wearing_headphones",
    2: "Prediction_engine",
    3: "glowing_brain",
    4: "exchanging_speech",
    5: "FFR_pathway",
    6: "entering_ear",
    7: "pointing_to_brainst",
    8: "marching_with_sine",
    9: "duplic",
    10: "midbra",
    11: "projecting_grid",
    12: "active_brain_illust",
    13: "Feedback_loop",
    14: "gain_control",
    15: "looking_at_sound",
    16: "Comparison_scale",
    17: "Two_gears",
    18: "megaphone",
    19: "verifying_sound",
    20: "state_shift",
    21: "illustration_predic",  # reuse
    22: "illustration_predic",
    23: "spraying_neural_pat",
    24: "erasing_drawing",
    25: "lightning",
    26: "wearing_headphones",  # reuse
    27: "phantom_beat",
    28: "locking_in_key",
    29: "concentric_waves",
    30: "collaborative_sync",
    31: "carrying_errors",
    32: "NO_MO",
    33: "lotus_position",
    34: "sliding_down_waveforms",
    35: "lightbulbs",
    36: "dialogue_chalkboar",
    37: "cooperation",
    38: "Structured_sound",
    39: "tuning_mind",
    40: "pressing_\"TUNE\"_button"
}

# 3. Scan clips directory and copy/extract frames
print("Staging video clips and extracting still frames...")
copied_count = 0

for frame_idx, keyword in keywords.items():
    matched_file = None
    for f in os.listdir(clips_dir):
        if keyword.lower() in f.lower() and f.lower().endswith(".mp4"):
            matched_file = f
            break
            
    if matched_file:
        src_path = os.path.join(clips_dir, matched_file)
        
        # Output mp4 path
        dest_mp4_filename = f"frame_{frame_idx:02d}.mp4"
        dest_mp4_path = os.path.join(target_dir, dest_mp4_filename)
        
        # Output png path
        dest_png_filename = f"frame_{frame_idx:02d}.png"
        dest_png_path = os.path.join(target_dir, dest_png_filename)
        
        # Copy the MP4 clip
        shutil.copy2(src_path, dest_mp4_path)
        
        # Extract the first frame (at ss 0.0) as PNG
        extract_cmd = [
            "ffmpeg", "-y",
            "-ss", "0.0",
            "-i", src_path,
            "-vframes", "1",
            "-f", "image2",
            dest_png_path
        ]
        res = subprocess.run(extract_cmd, capture_output=True, text=True)
        if res.returncode != 0:
            print(f"Error extracting frame {frame_idx:02d}: {res.stderr}")
        else:
            print(f"Frame {frame_idx:02d} -> Copied clip and extracted still: {matched_file}")
            copied_count += 1
    else:
        print(f"ERROR: No video clip found containing keyword '{keyword}' for frame {frame_idx}")

print(f"Staging completed. Organized {copied_count}/40 frames/clips.")
