#!/usr/bin/env python3
"""Publish a finished clip to YouTube and verify it landed.

The clip pipeline used to stop at `print("[upload] Would upload: ...")` — it
built the MP4, marked the source video as consumed so it would never be
re-tried, and never actually posted anything. This module is the missing step.

It also refuses to let a failed upload burn a source: callers only record a
video as clipped once this returns successfully, and the published video id is
kept in state so the comment-reply job knows what to watch.

Usage:
  python3 scripts/publish_clip.py --file output/rogan-xxx-captioned.mp4 \
      --channel rogan --source-id 7SzYbqsUSog
  python3 scripts/publish_clip.py --list          # what we already published
"""

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
STATE_PATH = PROJECT_ROOT / "state" / "clip_state.json"

# The clips are posted to the Cognistration channel as growth content: creator
# credit in the description, no branding or CTA. That token is the only one
# with usable client credentials on this machine.
TOKEN_PATH = Path(os.path.expanduser(
    "~/.hermes/profiles/cognistration/youtube_oauth_token.json"))

try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError as exc:  # pragma: no cover
    print(f"google-api-python-client required: {exc}", file=sys.stderr)
    raise


# ---------------------------------------------------------------------------
# Channel config (kept in sync with channel_clip.py)
# ---------------------------------------------------------------------------
CHANNELS = {
    "jesse": {
        "name": "Jesse Michaels",
        "credit": "Clipped from Jesse Michaels. Full episode on his YouTube channel.",
    },
    "shawn": {
        "name": "Shawn Ryan",
        "credit": "Clipped from Shawn Ryan Show. Watch the full interview on his channel.",
    },
    "rogan": {
        "name": "The Joe Rogan Experience",
        "credit": "Clipped from The Joe Rogan Experience. Full episode on Spotify and YouTube.",
    },
}

TAGS = ["shorts", "clip", "podcast", "interview", "youtube shorts"]


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------
def credentials():
    if not TOKEN_PATH.exists():
        raise RuntimeError(f"missing YouTube token at {TOKEN_PATH}")
    data = json.loads(TOKEN_PATH.read_text())
    creds = Credentials(
        token=data.get("token") or data.get("access_token"),
        refresh_token=data.get("refresh_token"),
        token_uri=data.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=data.get("client_id"),
        client_secret=data.get("client_secret"),
        # Use the scopes actually granted. Hardcoding a wider set is what makes
        # refresh fail with invalid_scope.
        scopes=data.get("scope", "").split() or None,
    )
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        data["token"] = creds.token
        TOKEN_PATH.write_text(json.dumps(data, indent=2))
    return creds


def youtube():
    return build("youtube", "v3", credentials=credentials())


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------
def load_state():
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"clipped": [], "published": []}


def record_published(state, channel, source_id, video_id, title):
    """Idempotent: republishing a known source updates rather than duplicates."""
    published = state.setdefault("published", [])
    entry = {
        "channel": channel,
        "sourceId": source_id,
        "videoId": video_id,
        "title": title,
        "url": f"https://youtube.com/shorts/{video_id}",
        "publishedAt": datetime.now(timezone.utc).isoformat(),
        # commentRepliesTo is where the reply job records the last comment it
        # handled, so it never double-replies.
        "commentRepliesTo": None,
        "repliesPosted": 0,
    }
    for i, p in enumerate(published):
        if p.get("sourceId") == source_id:
            published[i] = {**p, **entry}
            break
    else:
        published.append(entry)
    published[:] = published[-200:]
    STATE_PATH.write_text(json.dumps(state, indent=2))


# ---------------------------------------------------------------------------
# Title
# ---------------------------------------------------------------------------
def source_title(video_id):
    """Real title beats 'Rogan clip #shorts' for search and for honesty."""
    try:
        r = subprocess.run(
            ["yt-dlp", "--skip-download", "--print", "title",
             f"https://www.youtube.com/watch?v={video_id}"],
            capture_output=True, text=True, timeout=90)
        t = r.stdout.strip()
        if t:
            return t
    except Exception:
        pass
    return ""


def build_title(channel_key, video_id):
    name = CHANNELS[channel_key]["name"]
    t = re_clean(source_title(video_id))
    if not t:
        return f"{name} clip | #shorts"
    # Rogan's video titles already carry the show name, and Shawn's carry the
    # channel; appending it again reads like a bot wrote it.
    key = name.lower().replace("the ", "")
    if key.split()[0] in t.lower():
        core = t
    else:
        core = f"{t} — {name}"
    if len(core) > 84:
        core = core[:84].rsplit(" ", 1)[0].rstrip(",;:-—")
    return f"{core} | #shorts"


