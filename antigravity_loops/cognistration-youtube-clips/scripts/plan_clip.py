#!/usr/bin/env python3
"""Select a short clip and prepare Remotion metadata."""
from __future__ import annotations

import argparse
import json
import math
import shutil
import subprocess
from pathlib import Path

FPS = 30
MIN_DURATION = 90.0
DEFAULT_DURATION = MIN_DURATION
MAX_DURATION = 120.0



def run(cmd: list[str]) -> str:
    return subprocess.check_output(cmd, text=True).strip()


def source_duration(path: Path) -> float:
    return float(run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(path)
    ]))


def load_segments(path: Path) -> list[dict]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if payload.get("segments"):
        return payload["segments"]

    # YouTube json3 captions expose timed text events. Preserve per-segment
    # offsets when present; only distribute time when an event has no offsets.
    normalized: list[dict] = []
    for event in payload.get("events") or []:
        start = float(event.get("tStartMs", 0)) / 1000.0
        end = start + float(event.get("dDurationMs", 0)) / 1000.0
        timed_segments: list[tuple[list[str], float | None]] = []
        for segment in event.get("segs") or []:
            tokens = str(segment.get("utf8", "")).replace("\\n", " ").split()
            if tokens:
                offset = segment.get("tOffsetMs")
                timed_segments.append((tokens, float(offset) / 1000.0 if offset is not None else None))
        tokens = [token for segment_tokens, _ in timed_segments for token in segment_tokens]
        text = " ".join(tokens).strip()
        if not text or end <= start or not timed_segments:
            continue
        span = max(0.05, end - start)
        words: list[dict] = []
        has_offsets = any(offset is not None for _, offset in timed_segments)
        if has_offsets:
            cursor_offset = 0.0
            for index, (segment_tokens, offset) in enumerate(timed_segments):
                segment_start = offset if offset is not None else cursor_offset
                next_offset = next(
                    (next_offset for _, next_offset in timed_segments[index + 1:] if next_offset is not None),
                    span,
                )
                segment_end = max(segment_start + 0.05, min(span, next_offset))
                segment_span = max(0.05, segment_end - segment_start)
                step = segment_span / max(1, len(segment_tokens))
                words.extend(
                    {
                        "word": token,
                        "start": start + segment_start + word_index * step,
                        "end": start + min(span, segment_start + (word_index + 1) * step),
                    }
                    for word_index, token in enumerate(segment_tokens)
                )
                cursor_offset = segment_end
        else:
            step = span / max(1, len(tokens))
            words = [
                {"word": token, "start": start + index * step, "end": start + (index + 1) * step}
                for index, token in enumerate(tokens)
            ]
        normalized.append({"start": start, "end": end, "text": text, "words": words})
    return normalized


def choose_start(segments: list[dict], total: float, duration: float, avoid_ranges: list[dict] | None = None) -> float:
    if total <= duration:
        return 0.0
    candidates: list[tuple[float, float]] = []
    hook_terms = {
        "how", "why", "what", "actually", "mistake", "reason", "truth",
        "never", "simple", "important", "problem", "learned", "because",
    }
    for segment in segments:
        text = str(segment.get("text", "")).strip().lower()
        if not text:
            continue
        start = max(0.0, float(segment.get("start", 0.0)) - 1.5)
        if start > max(0.0, total - duration):
            continue
        if any(
            start < float(item.get("endSeconds", 0.0))
            and start + duration > float(item.get("startSeconds", 0.0))
            for item in (avoid_ranges or [])
        ):
            continue
        score = 0.0
        score += sum(2.0 for term in hook_terms if term in text)
        score += 2.0 if "?" in text else 0.0
        score += 1.5 if "!" in text else 0.0
        score += min(len(text.split()) / 18.0, 2.0)
        score -= 2.0 if any(term in text for term in ("sponsor", "subscribe", "welcome back")) else 0.0
        candidates.append((score, start))
    if not candidates:
        return 0.0
    candidates.sort(reverse=True)
    return round(candidates[0][1], 3)


