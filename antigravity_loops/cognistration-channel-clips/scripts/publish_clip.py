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

# The Google client is imported lazily, inside _google(). Clipping is an
# ffmpeg/yt-dlp job and must keep working in an interpreter that has no
# googleapiclient; only the upload needs it. Importing it at module scope made
# the whole clipper die at import time for a purely local --dry-run.
_google_cache = {}


def _google():
    if "mod" not in _google_cache:
        try:
            from google.oauth2.credentials import Credentials
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaFileUpload
        except ImportError as exc:
            raise RuntimeError(
                "publishing needs google-api-python-client "
                f"({exc}); install it or run with --dry-run") from exc
        _google_cache["mod"] = (Credentials, Request, build, MediaFileUpload)
    return _google_cache["mod"]


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
    Credentials, Request, _build, _mu = _google()
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
    _c, _r, build, _mu = _google()
    return build("youtube", "v3", credentials=credentials())


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------
def load_state():
    if STATE_PATH.exists():
        return json.loads(STATE_PATH.read_text())
    return {"clipped": [], "published": []}


def record_published(state, channel, source_id, video_id, title, part=1):
    """Idempotent: republishing a known source clip updates, never duplicates.

    The key is the source *and* the part, because one episode can now yield
    several clips and each of those is a separate upload.
    """
    published = state.setdefault("published", [])
    entry = {
        "channel": channel,
        "sourceId": source_id,
        "part": part,
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
        if p.get("sourceId") == source_id and p.get("part", 1) == part:
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


def build_title(channel_key, video_id, part=1):
    name = CHANNELS[channel_key]["name"]
    t = re_clean(source_title(video_id))
    # Several clips can now come out of one long episode. Only the first carries
    # the bare title; later ones get a part marker, so the uploads are their own
    # videos rather than three identical titles and the already-live guard can
    # tell one clip of an episode from the next.
    suffix = "" if part <= 1 else f" | Part {part}"
    tail = f"{suffix} | #shorts"
    if not t:
        return f"{name} clip{tail}"
    # Rogan's video titles already carry the show name, and Shawn's carry the
    # channel; appending it again reads like a bot wrote it.
    key = name.lower().replace("the ", "")
    if key.split()[0] in t.lower():
        core = t
    else:
        core = f"{t} — {name}"
    max_core = max(20, 100 - len(tail))
    if len(core) > max_core:
        core = core[:max_core].rsplit(" ", 1)[0].rstrip(",;:-—")
    return f"{core}{tail}"


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
def already_live(yt, source_title, channel_name, title=None, part=1):
    """Return the videoId of an existing upload of this same clip, or None.

    state/clip_state.json only records what this script published, and several
    clips were published before it existed by other means. Without this check a
    leftover file in output/ can be re-published as a duplicate of a video that
    has been live for days, which is exactly how one Jesse Michaels clip ended
    up on the channel twice.

    For the first clip of an episode the match is loose (the source title), so a
    manually posted original is still caught. For a second or later clip it
    matches the exact part title instead, because those clips deliberately share
    the source title and a loose match would refuse every one of them.
    """
    if part <= 1:
        token = re_clean(source_title or "").lower()[:40]
    else:
        token = re_clean(title or "").lower()
    if len(token) < 10:
        return None
    pl = yt.channels().list(part="contentDetails", mine=True).execute()[
        "items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]
    nxt = None
    for _ in range(4):
        r = yt.playlistItems().list(part="snippet", playlistId=pl,
                                    maxResults=50, pageToken=nxt).execute()
        for it in r.get("items", []):
            s = it["snippet"]
            vid = s["resourceId"]["videoId"]
            blob = (s.get("title", "") + " " + s.get("description", "")).lower()
            if token in re_clean(blob).lower():
                return vid
        nxt = r.get("nextPageToken")
        if not nxt:
            break
    return None


def publish(file_path, channel_key, source_id, privacy="public",
            allow_duplicate=False, part=1):
    path = Path(file_path)
    if not path.exists():
        raise RuntimeError(f"no such file: {path}")
    if channel_key not in CHANNELS:
        raise RuntimeError(f"unknown channel {channel_key!r}")

    info = CHANNELS[channel_key]
    src = source_title(source_id)
    title = build_title(channel_key, source_id, part)
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

    dup = already_live(yt, src, info["name"], title=title, part=part)
    if dup and not allow_duplicate:
        raise RuntimeError(
            f"this source is already published as {dup} "
            f"(https://youtube.com/shorts/{dup}); pass --allow-duplicate to post anyway")

    _c, _r, _b, MediaFileUpload = _google()
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
        "part": part,
    }


def main():
    ap = argparse.ArgumentParser(description="Publish a finished clip")
    ap.add_argument("--file")
    ap.add_argument("--channel", choices=list(CHANNELS))
    ap.add_argument("--source-id")
    ap.add_argument("--privacy", default="public",
                    choices=["public", "unlisted", "private"])
    ap.add_argument("--allow-duplicate", action="store_true",
                    help="Publish even if this source is already on the channel")
    ap.add_argument("--part", type=int, default=1,
                    help="Which clip of the episode this is; 2+ marks the title")
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
        print("  title:", build_title(args.channel, args.source_id, args.part))
        return

    result = publish(args.file, args.channel, args.source_id, args.privacy,
                     allow_duplicate=args.allow_duplicate, part=args.part)
    record_published(load_state(), args.channel, args.source_id,
                     result["videoId"], result["title"], part=args.part)
    print(result["url"])


if __name__ == "__main__":
    main()
