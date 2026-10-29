#!/usr/bin/env python3
"""Per-brain-state title, description, and discovery tags for Cognistration Shorts.

One source of truth, used by the cloud renderer (which stamps the copy onto the
Drive file) and by the local uploader.

Copy rules:
  - factual neuroscience first, then the felt experience
  - no em dashes, no middle dots
  - no medical claims, no treatment language, no government program framing
  - no URLs in the body (the channel keeps descriptions link free)
"""

# Discovery terms live in both the visible hashtag line and the tag metadata.
TAGS = [
    "binaural beats", "audio design", "theta waves", "alpha waves", "delta waves",
    "gamma waves", "beta waves", "meditation", "auditory science",
    "listening practice", "headphones", "experimental audio", "cognistration",
]

NEURO = {
    "delta": (
        "Delta is a label commonly used for EEG activity around 0.5 to 4 Hz. This "
        "session places a 2.5 Hz difference between two tones, one per ear. It is an "
        "audio design experiment; it does not guarantee sleep, restoration, or a "
        "change in brain activity."
    ),
    "theta": (
        "Theta is a label commonly used for EEG activity around 4 to 8 Hz. This "
        "session uses a 6 Hz difference between two tones. Research on binaural-beat "
        "perception and effects varies; no mental state or cognitive outcome is "
        "guaranteed."
    ),
    "alpha": (
        "Alpha is a label commonly used for EEG activity around 8 to 13 Hz. This "
        "session uses a 10 Hz difference between two tones. Treat the range as an "
        "audio-design reference, not a promise of relaxation or alertness."
    ),
    "smr": (
        "SMR is a label used in some EEG and neurofeedback contexts for activity "
        "around 12 to 15 Hz. This session uses a 13 Hz difference tone. It is audio "
        "experimentation, not neurofeedback or treatment, and does not promise a "
        "change in attention or movement."
    ),
    "beta": (
        "Beta is a label commonly used for EEG activity around 13 to 30 Hz. This "
        "session uses an 18 Hz difference between two tones. It is an exploratory "
        "listening cue, not a guaranteed way to change focus, alertness, or cognition."
    ),
    "gamma": (
        "Gamma is a broad label used for EEG activity above roughly 30 Hz. This "
        "session uses a 38 Hz difference tone; perception varies between listeners. "
        "It is an audio experiment, not a guaranteed cognitive or health effect."
    ),
}

OUTCOME = {
    "delta": "Delta-range listening experiment",
    "theta": "Theta-range listening experiment",
    "alpha": "Alpha-range listening experiment",
    "smr":   "SMR-range listening experiment",
    "beta":  "Beta-range listening experiment",
    "gamma": "Gamma-range listening experiment",
}

TITLE = {
    "delta": "Delta 2.5 Hz | Binaural Audio Experiment",
    "theta": "Theta 6 Hz | Binaural Audio Experiment",
    "alpha": "Alpha 10 Hz | Binaural Audio Experiment",
    "smr":   "SMR 13 Hz | Binaural Audio Experiment",
    "beta":  "Beta 18 Hz | Binaural Audio Experiment",
    "gamma": "Gamma 38 Hz | Binaural Audio Experiment",
}

FOOTER = (
    "Headphones are required, since the two ears have to hear two different tones "
    "for the phantom beat to exist. Listen at a comfortable volume.\n\n"
    "Cognistration is an exploration tool, not a medical device, and nothing here "
    "is a treatment for any condition. If you have a seizure disorder, tinnitus, "
    "or a hearing concern, talk to a clinician before experimenting with tones."
)


def build(brain_state: str, duration_sec: float, carrier_hz: float, beat_hz: float) -> dict:
    """Return title, description, and tags for one queue item."""
    state = brain_state if brain_state in NEURO else "theta"
    right_hz = carrier_hz + beat_hz
    outcome = OUTCOME[state]

    description = "\n".join([
        f"{outcome}.",
        "",
        NEURO[state],
        "",
        f"This session: {carrier_hz:.0f} Hz in the left ear, {right_hz:.1f} Hz in the "
        f"right ear, so the beat lands at {beat_hz:.1f} Hz. Length {duration_sec:.0f} seconds.",
        "",
        FOOTER,
        "",
        " ".join("#" + t.replace(" ", "").replace("-", "") for t in TAGS[:12]),
    ])

    return {
        "title": TITLE[state],
        "description": description,
        "tags": list(TAGS),
        "outcome": outcome,
        "brainState": state,
    }


if __name__ == "__main__":
    import argparse
    import json

    ap = argparse.ArgumentParser(description="Print Shorts metadata as JSON")
    ap.add_argument("--state", required=True)
    ap.add_argument("--duration", type=float, default=65.0)
    ap.add_argument("--carrier", type=float, default=200.0)
    ap.add_argument("--beat", type=float, default=None)
    args = ap.parse_args()

    from render_batch import BEAT_HZ  # noqa: E402  (same directory)

    beat = args.beat if args.beat is not None else BEAT_HZ.get(args.state, 6.0)
    print(json.dumps(build(args.state, args.duration, args.carrier, beat), indent=2))
