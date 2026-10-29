#!/usr/bin/env python3
"""Generate a unique, state-aware whispered hook for a Cognistration short.

Every render run calls this once, before Remotion starts. It:

  1. picks a hook line for the brain state that has not been used before,
     reading the ledger so the same sentence never ships twice;
  2. synthesises it as a slow, soft, human whisper through OpenRouter TTS
     (ElevenLabs `eleven-v3`, voice "Rachel", with the `[whispers]` tag);
  3. shapes the audio — high-pass, a 200 Hz scoop, a 2.8 kHz presence lift,
     gentle compression, a 0.80x slowdown and a limiter;
  4. measures real word timings with Whisper on the *body only*, so the
     captions can be cut to the actual speech and not a guess;
  5. writes `<public-dir>/hook/<slug>.mp3` and `<slug>.json`, where the JSON
     is exactly the `hook` prop the Remotion composition expects;
  6. appends the line to `hooks.md` so it is never reused.

The point of regenerating every run is that a templated, repeated hook reads
as spam to TTS and to the platforms. A fresh line each time keeps it human.

Usage:
  python3 generate_hook.py --state theta --public-dir <remotion>/public \\
      --ledger hooks.md --json-out /tmp/hook.json
  python3 generate_hook.py --state alpha --dry-run        # pick a line only
  python3 generate_hook.py --list-used                    # show spent lines
  python3 generate_hook.py --list-pool                    # show the pool
"""

import argparse
import json
import os
import random
import re
import struct
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Voice / audio constants — these define the shipped hook character
# ---------------------------------------------------------------------------
OR_ENDPOINT = "https://openrouter.ai/api/v1/audio/speech"
TTS_MODEL = "elevenlabs/eleven-v3"
TTS_VOICE = "21m00Tcm4TlvDq8ikWAM"          # Rachel
TTS_VOICE_LABEL = "Rachel"
WHISPER_TAG = "[whispers]"

FPS = 30
LEAD_SEC = 0.45                            # silence before the whisper
TAIL_SEC = 0.35                            # silence after it, before the snap
ATEMPO = 0.80                              # slowdown; lower = slower/more drawn out

AUDIO_CHAIN = (
    "highpass=f=95,"
    "equalizer=f=200:t=q:w=1:g=-3,"
    "equalizer=f=2800:t=q:w=1.3:g=2.5,"
    "acompressor=threshold=-20dB:ratio=3.2:attack=8:release=220,"
    f"atempo={ATEMPO},"
    "volume=2.2,"
    "alimiter=limit=0.92"
)

