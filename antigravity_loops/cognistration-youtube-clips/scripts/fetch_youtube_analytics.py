#!/usr/bin/env python3
"""Collect recent Cognistration YouTube performance data without mutating YouTube."""
from __future__ import annotations

import argparse
import datetime as dt
import importlib.util
import json
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any, cast

DEFAULT_UPLOADER = Path(
    "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/"
    "antigravity_loops/cognistration-daily-videos/scripts/upload_youtube.py"
)
API_ROOT = "https://www.googleapis.com/youtube/v3"


def load_uploader(path: Path):
    spec = importlib.util.spec_from_file_location("cognistration_youtube_uploader", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load YouTube uploader: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def get_json(path: str, access_token: str, params: dict[str, str]) -> dict:
    query = urllib.parse.urlencode(params)
    request = urllib.request.Request(
        f"{API_ROOT}/{path}?{query}",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    with urllib.request.urlopen(request, timeout=45) as response:
        return json.loads(response.read().decode("utf-8"))


def parse_duration(value: str) -> int:
    # YouTube contentDetails.duration is ISO-8601, normally PT#H#M#S.
    import re

    match = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", value or "")
    if not match:
        return 0
    hours, minutes, seconds = (int(part or 0) for part in match.groups())
    return hours * 3600 + minutes * 60 + seconds


def collect(access_token: str, limit: int) -> dict[str, object]:
    channel = get_json(
        "channels",
        access_token,
        {"part": "contentDetails,statistics", "mine": "true"},
    )["items"][0]
    channel_id = channel["id"]
    uploads_playlist = channel["contentDetails"]["relatedPlaylists"]["uploads"]
    playlist = get_json(
        "playlistItems",
        access_token,
        {"part": "contentDetails", "playlistId": uploads_playlist, "maxResults": str(limit)},
    )
    video_ids = [
        item.get("contentDetails", {}).get("videoId")
        for item in playlist.get("items", [])
        if item.get("contentDetails", {}).get("videoId")
    ]
    if not video_ids:
        return {
            "status": "ok",
            "channelId": channel_id,
            "channelTitle": "Cognistration",
            "videos": [],
        }
    videos = get_json(
        "videos",
        access_token,
        {
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(video_ids),
        },
    )
    rows = []
    for item in videos.get("items", []):
        snippet = item.get("snippet", {})
        stats = item.get("statistics", {})
        views = int(stats.get("viewCount") or 0)
        likes = int(stats.get("likeCount") or 0)
        comments = int(stats.get("commentCount") or 0)
        rows.append({
            "videoId": item.get("id"),
            "title": snippet.get("title"),
            "publishedAt": snippet.get("publishedAt"),
            "durationSeconds": parse_duration(item.get("contentDetails", {}).get("duration", "")),
            "views": views,
            "likes": likes,
            "comments": comments,
            "likeRate": round(likes / views, 6) if views else 0.0,
            "commentRate": round(comments / views, 6) if views else 0.0,
            "engagementRate": round((likes + comments) / views, 6) if views else 0.0,
            "url": f"https://www.youtube.com/watch?v={item.get('id')}",
        })
    rows.sort(key=lambda row: (row["views"], row["engagementRate"]), reverse=True)
    return {
        "status": "ok",
        "pulledAt": dt.datetime.now(dt.timezone.utc).isoformat(),
        "channelId": channel_id,
        "channelTitle": "Cognistration",
        "sampleSize": len(rows),
        "topByViews": rows[:10],
        "topByEngagement": sorted(rows, key=lambda row: (row["engagementRate"], row["views"]), reverse=True)[:10],
        "videos": rows,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--uploader", type=Path, default=DEFAULT_UPLOADER)
    args = parser.parse_args()

    try:
        uploader = load_uploader(args.uploader)
        credentials = uploader.load_credentials()
        access_token = uploader.refresh_token(
            credentials.get("client_id"),
            credentials.get("client_secret"),
            credentials.get("refresh_token"),
            credentials.get("token_path"),
        )
        if not access_token:
            raise RuntimeError("YouTube access token refresh failed")
        payload = collect(access_token, max(1, min(args.limit, 50)))
    except Exception as exc:  # Analytics must not block a clip run.
        payload = {
            "status": "unavailable",
            "pulledAt": dt.datetime.now(dt.timezone.utc).isoformat(),
            "error": str(exc),
            "videos": [],
        }
        print(f"Analytics unavailable; continuing clip run: {exc}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    if payload.get("status") == "ok":
        top_rows = cast(list[dict[str, Any]], payload.get("topByViews") or [{}])
        top = top_rows[0]
        print(
            f"Analytics pulled: {payload.get('sampleSize', 0)} videos; "
            f"top views={top.get('views', 0)}; top title={top.get('title', '')}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
