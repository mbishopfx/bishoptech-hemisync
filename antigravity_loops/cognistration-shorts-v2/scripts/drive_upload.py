#!/usr/bin/env python3
"""Upload a finished short to the shared Google Drive folder.

Uses the Cognistration OAuth token (client_id / client_secret / refresh_token),
which has the drive.file scope. A service account cannot be used here: bare
service accounts have no Drive storage quota of their own.

Usage:
  python3 scripts/drive_upload.py <video.mp4> --state theta --title "..." \
      --description "..." [--cleanup]
"""

import argparse
import json
import os
import sys

TOKEN_PATH = os.path.expanduser(
    "~/.hermes/profiles/cognistration/sheets_oauth_token.json")
FOLDER_ID = os.environ.get("COGNISTRATION_SHORTS_DRIVE_FOLDER_ID",
                           "10IDE8fm4Q029kS_ItYXa5n9Qv88JIgPH")
SCOPES = ["https://www.googleapis.com/auth/drive.file"]


def get_service():
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build

    with open(TOKEN_PATH) as f:
        t = json.load(f)

    creds = Credentials(
        token=t.get("token"),
        refresh_token=t["refresh_token"],
        token_uri=t.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=t["client_id"],
        client_secret=t["client_secret"],
        scopes=SCOPES,
    )
    creds.refresh(Request())
    return build("drive", "v3", credentials=creds)


def upload(video_path, brain_state, title=None, description=None, cleanup=False):
    if not os.path.exists(video_path):
        print(f"ERROR: file not found: {video_path}")
        sys.exit(1)

    name = os.path.basename(video_path)
    size_mb = os.path.getsize(video_path) / 1e6
    print(f"[drive] uploading {name} ({size_mb:.1f} MB) as {brain_state}")

    service = get_service()
    app_props = {"brainState": brain_state}
    if title:
        app_props["title"] = title[:120]  # Drive caps appProperty values at 124 bytes

    meta = {
        "name": name,
        "parents": [FOLDER_ID],
        "description": description or f"Cognistration Short, {brain_state}",
        "appProperties": app_props,
    }

    created = service.files().create(
        body=meta, media_body=video_path,
        fields="id, name, webViewLink").execute()

    file_id = created["id"]
    print(f"[drive] uploaded: {created.get('name')}")
    print(f"[drive] file id:  {file_id}")
    if created.get("webViewLink"):
        print(f"[drive] link:     {created['webViewLink']}")

    if cleanup:
        os.remove(video_path)
        print(f"[drive] removed local copy: {video_path}")

    return file_id


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Upload a short to Google Drive")
    ap.add_argument("video_path")
    ap.add_argument("--state", required=True)
    ap.add_argument("--title", default=None)
    ap.add_argument("--description", default=None)
    ap.add_argument("--cleanup", action="store_true",
                    help="Delete the local file after a successful upload")
    a = ap.parse_args()
    upload(a.video_path, a.state, a.title, a.description, a.cleanup)