ENV_CANDIDATES = [
    Path(os.path.expanduser("~/.hermes/profiles/cognistration/.env")),
    Path("/Users/matthewbishop/.hermes/profiles/cognistration/.env"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/.env"),
    Path(__file__).resolve().parent.parent / ".env",
]

# ---------------------------------------------------------------------------
# The hook pool
# ---------------------------------------------------------------------------
# Every line ends near the state name so the last beat lands on the promise.
# Twenty shapes across six states is 120 unique lines; the ledger keeps them
# from repeating. Add more templates freely — uniqueness scales linearly.
HOOK_TEMPLATES = [
    "You're about to have a digital reset in {state}.",
    "In a few seconds, your mind drops into {state}.",
    "This is your {state} reset. Let everything go.",
    "Close your eyes. You're entering {state} now.",
    "You're seconds away from {state}.",
    "Your mind is about to settle into {state}.",
    "Let the noise fall away. {state} is next.",
    "Breathe out. You're about to land in {state}.",
    "Everything quiets from here. Welcome to {state}.",
    "You're about to feel {state} take over.",
    "The reset begins now, in {state}.",
    "Stop scrolling. You're dropping into {state}.",
    "Your brain already knows the way to {state}.",
    "In a moment, you'll be deep in {state}.",
    "This is where {state} begins.",
    "You're about to go under, into {state}.",
    "Let your thoughts slow. {state} is waiting.",
    "Nothing to do now but drift into {state}.",
    "One breath from now, you're in {state}.",
    "Take a slow breath. You're going into {state}.",
]

# What the voice actually says for each state. SMR is the awkward one.
STATE_SPOKEN = {
    "delta": "delta",
    "theta": "theta",
    "alpha": "alpha",
    "smr": "SMR",
    "beta": "beta",
    "gamma": "gamma",
}

LEDGER_BEGIN = "<!-- HOOKS:BEGIN -->"
LEDGER_END = "<!-- HOOKS:END -->"

LEDGER_HEADER = """# Cognistration Shorts — Hook Ledger

Every whispered cold-open line the factory has already used. The generator
reads this file and refuses to repeat a line, so each short opens with
something the TTS engine has not said before.

Regenerated rows are appended below. Do not hand-edit the block between the
`HOOKS:BEGIN` / `HOOKS:END` markers — the generator parses it.

Format: `date | state | hook text | audio file | duration`

"""


# ---------------------------------------------------------------------------
# API key + TTS
# ---------------------------------------------------------------------------
def api_key():
    key = os.environ.get("OPENROUTER_API_KEY")
    if key:
        return key.strip()
    for env_path in ENV_CANDIDATES:
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                line = line.strip()
                if line.startswith("OPENROUTER_API_KEY="):
                    return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError(
        "OPENROUTER_API_KEY not found in the environment or in "
        + " or ".join(str(p) for p in ENV_CANDIDATES)
    )


def pcm_to_wav(pcm_bytes, rate, channels, out_path):
    """Wrap headerless PCM in a RIFF header so it is playable."""
    bits = 16
    byte_rate = rate * channels * bits // 8
    block_align = channels * bits // 8
    header = b"RIFF" + struct.pack("<I", 36 + len(pcm_bytes)) + b"WAVE"
    header += b"fmt " + struct.pack(
        "<IHHIIHH", 16, 1, channels, rate, byte_rate, block_align, bits)
    header += b"data" + struct.pack("<I", len(pcm_bytes))
    with open(out_path, "wb") as fh:
        fh.write(header + pcm_bytes)


def synth(text, out_path):
    """Render `text` to `out_path` with the hook voice. Returns True on success."""
    body = {
        "model": TTS_MODEL,
        "input": text,
        "voice": TTS_VOICE,
        "response_format": "mp3",
    }
    req = urllib.request.Request(
        OR_ENDPOINT,
        data=json.dumps(body).encode(),
        headers={
            "Authorization": f"Bearer {api_key()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            ctype = resp.headers.get("Content-Type", "")
            raw = resp.read()
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode(errors="replace")
        raise RuntimeError(f"TTS HTTP {exc.code}: {detail}") from exc

    if "pcm" in ctype:
        rate, channels = 24000, 1
        for part in ctype.split(";"):
            part = part.strip()
            if part.startswith("rate="):
                rate = int(part.split("=", 1)[1])
            elif part.startswith("channels="):
                channels = int(part.split("=", 1)[1])
        pcm_to_wav(raw, rate, channels, out_path)
    else:
        with open(out_path, "wb") as fh:
            fh.write(raw)
    return True


# ---------------------------------------------------------------------------
# Audio shaping + measurement
# ---------------------------------------------------------------------------
def ffprobe_duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def shape_audio(raw_path, body_path):
    """EQ + compress + slow the raw TTS into the hook body. No padding."""
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(raw_path),
         "-af", AUDIO_CHAIN, "-ar", "48000", "-ac", "2", str(body_path)],
        check=True)
    return ffprobe_duration(body_path)


def measure_words(body_path, model="base"):
    """Whisper word timings for the body. Returns list of {start,end,word}."""
    work = Path(body_path).parent
    subprocess.run(
        ["whisper", "--model", model, "--language", "en",
         "--word_timestamps", "True", "--output_format", "json",
         "--output_dir", str(work), str(body_path)],
        check=True, capture_output=True, text=True)
    js = work / (Path(body_path).stem + ".json")
    data = json.loads(js.read_text())
    words = []
    for seg in data.get("segments", []):
        for w in seg.get("words", []):
            words.append({
                "start": round(float(w["start"]), 3),
                "end": round(float(w["end"]), 3),
                "word": str(w["word"]).strip(),
            })
    return words, data.get("text", "").strip()


def _norm(word):
    return re.sub(r"[^a-z0-9]", "", word.lower())


def align_words(intended, measured, lead):
    """Map the *intended* caption text onto measured time.

    Whisper timings are on the unpadded body, so `lead` is added to every
    boundary. When the word counts line up we take Whisper's boundaries;
    when they do not (Whisper split or merged a token) we fall back to a
    length-weighted distribution across the measured speech span, so the
    caption always shows the intended words in time with the audio.
    """
    if not intended:
        return []
    if not measured:
        # Last resort: 0.35s per word starting at the lead.
        out, cursor = [], lead
        for w in intended:
            out.append({"text": w, "start": round(cursor, 3),
                        "end": round(cursor + 0.35, 3)})
            cursor += 0.35
        return out

    span_start = measured[0]["start"]
    span_end = measured[-1]["end"]

    if len(intended) == len(measured):
        pairs = [(t, measured[i]["start"], measured[i]["end"])
                 for i, t in enumerate(intended)]
    else:
        total = sum(max(1, len(_norm(w))) for w in intended)
        pairs, cursor = [], span_start
        for w in intended:
            frac = max(1, len(_norm(w))) / total
            dur = frac * (span_end - span_start)
            pairs.append((w, cursor, cursor + dur))
            cursor += dur

    return [{"text": t, "start": round(s + lead, 3), "end": round(e + lead, 3)}
            for t, s, e in pairs]


def accent_index(words, state):
    """Index of the word matching the state name, else the last word."""
    target = _norm(STATE_SPOKEN.get(state, state))
    for i, w in enumerate(words):
        if _norm(w["text"]) == target:
            return i
    return len(words) - 1


def build_timeline(work_dir, line, state):
    """Synthesise, shape, measure and pad. Returns the manifest dict."""
    raw = work_dir / "raw.mp3"
    body = work_dir / "body.wav"

    synth(f"{WHISPER_TAG} {line}", raw)
    body_sec = shape_audio(raw, body)
    measured, heard = measure_words(body)

    intended = [w for w in re.findall(r"[A-Za-z0-9']+", line)]
    words = align_words(intended, measured, LEAD_SEC)

    # Accent the state word so the promise lands on the highlighted beat.
    idx = accent_index(words, state)
    for i, w in enumerate(words):
        w["accent"] = (i == idx)

    audio_sec = round(LEAD_SEC + body_sec + TAIL_SEC, 3)
    return {
        "text": line,
        "heard": heard,
        "audioSec": audio_sec,
        "frames": round(audio_sec * FPS),
        "leadSec": LEAD_SEC,
        "tailSec": TAIL_SEC,
        "atempo": ATEMPO,
        "words": words,
        "bodySec": round(body_sec, 3),
    }


def pad_to_file(body_path, out_path, lead=LEAD_SEC, tail=TAIL_SEC):
    """Concat lead silence + body + tail silence into the final hook mp3."""
    work = Path(body_path).parent
    lead_wav = work / "lead.wav"
    tail_wav = work / "tail.wav"
    for path, secs in ((lead_wav, lead), (tail_wav, tail)):
        subprocess.run(
            ["ffmpeg", "-y", "-v", "error", "-f", "lavfi",
             "-i", f"anullsrc=r=48000:cl=stereo", "-t", str(secs), str(path)],
            check=True)
    lst = work / "concat.txt"
    lst.write_text(
        f"file '{lead_wav.name}'\nfile '{Path(body_path).name}'\n"
        f"file '{tail_wav.name}'\n")
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
         "-i", str(lst), "-ar", "48000", "-ac", "2",
         "-codec:a", "libmp3lame", "-b:a", "192k", str(out_path)],
        check=True)
    return ffprobe_duration(out_path)


