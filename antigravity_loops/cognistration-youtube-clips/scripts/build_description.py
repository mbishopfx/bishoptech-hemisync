#!/usr/bin/env python3
"""Build the reusable YouTube description and attribution for a Cognistration clip."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

APP_STORE_URL = "https://apps.apple.com/us/app/cognistration/id6780132617"
WEBSITE_URL = "https://cognistration.com"
MACHINE_URL = "https://cognistration.com/machine"
PACKS_URL = "https://cognistration.com/packs"
SUBSCRIBE_URL = "https://www.youtube.com/channel/UCGZsEX2J-R9NN2EE4Lx9xfw?sub_confirmation=1"


def clean(value: object, fallback: str) -> str:
    text = " ".join(str(value or "").split()).strip()
    return text or fallback


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-info", required=True, type=Path)
    parser.add_argument("--source-url", required=True)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--clip-title", default="")
    args = parser.parse_args()

    info = json.loads(args.source_info.read_text(encoding="utf-8"))
    source_title = clean(info.get("title"), "Untitled source video")
    creator = clean(info.get("uploader") or info.get("channel") or info.get("creator"), "Original creator not identified")
    source_url = clean(info.get("webpage_url") or args.source_url, args.source_url)
    clip_title = clean(args.clip_title, source_title)

    description = f"""{clip_title}

A concise excerpt selected from a longer conversation or video about audio, attention, consciousness, hemispheric synchronization, binaural beats, brain entrainment, frequency-following response, or related listening practice.

Cognistration gives you a calm, controlled way to explore custom listening sessions:
• Try the Cognistration iOS app: {APP_STORE_URL}
• Use the Cognistration web platform: {WEBSITE_URL}
• Build a session in the interactive machine: {MACHINE_URL}
• Explore bundled tone packs and session resources: {PACKS_URL}

Subscribe to Cognistration for more grounded audio experiments and thoughtful listening conversations: {SUBSCRIBE_URL}
Share this clip with someone who would enjoy exploring the idea with you.

This clip is for education, reflection, and listening exploration. Frequency labels and entrainment language describe an audio design or a topic discussed by the source; they are not medical advice and do not guarantee changes to consciousness, cognition, attention, sleep, mood, or health. Listen at a comfortable volume and stop if anything feels uncomfortable.

If this idea helped you think differently, save the clip and explore Cognistration on the web or in the iOS app. The app and web platform let you create, customize, and revisit your own sessions instead of relying on a one-size-fits-all track.

#Cognistration #BinauralBeats #BrainEntrainment #Consciousness #Meditation #FrequencyFollowingResponse #Mindfulness

SOURCE & ORIGINAL CREATOR
Original video: {source_title}
Original creator: {creator}
Original video link: {source_url}
"""
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(description.strip() + "\n", encoding="utf-8")
    print(json.dumps({
        "sourceTitle": source_title,
        "sourceCreator": creator,
        "descriptionPath": str(args.output),
        "characterCount": len(description.strip()),
    }))


if __name__ == "__main__":
    main()
