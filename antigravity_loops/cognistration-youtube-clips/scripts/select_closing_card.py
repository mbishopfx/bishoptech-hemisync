#!/usr/bin/env python3
"""Select and validate one Cognistration iOS CTA image for a clip run."""
from __future__ import annotations

import argparse
import hashlib
from pathlib import Path

CARDS = [
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/take_back_control.png"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/breathe_relax_recharge.png"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/slide5_build_mindful_habits.png"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/slide4_silence_digital_noise.png"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/detox_for_the_mind.png"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/slide3_custom_binaural_beats.png"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/slide2_enter_deep_flow_state.png"),
    Path("/Users/matthewbishop/BishopTech.dev/bishoptech-cognistration-ios/appstorepics/slide1_tune_your_brain_waves.png"),
]


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--job-id", required=True)
    args = parser.parse_args()
    missing = [str(path) for path in CARDS if not path.is_file()]
    if missing:
        raise SystemExit("Missing CTA image assets: " + "; ".join(missing))
    digest = hashlib.sha256(args.job_id.encode("utf-8")).digest()
    index = int.from_bytes(digest[:4], "big") % len(CARDS)
    print(CARDS[index])


if __name__ == "__main__":
    main()
