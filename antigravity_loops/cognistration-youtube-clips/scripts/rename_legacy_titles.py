#!/usr/bin/env python3
"""Rename legacy Cognistration-prefix videos without changing descriptions or privacy."""
from __future__ import annotations

import importlib.util
import json
import urllib.parse
import urllib.request
import time
from pathlib import Path

UPLOADER_PATH = Path(
    "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/"
    "antigravity_loops/cognistration-daily-videos/scripts/upload_youtube.py"
)
PREFIXES = ("Cognistration Clip:", "Cognistration Clip —")
TITLE_MAP = {
    "7TwdFN8d5CA": "Joe McMoneagle: CIA Project Stargate and Remote Viewing — Highlight 3:03:36",
    "ME0exq8teI0": "Astral Projection and the Question of Consciousness — Highlight 00:36",
    "Ta3R4vAvJes": "Joe McMoneagle and Project Stargate — Highlight 03:25",
    "8CxQPWr5M7k": "Joe McMoneagle: Remote Viewing and Psychic Perception — Highlight 10:56",
    "PtWJkmYEo4w": "Joe McMoneagle on Remote Viewing and Human Perception — Highlight 07:10",
    "Tx-DG-bpmCw": "Sadhguru on Life Energy and Personal Responsibility",
    "cMttwa8ZDOY": "Sadhguru: Life Energy, Attention, and Inner Balance",
    "VCQkuv552BU": "Guiding Your Attention: Meditation with Ayya Anandabodhi",
    "DufZuSMj9Zc": "Meditation, Attention, and Awareness — Ayya Anandabodhi",
    "LlwDjfmi_TY": "Dean Radin: A Quantum Question About Consciousness",
    "JHitMln3zo4": "Dean Radin and the Consciousness Question — Full Window",
    "u0yJZ8dc7so": "Binaural Beats and Focus",
    "18FSEqUWthc": "Binaural Beats: Exploring Sound and Attention — Full Window",
}
API_ROOT = "https://www.googleapis.com/youtube/v3"


def load_uploader():
    spec = importlib.util.spec_from_file_location("cognistration_uploader", UPLOADER_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load uploader: {UPLOADER_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def get_json(token: str, resource: str, params: dict[str, str]) -> dict:
    query = urllib.parse.urlencode(params)
    request = urllib.request.Request(
        f"{API_ROOT}/{resource}?{query}",
        headers={"Authorization": f"Bearer {token}"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def patch_title(token: str, item: dict, title: str) -> dict:
    snippet = item.get("snippet", {})
    updated_snippet = {
        "title": title,
        "description": snippet.get("description", ""),
        "categoryId": snippet.get("categoryId", "27"),
    }
    if snippet.get("tags"):
        updated_snippet["tags"] = snippet["tags"]
    body = json.dumps({"id": item["id"], "snippet": updated_snippet}).encode("utf-8")
    request = urllib.request.Request(
        f"{API_ROOT}/videos?part=snippet",
        data=body,
        method="PUT",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json; charset=UTF-8",
        },
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> None:
    uploader = load_uploader()
    credentials = uploader.load_credentials()
    token = uploader.refresh_token(
        credentials.get("client_id"),
        credentials.get("client_secret"),
        credentials.get("refresh_token"),
        credentials.get("token_path"),
    )
    if not token:
        raise SystemExit("Could not refresh the Cognistration YouTube token")
    channel = uploader.fetch_channel(token)
    if channel.get("title") != "Cognistration":
        raise SystemExit(f"Expected Cognistration channel, found {channel.get('title')!r}")

    data = get_json(token, "videos", {"part": "snippet,status", "id": ",".join(TITLE_MAP)})
    items = {item["id"]: item for item in data.get("items", [])}
    missing = sorted(set(TITLE_MAP) - set(items))
    if missing:
        raise SystemExit(f"Video readback missing IDs: {', '.join(missing)}")

    titles = list(TITLE_MAP.values())
    if len(titles) != len(set(titles)):
        raise SystemExit("Rename map contains duplicate target titles")
    changed = []
    for video_id, new_title in TITLE_MAP.items():
        item = items[video_id]
        current = item.get("snippet", {}).get("title", "")
        if current == new_title:
            print(f"Already correct: {video_id} -> {new_title}")
            continue
        if not current.startswith(PREFIXES):
            raise SystemExit(f"Refusing to rename {video_id}: current title is not legacy-prefixed: {current}")
        if len(new_title) > 100:
            raise SystemExit(f"Target title exceeds YouTube limit: {new_title}")
        if current != new_title:
            patch_title(token, item, new_title)
        readback = {}
        for attempt in range(5):
            readback = uploader.fetch_uploaded_video(token, video_id)
            if readback.get("title") == new_title:
                break
            time.sleep(2 + attempt)
        if readback.get("channelId") != channel.get("id"):
            raise SystemExit(f"Channel mismatch after rename for {video_id}")
        if readback.get("title") != new_title:
            raise SystemExit(f"Title readback mismatch for {video_id}: {readback.get('title')!r}")
        changed.append({
            "id": video_id,
            "title": new_title,
            "privacyStatus": readback.get("privacyStatus"),
            "url": f"https://www.youtube.com/watch?v={video_id}",
        })
        print(f"Verified rename: {video_id} -> {new_title}")
    print(json.dumps({"channel": channel, "renamedCount": len(changed), "videos": changed}, indent=2))


if __name__ == "__main__":
    main()
