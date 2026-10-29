import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch


SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"

# channel_clip resolves the local yt-dlp executable at import time. Keep these
# unit tests offline and side-effect free by stubbing only that version probe.
with patch("subprocess.run", return_value=SimpleNamespace(
    returncode=0, stdout="2026.10.03\n", stderr="")):
    sys.path.insert(0, str(SCRIPTS))
    publish_spec = importlib.util.spec_from_file_location(
        "publish_clip", SCRIPTS / "publish_clip.py")
    if publish_spec is None or publish_spec.loader is None:
        raise RuntimeError("could not load publish_clip for safety tests")
    publish_clip = importlib.util.module_from_spec(publish_spec)
    sys.modules["publish_clip"] = publish_clip
    publish_spec.loader.exec_module(publish_clip)

    channel_spec = importlib.util.spec_from_file_location(
        "channel_clip", SCRIPTS / "channel_clip.py")
    if channel_spec is None or channel_spec.loader is None:
        raise RuntimeError("could not load channel_clip for safety tests")
    channel_clip = importlib.util.module_from_spec(channel_spec)
    sys.modules["channel_clip"] = channel_clip
    channel_spec.loader.exec_module(channel_clip)

pull_spec = importlib.util.spec_from_file_location(
    "pull_and_post", SCRIPTS.parent.parent / "cognistration-shorts-v2" / "scripts" / "pull_and_post.py")
if pull_spec is None or pull_spec.loader is None:
    raise RuntimeError("could not load pull_and_post for safety tests")
pull_and_post = importlib.util.module_from_spec(pull_spec)
pull_spec.loader.exec_module(pull_and_post)

description_spec = importlib.util.spec_from_file_location(
    "descriptions", SCRIPTS.parent.parent / "cognistration-shorts-v2" / "scripts" / "descriptions.py")
if description_spec is None or description_spec.loader is None:
    raise RuntimeError("could not load descriptions for safety tests")
descriptions = importlib.util.module_from_spec(description_spec)
description_spec.loader.exec_module(descriptions)


class ChannelClipStateTests(unittest.TestCase):
    def test_legacy_published_entry_counts_as_used_segment(self):
        state = {
            "clipped": ["jesse:source-1"],
            "published": [{
                "channel": "jesse",
                "sourceId": "source-1",
                "videoId": "posted-1",
                "publishedAt": "2026-10-18T09:11:55+00:00",
            }],
        }

        used = channel_clip.used_segments(state, "jesse", "source-1")

        self.assertEqual(len(used), 1)
        self.assertEqual(used[0]["part"], 1)
        self.assertEqual(used[0]["videoId"], "posted-1")
        self.assertIsNone(used[0]["start"])

    def test_legacy_segment_and_new_segments_are_not_double_counted(self):
        state = {
            "clipped": ["jesse:source-1"],
            "published": [{
                "channel": "jesse", "sourceId": "source-1", "videoId": "posted-1"
            }],
            "segments": {"jesse:source-1": [{
                "start": 300, "dur": 75, "part": 2, "videoId": "posted-2"
            }]},
        }

        used = channel_clip.used_segments(state, "jesse", "source-1")

        self.assertEqual([segment["part"] for segment in used], [1, 2])
        self.assertEqual([segment["videoId"] for segment in used], ["posted-1", "posted-2"])

    def test_legacy_clipped_marker_without_publish_record_still_counts_once(self):
        state = {"clipped": ["rogan:source-2"], "published": [], "segments": {}}

        used = channel_clip.used_segments(state, "rogan", "source-2")

        self.assertEqual(len(used), 1)
        self.assertEqual(used[0]["part"], 1)
        self.assertIsNone(used[0]["videoId"])

    def test_privacy_mismatch_fails_closed(self):
        with self.assertRaises(RuntimeError):
            publish_clip.require_privacy_match("public", "private", "video-1")
        publish_clip.require_privacy_match("private", "private", "video-2")


class DriveIngestSafetyTests(unittest.TestCase):
    def test_drive_filename_cannot_escape_output_directory(self):
        with tempfile.TemporaryDirectory() as temp:
            output = Path(temp) / "out"
            target = Path(pull_and_post.safe_output_path(
                "drive_id-1", "../../outside.mp4", output))

            self.assertEqual(target.parent, output.resolve())
            self.assertEqual(target.name, "drive_id-1-outside.mp4")

    def test_drive_file_id_is_validated(self):
        with tempfile.TemporaryDirectory() as temp:
            with self.assertRaises(ValueError):
                pull_and_post.safe_output_path("../escape", "clip.mp4", temp)

    def test_drive_pagination_finds_files_beyond_first_page(self):
        pages = {
            None: {"files": [{"id": "one"}, {"id": "already-pulled"}],
                   "nextPageToken": "page-2"},
            "page-2": {"files": [{"id": "two"}]},
        }
        calls = []

        class Request:
            def __init__(self, response):
                self.response = response

            def execute(self):
                return self.response

        class Files:
            def list(self, **kwargs):
                calls.append(kwargs)
                return Request(pages[kwargs.get("pageToken")])

        class Service:
            def files(self):
                return Files()

        found = pull_and_post.list_new_videos(Service(), "folder-id", {"already-pulled"})

        self.assertEqual([item["id"] for item in found], ["one", "two"])
        self.assertEqual([call.get("pageToken") for call in calls], [None, "page-2"])
        self.assertIn("nextPageToken", calls[0]["fields"])
        self.assertEqual(calls[0]["pageSize"], 1000)


class PublicCopySafetyTests(unittest.TestCase):
    def test_frequency_metadata_stays_exploratory_and_claim_safe(self):
        blocked_claims = (
            "deep restorative sleep",
            "inner restoration",
            "higher awareness",
            "connected consciousness",
            "guiding cortical networks",
            "frequency following response, and it is measured",
        )
        for state in descriptions.NEURO:
            with self.subTest(state=state):
                result = descriptions.build(state, 65, 200, 6)
                text = (result["title"] + "\n" + result["description"]).lower()
                for phrase in blocked_claims:
                    self.assertNotIn(phrase, text)
                self.assertTrue(any(phrase in text for phrase in (
                    "does not guarantee", "is guaranteed", "not a promise",
                    "does not promise", "not a guaranteed",
                )))


if __name__ == "__main__":
    unittest.main()
