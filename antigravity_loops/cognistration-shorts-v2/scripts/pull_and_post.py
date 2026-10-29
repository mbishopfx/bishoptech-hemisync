#!/usr/bin/env python3
"""Pull rendered videos from Google Drive and upload to YouTube.

This runs on the MAIN Cognistration machine. The render agent (separate machine)
pushes videos to a shared Drive folder. This script watches that folder,
downloads new videos, and posts them to YouTube.

Usage:
  python3 scripts/pull_and_post.py            # Process all new videos
  python3 scripts/pull_and_post.py --dry-run   # Show what's available without acting
"""

import argparse, json, os, re, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

# --- Config ---
DRIVE_KEY_PATH = os.path.expanduser(
    "~/.hermes/profiles/cognistration/cognistration-shorts-factory-service-account.json")

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(SCRIPTS_DIR)
STATE_PATH = os.path.join(REPO_ROOT, "state", "pulled_videos.json")
OUTPUT_DIR = os.path.join(REPO_ROOT, "output")

DRIVE_FOLDER_ID = os.environ.get("COGNISTRATION_SHORTS_DRIVE_FOLDER_ID",
                                 "10IDE8fm4Q029kS_ItYXa5n9Qv88JIgPH")

SCOPES_DRIVE = ['https://www.googleapis.com/auth/drive.readonly']

# Brain state metadata for YouTube titles/descriptions
STATE_META = {
    'delta': {'title': 'Delta 2.5 Hz | Binaural Audio Experiment', 'outcome': 'Delta-range listening experiment'},
    'theta': {'title': 'Theta 6 Hz | Binaural Audio Experiment', 'outcome': 'Theta-range listening experiment'},
    'alpha': {'title': 'Alpha 10 Hz | Binaural Audio Experiment', 'outcome': 'Alpha-range listening experiment'},
    'smr':   {'title': 'SMR 13 Hz | Binaural Audio Experiment', 'outcome': 'SMR-range listening experiment'},
    'beta':  {'title': 'Beta 18 Hz | Binaural Audio Experiment', 'outcome': 'Beta-range listening experiment'},
    'gamma': {'title': 'Gamma 38 Hz | Binaural Audio Experiment', 'outcome': 'Gamma-range listening experiment'},
}

DISCOVERY_TAGS = [
    'binaural beats', 'theta waves', 'meditation', 'audio design',
    'listening practice', 'auditory science', 'cognistration', 'headphones',
]


def get_drive_service():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    creds = service_account.Credentials.from_service_account_file(
        DRIVE_KEY_PATH, scopes=SCOPES_DRIVE)
    return build('drive', 'v3', credentials=creds)


def list_new_videos(service, folder_id, pulled_ids):
    """List videos in Drive folder that haven't been pulled yet."""
    query = (f"'{folder_id}' in parents and mimeType contains 'video/' "
             f"and trashed = false")
    files = []
    page_token = None
    while True:
        params = {
            'q': query,
            'fields': 'nextPageToken,files(id, name, description, appProperties, createdTime, size)',
            'orderBy': 'createdTime asc',
            'pageSize': 1000,
        }
        if page_token:
            params['pageToken'] = page_token
        results = service.files().list(**params).execute()
        files.extend(results.get('files', []))
        page_token = results.get('nextPageToken')
        if not page_token:
            break
    return [f for f in files if f['id'] not in pulled_ids]


def safe_output_path(file_id, file_name, output_dir=OUTPUT_DIR):
    """Build a unique path under OUTPUT_DIR from untrusted Drive metadata."""
    file_id = str(file_id or '')
    if not re.fullmatch(r'[A-Za-z0-9_-]+', file_id):
        raise ValueError('Drive returned an invalid file id')

    name = str(file_name or '').replace('\\', '/')
    basename = name.rsplit('/', 1)[-1]
    safe_name = re.sub(r'[^A-Za-z0-9._-]+', '_', basename).lstrip('.')
    if not safe_name or safe_name in {'.', '..'}:
        safe_name = 'video.mp4'

    root = Path(output_dir).resolve()
    target = (root / f'{file_id}-{safe_name}').resolve()
    if not target.is_relative_to(root):
        raise ValueError('Drive filename resolves outside the output directory')
    return str(target)


def download_video(service, file_id, dest_path):
    """Download a video from Drive."""
    from googleapiclient.http import MediaIoBaseDownload
    import io
    request = service.files().get_media(fileId=file_id)
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    with open(dest_path, 'wb') as fh:
        downloader = MediaIoBaseDownload(fh, request)
        done = False
        while not done:
            status, done = downloader.next_chunk()
    return dest_path