# ---------------------------------------------------------------------------
# Ledger
# ---------------------------------------------------------------------------
def read_used(ledger_path):
    """Return the set of hook texts already recorded in the ledger."""
    p = Path(ledger_path)
    if not p.exists():
        return set()
    text = p.read_text()
    used = set()
    for line in text.splitlines():
        line = line.strip()
        if not line.startswith("- "):
            continue
        parts = [x.strip() for x in line[2:].split("|")]
        if len(parts) >= 3:
            used.add(parts[2].strip().strip('"'))
    return used


def append_ledger(ledger_path, state, line, audio_name, audio_sec):
    p = Path(ledger_path)
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    row = f'- {stamp} | {state} | "{line}" | {audio_name} | {audio_sec:.2f}s'
    if not p.exists():
        p.write_text(LEDGER_HEADER + LEDGER_BEGIN + "\n" + LEDGER_END + "\n")
    text = p.read_text()
    if LEDGER_BEGIN not in text:
        text = text.rstrip() + "\n\n" + LEDGER_BEGIN + "\n" + LEDGER_END + "\n"
    head, rest = text.split(LEDGER_BEGIN, 1)
    body, tail = rest.split(LEDGER_END, 1)
    rows = [r for r in body.strip().splitlines() if r.strip()]
    rows.append(row)
    p.write_text(head + LEDGER_BEGIN + "\n" + "\n".join(rows) + "\n" + LEDGER_END + tail)


def list_used(ledger_path):
    p = Path(ledger_path)
    if not p.exists():
        print("(no ledger yet)")
        return
    text = p.read_text()
    rows = [r for r in text.splitlines() if r.strip().startswith("- ")]
    print(f"{len(rows)} hook(s) used:")
    for r in rows:
        print("  " + r)


