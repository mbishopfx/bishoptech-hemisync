#!/usr/bin/env python3
"""Publish one Cognistration clip and verify YouTube read-back."""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from pathlib import Path

DEFAULT_UPLOADER = Path(
    "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/"
    "antigravity_loops/cognistration-daily-videos/scripts/upload_youtube.py"
)
APP_STORE_URL = "https://apps.apple.com/us/app/cognistration/id6780132617"
WEBSITE_URL = "https://cognistration.com"
SUBSCRIBE_URL = "https://www.youtube.com/channel/UCGZsEX2J-R9NN2EE4Lx9xfw?sub_confirmation=1"


def load_uploader(path: Path):
    spec = importlib.util.spec_from_file_location("cognistration_youtube_uploader", path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load YouTube uploader: {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def format_timestamp(seconds: object) -> str:
    try:
        total = max(0, int(float(str(seconds))))
    except (TypeError, ValueError):
        return ""
    hours, remainder = divmod(total, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours}:{minutes:02d}:{secs:02d}" if hours else f"{minutes:02d}:{secs:02d}"


def topic_title(source_title: str) -> str:
    normalized = " ".join(source_title.replace("|", " ").split())
    lower = normalized.casefold()
    if "mcmoneagle" in lower and "stargate" in lower:
        return "Joe McMoneagle: Project Stargate and Remote Viewing"
    if "mcmoneagle" in lower:
        return "Joe McMoneagle on Remote Viewing and Consciousness"
    if "astral projection" in lower:
        return "Astral Projection and the Question of Consciousness"
    if "sadhguru" in lower and "energy" in lower:
        return "Sadhguru on Life Energy and Personal Responsibility"
    if "anandabohi" in lower or "anandabodhi" in lower or "guiding your attention" in lower:
        return "Guiding Your Attention: Meditation with Ayya Anandabodhi"
    if "quantum computer" in lower or "dean radin" in lower:
        return "Dean Radin and the Consciousness Question"
    if normalized.casefold() == "binaural beats":
        return "Binaural Beats and Focus"
    return normalized


def title_for(source_title: str, metadata: dict, landscape: bool) -> str:
    title = topic_title(source_title)
    timestamp = format_timestamp(metadata.get("clipStartSeconds"))
    if timestamp:
        title = f"{title} — Highlight {timestamp}"
    if landscape:
        title = f"{title} — Full Window"
    return title[:100].rstrip(" —")


def tags_for(source_creator: str) -> list[str]:
    tags = [
        "Cognistration",
        "binaural beats",
        "brain entrainment",
        "frequency following response",
        "hemispheric synchronization",
        "consciousness",
        "meditation",
        "mindfulness",
    ]
    if source_creator.strip():
        tags.append(source_creator.strip()[:60])
    return tags


def publish_one(uploader, path: Path, title: str, description: str, tags: list[str], channel: dict) -> dict:
    video_id = uploader.upload_video(str(path), channel["access_token"], title, description, tags)
    if not video_id:
        raise RuntimeError(f"YouTube upload returned no video ID for {path.name}")
    readback = uploader.fetch_uploaded_video(channel["access_token"], video_id)
    if readback.get("channelId") != channel["id"]:
        raise RuntimeError(
            f"YouTube channel mismatch for {video_id}: expected {channel['id']}, "
            f"got {readback.get('channelId')}"
        )
    if readback.get("privacyStatus") != "public":
        raise RuntimeError(
            f"YouTube upload {video_id} read back as {readback.get('privacyStatus')}, not public"
        )
    if APP_STORE_URL not in (readback.get("description") or ""):
        raise RuntimeError(f"YouTube description read-back is missing the App Store CTA for {video_id}")
    if WEBSITE_URL not in (readback.get("description") or ""):
        raise RuntimeError(f"YouTube description read-back is missing the website CTA for {video_id}")
    if SUBSCRIBE_URL not in (readback.get("description") or ""):
        raise RuntimeError(f"YouTube description read-back is missing the subscribe CTA for {video_id}")
    return {
        "id": video_id,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "title": readback.get("title"),
        "privacyStatus": readback.get("privacyStatus"),
        "channelId": readback.get("channelId"),
        "localFile": str(path),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--standard", required=True, type=Path)
    parser.add_argument("--landscape", type=Path)
    parser.add_argument("--metadata", required=True, type=Path)
    parser.add_argument("--description", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--uploader", type=Path, default=DEFAULT_UPLOADER)
    args = parser.parse_args()

    required_paths = [args.standard, args.metadata, args.description, args.uploader]
    if args.landscape:
        required_paths.append(args.landscape)
    for path in required_paths:
        if not path.is_file():
            raise SystemExit(f"YouTube publish input does not exist: {path}")

    metadata = json.loads(args.metadata.read_text(encoding="utf-8"))
    description = args.description.read_text(encoding="utf-8").strip()
    if not description:
        raise SystemExit("YouTube description is empty")
    source_title = str(metadata.get("sourceTitle") or "Cognistration listening conversation")
    source_creator = str(metadata.get("sourceCreator") or "")
    tags = tags_for(source_creator)

    uploader = load_uploader(args.uploader)
    creds = uploader.load_credentials()
    access_token = uploader.refresh_token(
        creds.get("client_id"),
        creds.get("client_secret"),
        creds.get("refresh_token"),
        creds.get("token_path"),
    )
    if not access_token:
        raise SystemExit("Could not refresh the Cognistration YouTube access token")
    channel = uploader.fetch_channel(access_token)
    expected_channel = "Cognistration"
    if channel.get("title") != expected_channel:
        raise SystemExit(
            f"Expected YouTube channel {expected_channel!r}, found {channel.get('title')!r}"
        )
    channel["access_token"] = access_token

    manifest = {
        "channel": {
            "id": channel.get("id"),
            "title": channel.get("title"),
        },
        "sourceTitle": source_title,
        "sourceCreator": source_creator,
        "standard": publish_one(
            uploader,
            args.standard,
            title_for(source_title, metadata, landscape=False),
            description,
            tags,
            channel,
        ),
    }
    if args.landscape:
        manifest["landscapeLetterbox"] = publish_one(
            uploader,
            args.landscape,
            title_for(source_title, metadata, landscape=True),
            description,
            tags,
            channel,
        )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
