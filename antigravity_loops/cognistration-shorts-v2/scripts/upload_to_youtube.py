#!/usr/bin/env python3
"""Upload a Cognistration short to YouTube using existing OAuth token."""
import os, sys, json, argparse
from pathlib import Path

# Google API client libraries
try:
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "google-auth-oauthlib", "google-api-python-client", "-q"], check=True)
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    from googleapiclient.http import MediaFileUpload

TOKEN_PATH = os.path.expanduser("~/.hermes/profiles/cognistration/youtube_oauth_token.json")
# Use token's actual scopes rather than hardcoding — prevents invalid_scope on refresh
SCOPES = None  # resolved from token at runtime

def load_credentials():
    """Load and refresh OAuth credentials from token file."""
    if not os.path.exists(TOKEN_PATH):
        print(f"ERROR: Token not found at {TOKEN_PATH}")
        sys.exit(1)

    with open(TOKEN_PATH, "r") as f:
        token_data = json.load(f)

    creds = Credentials(
        token=token_data.get("token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri=token_data.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=token_data.get("client_id"),
        client_secret=token_data.get("client_secret"),
        scopes=SCOPES if SCOPES else token_data.get("scope", "").split(),
    )

    # Refresh if needed
    if creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            # Save refreshed token
            token_data["token"] = creds.token
            with open(TOKEN_PATH, "w") as f:
                json.dump(token_data, f, indent=2)
            print("Token refreshed.")
        except Exception as e:
            print(f"WARNING: Token refresh failed: {e}")
            print("Continuing with existing token...")

    return creds

def upload_short(video_path: str, title: str, description: str, tags: list[str], privacy: str = "public"):
    """Upload a video to YouTube as a Short."""
    video_path = os.path.abspath(video_path)
    if not os.path.exists(video_path):
        print(f"ERROR: Video not found at {video_path}")
        sys.exit(1)

    file_size_mb = os.path.getsize(video_path) / (1024 * 1024)
    print(f"Video: {video_path} ({file_size_mb:.1f} MB)")

    creds = load_credentials()

    try:
        from google.auth.transport.requests import Request
    except ImportError:
        from google.auth.transport.requests import Request

    youtube = build("youtube", "v3", credentials=creds)

    # First, verify which channel we're uploading to
    channels_response = youtube.channels().list(
        part="snippet",
        mine=True
    ).execute()

    channel_title = channels_response.get("items", [{}])[0].get("snippet", {}).get("title", "Unknown")
    print(f"Uploading to channel: {channel_title}")

    # Build the upload request body
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": "27",  # Education
        },
        "status": {
            # Pass all three states through. This used to collapse anything that
            # was not "public" into "private", so --privacy unlisted quietly
            # produced a private video with no shareable link.
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False,
        },
    }

    # Upload
    media = MediaFileUpload(
        video_path,
        mimetype="video/mp4",
        resumable=True,
        chunksize=1024 * 1024 * 5,  # 5MB chunks
    )

    print(f"Starting upload (title: '{title[:80]}...')...")

    insert_request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media,
    )

    response = None
    while response is None:
        status, response = insert_request.next_chunk()
        if status:
            print(f"  Uploaded {int(status.progress() * 100)}%")

    video_id = response["id"]
    print(f"\nUpload complete! Video ID: {video_id}")
    print(f"URL: https://youtube.com/shorts/{video_id}")

    # Verify the upload by reading it back
    verify_response = youtube.videos().list(
        part="snippet,status",
        id=video_id
    ).execute()

    if verify_response.get("items"):
        item = verify_response["items"][0]
        actual_title = item["snippet"]["title"]
        actual_privacy = item["status"]["privacyStatus"]
        print(f"\nVerification:")
        print(f"  Title: {actual_title}")
        print(f"  Privacy: {actual_privacy}")
        print(f"  Video ID: {video_id}")
    else:
        print("WARNING: Could not verify upload in API response")

    return video_id, response

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Upload a Cognistration Short to YouTube")
    parser.add_argument("video_path", help="Path to the MP4 video file")
    parser.add_argument("--title", "-t", required=True, help="Video title")
    parser.add_argument("--description", "-d", default="", help="Video description")
    parser.add_argument("--privacy", "-p", default="private", choices=["public", "private", "unlisted"],
                       help="Privacy status (default: private)")
    args = parser.parse_args()

    # Build description with discovery terms
    full_description = args.description
    if not full_description:
        full_description = (
            "Theta waves (4–8 Hz) dominate during deep meditation, creative flow, "
            "and the hypnagogic state. Binaural beats at 6 Hz trigger the Frequency "
            "Following Response in your auditory brainstem, guiding cortical networks "
            "toward theta coherence.\n\n"
            "🔗 Explore your own brain states: https://cognistration.com/machine\n\n"
            "#binauralbeats #theta #meditation #neuroscience #brainwaves "
            "#frequencyfollowingresponse #cognistration #flowstate #creativity #deepfocus"
        )

    tags = [
        "binaural beats", "theta waves", "meditation", "neuroscience",
        "brain waves", "frequency following response", "FFR",
        "cognistration", "flow state", "creativity", "deep focus",
        "binaural", "brain entrainment", "auditory neuroscience",
        "theta meditation", "hypnagogic", "brain hacking"
    ]

    upload_short(args.video_path, args.title, full_description, tags, args.privacy)