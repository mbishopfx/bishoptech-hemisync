#!/usr/bin/env python3
"""Update the human-readable clip-loop state after a verified publish."""
from __future__ import annotations

import argparse
from pathlib import Path


def replace_or_insert(lines: list[str], prefix: str, value: str, before: str) -> list[str]:
    replacement = f"- {value}\n"
    for index, line in enumerate(lines):
        if line.startswith(prefix):
            lines[index] = replacement
            return lines
    for index, line in enumerate(lines):
        if line.startswith(before):
            lines.insert(index, replacement)
            return lines
    lines.append(replacement)
    return lines


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--state", required=True, type=Path)
    parser.add_argument("--source-index", required=True, type=int)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--start", required=True, type=float)
    parser.add_argument("--duration", required=True, type=float)
    parser.add_argument("--watermark", required=True, choices=("logo", "domain"))
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--youtube-url", required=True)
    args = parser.parse_args()

    if not args.state.is_file():
        raise SystemExit(f"State file does not exist: {args.state}")
    lines = args.state.read_text(encoding="utf-8").splitlines(keepends=True)
    end = args.start + args.duration
    lines = replace_or_insert(
        lines,
        "- Latest published clip:",
        f"Latest published clip: `{args.youtube_url}`.",
        "- Freshness gate:",
    )
    lines = replace_or_insert(
        lines,
        "- Latest completed timestamp:",
        (
            f"Latest completed timestamp: source index {args.source_index} "
            f"(`{args.source_url.split('v=', 1)[-1]}`), `{args.start:.3f}s`–`{end:.3f}s` "
            f"({args.duration:.3f}s), job `{args.job_id}`, {args.watermark} watermark."
        ),
        "- Freshness gate:",
    )
    args.state.write_text("".join(lines), encoding="utf-8")
    print(f"Updated {args.state}")


if __name__ == "__main__":
    main()
