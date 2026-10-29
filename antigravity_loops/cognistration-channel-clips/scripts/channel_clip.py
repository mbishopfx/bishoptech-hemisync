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

# A long podcast holds more than one usable moment, so a source is no longer
# spent by its first clip: each run takes the next spot in the episode instead
# of skipping, up to this many clips per source, and only then does the loop
# move on to the next upload. Tune with COGNISTRATION_MAX_CLIPS_PER_VIDEO.
MAX_CLIPS_PER_VIDEO = int(os.environ.get("COGNISTRATION_MAX_CLIPS_PER_VIDEO", "3"))
# How far down the channel's uploads list to look for a source that still has a
# free clip slot before deciding there is nothing to publish today.
RECENT_LIMIT = int(os.environ.get("COGNISTRATION_RECENT_LIMIT", "12"))
# Two windows this close share the same stretch of conversation, so a fresh clip
# must clear every used one by at least this many seconds.
SEGMENT_PAD_SEC = int(os.environ.get("COGNISTRATION_SEGMENT_PAD_SEC", "30"))


class NoFreeSegment(RuntimeError):
    """Raised when a source has no unused, non-overlapping window left."""


# The Homebrew build is the one that got updated to a SABR-capable release; a
# stale yt_dlp also sits in the user site-packages and `which` can find either
# depending on PATH, so pick the newest explicitly. An old yt-dlp is what made
# these videos look 360p-only.
def _resolve_ytdlp():
    cands = ["/opt/homebrew/bin/yt-dlp", "/usr/local/bin/yt-dlp",
             os.path.expanduser("~/Library/Python/3.9/bin/yt-dlp"),
             os.path.expanduser("~/.local/bin/yt-dlp")]
    found = [c for c in cands if os.path.exists(c)]
    w = shutil.which("yt-dlp")
    if w and w not in found:
        found.append(w)
    best, best_v = None, ()
    for c in found:
        try:
            out = subprocess.run([c, "--version"], capture_output=True,
                                 text=True, timeout=20).stdout.strip()
            v = tuple(int(x) for x in out.split(".")[:3] if x.isdigit())
        except Exception:
            continue
        if v > best_v:
            best, best_v = c, v
    return best or w or "yt-dlp"


YTDLP = _resolve_ytdlp()

# YouTube moved this session to SABR-only streaming. The `android` client used
# to be the workaround for 403s, but it now tops out at 640x360, which is what
# starved the vertical reframes; the default client exposes 720p and 1080p.
# Override with COGNISTRATION_YTDLP_CLIENT if YouTube changes shape again.
YTDLP_CLIENT = os.environ.get("COGNISTRATION_YTDLP_CLIENT", "default")
YTDLP_ARGS = f"youtube:player_client={YTDLP_CLIENT}"

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
            state = json.load(f)
    else:
        state = {}
    state.setdefault("clipped", [])
    state.setdefault("segments", {})
    return state


def save_state(s):
    s["clipped"] = s["clipped"][-50:]
    with open(STATE_PATH, "w") as f:
        json.dump(s, f, indent=2)


def get_latest_video(channel_key):
    info = CHANNELS[channel_key]
    print(f"[source] Fetching latest from {info['name']}...")
    # Step 1: Get the first video ID from the uploads playlist
    result = subprocess.run([
        YTDLP, "--flat-playlist", "--print", "id",
        "--playlist-end", "1", info["url"],
    ], capture_output=True, text=True, timeout=60)
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {result.stderr[:300]}")
    vid = result.stdout.strip().split("\n")[0]
    # Step 2: Get title for that video
    result2 = subprocess.run([
        YTDLP, "--print", "title", "--skip-download",
        f"https://www.youtube.com/watch?v={vid}",
    ], capture_output=True, text=True, timeout=60)
    title = result2.stdout.strip().split("\n")[0] if result2.returncode == 0 else "Unknown"
    print(f"[source] Found: {title} ({vid})")
    return vid, title


def source_key(channel_key, video_id):
    return f"{channel_key}:{video_id}"