def upload_to_youtube(video_path, brain_state, title=None, description=None,
                      privacy="private"):
    """Upload a video to YouTube using the existing upload script.

    The cloud renderer stamps the finished title and description onto the Drive
    file, so prefer those and fall back to the local defaults only if the file
    carries none.
    """
    meta = STATE_META.get(brain_state, STATE_META['theta'])
    all_tags = list(dict.fromkeys(DISCOVERY_TAGS))

    if not title:
        title = meta['title']
    if not description:
        description = (
            f"{meta['outcome']}. Pure binaural beat from Cognistration.\n\n"
            + ' '.join(f"#{t.replace(' ', '')}" for t in all_tags[:12])
        )

    upload_script = os.path.join(SCRIPTS_DIR, 'upload_to_youtube.py')
    cmd = [
        sys.executable, upload_script,
        video_path,
        '--title', title,
        '--description', description,
        '--privacy', privacy,
    ]

    print(f"  Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    print(result.stdout)
    if result.returncode != 0:
        print(f"  Upload stderr: {result.stderr}")
        raise RuntimeError(f"YouTube upload failed with code {result.returncode}")


def load_state():
    if os.path.exists(STATE_PATH):
        with open(STATE_PATH) as f:
            return json.load(f)
    return {'pulled_file_ids': [], 'last_run': None}


def save_state(state):
    os.makedirs(os.path.dirname(STATE_PATH), exist_ok=True)
    state['last_run'] = datetime.now(timezone.utc).isoformat()
    with open(STATE_PATH, 'w') as f:
        json.dump(state, f, indent=2)


def main(dry_run=False, limit=None, only=None, privacy="private"):
    if DRIVE_FOLDER_ID == 'REPLACE_WITH_YOUR_DRIVE_FOLDER_ID':
        print("ERROR: Set COGNISTRATION_SHORTS_DRIVE_FOLDER_ID environment variable "
              "or edit this script with your Drive folder ID.")
        sys.exit(1)

    if not os.path.exists(DRIVE_KEY_PATH):
        print(f"ERROR: Service account key not found at {DRIVE_KEY_PATH}")
        print("Copy the service account JSON key there and retry.")
        sys.exit(1)

    state = load_state()
    pulled_ids = set(state.get('pulled_file_ids', []))

    print(f"Drive folder: {DRIVE_FOLDER_ID}")
    service = get_drive_service()
    new_videos = list_new_videos(service, DRIVE_FOLDER_ID, pulled_ids)

    if not new_videos:
        print("No new videos in Drive folder.")
        return

    print(f"\nFound {len(new_videos)} new video(s):")
    for v in new_videos:
        props = v.get('appProperties', {})
        size_mb = int(v.get('size', 0)) / (1024 * 1024)
        print(f"  • {v['name']} ({size_mb:.1f} MB) — "
              f"{props.get('brainState', '?')} / batch {props.get('batchId', '?')}")

    if dry_run:
        print("\nDry run — not downloading or posting.")
        return

    if only:
        new_videos = [v for v in new_videos if only in v['name']]
        if not new_videos:
            print(f"No unpulled video matching '{only}'.")
            return

    if limit:
        new_videos = new_videos[:limit]

    for v in new_videos:
        file_id = v['id']
        file_name = v['name']
        props = v.get('appProperties', {})
        brain_state = props.get('brainState', 'theta')
        drive_title = props.get('title')
        drive_description = v.get('description')
        dest = safe_output_path(file_id, file_name)

        print(f"\n⬇ Downloading {file_name}...")
        download_video(service, file_id, dest)

        print(f"⬆ Posting to YouTube ({brain_state})...")
        try:
            upload_to_youtube(dest, brain_state, drive_title, drive_description,
                              privacy=privacy)
        except Exception as e:
            print(f"  FAILED: {e}")
            continue

        pulled_ids.add(file_id)
        state['pulled_file_ids'] = sorted(pulled_ids)
        save_state(state)

        # Drive holds the master copy; the local download is only needed for the
        # upload, so remove it once YouTube has the video.
        try:
            os.remove(dest)
            print(f"  removed local copy: {dest}")
        except OSError as exc:
            print(f"  could not remove local copy: {exc}")

        print(f"  ✓ Complete")

    print(f"\nProcessed {len(new_videos)} videos.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Pull rendered shorts from Drive and post to YouTube')
    parser.add_argument('--dry-run', action='store_true',
                        help='Show what is available without downloading or posting')
    parser.add_argument('--limit', type=int, default=None,
                        help='Post at most this many videos (use 1 for a single review post)')
    parser.add_argument('--only', default=None,
                        help='Only post files whose name contains this text')
    parser.add_argument('--privacy', default='private',
                        choices=['public', 'private', 'unlisted'],
                        help='Privacy for this batch (default private, for review)')
    args = parser.parse_args()
    main(dry_run=args.dry_run, limit=args.limit, only=args.only,
         privacy=args.privacy)