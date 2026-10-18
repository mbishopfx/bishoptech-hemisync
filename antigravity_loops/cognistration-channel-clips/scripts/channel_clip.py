#!/usr/bin/env python3
"""Channel clip pipeline: download, clip, caption, and post Shorts from
Jesse Michaels, Shawn Ryan, and Joe Rogan. No Cognistration ads, just growth.

Usage:
  python3 scripts/channel_clip.py --channel jesse
  python3 scripts/channel_clip.py --channel shawn
  python3 scripts/channel_clip.py --channel rogan --dry-run
"""

import argparse, json, os, random, re, shutil, subprocess, sys, tempfile
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import publish_clip  # noqa: E402

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = PROJECT_ROOT / "output"
STATE_DIR = PROJECT_ROOT / "state"
STATE_PATH = STATE_DIR / "clip_state.json"

CHANNELS = {
    "jesse": {
        "handle": "@JesseMichels",
        "name": "Jesse Michaels",
        "credit": "Clipped from Jesse Michaels. Full episode on his YouTube channel.",
        "url": "https://www.youtube.com/@JesseMichels/videos",
    },
    "shawn": {
        "handle": "@ShawnRyanShow",
        "name": "Shawn Ryan",
        "credit": "Clipped from Shawn Ryan Show. Watch the full interview on his channel.",
        "url": "https://www.youtube.com/@ShawnRyanShow/videos",
    },
    "rogan": {
        "handle": "@joerogan",
        "name": "Joe Rogan",
        "credit": "Clipped from The Joe Rogan Experience. Full episode on Spotify and YouTube.",
        "url": "https://www.youtube.com/@joerogan/videos",
    },
}

TARGET_SEC = 75


