#!/usr/bin/env python3
"""Retroactively refresh public Cognistration video metadata.

Default mode is dry-run. Pass --apply to update public videos only. Unlisted
videos are left untouched so the archive is not unexpectedly republished.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

LOOPS_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if LOOPS_DIR not in sys.path:
    sys.path.insert(0, LOOPS_DIR)
from youtube_metadata import CTA, DREAM_EXPLORATION, DISCOVERY_HASHTAGS, DISCOVERY_TAGS, TITLE_HOOKS, dedupe

UPLOAD_HELPER = os.path.join(
    LOOPS_DIR, "cognistration-daily-videos", "scripts", "upload_youtube.py"
)
if os.path.dirname(UPLOAD_HELPER) not in sys.path:
    sys.path.insert(0, os.path.dirname(UPLOAD_HELPER))
import upload_youtube


def api_json(url: str, token: str, method: str = "GET", payload: dict | None = None) -> dict:
    headers = {"Authorization": f"Bearer {token}"}
    data = None
    if payload is not None:
        headers["Content-Type"] = "application/json"
        data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, method=method, headers=headers, data=data)
    for attempt in range(5):
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                return json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as error:
            detail = error.read().decode("utf-8", errors="replace")
            if error.code in {429, 500, 502, 503, 504} and attempt < 4:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"YouTube API HTTP {error.code}: {detail[:1200]}") from error
        except (urllib.error.URLError, TimeoutError) as error:
            if attempt < 4:
                time.sleep(2 ** attempt)
                continue
            raise RuntimeError(f"YouTube API request failed: {error}") from error
    raise RuntimeError("YouTube API request exhausted its retry budget")


def api(base: str, params: dict[str, str], token: str, method: str = "GET", payload: dict | None = None) -> dict:
    url = f"{base}?{urllib.parse.urlencode(params)}"
    return api_json(url, token, method=method, payload=payload)


def stable_index(video_id: str, size: int) -> int:
    return int(hashlib.sha256(video_id.encode("utf-8")).hexdigest()[:8], 16) % size


def classify(title: str) -> str:
    lowered = title.casefold()
    if "workshop" in lowered:
        return "workshop"
    if "binaural" in lowered:
        return "binaural"
    if any(word in lowered for word in ["phase locking", "phase-locking", "phase lock", "ffr"]):
        return "phase"
    if any(word in lowered for word in ["attention", "suppress", "mutes", "background sound"]):
        return "attention"
    if any(word in lowered for word in ["consciousness", "predicting reality", "brain builds the world"]):
        return "mind"
    if any(word in lowered for word in ["sound frequency", "brain wave", "brainwave", "sound waves", "sound controls", "sound hacks", "sound sync"]):
        return "sound"
    if "cognitive orchestration" in lowered:
        return "daily"
    return "general"


def title_for(video: dict, used_titles: set[str]) -> str:
    start = stable_index(video["id"], len(TITLE_HOOKS))
    for offset in range(len(TITLE_HOOKS)):
        candidate = TITLE_HOOKS[(start + offset) % len(TITLE_HOOKS)]
        if candidate not in used_titles:
            return candidate
    raise RuntimeError("Unique title bank exhausted; add more hook variants before publishing.")


def description_for(video: dict, title: str) -> str:
    kind = classify(video["title"])
    intros = {
        "workshop": "Watch Cognistration's Workshop turn left/right stereo carriers into a visible listening session. You can follow the waveforms, explore a changing frequency relationship, and shape a repeatable audio ritual.",
        "binaural": "Binaural beats are a listening phenomenon created by presenting nearby tones to the left and right channels. This short explains the idea in a clear, evidence-aware way without promising a guaranteed change in mood, focus, or cognition.",
        "phase": "Phase locking describes a timing relationship between sound cycles and auditory neural activity. This short breaks down the concept without turning an audio mechanism into a medical promise.",
        "attention": "Attention changes how we notice and organize information. This short explores that relationship with sound in a calm, evidence-aware way rather than promising a guaranteed neurological outcome.",
        "mind": "The brain is constantly filtering, predicting, and organizing experience. This short offers a simple explanation of that process without reducing it to a guaranteed performance hack.",
        "sound": "Sound can shape the listening experience through rhythm, timing, and left/right relationships. This short explores the mechanism as an audio experiment, not as medical treatment.",
        "daily": "When attention feels scattered, a repeatable listening ritual can make the transition into focused work feel more deliberate. This short shows the kind of stereo session you can explore in Cognistration.",
        "general": "Cognistration is a calm workspace for exploring stereo carriers, session timing, and repeatable listening routines. This short offers a quick look at the idea behind the experience.",
    }
    opening_angles = {
        "workshop": "a visual stereo experiment",
        "binaural": "a close listen to nearby tones",
        "phase": "a timing experiment in sound",
        "attention": "an experiment in what you notice",
        "mind": "a grounded question about perception",
        "sound": "a practical audio experiment",
        "daily": "a focused listening experiment",
        "general": "a calm exploration of sound and attention",
    }
    hook = title.removesuffix(" #shorts")
    opening = f"{hook} — {opening_angles[kind]}."
    return f"{opening}\n\n{intros[kind]}\n\n{DREAM_EXPLORATION}\n\n{CTA}\n\n{' '.join(DISCOVERY_HASHTAGS)}"


def tags_for(video: dict) -> list[str]:
    kind = classify(video["title"])
    specific = {
        "workshop": ["workshop demo", "wave visualization", "stereo sound", "audio workspace"],
        "binaural": ["binaural audio", "binaural beat science", "spatial hearing"],
        "phase": ["phase locking", "frequency following response", "auditory science"],
        "attention": ["attention", "auditory processing", "focus ritual"],
        "mind": ["cognitive science", "neuroscience", "perception"],
        "sound": ["sound frequency", "audio science", "neural oscillations"],
        "daily": ["cognitive orchestration", "focus ritual", "calm audio"],
        "general": ["audio science", "cognitive science", "calm audio"],
    }
    return dedupe([*specific[kind], *DISCOVERY_TAGS])


def get_public_videos(token: str) -> list[dict]:
    channel = api(
        "https://www.googleapis.com/youtube/v3/channels",
        {"part": "snippet,contentDetails", "mine": "true"},
        token,
    )
    items = channel.get("items") or []
    if not items or items[0].get("snippet", {}).get("title") != "Cognistration":
        found = items[0].get("snippet", {}).get("title") if items else "none"
        raise RuntimeError(f"Refusing metadata update: expected Cognistration, found {found!r}")
    playlist_id = items[0].get("contentDetails", {}).get("relatedPlaylists", {}).get("uploads")
    playlist = api(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {"part": "contentDetails", "playlistId": playlist_id, "maxResults": "50"},
        token,
    )
    video_ids = [x.get("contentDetails", {}).get("videoId") for x in playlist.get("items", [])]
    video_ids = [x for x in video_ids if x]
    if not video_ids:
        return []
    videos = api(
        "https://www.googleapis.com/youtube/v3/videos",
        {"part": "snippet,status", "id": ",".join(video_ids)},
        token,
    )
    return [
        {
            "id": item["id"],
            "title": item.get("snippet", {}).get("title", ""),
            "description": item.get("snippet", {}).get("description", ""),
            "tags": item.get("snippet", {}).get("tags", []),
            "categoryId": item.get("snippet", {}).get("categoryId", "27"),
            "privacyStatus": item.get("status", {}).get("privacyStatus"),
        }
        for item in videos.get("items", [])
    ]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Actually update public videos")
    args = parser.parse_args()
    creds = upload_youtube.load_credentials()
    token = upload_youtube.refresh_token(
        creds.get("client_id"), creds.get("client_secret"), creds.get("refresh_token"), creds.get("token_path")
    )
    if not token:
        raise RuntimeError("Could not refresh Cognistration YouTube OAuth token")
    videos = get_public_videos(token)
    public = [v for v in videos if v["privacyStatus"] == "public"]
    shorts = [v for v in public if "#shorts" in v["title"].casefold()]
    skipped = [v for v in videos if v not in shorts]
    print(f"Verified Cognistration. Found {len(videos)} uploads: {len(shorts)} public Shorts targeted, {len(skipped)} live/non-public skipped.")
    plan = []
    used_titles: set[str] = set()
    for video in shorts:
        new_title = title_for(video, used_titles)
        used_titles.add(new_title)
        new_description = description_for(video, new_title)
        new_tags = tags_for(video)
        plan.append((video, new_title, new_description, new_tags))
    if len({item[1] for item in plan}) != len(plan) or len({item[2] for item in plan}) != len(plan):
        raise RuntimeError("Unique title/description generation failed; refusing to publish duplicate metadata.")
    for video, title, description, tags in plan:
        print(f"{video['id']} | {video['title']} -> {title}")
    if not args.apply:
        print("DRY RUN ONLY: pass --apply to update public metadata.")
        return
    updated = []
    for video, title, description, tags in plan:
        payload = {
            "id": video["id"],
            "snippet": {
                "title": title,
                "description": description,
                "tags": tags,
                "categoryId": video["categoryId"],
            },
        }
        api(
            "https://www.googleapis.com/youtube/v3/videos",
            {"part": "snippet"},
            token,
            method="PUT",
            payload=payload,
        )
        updated.append(video["id"])
        time.sleep(0.25)
    # Read back every updated item in one request and verify the visible fields.
    readback = api(
        "https://www.googleapis.com/youtube/v3/videos",
        {"part": "snippet,status", "id": ",".join(updated)},
        token,
    )
    by_id = {item["id"]: item for item in readback.get("items", [])}
    failures = []
    for video, title, description, tags in plan:
        item = by_id.get(video["id"], {})
        snippet = item.get("snippet", {})
        actual_tags = set(snippet.get("tags", []))
        expected_tags = set(tags)
        required_hashtags = set(DISCOVERY_HASHTAGS)
        if (
            snippet.get("title") != title
            or snippet.get("description") != description
            or not expected_tags.issubset(actual_tags)
            or not required_hashtags.issubset(set(description.split()))
            or "http://" in snippet.get("description", "").casefold()
            or "https://" in snippet.get("description", "").casefold()
        ):
            failures.append(video["id"])
    if failures:
        raise RuntimeError(f"Metadata readback mismatch for {len(failures)} videos: {failures}")
    print(f"APPLIED_AND_VERIFIED: {len(updated)} public Cognistration videos updated.")


if __name__ == "__main__":
    main()
