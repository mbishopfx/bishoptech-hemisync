import os
import shutil

downloads_dir = "/Users/matthewbishop/Downloads"
target_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/bidirectional-ffr/output_2026_06_22"
public_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/bidirectional-ffr/video1/public"

os.makedirs(target_dir, exist_ok=True)
os.makedirs(public_dir, exist_ok=True)

# Find the ElevenLabs MP3 file
audio_file = None
for f in os.listdir(downloads_dir):
    if f.startswith("ElevenLabs_") and f.endswith(".mp3"):
        audio_file = f
        break

if audio_file:
    src_audio = os.path.join(downloads_dir, audio_file)
    dest_audio = os.path.join(public_dir, "audio.mp3")
    shutil.copy2(src_audio, dest_audio)
    print(f"Copied audio: {audio_file} -> video1/public/audio.mp3")
else:
    print("Warning: ElevenLabs audio file not found in Downloads!")

# Keywords dictionary mapping frame number to search substring and extension
keywords = {
    1: ("headphones", ".mp4"),
    2: ("factory", ".jpeg"),
    3: ("glowing_brain", ".jpeg"),
    4: ("exchanging_speech", ".mp4"),
    5: ("FFR_pathway", ".jpeg"),
    6: ("entering_ear", ".jpeg"),
    7: ("midbra", ".jpeg"),
    8: ("marching_with_sine", ".jpeg"),
    9: ("duplic", ".jpeg"),
    10: ("pointing_to_brainst", ".jpeg"),
    11: ("projecting_grid", ".jpeg"),
    12: ("outer_layer", ".jpeg"),
    13: ("Feedback_loop", ".jpeg"),
    14: ("gain_control", ".jpeg"),
    15: ("looking_at_sound", ".jpeg"),
    16: ("comparison_scale", ".jpeg"),
    17: ("gears", ".jpeg"),
    18: ("megaphone", ".jpeg"),
    19: ("verifying_sound", ".jpeg"),
    20: ("state_shift", ".mp4"),
    21: ("Square_peg", ".jpeg"),
    22: ("predic", ".mp4"),
    23: ("spraying_neural", ".jpeg"),
    24: ("Square_peg", ".jpeg"), # reuse
    25: ("predic", ".mp4"), # reuse
    26: ("headphones", ".mp4"), # reuse
    27: ("phantom_beat", ".mp4"),
    28: ("gears", ".jpeg"), # reuse
    29: ("concentric_waves", ".mp4"),
    30: ("Feedback_loop", ".jpeg"), # reuse
    31: ("carrying_errors", ".mp4"),
    32: ("verifying_sound", ".jpeg"), # reuse
    33: ("lotus", ".mp4"),
    34: ("concentric_waves", ".mp4"), # reuse
    35: ("lightbulbs", ".mp4"),
    36: ("exchanging_speech", ".mp4"),
    37: ("cooperation", ".mp4"),
    38: ("marching_with_sine", ".jpeg"), # reuse
    39: ("tuning_mind", ".mp4"),
    40: ("pressing__TUNE__button", ".mp4")
}

# Scan downloads and copy
copied_count = 0
for frame_idx, (substring, ext) in keywords.items():
    matched_file = None
    for f in os.listdir(downloads_dir):
        if substring.lower() in f.lower() and f.endswith(ext):
            matched_file = f
            break
            
    if matched_file:
        src_path = os.path.join(downloads_dir, matched_file)
        dest_filename = f"frame_{frame_idx:02d}{ext}"
        dest_path = os.path.join(target_dir, dest_filename)
        shutil.copy2(src_path, dest_path)
        print(f"Frame {frame_idx:02d} -> Copied: {matched_file} as {dest_filename}")
        copied_count += 1
    else:
        print(f"Error: No file found in Downloads containing '{substring}' with extension '{ext}' for Frame {frame_idx:02d}")

print(f"Asset copying done. Copied {copied_count}/40 frames.")
