#!/usr/bin/env python3
"""Nightly render: binaural audio, HTML backdrop, Remotion render, Drive upload.

Designed for cron at off-peak hours (1-3 AM). Each run renders ONE brain-state
short, uploads it to the shared Google Drive folder, and then deletes every
local artifact it created. Nothing is left on disk except the queue record.

Usage:
  python3 scripts/nightly_render.py --state theta
  python3 scripts/nightly_render.py --state alpha --carrier 236
  python3 scripts/nightly_render.py --state delta --duration 60
  python3 scripts/nightly_render.py --state theta --keep-local
"""

import argparse, json, os, shutil, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
# The Remotion project lives in the main Cognistration repo, not here
REMOTION_DIR = Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/remotion")
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
BACKGROUNDS_DIR = PROJECT_ROOT / "backgrounds"
AUDIO_DIR = PROJECT_ROOT / "output" / "audio"
STAGING_DIR = PROJECT_ROOT / "output" / "staging"
STATE_DIR = PROJECT_ROOT / "state"
QUEUE_PATH = STATE_DIR / "batch_queue.json"
AUDIO_SCRIPT = SCRIPTS_DIR / "generate_audio.py"
BACKGROUND_SCRIPT = SCRIPTS_DIR / "render_background.py"
DRIVE_SCRIPT = SCRIPTS_DIR / "drive_upload.py"

sys.path.insert(0, str(SCRIPTS_DIR))
import descriptions  # noqa: E402
import generate_hook  # noqa: E402

BEAT_MAP = {
    "delta": 2.5, "theta": 6.0, "alpha": 10.0,
    "smr": 13.0, "beta": 18.0, "gamma": 38.0,
}

# Each brain state gets its own BishopTech HTML sketch as the moving backdrop.
BACKGROUNDS = {
    "delta": "2026-08-09-vertical-09-gravity-garden.html",
    "theta": "2026-08-09-vertical-04-curl-field-weave.html",
    "alpha": "2026-08-09-vertical-05-blue-hour-lattice.html",
    "smr":   "2026-08-09-vertical-03-infinite-warehouse.html",
    "beta":  "2026-08-08-vertical-04-curl-field-weave.html",
    "gamma": "2026-08-07-vertical-04-curl-field-weave.html",
}


def resolve_python():
    """Return an interpreter that can import the Google API client.

    cron shells and background shells can resolve a different `python3` than the
    interactive terminal, so pick one that actually has googleapiclient rather
    than trusting sys.executable.
    """
    candidates = [
        PROJECT_ROOT / ".venv" / "bin" / "python3",
        Path("/usr/bin/python3"),
    ]
    for cand in candidates:
        if not cand.exists():
            continue
        probe = subprocess.run(
            [str(cand), "-c", "import googleapiclient, google.oauth2"],
            capture_output=True)
        if probe.returncode == 0:
            return str(cand)
    print("[env] warning: no interpreter with googleapiclient found; using sys.executable")
    return sys.executable


PYTHON: str = ""