def re_clean(title):
    """ASCII-ish, single-spaced, no stray quotes.

    Source titles arrive wrapped in smart or straight quotes around a phrase,
    and after stripping the outer pair an unpaired `"` is left mid-title. Video
    titles essentially never need a quote character, so all of them go, which
    keeps the cleaner idempotent instead of leaving one behind.
    """
    swaps = {"\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
             "\u2013": "-", "\u2014": "-", "\u2026": "..."}
    for a, b in swaps.items():
        title = title.replace(a, b)
    title = title.replace('"', "").replace("'", "")
    cleaned = "".join(ch for ch in title if ord(ch) < 0x250 or ch in " ")
    cleaned = " ".join(cleaned.split())
    # A quoted phrase followed by " | something" leaves a dangling separator.
    cleaned = re.sub(r"\s*\|\s*(Official Preview|Trailer|Clip \d+)\s*", " ", cleaned)
    return cleaned.strip(" -|·•\"'")


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------
def publish(file_path, channel_key, source_id, privacy="public"):
    path = Path(file_path)
    if not path.exists():
        raise RuntimeError(f"no such file: {path}")
    if channel_key not in CHANNELS:
        raise RuntimeError(f"unknown channel {channel_key!r}")

    info = CHANNELS[channel_key]
    title = build_title(channel_key, source_id)
    src = source_title(source_id)
    description = (
        f"{info['credit']}\n\n"
        f"Source: {src or 'https://www.youtube.com/watch?v=' + source_id}\n\n"
        "#shorts #podcast #clips"
    )

    yt = youtube()
    channel = yt.channels().list(part="snippet", mine=True).execute()
    items = channel.get("items") or [{}]
    channel_title = items[0]["snippet"]["title"]
    channel_id = items[0]["snippet"]["channelId"] if "channelId" in items[0] \
        else items[0].get("channelId") or yt.channels().list(
            part="contentDetails", mine=True).execute()["items"][0]["id"]
    print(f"[publish] channel: {channel_title} ({channel_id})")
    print(f"[publish] title  : {title}")
    print(f"[publish] file   : {path.name} ({path.stat().st_size / 1e6:.1f} MB)")

    media = MediaFileUpload(str(path), mimetype="video/mp4",
                            resumable=True, chunksize=5 * 1024 * 1024)
    req = yt.videos().insert(
        part="snippet,status",
        body={
            "snippet": {
                "title": title,
                "description": description,
                "tags": TAGS + [info["name"], "clips"],
                "categoryId": "28",  # Science & Tech; Education was the old mapping
            },
            "status": {
                "privacyStatus": privacy,
                "selfDeclaredMadeForKids": False,
            },
        },
        media_body=media,
    )
    response = None
    while response is None:
        status, response = req.next_chunk()
        if status:
            print(f"  uploaded {int(status.progress() * 100)}%")

    video_id = response["id"]

    # Read back. A 200 from insert is not proof the video is actually there and
    # public with the copy we intended.
    chk = yt.videos().list(part="snippet,status", id=video_id).execute()
    if not chk.get("items"):
        raise RuntimeError(f"upload returned {video_id} but read-back found nothing")
    item = chk["items"][0]
    got_title = item["snippet"]["title"]
    got_privacy = item["status"]["privacyStatus"]
    url = f"https://youtube.com/shorts/{video_id}"
    print(f"[publish] verified : {got_privacy} | {got_title}")
    print(f"[publish] url      : {url}")
    if got_privacy != privacy:
        print(f"[publish] WARNING: asked {privacy}, got {got_privacy}")

    return {
        "videoId": video_id,
        "url": url,
        "title": got_title,
        "privacy": got_privacy,
        "channel": channel_title,
    }


def main():
    ap = argparse.ArgumentParser(description="Publish a finished clip")
    ap.add_argument("--file")
    ap.add_argument("--channel", choices=list(CHANNELS))
    ap.add_argument("--source-id")
    ap.add_argument("--privacy", default="public",
                    choices=["public", "unlisted", "private"])
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if args.list:
        st = load_state()
        pub = st.get("published", [])
        print(f"{len(pub)} published clip(s):")
        for p in pub:
            print(f"  {p.get('channel'):22} {p.get('url')}  {p.get('title','')[:60]}")
        return

    if not (args.file and args.channel and args.source_id):
        ap.error("--file, --channel and --source-id are all required")

    if args.dry_run:
        print("[dry-run] would publish:")
        print("  title:", build_title(args.channel, args.source_id))
        return

    result = publish(args.file, args.channel, args.source_id, args.privacy)
    record_published(load_state(), args.channel, args.source_id,
                     result["videoId"], result["title"])
    print(result["url"])


if __name__ == "__main__":
    main()