def used_segments(state, channel_key, video_id):
    """The clip windows already published from this source video.

    Older state files only contain ``clipped`` keys and ``published`` records.
    Convert those into placeholder windows so they still count toward
    MAX_CLIPS_PER_VIDEO, while their unknown start time does not constrain the
    next segment's position.
    """
    key = source_key(channel_key, video_id)
    segments = list(state.get("segments", {}).get(key, []))
    known_ids = {s.get("videoId") for s in segments if s.get("videoId")}
    legacy = []
    legacy_part = 0
    for published in state.get("published", []):
        if (published.get("channel") != channel_key
                or published.get("sourceId") != video_id):
            continue
        posted_id = published.get("videoId")
        if posted_id and posted_id in known_ids:
            continue
        legacy_part += 1
        try:
            part = int(published.get("part") or legacy_part)
        except (TypeError, ValueError):
            part = legacy_part
        legacy.append({
            "start": None,
            "dur": TARGET_SEC,
            "part": part,
            "videoId": posted_id,
            "publishedAt": published.get("publishedAt"),
        })
        if posted_id:
            known_ids.add(posted_id)

    has_part_one = any(int(s.get("part") or 0) == 1 for s in segments)
    if (key in state.get("clipped", []) and not legacy and not has_part_one):
        legacy.append({"start": None, "dur": TARGET_SEC, "part": 1,
                       "videoId": None})
    return legacy + segments


def record_segment(state, channel_key, video_id, start, dur, part, posted_id):
    key = source_key(channel_key, video_id)
    segs = state.setdefault("segments", {}).setdefault(key, [])
    segs.append({
        "start": int(start),
        "dur": int(dur),
        "part": int(part),
        "videoId": posted_id,
        "publishedAt": datetime.now(timezone.utc).isoformat(),
    })
    state["segments"][key] = segs[-25:]
    # Legacy mirror: anything older than this change reads the flat "clipped"
    # list, so keep it truthful without letting it gate anything.
    clipped = state.setdefault("clipped", [])
    if key not in clipped:
        clipped.append(key)
    save_state(state)


def get_recent_videos(channel_key, limit=RECENT_LIMIT):
    """Video ids from the channel's uploads list, newest first."""
    info = CHANNELS[channel_key]
    print(f"[source] Fetching recent uploads from {info['name']}...")
    result = subprocess.run([
        YTDLP, "--flat-playlist", "--print", "id",
        "--playlist-end", str(limit), info["url"],
    ], capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        raise RuntimeError(f"yt-dlp failed: {result.stderr[:300]}")
    return [v.strip() for v in result.stdout.strip().split("\n") if v.strip()]


def video_title(video_id):
    result = subprocess.run([
        YTDLP, "--print", "title", "--skip-download",
        f"https://www.youtube.com/watch?v={video_id}",
    ], capture_output=True, text=True, timeout=60)
    if result.returncode == 0 and result.stdout.strip():
        return result.stdout.strip().split("\n")[0]
    return "Unknown"


def pick_segment(total, used, target=TARGET_SEC, pad=SEGMENT_PAD_SEC):
    """A start time for the next clip, spaced away from the ones already used.

    Old behaviour drew one random start from the whole episode. That is what
    made a second run either duplicate a clip or skip the source entirely. Here
    every candidate start is scored by how far it sits from the nearest used
    window, and the run takes one of the widest-gap candidates, so successive
    clips spread across the episode instead of clustering. Returns
    (None, None) when no non-overlapping window is left.
    """
    margin = int(total * 0.15)
    lo, hi = margin, total - margin - target
    used_windows = [(u["start"], u["start"] + u["dur"])
                    for u in used if u.get("start") is not None]

    if hi < lo:
        # Short source: exactly one window fits. Take it once, then stop.
        end = min(total, lo + target)
        if any(not (end + pad <= u_s or lo >= u_e + pad)
               for u_s, u_e in used_windows):
            return None, None
        return lo, max(1, end - lo)

    scored = []
    for s in range(lo, hi + 1, 5):
        e = s + target
        if not used_windows:
            scored.append((float("inf"), s))
            continue
        gap, ok = float("inf"), True
        for u_s, u_e in used_windows:
            if not (e + pad <= u_s or s >= u_e + pad):
                ok = False
                break
            gap = min(gap, max(u_s - e, s - u_e))
        if ok:
            scored.append((gap, s))
    if not scored:
        return None, None
    # Among the roomiest candidates, stay random so repeat runs do not land on
    # the same second.
    best_gap = max(g for g, _ in scored)
    best = [s for g, s in scored if g >= best_gap * 0.8]
    return random.choice(best), target


def probe_size(path):
    """Width and height of the first video stream, as (w, h)."""
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", str(path)],
        capture_output=True, text=True, check=True)
    w, h = r.stdout.strip().split("x")[:2]
    return int(w), int(h)


