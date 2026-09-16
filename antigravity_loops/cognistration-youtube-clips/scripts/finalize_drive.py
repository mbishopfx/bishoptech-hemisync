#!/usr/bin/env python3
"""Upload and verify a completed clip archive in Google Drive."""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

DEFAULT_GOOGLE_API = "/Users/matthewbishop/.hermes/skills/productivity/google-workspace/scripts/google_api.py"


def gapi(python_bin: str, google_api: Path, args: list[str]) -> dict:
    result = subprocess.run(
        [python_bin, str(google_api), *args],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


def upload(
    python_bin: str,
    google_api: Path,
    path: Path,
    name: str,
    folder_id: str,
) -> dict:
    uploaded = gapi(
        python_bin,
        google_api,
        ["drive", "upload", str(path), "--name", name, "--parent", folder_id],
    )
    if uploaded.get("status") != "uploaded" or not uploaded.get("id"):
        raise RuntimeError(f"Drive upload did not return a usable file: {uploaded}")
    verified = gapi(python_bin, google_api, ["drive", "get", uploaded["id"]])
    expected_size = path.stat().st_size
    actual_size = int(verified.get("size") or 0)
    if actual_size != expected_size:
        raise RuntimeError(
            f"Drive size mismatch for {path.name}: local={expected_size}, drive={actual_size}"
        )
    return {
        "id": verified["id"],
        "name": verified.get("name", name),
        "mimeType": verified.get("mimeType"),
        "size": actual_size,
        "webViewLink": verified.get("webViewLink") or uploaded.get("webViewLink"),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder-id", required=True)
    parser.add_argument("--job-id", required=True)
    parser.add_argument("--clip", required=True, type=Path)
    parser.add_argument("--landscape-clip", type=Path)
    parser.add_argument("--metadata", required=True, type=Path)
    parser.add_argument("--transcript", required=True, type=Path)
    parser.add_argument("--description", required=True, type=Path)
    parser.add_argument("--youtube-manifest", type=Path)
    parser.add_argument("--source-selection", type=Path)
    parser.add_argument("--analytics", type=Path)
    parser.add_argument("--google-api", type=Path, default=Path(DEFAULT_GOOGLE_API))
    parser.add_argument("--python", dest="python_bin", default="/usr/bin/python3")
    args = parser.parse_args()

    archive_inputs = [args.clip, args.metadata, args.transcript, args.description]
    if args.landscape_clip:
        archive_inputs.append(args.landscape_clip)
    if args.youtube_manifest:
        archive_inputs.append(args.youtube_manifest)
    if args.source_selection:
        archive_inputs.append(args.source_selection)
    if args.analytics:
        archive_inputs.append(args.analytics)
    for path in archive_inputs:
        if not path.is_file():
            raise SystemExit(f"Archive input does not exist: {path}")
    if not args.google_api.is_file():
        raise SystemExit(f"Google API helper does not exist: {args.google_api}")

    prefix = f"cognistration-clip-{args.job_id}"
    manifest = {
        "folderId": args.folder_id,
        "jobId": args.job_id,
        "clip": upload(args.python_bin, args.google_api, args.clip, f"{prefix}.mp4", args.folder_id),
        "metadata": upload(
            args.python_bin,
            args.google_api,
            args.metadata,
            f"{prefix}-metadata.json",
            args.folder_id,
        ),
        "transcript": upload(
            args.python_bin,
            args.google_api,
            args.transcript,
            f"{prefix}-transcript.json",
            args.folder_id,
        ),
        "description": upload(
            args.python_bin,
            args.google_api,
            args.description,
            f"{prefix}-description.txt",
            args.folder_id,
        ),
    }
    if args.landscape_clip:
        manifest["landscapeClip"] = upload(
            args.python_bin,
            args.google_api,
            args.landscape_clip,
            f"{prefix}-landscape-letterbox.mp4",
            args.folder_id,
        )
    if args.youtube_manifest:
        manifest["youtubeManifest"] = upload(
            args.python_bin,
            args.google_api,
            args.youtube_manifest,
            f"{prefix}-youtube-manifest.json",
            args.folder_id,
        )
    if args.source_selection:
        manifest["sourceSelection"] = upload(
            args.python_bin,
            args.google_api,
            args.source_selection,
            f"{prefix}-source-selection.json",
            args.folder_id,
        )
    if args.analytics:
        manifest["analytics"] = upload(
            args.python_bin,
            args.google_api,
            args.analytics,
            f"{prefix}-youtube-analytics.json",
            args.folder_id,
        )
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    main()