# ---------------------------------------------------------------------------
# Picking a line
# ---------------------------------------------------------------------------
def candidate_lines(state):
    spoken = STATE_SPOKEN.get(state or "", state or "")
    return [t.replace("{state}", spoken) for t in HOOK_TEMPLATES]


def pick_line(state, used, rng):
    pool = candidate_lines(state)
    fresh = [t for t in pool if t not in used]
    if fresh:
        return rng.choice(fresh), False
    # Whole pool spent for this state — fall back to the least-recently used.
    return rng.choice(pool), True


# ---------------------------------------------------------------------------
# Slug
# ---------------------------------------------------------------------------
def make_slug(state):
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    return f"{state}-{stamp}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def generate(state, public_dir, ledger, json_out=None, seed=None,
             work_dir=None, keep_work=False, whisper_model="base",
             json_only_path=None):
    """Full pipeline. Returns the manifest dict and the audio Path."""
    rng = random.Random(seed)
    used = read_used(ledger)
    line, reused = pick_line(state, used, rng)
    if reused:
        print(f"[hook] WARNING: every {state} line has been used; reusing "
              f"(least-recently-used pool entry). Add templates to keep it fresh.")

    work = Path(work_dir) if work_dir else Path(tempfile.mkdtemp(prefix="hook_"))
    work.mkdir(parents=True, exist_ok=True)

    print(f"[hook] state={state}  line: {line}")
    manifest = build_timeline(work, line, state)

    public_dir = Path(public_dir)
    hook_dir = public_dir / "hook"
    hook_dir.mkdir(parents=True, exist_ok=True)
    slug = make_slug(state)
    audio_name = f"{slug}.mp3"
    audio_path = hook_dir / audio_name

    pad_to_file(work / "body.wav", audio_path)
    total = ffprobe_duration(audio_path)

    manifest.update({
        "state": state,
        "slug": slug,
        "voice": f"{TTS_VOICE_LABEL} ({TTS_MODEL})",
        "audioPath": f"hook/{audio_name}",
        "audioSec": round(total, 3),
        "frames": round(total * FPS),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "reused": reused,
    })

    out_json = Path(json_out) if json_out else hook_dir / f"{slug}.json"
    out_json.parent.mkdir(parents=True, exist_ok=True)
    out_json.write_text(json.dumps(manifest, indent=2))

    append_ledger(ledger, state, line, audio_name, total)

    if not keep_work:
        for f in work.iterdir():
            try:
                f.unlink()
            except OSError:
                pass
        try:
            work.rmdir()
        except OSError:
            pass

    print(f"[hook] audio  : {audio_path}  ({total:.2f}s)")
    print(f"[hook] manifest: {out_json}")
    print(f"[hook] words  : {len(manifest['words'])}")
    return manifest, audio_path, out_json


def main():
    ap = argparse.ArgumentParser(description="Generate a unique whispered hook")
    ap.add_argument("--state", choices=list(STATE_SPOKEN.keys()))
    ap.add_argument("--public-dir", help="Remotion public/ dir (hook audio lands in <dir>/hook/)")
    ap.add_argument("--ledger", help="Path to hooks.md")
    ap.add_argument("--json-out", help="Where to write the manifest JSON")
    ap.add_argument("--work-dir", help="Scratch dir for intermediates")
    ap.add_argument("--keep-work", action="store_true", help="Keep intermediates")
    ap.add_argument("--seed", type=int, help="Deterministic pick")
    ap.add_argument("--whisper-model", default="base", help="Whisper model size")
    ap.add_argument("--dry-run", action="store_true",
                    help="Pick a line and show it; do not synthesise")
    ap.add_argument("--list-used", action="store_true")
    ap.add_argument("--list-pool", action="store_true")
    args = ap.parse_args()

    if args.list_pool:
        for state in STATE_SPOKEN:
            print(f"\n== {state} ({len(HOOK_TEMPLATES)} lines) ==")
            for line in candidate_lines(state):
                print("  " + line)
        return

    if args.list_used:
        list_used(args.ledger or "hooks.md")
        return

    if not args.state:
        ap.error("--state is required unless --list-used/--list-pool")

    if args.dry_run:
        used = read_used(args.ledger) if args.ledger else set()
        line, reused = pick_line(args.state, used, random.Random(args.seed))
        print(f"state={args.state}\nline={line}\nreused={reused}")
        return

    if not (args.public_dir and args.ledger):
        ap.error("--public-dir and --ledger are required to generate audio")

    generate(args.state, args.public_dir, args.ledger,
             json_out=args.json_out, seed=args.seed, work_dir=args.work_dir,
             keep_work=args.keep_work, whisper_model=args.whisper_model)


if __name__ == "__main__":
    main()
