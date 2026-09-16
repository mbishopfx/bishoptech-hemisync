#!/usr/bin/env python3
import os
import sys
import json
import tempfile
import urllib.request
import urllib.parse

DEFAULT_TOKEN_PATH = "/Users/matthewbishop/.hermes/profiles/cognistration/youtube_oauth_token.json"
DEFAULT_CLIENT_SECRETS_PATH = "/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration/client_secret_704033580490-uhapna4nrrelbo8s1p94octgob89a120.apps.googleusercontent.com.json"
LEGACY_ADC_PATH = "/Users/matthewbishop/.config/gcloud/legacy_credentials/bishopfamilyoculus@gmail.com/adc.json"


def load_credentials():
    token_path = os.environ.get("YOUTUBE_TOKEN_FILE", DEFAULT_TOKEN_PATH)
    client_secrets_path = os.environ.get("YOUTUBE_CLIENT_SECRETS_FILE", DEFAULT_CLIENT_SECRETS_PATH)

    if os.path.exists(token_path) and os.path.exists(client_secrets_path):
        with open(token_path, "r", encoding="utf-8") as handle:
            token_data = json.load(handle)
        with open(client_secrets_path, "r", encoding="utf-8") as handle:
            client_data = json.load(handle)
        installed = client_data.get("installed") or client_data.get("web") or {}
        return {
            "client_id": installed.get("client_id"),
            "client_secret": installed.get("client_secret"),
            "refresh_token": token_data.get("refresh_token"),
            "token_path": token_path,
            "source": "cognistration_profile_token"
        }

    if os.path.exists(LEGACY_ADC_PATH):
        with open(LEGACY_ADC_PATH, "r", encoding="utf-8") as handle:
            legacy_data = json.load(handle)
        legacy_data["token_path"] = None
        legacy_data["source"] = "legacy_adc_fallback"
        return legacy_data

    raise FileNotFoundError(
        f"No YouTube OAuth credentials found. Checked {token_path} and {LEGACY_ADC_PATH}."
    )


def refresh_token(client_id, client_secret, refresh_token_val, token_path=None):
    url = "https://oauth2.googleapis.com/token"
    data = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "refresh_token": refresh_token_val,
        "grant_type": "refresh_token"
    }).encode("utf-8")
    
    req = urllib.request.Request(url, data=data)
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            access_token = res.get("access_token")
            if access_token and token_path:
                with open(token_path, "r", encoding="utf-8") as handle:
                    token_data = json.load(handle)
                token_data.update({key: value for key, value in res.items() if key != "refresh_token"})
                token_data["refresh_token"] = refresh_token_val
                directory = os.path.dirname(token_path) or "."
                fd, temp_path = tempfile.mkstemp(prefix="youtube-token-", suffix=".json", dir=directory)
                try:
                    with os.fdopen(fd, "w", encoding="utf-8") as handle:
                        json.dump(token_data, handle, indent=2)
                    os.chmod(temp_path, 0o600)
                    os.replace(temp_path, token_path)
                finally:
                    if os.path.exists(temp_path):
                        os.remove(temp_path)
            return access_token
    except Exception as e:
        print(f"Failed to refresh access token: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode())
        return None

def upload_video(video_path, access_token, title, description, tags):
    boundary = "314159265358979323846"
    metadata = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": "27"  # Education category
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False
        }
    }

    metadata_json = json.dumps(metadata)
    boundary_bytes = boundary.encode('utf-8')
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': f'multipart/related; boundary={boundary}'
    }

    body_parts = []
    body_parts.append(b'--' + boundary_bytes + b'\r\n')
    body_parts.append(b'Content-Type: application/json; charset=UTF-8\r\n\r\n')
    body_parts.append(metadata_json.encode('utf-8') + b'\r\n')
    body_parts.append(b'--' + boundary_bytes + b'\r\n')
    body_parts.append(b'Content-Type: video/mp4\r\n\r\n')

    # Read binary video content
    with open(video_path, 'rb') as f:
        video_data = f.read()

    body_parts.append(video_data + b'\r\n')
    body_parts.append(b'--' + boundary_bytes + b'--\r\n')

    body = b''.join(body_parts)

    url = "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status"
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')

    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            video_id = res.get("id")
            print(f"Video uploaded successfully! Video ID: {video_id}")
            return video_id
    except Exception as e:
        print(f"YouTube upload failed: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode())
        return None

def fetch_channel(access_token):
    url = "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    items = data.get("items") or []
    if not items:
        raise RuntimeError("The YouTube token is valid but no owned channel was returned.")
    item = items[0]
    return {"id": item.get("id"), "title": item.get("snippet", {}).get("title")}


def fetch_uploaded_video(access_token, video_id):
    query = urllib.parse.urlencode({"part": "snippet,status", "id": video_id})
    url = f"https://www.googleapis.com/youtube/v3/videos?{query}"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {access_token}"})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    items = data.get("items") or []
    if not items:
        raise RuntimeError(f"YouTube upload returned {video_id}, but readback found no video.")
    item = items[0]
    snippet = item.get("snippet", {})
    status = item.get("status", {})
    return {
        "id": item.get("id"),
        "title": snippet.get("title"),
        "description": snippet.get("description"),
        "privacyStatus": status.get("privacyStatus"),
        "channelId": snippet.get("channelId")
    }


def main():
    if len(sys.argv) < 5:
        print("Usage: python3 upload_youtube.py <video-path> <title> <description> <comma-separated-tags>")
        sys.exit(1)

    video_path = sys.argv[1]
    title = sys.argv[2]
    description = sys.argv[3]
    tags = [tag.strip() for tag in sys.argv[4].split(",") if tag.strip()]

    try:
        creds = load_credentials()
    except Exception as error:
        print(f"Error loading YouTube OAuth credentials: {error}")
        sys.exit(1)

    client_id = creds.get("client_id")
    client_secret = creds.get("client_secret")
    refresh_token_val = creds.get("refresh_token")

    if not client_id or not client_secret or not refresh_token_val:
        print("Error: Missing client credentials or refresh token in credentials file.")
        sys.exit(1)

    print(f"Refreshing access token from {creds.get('source')}...")
    access_token = refresh_token(client_id, client_secret, refresh_token_val, creds.get("token_path"))
    if not access_token:
        print("Error: Could not retrieve a valid access token.")
        sys.exit(1)

    try:
        channel = fetch_channel(access_token)
        print(f"Verified YouTube channel: {channel['title']} ({channel['id']})")
        expected_channel = os.environ.get("YOUTUBE_EXPECTED_CHANNEL", "Cognistration")
        if channel["title"] != expected_channel:
            print(f"Error: Expected YouTube channel '{expected_channel}', found '{channel['title']}'.")
            sys.exit(1)
    except Exception as error:
        print(f"Error verifying the target YouTube channel: {error}")
        sys.exit(1)

    print(f"Starting upload for: {video_path}")
    print(f"- Title: {title}")
    video_id = upload_video(video_path, access_token, title, description, tags)

    if video_id:
        try:
            uploaded = fetch_uploaded_video(access_token, video_id)
            if uploaded["channelId"] != channel["id"]:
                raise RuntimeError("Uploaded video channel does not match the verified target channel.")
            print(f"Verified upload readback: {uploaded['title']} [{uploaded['privacyStatus']}]")
            print(f"SUCCESS_URL:https://www.youtube.com/watch?v={video_id}")
        except Exception as error:
            print(f"YouTube upload readback failed: {error}")
            sys.exit(1)
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()
