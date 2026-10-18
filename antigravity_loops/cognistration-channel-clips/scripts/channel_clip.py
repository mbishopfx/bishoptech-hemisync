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

# Every clip ends on the brand card, with the snap landing just before the cut.
# The outro lives with the shorts factory, which is where the asset is managed;
# SNAP is the same crack used to open a binaural short, so the two loops share
# one sound identity. Override either with an env var if the asset moves.
BRAND_OUTRO = Path(os.environ.get(
    "COGNISTRATION_BRAND_OUTRO",
    "/Users/matthewbishop/BishopTech.dev/cognistration-shorts-factory/"
    "04c65a1222794b8fbecef388baa3a8b8.mov"))
SNAP_SFX = Path(os.environ.get(
    "COGNISTRATION_SNAP_SFX",
    "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/remotion/"
    "public/hook/snap.mp3"))
# The snap starts this many seconds before the outro begins, so the crack
# arrives on the transition rather than after it.
SNAP_LEAD_SEC = 0.75


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


def probe_size(path):
    """Width and height of the first video stream, as (w, h)."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", str(path)],
        capture_output=True, text=True, check=True)
    w, h = r.stdout.strip().split("x")[:2]
    return int(w), int(h)


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

    # Step 3: Download only the segment we need. The old format string
    # `best[height<=720]` was resolving to 360p, which then got cropped to a
    # narrow slice and blown up to 1080x1920. Ask for the tallest real stream.
    print("[download] Fetching segment...")
    subprocess.run([
        "yt-dlp", "-f",
        "best[height<=1080][vcodec^=avc1]/best[height<=1080]/best[height<=720]/best",
        "--download-sections", f"*{start}-{start+cdur}",
        "-o", str(src), "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        url,
    ], check=True, timeout=300)

    mb = src.stat().st_size / 1e6
    print(f"[download] {mb:.1f} MB")

    # Step 4: Reframe 16:9 -> 9:16.
    #
    # A static centre crop of a two-person two-shot is the classic amateur
    # result: it isolates the gap between the host and the guest, and a fixed
    # crop means you are watching someone silent while the other talks. True
    # active-speaker panning would need diarization, which is not installed
    # here, so we use the layout the research calls the standard vertical
    # podcast look instead: stack the two halves of the wide frame so both
    # faces stay visible and correctly sized for the whole exchange.
    #
    # If the source is not wide (or is already tall), stacking would slice
    # people in half, so fall back to fitting the whole frame over a blurred
    # fill rather than cropping anyone out.
    w, h = probe_size(src)
    # Stacking is a resolution gamble as well as a layout choice: each panel is
    # only half the source width, so a 640px-wide source gives a 320px panel
    # blown up to 1080 (3.4x) and it turns to mush. Require the panel to start
    # at least half as wide again as it needs to be. YouTube is currently
    # serving many podcast videos to yt-dlp at 360p only, so in practice this
    # check is what decides the layout.
    half = (w // 2) & ~1
    stacked = h > 0 and (w / h) >= 1.6 and half >= 720
    if stacked:
        # Each panel is 1080x960 so the two stack to exactly 1080x1920; the
        # panel is covered then cropped, biased upward (0.33 of the overflow)
        # so the eyes land about a third down instead of jammed to the top.
        panel = ("scale=1080:960:force_original_aspect_ratio=increase,"
                 "crop=1080:960:0:'(ih-960)*0.33'")
        vf = (
            f"[0:v]fps=30,setsar=1,split=2[t][b];"
            f"[t]crop={half}:{h}:0:0,{panel}[tt];"
            f"[b]crop={half}:{h}:{half}:0,{panel}[bb];"
            f"[tt][bb]vstack=inputs=2[out]"
        )
        print(f"[clip] Framing: stacked two-panel from {w}x{h}")
    else:
        # Blurred fill: whole shot visible, nobody cropped off the edge.
        vf = (
            f"[0:v]fps=30,setsar=1,split=2[bg][fg];"
            f"[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
            f"boxblur=24:3,eq=brightness=-0.06[bgb];"
            f"[fg]scale=1080:-2[fgs];"
            f"[bgb][fgs]overlay=(W-w)/2:(H-h)/2[out]"
        )
        print(f"[clip] Framing: blurred-fill fit from {w}x{h}")

    subprocess.run([
        "ffmpeg", "-y", "-i", str(src),
        "-filter_complex", vf, "-map", "[out]",
        # Once any -map is given, ffmpeg stops auto-selecting streams for the
        # rest, so the audio has to be mapped explicitly or the clip comes out
        # with no sound and the later concat fails on a missing [0:a].
        "-map", "0:a:0",
        "-c:v", "libx264", "-crf", "18", "-preset", "fast",
        "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2", "-r", "30",
        "-pix_fmt", "yuv420p", str(clip),
    ], check=True, capture_output=True, timeout=600)

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

    # FontSize used to be 18 with no PlayRes set, and libass defaults to
    # PlayResY=384: 18/384 of a 1920px-tall frame is ~90px of text, which is
    # why the captions ate the picture. Declaring PlayRes makes the number the
    # literal pixel height it looks like, so 52 is genuinely smaller, and
    # Bold=1 plus a thicker outline keeps it readable at that size.
    #
    # MarginV clears the bottom of the Shorts UI (title, channel, buttons) and
    # MarginL/R keep long lines off the screen edges; BottomCenter sits above
    # the safe zone rather than inside it.
    style = (
        "FontName=Arial Black,FontSize=52,Bold=1,"
        "PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,"
        "Outline=4,Shadow=0,BorderStyle=1,"
        "Alignment=2,MarginV=230,MarginL=70,MarginR=70,"
        "PlayResX=1080,PlayResY=1920"
    )
    print("[captions] Burning subtitles...")
    subprocess.run([
        "ffmpeg", "-y", "-i", str(video_path),
        "-vf", f"subtitles={srt_path}:force_style='{style}'",
        "-c:v", "libx264", "-crf", "19", "-preset", "fast",
        "-c:a", "copy", str(output_path),
    ], check=True, capture_output=True, timeout=600)


def probe_duration(path):
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def append_outro(clip_path, output_path):
    """Join the brand card after the clip and put the snap on the seam.

    Both halves are forced to identical video and audio parameters first: the
    concat filter refuses mismatched inputs, and the .mov comes in at 44.1 kHz
    while the clip is 48 kHz, so a naive stream copy would fail or drift.

    The snap is not appended, it is mixed over the end of the clip, starting
    SNAP_LEAD_SEC before the picture cuts. A crack placed after the transition
    reads as an echo of a cut nobody noticed; placed across it, it is the cut.
    """
    if not BRAND_OUTRO.exists():
        raise RuntimeError(f"brand outro missing at {BRAND_OUTRO}")
    if not SNAP_SFX.exists():
        raise RuntimeError(f"snap sfx missing at {SNAP_SFX}")

    clip_dur = probe_duration(clip_path)
    # adelay counts from the start of the mix, and the mix starts at the head of
    # the clip, so the offset is the clip length minus the lead.
    delay_ms = max(0, int((clip_dur - SNAP_LEAD_SEC) * 1000))

    a_common = "aformat=sample_rates=48000:channel_layouts=stereo"
    v_common = ("fps=30,setsar=1,settb=AVTB,"
                "scale=1080:1920:force_original_aspect_ratio=decrease,"
                "pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p")
    graph = (
        f"[0:v]{v_common}[v0];"
        f"[1:v]{v_common}[v1];"
        f"[v0][v1]concat=n=2:v=1:a=0[vout];"
        f"[0:a]{a_common}[a0];"
        f"[1:a]{a_common}[a1];"
        f"[2:a]{a_common},volume=0.7,adelay={delay_ms}|{delay_ms}[sn];"
        # amix with normalize=0 sums the two streams, and YouTube's own audio
        # already runs near full scale, so the snap pushed the seam over 0 dBFS
        # (measured peak 1.341, 3322 clipping samples). Limiting the sum keeps
        # the crack loud without distorting the first word of the outro.
        f"[a0][sn]amix=inputs=2:duration=first:normalize=0[amixraw];"
        f"[amixraw]alimiter=limit=0.89:attack=1:release=40[amix];"
        f"[amix][a1]concat=n=2:v=0:a=1[aout]"
    )
    print(f"[outro] snap at {delay_ms / 1000:.2f}s, brand card "
          f"{probe_duration(BRAND_OUTRO):.1f}s appended")
    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-i", str(clip_path),
        "-i", str(BRAND_OUTRO), "-i", str(SNAP_SFX),
        "-filter_complex", graph, "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-crf", "19", "-preset", "fast",
        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
        str(output_path),
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=900)
    except subprocess.CalledProcessError as exc:
        # Every ffmpeg call in this file ran with its output captured and
        # discarded, so a real filter-graph failure surfaced as a bare non-zero
        # exit with no reason. Replay the tail of stderr into the log instead.
        tail = (exc.stderr or b"").decode(errors="replace").strip().splitlines()[-12:]
        print("[outro] ffmpeg failed:", file=sys.stderr)
        print("\n".join(f"  {ln}" for ln in tail), file=sys.stderr)
        raise


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
        captioned = td / "captioned.mp4"
        burn_captions(clipped, srt, str(captioned))
        # The brand card is added after the captions so the subtitle pass never
        # touches the outro, and the outro keeps its own audio intact.
        append_outro(captioned, str(final))

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
