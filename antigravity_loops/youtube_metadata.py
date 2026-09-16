"""Shared Cognistration YouTube metadata policy for generated and retroactive uploads."""

from __future__ import annotations

import hashlib
import time
from typing import Iterable

CTA = "Explore the interactive Cognistration machine and build your own listening session."
IOS_APP_URL = "https://apps.apple.com/us/app/cognistration/id6780132617"
IOS_APP_CTA = f"Get Cognistration on iOS: {IOS_APP_URL}"
DREAM_EXPLORATION = (
    "Dream-state exploration: If you are curious about deep dreaming, lucid dreaming, or astral projection traditions, "
    "treat sound as a personal reflection cue rather than a guaranteed trigger. Practical, low-pressure tactics include "
    "setting one intention before sleep, keeping a dream journal beside the bed, using a comfortable volume, and "
    "writing down impressions immediately after waking. Stop if the experience feels unsettling, and never use audio "
    "while driving or operating equipment. Cognistration does not claim to induce dreams, out-of-body experiences, "
    "or medical outcomes."
)

TITLE_HOOKS = [
    "What Is a Binaural Differential? #shorts",
    "How Carrier Frequency Shapes a Listening Session #shorts",
    "Alpha vs Theta: What the Labels Mean #shorts",
    "What Does a 6 Hz Differential Mean? #shorts",
    "What Does a 10 Hz Differential Mean? #shorts",
    "What Does a 16 Hz Differential Mean? #shorts",
    "Can Two Tones Shape a Listening Ritual? #shorts",
    "How Left + Right Carriers Create a Beat #shorts",
    "A Calm Audio Experiment for Clearer Attention #shorts",
    "What Is a Carrier Frequency in Audio? #shorts",
    "Why the Differential Matters More Than One Tone #shorts",
    "A Visual Guide to Stereo Carrier Frequencies #shorts",
    "Theta, Alpha, and Beta: A Listening Map #shorts",
    "What Changes When the Differential Sweeps? #shorts",
    "How to Explore Frequency Without Hype #shorts",
    "A Stereo Experiment for Focus Transitions #shorts",
    "What Does Clarity Mean in a Listening Session? #shorts",
    "The Audio Design Behind a Quiet Reset #shorts",
    "How Frequency Labels Relate to Attention #shorts",
    "A Grounded Look at Sound and Consciousness #shorts",
    "What a 40 Hz Differential Can Represent #shorts",
    "From Active Focus Toward Quiet Reflection #shorts",
    "Why Headphones Matter for Two-Tone Audio #shorts",
    "How Cognistration Visualizes a Binaural Beat #shorts",
    "A 90-Second Carrier Frequency Experiment #shorts",
    "What to Notice During a Frequency Sweep #shorts",
    "Can Sound Change What You Notice? #shorts",
    "A Practical Way to Explore Stereo Sound #shorts",
    "Build a Listening Ritual Around One Session #shorts",
    "Frequency Ranges Are Labels, Not Switches #shorts",
]

# These are discovery terms requested for the current analytics experiment. They
# are kept in both the YouTube tag list and the visible description hashtag line.
DISCOVERY_HASHTAGS = [
    "#BinauralBeats",
    "#Frequency",
    "#Cognistration",
    "#StereoSound",
    "#AudioExperiment",
    "#Shorts",
]

DISCOVERY_TAGS = [
    "binaural beats",
    "frequency",
    "binaural frequency",
    "cognistration",
    "stereo sound",
    "audio experiment",
    "brainwave audio",
    "focus ritual",
    "shorts",
]

DAILY_COPY = {
    "monday": (
        "A calmer way to start a focus session",
        "When your attention feels scattered, a repeatable listening ritual can make the transition into focused work feel more deliberate. This short explores that idea through clean stereo carriers and a simple Cognistration session."
    ),
    "tuesday": (
        "Two frequencies, one listening pattern",
        "Two nearby tones can create a distinctly different listening experience between the left and right channels. This short shows how Cognistration lets you explore that relationship as an audio experiment."
    ),
    "wednesday": (
        "Can sound change what you notice?",
        "Sound can shape what stands out in a listening environment without promising a guaranteed change in mood, focus, or cognition. This short is a calm, evidence-aware exploration of that idea."
    ),
    "thursday": (
        "A 90-second audio reset for scattered attention",
        "A repeatable start-of-session ritual can make it easier to move from a busy moment into intentional listening. This short shows the kind of stereo session you can explore in Cognistration."
    ),
    "friday": (
        "From scattered to settled: a stereo ritual",
        "Cognistration gives you a visual way to shape a listening moment with left/right carriers, timing, and a simple session flow. This is a product demonstration and audio design experiment."
    ),
    "saturday": (
        "Watch left and right channels move together",
        "See how the left and right channels interact inside a live Cognistration session. The visualizer makes the stereo relationship easier to follow while you explore the sound."
    ),
    "sunday": (
        "Build your own listening ritual",
        "Cognistration is a calm workspace for exploring stereo carriers, session timing, and repeatable listening routines. This short offers a quick look at how the experience comes together."
    ),
}

