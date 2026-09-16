#!/usr/bin/env python3
"""Select and advance a user-provided YouTube source list."""
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse

YOUTUBE_HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"}
DEFAULT_VARIANTS = ("logo", "domain")


def load_links(path: Path) -> list[str]:
    if not path.is_file():
        raise SystemExit(f"Source list does not exist: {path}")
    links = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        value = raw.strip()
        if not value or value.startswith("#"):
            continue
        parsed = urlparse(value)
        if parsed.scheme not in {"http", "https"} or parsed.netloc.lower() not in YOUTUBE_HOSTS:
            raise SystemExit(f"Invalid YouTube URL in source list: {value}")
        links.append(value)
    if not links:
        raise SystemExit(f"Source list is empty: {path}")
    if len(set(links)) != len(links):
        raise SystemExit("Source list contains duplicate YouTube URLs")
    return links


def load_state(path: Path) -> dict[str, object]:
    if not path.is_file():
        return {"next_index": 0, "next_watermark_variant": DEFAULT_VARIANTS[0]}
    try:
        state = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid source selection state: {path}: {exc}") from exc
    return state if isinstance(state, dict) else {}


def save_state(path: Path, state: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    temp.replace(path)


def source_index(value: str, count: int) -> int:
    if not re.fullmatch(r"\d+", value):
        raise SystemExit(f"Source index must be a non-negative integer: {value}")
    index = int(value)
    if index >= count:
        raise SystemExit(f"Source index {index} is outside the source list (0-{count - 1})")
    return index


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--links", required=True, type=Path)
    parser.add_argument("--state", required=True, type=Path)
    parser.add_argument("--select", action="store_true")
    parser.add_argument("--advance", action="store_true")
    parser.add_argument("--url", default="")
    parser.add_argument("--index", default="")
    parser.add_argument("--watermark-variant", choices=DEFAULT_VARIANTS, default="")
    parser.add_argument("--clip-start", type=float)
    parser.add_argument("--clip-duration", type=float)
    parser.add_argument("--job-id", default="")
    args = parser.parse_args()

    if args.select == args.advance:
        raise SystemExit("Choose exactly one of --select or --advance")

    links = load_links(args.links)
    state = load_state(args.state)
    raw_next_index = state.get("next_index", 0)
    next_index = int(raw_next_index) if isinstance(raw_next_index, (int, float, str)) else 0
    next_index %= len(links)
    next_variant = str(state.get("next_watermark_variant", DEFAULT_VARIANTS[0]))
    if next_variant not in DEFAULT_VARIANTS:
        next_variant = DEFAULT_VARIANTS[0]

    if args.select:
        if args.url:
            if args.url not in links:
                raise SystemExit("Explicit source URL is not present in sources/links.txt")
            index = links.index(args.url)
        elif args.index:
            index = source_index(args.index, len(links))
        else:
            index = next_index
        variant = args.watermark_variant or next_variant
        generated_ranges = state.get("generated_ranges", {})
        previous_ranges = generated_ranges.get(links[index], []) if isinstance(generated_ranges, dict) else []
        print(json.dumps({
            "url": links[index],
            "sourceIndex": index,
            "sourceCount": len(links),
            "watermarkVariant": variant,
            "previousRanges": previous_ranges if isinstance(previous_ranges, list) else [],
        }))
        return

    index = source_index(args.index, len(links)) if args.index else next_index
    variant = args.watermark_variant or next_variant
    state.update({
        "next_index": (index + 1) % len(links),
        "next_watermark_variant": DEFAULT_VARIANTS[(DEFAULT_VARIANTS.index(variant) + 1) % len(DEFAULT_VARIANTS)],
        "last_source_index": index,
        "last_source_url": links[index],
        "last_watermark_variant": variant,
    })
    if args.clip_start is not None and args.clip_duration is not None:
        generated_ranges = state.setdefault("generated_ranges", {})
        if not isinstance(generated_ranges, dict):
            generated_ranges = {}
            state["generated_ranges"] = generated_ranges
        source_ranges = generated_ranges.setdefault(links[index], [])
        if not isinstance(source_ranges, list):
            source_ranges = []
            generated_ranges[links[index]] = source_ranges
        source_ranges.append({
            "startSeconds": round(args.clip_start, 3),
            "durationSeconds": round(args.clip_duration, 3),
            "endSeconds": round(args.clip_start + args.clip_duration, 3),
            "jobId": args.job_id,
            "watermarkVariant": variant,
        })
    save_state(args.state, state)
    print(json.dumps(state))


if __name__ == "__main__":
    main()
