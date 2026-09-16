#!/usr/bin/env python3
import os
import sys
import json
import random
import subprocess
import shutil
import atexit
import functools
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote

LOOPS_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if LOOPS_DIR not in sys.path:
    sys.path.insert(0, LOOPS_DIR)
from youtube_metadata import daily_metadata

VISUALS_DIR = "/Users/matthewbishop/BishopTech.dev/bishoptech-visuals"
FAVORITES_DIR = os.path.join(VISUALS_DIR, "favorites")
APP_STORE_ASSET_SOURCE = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-daily-videos/photoassets/images.png"
APP_STORE_ASSET_NAME = "app_store_badge.png"
FPS = 30
VIDEO_SECONDS = 90
TARGET_FRAMES = VIDEO_SECONDS * FPS

DAY_CONFIGS = {
    "monday": {"carrierFrom": 260, "carrierTo": 160, "deltaFrom": 15, "deltaTo": 4.8},
    "tuesday": {"carrierFrom": 160, "carrierTo": 280, "deltaFrom": 6, "deltaTo": 16},
    "wednesday": {"carrierFrom": 220, "carrierTo": 170, "deltaFrom": 10, "deltaTo": 5},
    "thursday": {"carrierFrom": 220, "carrierTo": 380, "deltaFrom": 10, "deltaTo": 40},
    "friday": {"carrierFrom": 380, "carrierTo": 220, "deltaFrom": 40, "deltaTo": 9.5},
    "saturday": {"carrierFrom": 280, "carrierTo": 100, "deltaFrom": 18, "deltaTo": 2.2},
    "sunday": {"carrierFrom": 180, "carrierTo": 120, "deltaFrom": 6.5, "deltaTo": 4},
}

def start_visual_server():
    """Serve one randomized vertical visual from the Favorites directory."""
    favorites_root = Path(FAVORITES_DIR).resolve()
    visuals_root = Path(VISUALS_DIR).resolve()
    candidates = sorted(
        path for path in favorites_root.iterdir()
        if path.is_file() and path.suffix.lower() == ".html"
    )
    if not candidates:
        raise RuntimeError(f"No favorite HTML visuals found in {FAVORITES_DIR}")

    selected_path = random.SystemRandom().choice(candidates)
    filename = selected_path.name
    class FavoritesHandler(SimpleHTTPRequestHandler):
        def translate_path(self, path):
            clean_path = path.split("?", 1)[0]
            if clean_path == "/p5.min.js":
                return str(visuals_root / "p5.min.js")
            return super().translate_path(path)

    handler = functools.partial(FavoritesHandler, directory=str(favorites_root))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    server.daemon_threads = True
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    atexit.register(server.shutdown)

    variation_seed = random.SystemRandom().randrange(1, 1_000_000_000)
    url = f"http://127.0.0.1:{server.server_port}/{quote(filename)}?obs=1&seed={variation_seed}"
    print(f"Selected BishopTech Visuals background: {filename}")
    print(f"Favorites directory: {FAVORITES_DIR}")
    print(f"Random visual state seed: {variation_seed}")
    print(f"Visual source URL: {url}")
    selected = {
        "file": filename,
        "title": selected_path.stem,
        "orientation": "vertical",
        "aspect_ratio": "9:16",
    }
    return server, thread, url, selected, None, variation_seed

def get_video_duration(path):
    cmd = [
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", path
    ]
    try:
        return float(subprocess.check_output(cmd).decode().strip())
    except Exception as e:
        print(f"Error getting duration for {path}: {e}")
        return 0.0