FREQUENCY_CONTEXT = {
    "monday": (
        "Frequency context: this session moves from a 15 Hz beta-range differential toward 4.8 Hz, near the upper theta range. "
        "Best treated as an active-to-reflective listening transition: start with a clear task, then make room for quieter noticing. "
        "These labels describe the audio design, not a guaranteed change in consciousness, focus, or brain state."
    ),
    "tuesday": (
        "Frequency context: this session rises from 6 Hz theta through alpha toward a 16 Hz beta-range differential. "
        "Best treated as a gradual warm-up from inward reflection toward structured attention. "
        "These labels describe the audio design, not a guaranteed change in consciousness, focus, or brain state."
    ),
    "wednesday": (
        "Frequency context: this session moves from a 10 Hz alpha-range differential toward 5 Hz theta. "
        "Best treated as a relaxed-alertness-to-reflection experiment for journaling, creative work, or a quieter reset. "
        "These labels describe the audio design, not a guaranteed change in consciousness, focus, or brain state."
    ),
    "thursday": (
        "Frequency context: this session sweeps from 10 Hz alpha toward a 40 Hz gamma-range differential. "
        "Best treated as a vivid changing-attention experiment rather than a concentration promise or a control over consciousness."
    ),
    "friday": (
        "Frequency context: this session descends from a 40 Hz gamma-range differential toward 9.5 Hz alpha. "
        "Best treated as an intensity-to-relaxed-alertness transition for reviewing, resetting, or closing a work block. "
        "These labels describe the audio design, not a guaranteed change in consciousness, focus, or brain state."
    ),
    "saturday": (
        "Frequency context: this session moves from an 18 Hz beta-range differential toward 2.2 Hz, near the delta range. "
        "Best treated as an evening wind-down experiment, not sleep treatment or a guaranteed route to a particular state of consciousness."
    ),
    "sunday": (
        "Frequency context: this session moves from 6.5 Hz theta toward 4 Hz, the lower edge of the theta range. "
        "Best treated as a quiet reflection cue if that fits your routine, without promising a specific dream or consciousness outcome."
    ),
}

WORKSHOP_TITLES = {
    "monday": "Build a Stereo Listening Ritual #shorts",
    "tuesday": "Watch Left + Right Channels Move Together #shorts",
    "wednesday": "A Quick Tour of the Cognistration Workshop #shorts",
    "thursday": "Explore a New Binaural Session #shorts",
    "friday": "Shape the Listening Moment in Workshop #shorts",
    "saturday": "Two Frequencies, One Moving Visualizer #shorts",
    "sunday": "Make Your Listening Session Yours #shorts",
}


def title_from_seed(seed: str | None) -> str:
    value = str(seed or time.time_ns())
    digest = hashlib.sha256(value.encode("utf-8")).hexdigest()
    return TITLE_HOOKS[int(digest[:8], 16) % len(TITLE_HOOKS)]


def dedupe(items: Iterable[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for item in items:
        value = str(item).strip()
        key = value.casefold()
        if value and key not in seen:
            seen.add(key)
            result.append(value)
    return result


def hashtags_line() -> str:
    return " ".join(DISCOVERY_HASHTAGS)


def with_metadata_policy(
    title: str,
    description: str,
    tags: Iterable[str],
    *,
    append_dream_exploration: bool = True,
) -> dict[str, object]:
    """Normalize generated metadata without making unsupported outcome claims."""
    clean_title = " ".join(str(title).split()).strip()
    clean_description = str(description).strip()
    hook = clean_title.removesuffix(" #shorts")
    if not clean_description.startswith(hook):
        clean_description = f"{hook} — {clean_description}"
    if CTA not in clean_description:
        clean_description = f"{clean_description.rstrip()}\n\n{CTA}"
    if IOS_APP_URL not in clean_description:
        clean_description = f"{clean_description.rstrip()}\n\n{IOS_APP_CTA}"
    if append_dream_exploration and "Dream-state exploration:" not in clean_description:
        clean_description = f"{clean_description.rstrip()}\n\n{DREAM_EXPLORATION}"
    if hashtags_line() not in clean_description:
        clean_description = f"{clean_description.rstrip()}\n\n{hashtags_line()}"
    clean_tags = dedupe([*tags, *DISCOVERY_TAGS])
    return {"title": clean_title, "description": clean_description, "tags": clean_tags}


def daily_metadata(day: str, seed: str | None = None) -> dict[str, object]:
    key = day.casefold()
    _, description = DAILY_COPY.get(key, DAILY_COPY["sunday"])
    title = title_from_seed(seed or f"daily-{key}-{time.time_ns()}")
    description = f"{description}\n\n{FREQUENCY_CONTEXT.get(key, FREQUENCY_CONTEXT['sunday'])}"
    return with_metadata_policy(
        title,
        description,
        ["cognitive orchestration", "cognistration"],
        append_dream_exploration=False,
    )


def workshop_metadata(day: str, seed: str | None = None) -> dict[str, object]:
    key = day.casefold()
    title = title_from_seed(seed or f"workshop-{key}-{time.time_ns()}")
    description = (
        "Watch Cognistration's Workshop turn left/right stereo carriers into a visible listening session. "
        "You can follow the waveforms, explore a changing frequency relationship, and shape a repeatable audio ritual."
    )
    return with_metadata_policy(title, description, ["cognistration", "workshop demo", "wave visualization", "stereo sound", "binaural audio"])