def download_and_clip(channel_key, video_id, used=None):
    used = used or []
    url = f"https://www.youtube.com/watch?v={video_id}"
    td = Path(tempfile.mkdtemp(prefix="cog-clip-"))
    slug = f"{channel_key}-{video_id[:8]}"
    src = td / f"{slug}-source.mp4"
    clip = td / f"{slug}-clip.mp4"

    # Step 1: Get duration without downloading
    print("[info] Getting video duration...")
    dur_out = subprocess.run([
        YTDLP, "--print", "duration_string", "--skip-download",
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

    # Step 2: Pick the next segment, spaced away from any already used in this
    # episode, instead of drawing one at random from the whole runtime.
    start, cdur = pick_segment(total, used)
    if start is None or cdur is None:
        raise NoFreeSegment(
            f"{video_id}: no unused {TARGET_SEC}s window left "
            f"({len(used)} clip(s) already taken)")
    start, cdur = int(start), int(cdur)
    print(f"[clip] Segment {len(used) + 1}: {start}s + {cdur}s "
          f"(clear of {len(used)} earlier clip(s))")

    # YouTube's 720/1080p podcast streams are separate video+audio (DASH)
    # tracks, so a plain `best[height<=1080]` matches nothing at all and the
    # only muxed stream is 360p format 18 — which is exactly why every clip
    # looked soft. The bv+ba form selects a real 1080p picture and merges it
    # with the best audio, then remuxes to mp4 for ffmpeg downstream.
    subprocess.run([
        YTDLP, "-f",
        "bv*[height<=1080]+ba/b[height<=1080]/b[height<=1080]/bv*[height<=720]+ba/b",
        "--merge-output-format", "mp4",
        "--download-sections", f"*{start}-{start+cdur}",
        "-o", str(src), "--no-playlist",
        "--extractor-args", YTDLP_ARGS,
        url,
    ], check=True, timeout=900)

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
            YTDLP, "--write-auto-subs", "--sub-lang", "en",
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
    print(f" Channel Clip: {ch['name']}")
    print(f" Started: {datetime.now(timezone.utc).isoformat()}")
    print(f"{'='*60}")

    recent = get_recent_videos(args.channel)
    if not recent:
        raise RuntimeError("yt-dlp returned no uploads for this channel")

    # Walk newest-first to the first source that still has a free clip slot, and
    # within it take a fresh segment. This replaces the old "skip if already
    # clipped" rule: a source that already carries clips is only passed over
    # once it hits MAX_CLIPS_PER_VIDEO, so one long podcast yields several clips
    # instead of one. A short source whose windows are all used is skipped for
    # the next candidate rather than failing the run.
    passed_over = []
    for video_id in recent:
        used = used_segments(state, args.channel, video_id)
        if len(used) >= MAX_CLIPS_PER_VIDEO:
            passed_over.append(
                f"{video_id} (quota {len(used)}/{MAX_CLIPS_PER_VIDEO})")
            continue

        part = len(used) + 1
        title = video_title(video_id)
        print(f"[source] Chose: {title} ({video_id}) - clip {part}")
        final = OUTPUT_DIR / f"{args.channel}-{video_id[:8]}-p{part}-captioned.mp4"
        td = None
        try:
            clipped, total, clip_start, clip_dur, td = download_and_clip(
                args.channel, video_id, used)
        except NoFreeSegment as exc:
            print(f"[skip] {exc}")
            passed_over.append(f"{video_id} (no free window)")
            continue
        except Exception as e:
            print(f"\nFAILED: {e}")
            sys.exit(1)

        try:
            srt = get_captons(video_id, clip_start, clip_dur, str(td))
            captioned = td / "captioned.mp4"
            burn_captions(clipped, srt, str(captioned))
            # The brand card is added after the captions so the subtitle pass
            # never touches the outro, and the outro keeps its own audio intact.
            append_outro(captioned, str(final))

            # Post it. This used to be a print() that claimed "Would upload" and
            # then marked the source consumed anyway, so the pipeline produced
            # finished clips that never went anywhere.
            if args.dry_run:
                print(f"\n[dry-run] would publish clip {part}: {final}")
                return
            result = publish_clip.publish(final, args.channel, video_id,
                                          privacy=args.privacy, part=part)
            # Only now is the segment genuinely spent, so a failed upload leaves
            # it eligible for the next run instead of silently dropping it.
            record_segment(state, args.channel, video_id, clip_start, clip_dur,
                           part, result["videoId"])
            publish_clip.record_published(state, args.channel, video_id,
                                          result["videoId"], result["title"],
                                          part=part)
            print(f"\nDone: {result['url']}")
            return
        finally:
            if td:
                shutil.rmtree(td, ignore_errors=True)

    print("[skip] every recent upload is at its clip quota:")
    for line in passed_over[:8]:
        print(f"        {line}")


if __name__ == "__main__":
    main()