def prerender_visual_background(base_loop_dir, day_dir, public_dir, visual_url):
    """Capture one controlled p5 redraw per frame and encode a stable MP4."""
    frames_dir = os.path.join(day_dir, ".visual-frames")
    output_path = os.path.join(public_dir, "bishoptech_visual_background.mp4")
    capture_script = os.path.join(base_loop_dir, "scripts", "capture_visual_background.mjs")
    try:
        subprocess.run(
            [
                "node", capture_script, visual_url,
                "--output", frames_dir,
                "--width", "1080",
                "--height", "1920",
                "--frames", str(TARGET_FRAMES),
            ],
            cwd=os.path.dirname(capture_script),
            check=True,
        )
        subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-framerate", str(FPS),
                "-i", os.path.join(frames_dir, "frame-%06d.jpg"),
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                "-pix_fmt", "yuv420p", "-an", "-movflags", "+faststart",
                output_path,
            ],
            check=True,
        )
        print(f"Encoded deterministic BishopTech Visuals background: {output_path}")
        return output_path
    finally:
        shutil.rmtree(frames_dir, ignore_errors=True)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 compile_video.py <day-folder-name> <output-slug>")
        sys.exit(1)

    day = sys.argv[1].lower()
    slug = sys.argv[2]

    base_loop_dir = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/antigravity_loops/cognistration-daily-videos"
    day_dir = os.path.join(base_loop_dir, day)
    remotion_dir = os.path.join(base_loop_dir, "video1")
    public_dir = os.path.join(remotion_dir, "public")

    cfg = DAY_CONFIGS.get(day, DAY_CONFIGS["sunday"])

    # Generate local YouTube metadata only. The daily visual/audio lane intentionally
    # has no caption generation or caption rendering.
    yt_metadata = daily_metadata(day, slug)

    # Save youtube_metadata.json to day folder
    with open(os.path.join(day_dir, "youtube_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(yt_metadata, f, indent=2)
    print("Saved youtube_metadata.json.")

    # 3. Clean out old assets from public folder
    print("Cleaning Remotion public directory...")
    for f in os.listdir(public_dir):
        if f.startswith("bg_") or f in {"video_metadata.json", "audio.wav", "bishoptech_visual_background.mp4", APP_STORE_ASSET_NAME}:
            try:
                os.remove(os.path.join(public_dir, f))
            except Exception as e:
                print(f"Warning: could not delete {f}: {e}")

    # 4. Copy generated sweep audio into Remotion public
    src_audio = os.path.join(day_dir, "audio.wav")
    if os.path.exists(src_audio):
        shutil.copy2(src_audio, os.path.join(public_dir, "audio.wav"))
        print("Copied generated sweep audio to Remotion public.")
    else:
        print(f"Error: Generated audio not found at {src_audio}")
        sys.exit(1)

    if not os.path.isfile(APP_STORE_ASSET_SOURCE):
        print(f"Error: App Store asset not found at {APP_STORE_ASSET_SOURCE}")
        sys.exit(1)
    shutil.copy2(APP_STORE_ASSET_SOURCE, os.path.join(public_dir, APP_STORE_ASSET_NAME))
    print(f"Copied App Store asset to Remotion public as {APP_STORE_ASSET_NAME}.")

    # 5. Select a randomized vertical Favorites sketch as the background source.
    # The local server stays alive for the Remotion render so the final MP4 is
    # rendered from the original browser-native visual, not an AI-generated clip.
    print("Selecting a vertical BishopTech Visuals background...")
    visual_server, visual_thread, visual_url, visual_entry, visual_manifest, visual_seed = start_visual_server()
    try:
        prerender_visual_background(base_loop_dir, day_dir, public_dir, visual_url)
    except Exception:
        visual_server.shutdown()
        visual_server.server_close()
        visual_thread.join(timeout=2)
        raise
    selected_bg = [{
        "source": "BishopTech Visuals",
        "file": visual_entry["file"],
        "title": visual_entry.get("title"),
        "orientation": visual_entry.get("orientation"),
        "aspect_ratio": visual_entry.get("aspect_ratio"),
        "variationSeed": visual_seed,
        "startFrame": 0,
        "duration": TARGET_FRAMES,
    }]
    print(f"Prepared BishopTech Visuals background for exactly {TARGET_FRAMES} frames.")

    # 6. Save video_metadata.json with day configurations for MachineOverlay
    metadata = {
        "durationInFrames": TARGET_FRAMES,
        "fps": FPS,
        "toneDurationInFrames": TARGET_FRAMES,
        "toneDurationSeconds": VIDEO_SECONDS,
        "carrierFrom": cfg["carrierFrom"],
        "carrierTo": cfg["carrierTo"],
        "deltaFrom": cfg["deltaFrom"],
        "deltaTo": cfg["deltaTo"],
        "visualSourceUrl": visual_url,
        "visualMode": "rendered-favorites-full-bleed",
        "visualBackgroundFile": "bishoptech_visual_background.mp4",
        "visualSource": selected_bg,
        "appStoreAssetFile": APP_STORE_ASSET_NAME,
        "layout": "three-section-top-frequency-middle-app-store-bottom-visual",
        "videoEffects": []
    }
    with open(os.path.join(public_dir, "video_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    with open(os.path.join(day_dir, "composition_manifest.json"), "w", encoding="utf-8") as f:
        json.dump({
            "durationSeconds": VIDEO_SECONDS,
            "fps": FPS,
            "toneSeconds": VIDEO_SECONDS,
            "visualSource": selected_bg,
            "visualMode": "rendered-favorites-full-bleed",
            "visualCapture": "deterministic-p5-frames-to-mp4",
            "visualBackgroundFile": "bishoptech_visual_background.mp4",
            "appStoreAssetFile": APP_STORE_ASSET_NAME,
            "layout": "three-section-top-frequency-middle-app-store-bottom-visual",
            "videoEffects": [],
            "output": os.path.join(day_dir, "output.mp4"),
        }, f, indent=2)
    print("Saved video_metadata.json and composition_manifest.json.")

    # 7. Render Remotion video
    print("Rendering video via Remotion CLI...")
    output_mp4 = os.path.join(day_dir, "output.mp4")
    if os.path.exists(output_mp4):
        os.remove(output_mp4)

    cmd = ["./node_modules/.bin/remotion", "render", "MyComp", output_mp4]
    try:
        result = subprocess.run(cmd, cwd=remotion_dir, capture_output=True, text=True, stdin=subprocess.DEVNULL)

        print("Remotion CLI STDOUT:")
        print(result.stdout)
        print("Remotion CLI STDERR:")
        print(result.stderr)

        if result.returncode == 0 and os.path.exists(output_mp4):
            print("Video rendered successfully!")

            # 8. Copy to iCloud only when explicitly enabled. The render itself
            # remains temporary when COGNISTRATION_KEEP_LOCAL_COPY=0.
            keep_local_copy = os.environ.get("COGNISTRATION_KEEP_LOCAL_COPY", "0").lower() not in {"0", "false", "no"}
            if keep_local_copy:
                icloud_base = "/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG"
                icloud_dest_dir = os.path.join(icloud_base, slug)
                os.makedirs(icloud_dest_dir, exist_ok=True)

                dest_video = os.path.join(icloud_dest_dir, f"{slug}.mp4")
                if os.path.exists(dest_video):
                    os.remove(dest_video)
                shutil.copy2(output_mp4, dest_video)
                print(f"Saved compiled video to iCloud: {dest_video}")
            else:
                print("Skipping iCloud copy; local video is temporary for upload only.")
        else:
            print(f"Error: Remotion render failed with code {result.returncode}")
            sys.exit(1)
    finally:
        visual_server.shutdown()
        visual_server.server_close()
        visual_thread.join(timeout=2)
        print("Stopped BishopTech Visuals local source server.")

if __name__ == "__main__":
    main()