def ensure_dirs():
    for d in [AUDIO_DIR, STAGING_DIR, STATE_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def ensure_env():
    """Install node_modules for Remotion if missing (first run only)."""
    if not (REMOTION_DIR / "node_modules" / "remotion").exists():
        print("[env] Installing Remotion...")
        subprocess.run(["npm", "install"], cwd=str(REMOTION_DIR), check=True)
        print("[env] Remotion ready.")
    else:
        print("[env] Remotion OK.")


def generate_audio(brain_state, carrier_hz, duration_sec):
    """Generate binaural WAV, convert to MP3, return MP3 path."""
    beat_hz = BEAT_MAP[brain_state]
    slug = f"{brain_state}-{int(carrier_hz)}hz-{beat_hz}hz"
    wav_path = AUDIO_DIR / f"{slug}.wav"
    mp3_path = AUDIO_DIR / f"{slug}.mp3"

    print(f"[audio] {brain_state} carrier={carrier_hz} beat={beat_hz} dur={duration_sec}s")
    subprocess.run([
        PYTHON, str(AUDIO_SCRIPT),
        "--output", str(wav_path),
        "--carrier", str(carrier_hz),
        "--beat", str(beat_hz),
        "--duration", str(duration_sec),
        "--volume", "0.7",
    ], check=True)

    subprocess.run([
        "ffmpeg", "-y", "-i", str(wav_path),
        "-codec:a", "libmp3lame", "-b:a", "192k",
        str(mp3_path),
    ], check=True, capture_output=True)

    wav_path.unlink(missing_ok=True)
    size_mb = mp3_path.stat().st_size / 1e6
    print(f"[audio] {mp3_path.name} ({size_mb:.1f} MB)")
    return mp3_path


def render_background(brain_state, duration_sec):
    """Turn this state's HTML sketch into a background MP4. Best effort."""
    sketch = BACKGROUNDS.get(brain_state)
    if not sketch:
        return None
    html = BACKGROUNDS_DIR / sketch
    if not html.exists():
        print(f"[background] sketch missing: {html}")
        return None

    out = STAGING_DIR / f"bg-{brain_state}.mp4"
    try:
        print(f"[background] {sketch}")
        subprocess.run([
            PYTHON, str(BACKGROUND_SCRIPT),
            "--html", str(html),
            "--out", str(out),
            "--duration", str(duration_sec),
        ], check=True)
        return out
    except Exception as exc:
        print(f"[background] skipped ({exc}); rendering without a backdrop")
        return None


def make_hook(brain_state):
    """Generate this run's whispered cold open.

    Returns the manifest dict Remotion expects as its `hook` prop, or None if
    generation failed. A None hook means the composition falls back to its
    baked-in DEFAULT_HOOK, so a TTS or Whisper hiccup never loses the render.
    """
    ledger = PROJECT_ROOT / "hooks.md"
    public_dir = REMOTION_DIR / "public"
    try:
        manifest, audio_path, json_path = generate_hook.generate(
            state=brain_state,
            public_dir=str(public_dir),
            ledger=str(ledger),
            json_out=str(STAGING_DIR / "hook_manifest.json"),
        )
        # The composition reads audioPath relative to remotion/public/.
        manifest["_audioFile"] = str(audio_path)
        manifest["_jsonFile"] = str(json_path)
        return manifest
    except Exception as exc:
        print(f"[hook] generation failed ({exc}); using the default cold open")
        return None


def render_video(brain_state, carrier_hz, audio_mp3, background_mp4, duration_sec,
                 hook=None):
    """Run the Remotion render, return the output MP4 path."""
    slug = f"{brain_state}-{int(carrier_hz)}hz"
    date_tag = datetime.now(timezone.utc).strftime("%Y%m%d")
    output_path = STAGING_DIR / f"{slug}-{date_tag}.mp4"

    # Audio and background both live under remotion/public so staticFile() resolves them
    r_audio_dir = REMOTION_DIR / "public" / "output" / "audio"
    r_bg_dir = REMOTION_DIR / "public" / "output" / "backgrounds"
    r_audio_dir.mkdir(parents=True, exist_ok=True)
    r_bg_dir.mkdir(parents=True, exist_ok=True)

    shutil.copy2(audio_mp3, r_audio_dir / audio_mp3.name)
    bg_prop = ""
    if background_mp4 and background_mp4.exists():
        shutil.copy2(background_mp4, r_bg_dir / background_mp4.name)
        bg_prop = f"output/backgrounds/{background_mp4.name}"

    props_dict = {
        "brainState": brain_state,
        "audioPath": f"output/audio/{audio_mp3.name}",
        "backgroundPath": bg_prop,
        "carrierHz": carrier_hz,
        "durationSec": duration_sec,
    }
    # The cold open: measured audio path + word timings from generate_hook.py.
    # Strip the private bookkeeping keys before Remotion sees them.
    if hook:
        props_dict["hook"] = {
            k: v for k, v in hook.items() if not k.startswith("_")
        }
    props = json.dumps(props_dict)

    print(f"[render] Rendering {brain_state}...")
    subprocess.run([
        "npx", "remotion", "render", "index.tsx", "CognistrationShort",
        str(output_path), "--props", props,
    ], cwd=str(REMOTION_DIR), check=True)

    # The public-dir copies are only needed while the render runs
    (r_audio_dir / audio_mp3.name).unlink(missing_ok=True)
    if bg_prop:
        (r_bg_dir / background_mp4.name).unlink(missing_ok=True)
    # Remove this run's hook audio + manifest so nothing accumulates.
    if hook:
        for key in ("_audioFile", "_jsonFile"):
            p = hook.get(key)
            if p and Path(p).exists():
                Path(p).unlink(missing_ok=True)
        hook_audio = REMOTION_DIR / "public" / str(hook.get("audioPath", ""))
        if hook.get("audioPath") and hook_audio.exists():
            hook_audio.unlink(missing_ok=True)

    size_mb = output_path.stat().st_size / 1e6
    print(f"[render] {output_path.name} ({size_mb:.1f} MB)")
    return output_path


def upload_to_drive(brain_state, video_path, duration_sec, carrier_hz):
    """Upload the finished MP4 to Drive, deleting the local copy on success."""
    beat_hz = BEAT_MAP[brain_state]
    meta = descriptions.build(brain_state, duration_sec, carrier_hz, beat_hz)
    print(f"[drive] title: {meta['title']}")

    result = subprocess.run([
        PYTHON, str(DRIVE_SCRIPT), str(video_path),
        "--state", brain_state,
        "--title", meta["title"],
        "--description", meta["description"],
        "--cleanup",
    ], text=True, capture_output=True)

    print(result.stdout)
    if result.returncode != 0:
        print(result.stderr)
        raise RuntimeError("drive upload failed")

    drive_id = None
    for line in result.stdout.splitlines():
        if "file id:" in line.lower():
            drive_id = line.split(":")[-1].strip()
    return drive_id


def cleanup(*paths):
    """Delete any remaining intermediates."""
    for p in paths:
        if p and Path(p).exists():
            Path(p).unlink()
            print(f"[cleanup] removed {p}")


def update_queue(brain_state, label, status="done", drive_id=None):
    """Mark batch item as done/failed in the queue."""
    if not QUEUE_PATH.exists():
        return
    with open(QUEUE_PATH) as f:
        q = json.load(f)
    for b in q.get("batches", []):
        if b.get("brainState") == brain_state and b.get("status") == "pending":
            b["status"] = status
            if label:
                b["outputFile"] = str(label)
            if drive_id:
                b["driveFileId"] = drive_id
            b["renderedAt"] = datetime.now(timezone.utc).isoformat()
            break
    with open(QUEUE_PATH, "w") as f:
        json.dump(q, f, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Nightly Cognistration short render")
    parser.add_argument("--state", "-s", required=True,
                        choices=list(BEAT_MAP.keys()))
    parser.add_argument("--carrier", "-c", type=float, default=200.0)
    parser.add_argument("--duration", "-d", type=float, default=65.0)
    parser.add_argument("--keep-local", action="store_true",
                        help="Do not delete the MP4 after the Drive upload")
    parser.add_argument("--no-hook", action="store_true",
                        help="Skip the whispered cold open; use the default one")
    args = parser.parse_args()

    print(f"{'='*60}")
    print(f" Nightly Render: {args.state} @ {args.carrier} Hz  ({args.duration}s)")
    print(f" Started: {datetime.now(timezone.utc).isoformat()}")
    print(f"{'='*60}")

    global PYTHON
    PYTHON = resolve_python()
    print(f"[env] python: {PYTHON}")

    ensure_dirs()
    ensure_env()

    mp3 = bg = vid = None
    hook = None
    try:
        if args.no_hook:
            print("[hook] skipped (--no-hook); the default cold open will be used")
        else:
            hook = make_hook(args.state)
        mp3 = generate_audio(args.state, args.carrier, args.duration)
        bg = render_background(args.state, args.duration)
        vid = render_video(args.state, args.carrier, mp3, bg, args.duration, hook)

        # Upload first, then remove the local MP4: Drive is the handoff point.
        drive_id = upload_to_drive(args.state, vid, args.duration, args.carrier)
        label = None
        if args.keep_local:
            label = vid.name
        else:
            cleanup(vid)
            vid = None

        cleanup(mp3, bg)
        update_queue(args.state, label, "done", drive_id)
        print(f"\nOK {args.state} uploaded to Drive (id {drive_id})")

    except Exception as e:
        print(f"\nFAIL {args.state}: {e}")
        cleanup(mp3, bg)
        update_queue(args.state, None, "failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