def build_camera_cuts(duration: float) -> list[dict]:
    patterns = [
        {"scale": 1.01, "xPct": 0, "yPct": 0},
        {"scale": 1.05, "xPct": -2, "yPct": 0},
        {"scale": 1.03, "xPct": 2, "yPct": -1},
        {"scale": 1.07, "xPct": 0, "yPct": 1},
    ]
    cut_seconds = 2.5
    cuts: list[dict] = []
    count = max(1, math.ceil(duration / cut_seconds))
    for index in range(count):
        start = index * cut_seconds
        end = min(duration, (index + 1) * cut_seconds)
        pattern = patterns[index % len(patterns)]
        cuts.append({
            "startFrame": round(start * FPS),
            "endFrame": max(round(start * FPS) + 1, round(end * FPS)),
            **pattern,
        })
    return cuts


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--transcript", required=True, type=Path)
    parser.add_argument("--source-info", required=True, type=Path)
    parser.add_argument("--description", required=True, type=Path)
    parser.add_argument("--closing-card", required=True, type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    parser.add_argument("--public-dir", required=True, type=Path)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--clip-start", type=float)
    parser.add_argument("--clip-duration", type=float, default=DEFAULT_DURATION)

    parser.add_argument("--watermark-variant", choices=("logo", "domain"), default="logo")
    parser.add_argument("--avoid-ranges", type=Path)
    parser.add_argument("--analytics", type=Path)
    args = parser.parse_args()

    total = source_duration(args.source)
    if total < MIN_DURATION:
        raise SystemExit(
            f"Source is {total:.3f}s; it is too short for the required "
            f"minimum {MIN_DURATION:.0f}-second clip"
        )
    duration = min(MAX_DURATION, max(MIN_DURATION, float(args.clip_duration)))
    duration = min(duration, total)
    source_info = json.loads(args.source_info.read_text(encoding="utf-8"))
    description = args.description.read_text(encoding="utf-8").strip()
    if not description:
        raise SystemExit("Description is empty")
    if not args.closing_card.is_file():
        raise SystemExit(f"Closing card does not exist: {args.closing_card}")
    segments = load_segments(args.transcript)

    avoid_ranges: list[dict] = []
    if args.avoid_ranges and args.avoid_ranges.is_file():
        selection = json.loads(args.avoid_ranges.read_text(encoding="utf-8"))
        previous = selection.get("previousRanges", []) if isinstance(selection, dict) else []
        if isinstance(previous, list):
            avoid_ranges = [item for item in previous if isinstance(item, dict)]
    analytics_summary: dict = {}
    if args.analytics and args.analytics.is_file():
        analytics_payload = json.loads(args.analytics.read_text(encoding="utf-8"))
        if isinstance(analytics_payload, dict):
            analytics_summary = {
                "status": analytics_payload.get("status"),
                "pulledAt": analytics_payload.get("pulledAt"),
                "sampleSize": analytics_payload.get("sampleSize", 0),
                "topByViews": (analytics_payload.get("topByViews") or [])[:5],
                "topByEngagement": (analytics_payload.get("topByEngagement") or [])[:5],
            }
    start = max(0.0, float(args.clip_start)) if args.clip_start is not None else choose_start(segments, total, duration, avoid_ranges)
    start = min(start, max(0.0, total - duration))
    end = min(total, start + duration)
    duration = end - start

    args.output_dir.mkdir(parents=True, exist_ok=True)
    args.public_dir.mkdir(parents=True, exist_ok=True)
    clip_path = args.output_dir / "clip-source.mp4"
    subprocess.run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-ss", f"{start:.3f}", "-i", str(args.source), "-t", f"{duration:.3f}",
        "-vf", f"fps={FPS}",
        "-c:v", "libx264", "-preset", "medium", "-crf", "16",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(clip_path),
    ], check=True)
    shutil.copy2(clip_path, args.public_dir / "source.mp4")
    shutil.copy2(args.closing_card, args.public_dir / "closing_card.png")

    source_title = str(source_info.get("title") or "Untitled source video").strip()
    source_creator = str(
        source_info.get("uploader") or source_info.get("channel") or source_info.get("creator") or "Original creator not identified"
    ).strip()
    source_url = str(source_info.get("webpage_url") or args.source_url).strip()
    closing_start = max(0, round(duration * FPS) - 60)

    metadata = {
        "sourceUrl": args.source_url,
        "sourceTitle": source_title,
        "sourceCreator": source_creator,
        "sourceLicense": source_info.get("license"),
        "sourceUploadDate": source_info.get("upload_date"),
        "sourceFile": str(args.source),
        "sourceMetadata": {
            "title": source_title,
            "creator": source_creator,
            "url": source_url,
        },
        "sourceDurationSeconds": total,
        "clipStartSeconds": start,
        "clipDurationSeconds": duration,
        "fps": FPS,
        "durationInFrames": max(1, round(duration * FPS)),
        "captions": [],
        "cameraCuts": build_camera_cuts(duration),
        "description": description,
        "closingCard": {
            "asset": "closing_card.png",
            "sourcePath": str(args.closing_card),
            "startFrame": closing_start,
            "durationFrames": min(60, max(1, round(duration * FPS))),
            "fadeInFrames": 15,
        },
        "renderVariants": {
            "standard": {
                "composition": "ClipComp",
                "file": "clip.mp4",
                "treatment": "full-bleed-vertical-face-aware",
            },
            "landscapeLetterbox": {
                "composition": "ClipLandscapeLetterbox",
                "file": "clip-landscape-letterbox.mp4",
                "treatment": "full-landscape-window-black-letterbox-top-website-bottom-ios-cta",
            },
        },
        "format": "vertical-9:16",
        "editingProfile": "hook-first-punchy-cuts",

        "watermarkVariant": args.watermark_variant,
        "watermarkOpacity": 0.28,
        "previousGeneratedRanges": avoid_ranges,
        "channelAnalytics": analytics_summary,
    }
    (args.output_dir / "clip_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    (args.public_dir / "clip_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps({
        "clipStartSeconds": start,
        "clipDurationSeconds": duration,
        "captionCount": len(metadata["captions"]),
        "cameraCutCount": len(metadata["cameraCuts"]),
        "clipPath": str(clip_path),
    }))


if __name__ == "__main__":
    main()