def ensure_dirs():
    for d in [OUTPUT_DIR, STATE_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def load_state():
    if STATE_PATH.exists():
        with open(STATE_PATH) as f:
            return json.load(f)
    return {"clipped": []}


def save_state(s):
    s["clipped"] = s["clipped"][-50:]
    with open(STATE_PATH, "w") as f:
        json.dump(s, f, indent=2)


def get_latest_video(channel_key):
    info = CHANNELS[channel_key]
    print(f"[source] Fetching latest from {info['name']}...")
    # Step 1: Get the first video ID from the uploads playlist
    result = subprocess.run([
        "yt-dlp", "--flat-playlist", "--print", "id",
        "--playlist-end", "1", info["url"],
    ], capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {result.stderr[:300]}")
    vid = result.stdout.strip().split("\n")[0]
    # Step 2: Get title for that video
    result2 = subprocess.run([
        "yt-dlp", "--print", "title", "--skip-download",
        f"https://www.youtube.com/watch?v={vid}",
    ], capture_output=True, text=True, timeout=60)
    title = result2.stdout.strip().split("\n")[0] if result2.returncode == 0 else "Unknown"
    print(f"[source] Found: {title} ({vid})")
    return vid, title


def already_clipped(channel_key, video_id, state):
    key = f"{channel_key}:{video_id}"
    return key in state.get("clipped", [])


def mark_clipped(channel_key, video_id, state):
    state.setdefault("clipped", []).append(f"{channel_key}:{video_id}")
    save_state(state)


def download_and_clip(channel_key, video_id):
    url = f"https://www.youtube.com/watch?v={video_id}"
    td = Path(tempfile.mkdtemp(prefix="cog-clip-"))
    slug = f"{channel_key}-{video_id[:8]}"
    src = td / f"{slug}-source.mp4"
    clip = td / f"{slug}-clip.mp4"

    # Step 1: Get duration without downloading
    print("[info] Getting video duration...")
    dur_out = subprocess.run([
        "yt-dlp", "--print", "duration_string", "--skip-download",
        url,
    ], capture_output=True, text=True, timeout=30)
    
    # Parse duration (HH:MM:SS or just seconds)
    dur_str = dur_out.stdout.strip().split("\n")[0]
    parts = dur_str.split(":")
    if len(parts) == 3:
        total = int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
    elif len(parts) == 2:
        total = int(parts[0]) * 60 + int(parts[1])
    else:
        total = int(float(dur_str))
    total = int(total)
    print(f"[info] Video: {total}s")

    if total < 50:
        raise RuntimeError(f"Too short ({total:.0f}s)")

    # Step 2: Pick random segment (avoid first/last 15%)
    margin = int(total * 0.15)
    if total - margin * 2 < TARGET_SEC:
        start = margin
        cdur = min(TARGET_SEC, total - margin)
    else:
        start = random.randint(margin, total - margin - TARGET_SEC)
        cdur = TARGET_SEC

    print(f"[clip] Segment: {start}s + {cdur}s")

    # Step 3: Download only the segment we need
    print("[download] Fetching segment...")
    subprocess.run([
        "yt-dlp", "-f",
        "best[height<=720]",
        "--download-sections", f"*{start}-{start+cdur}",
        "-o", str(src), "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        url,
    ], check=True, timeout=300)

    mb = src.stat().st_size / 1e6
    print(f"[download] {mb:.1f} MB")

    # Step 4: Crop to vertical 1080x1920
    subprocess.run([
        "ffmpeg", "-y",
        "-i", str(src),
        "-vf", "crop=ih*9/16:ih:(iw-ow)/2:0,scale=1080:1920",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-c:a", "aac", "-b:a", "128k", "-r", "30",
        str(clip),
    ], check=True, capture_output=True, timeout=300)

    mb2 = clip.stat().st_size / 1e6
    print(f"[clip] Done: {mb2:.1f} MB")
    return clip, total, start, cdur, td


def get_captons(video_id, clip_start, clip_dur, dest_dir):
    """Download YouTube auto-captions and extract clip segment with adjusted timestamps."""
    srt_dest = Path(dest_dir) / "captions.srt"
    tmp = tempfile.mkdtemp(prefix="cog-subs-")

    try:
        subprocess.run([
            "yt-dlp", "--write-auto-subs", "--sub-lang", "en",
            "--skip-download", "--convert-subs", "srt",
            "-o", f"{tmp}/%(id)s",
            f"https://www.youtube.com/watch?v={video_id}",
        ], capture_output=True, text=True, timeout=120)

        srt_files = list(Path(tmp).glob("*.srt"))
        if not srt_files:
            print("[captions] No auto-captions available")
            return None

        with open(srt_files[0]) as f:
            content = f.read()

        clip_end = clip_start + clip_dur
        out_lines = []
        
        # Parse SRT blocks and shift timestamps
        for block in content.strip().split("\n\n"):
            lines = block.split("\n")
            if len(lines) < 3:
                continue
            
            # Parse timestamp line: 00:50:18,000 --> 00:50:21,500
            tm_match = re.match(
                r"(\d+):(\d+):(\d+)[,.](\d+)\s*-->\s*(\d+):(\d+):(\d+)[,.](\d+)",
                lines[1])
            if not tm_match:
                continue
            
            start_sec = (int(tm_match.group(1)) * 3600 + int(tm_match.group(2)) * 60 +
                         int(tm_match.group(3)) + int(tm_match.group(4)) / 1000)
            end_sec = (int(tm_match.group(5)) * 3600 + int(tm_match.group(6)) * 60 +
                       int(tm_match.group(7)) + int(tm_match.group(8)) / 1000)
            
            # Check if this caption overlaps with our clip window
            if end_sec < clip_start - 0.5 or start_sec > clip_end + 0.5:
                continue
            
            # Shift timestamps relative to clip start
            rel_start = max(0, start_sec - clip_start)
            rel_end = min(clip_dur, end_sec - clip_start)
            
            # Format as SRT timestamp
            def fmt_ts(t):
                h = int(t // 3600)
                m = int((t % 3600) // 60)
                s = int(t % 60)
                ms = int((t % 1) * 1000)
                return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
            
            out_lines.append(lines[0])  # sequence number
            out_lines.append(f"{fmt_ts(rel_start)} --> {fmt_ts(rel_end)}")
            out_lines.extend(lines[2:])  # caption text
            out_lines.append("")  # blank line separator

        if not out_lines:
            print("[captions] No captions in clip window")
            return None

        with open(srt_dest, "w") as f:
            f.write("\n".join(out_lines))
        
        print(f"[captions] Extracted {len([l for l in out_lines if '-->' in l])} caption blocks")
        return str(srt_dest)
        
    except Exception as e:
        print(f"[captions] Error: {e}")
        return None
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def burn_captions(video_path, srt_path, output_path):
    if not srt_path or not os.path.exists(srt_path):
        shutil.copy2(video_path, output_path)
        print("[captions] No SRT, copying as-is")
        return

    print("[captions] Burning subtitles...")
    subprocess.run([
        "ffmpeg", "-y", "-i", str(video_path),
        "-vf", f"subtitles={srt_path}:force_style='FontSize=18,PrimaryColour=&H00FFFFFF,Outline=1,Shadow=1,Alignment=2,MarginV=80'",
        "-c:v", "libx264", "-crf", "20", "-preset", "fast",
        "-c:a", "copy", str(output_path),
    ], check=True, capture_output=True, timeout=300)


def main():
    parser = argparse.ArgumentParser(description="Clip YouTube channel for Shorts")
    parser.add_argument("--channel", "-c", required=True,
                        choices=list(CHANNELS.keys()))
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--privacy", default="public",
                        choices=["public", "unlisted", "private"],
                        help="Privacy for the posted clip (default: public)")
    args = parser.parse_args()

    ch = CHANNELS[args.channel]
    ensure_dirs()
    state = load_state()

    print(f"{'='*60}")
    print(f" Channel Clp: {ch['name']}")
    print(f" Started: {datetime.now(timezone.utc).isoformat()}")
    print(f"{'='*60}")

    video_id, title = get_latest_video(args.channel)

    if already_clipped(args.channel, video_id, state):
        print(f"[skip] Already clpped: {video_id}")
        return

    final = OUTPUT_DIR / f"{args.channel}-{video_id[:8]}-captioned.mp4"
    td = None

    try:
        clipped, total, clip_start, clip_dur, td = download_and_clip(
            args.channel, video_id)
        srt = get_captons(video_id, clip_start, clip_dur, str(td))
        burn_captions(clipped, srt, str(final))

        # Post it. This used to be a print() that claimed "Would upload" and
        # then marked the source consumed anyway, so the pipeline produced
        # finished clips that never went anywhere.
        if args.dry_run:
            print(f"\n[dry-run] would publish: {final}")
            return
        result = publish_clip.publish(final, args.channel, video_id,
                                      privacy=args.privacy)
        # Only now is the source genuinely spent, so a failed upload leaves it
        # eligible for the next run instead of silently dropping it.
        mark_clipped(args.channel, video_id, state)
        print(f"\nDone: {result['url']}")

    except Exception as e:
        print(f"\nFAILED: {e}")
        sys.exit(1)
    finally:
        if td:
            shutil.rmtree(td, ignore_errors=True)


if __name__ == "__main__":
    main()
