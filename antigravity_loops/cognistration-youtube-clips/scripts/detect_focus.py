#!/usr/bin/env python3
"""Build a smoothed face-aware object-position track for a clip."""
from __future__ import annotations

import argparse
import json
from pathlib import Path


def center_track(duration: float, fps: float) -> list[dict]:
    step = max(1, round(fps * 0.5))
    total_frames = max(1, round(duration * fps))
    return [
        {"frame": frame, "xPct": 50.0, "yPct": 50.0, "facePresent": False, "confidence": 0.0}
        for frame in range(0, total_frames + 1, step)
    ]


def write_result(metadata: dict, metadata_path: Path, public_path: Path, result: dict) -> None:
    metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    public_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    print(json.dumps(result))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True, type=Path)
    parser.add_argument("--metadata", required=True, type=Path)
    parser.add_argument("--public-metadata", required=True, type=Path)
    parser.add_argument(
        "--model",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "models" / "face_detection_yunet_2023mar.onnx",
    )
    parser.add_argument("--sample-seconds", type=float, default=0.5)
    args = parser.parse_args()

    metadata = json.loads(args.metadata.read_text(encoding="utf-8"))
    duration = float(metadata["clipDurationSeconds"])
    fps = float(metadata.get("fps", 30))

    try:
        import cv2
    except ImportError:
        track = center_track(duration, fps)
        metadata["focusMode"] = "center-fallback-opencv-unavailable"
        metadata["focusTrack"] = track
        write_result(metadata, args.metadata, args.public_metadata, {
            "focusMode": metadata["focusMode"], "samples": len(track), "faces": 0,
        })
        return

    if not args.model.exists():
        track = center_track(duration, fps)
        metadata["focusMode"] = "center-fallback-face-model-unavailable"
        metadata["focusTrack"] = track
        write_result(metadata, args.metadata, args.public_metadata, {
            "focusMode": metadata["focusMode"], "samples": len(track), "faces": 0,
        })
        return

    detector = cv2.FaceDetectorYN_create(str(args.model), "", (320, 320), 0.65, 0.3, 5000)
    capture = cv2.VideoCapture(str(args.video))
    source_fps = capture.get(cv2.CAP_PROP_FPS) or fps
    total_frames = max(1, round(duration * fps))
    source_frame_count = max(1, round(capture.get(cv2.CAP_PROP_FRAME_COUNT)))
    step_frames = max(1, round(source_fps * args.sample_seconds))
    track: list[dict] = []
    last_x, last_y = 0.5, 0.5
    faces_found = 0

    for source_frame in range(0, source_frame_count + 1, step_frames):
        capture.set(cv2.CAP_PROP_POS_FRAMES, source_frame)
        ok, frame = capture.read()
        if not ok:
            break
        height, width = frame.shape[:2]
        detector.setInputSize((width, height))
        _, detected_faces = detector.detect(frame)
        faces = list(detected_faces) if detected_faces is not None else []
        face_present = len(faces) > 0
        confidence = 0.0
        if face_present:
            faces_found += 1
            # YuNet rows: x, y, w, h, landmarks..., confidence.
            face = max(faces, key=lambda item: float(item[2] * item[3]))
            x, y, w, h = [float(value) for value in face[:4]]
            target_x = (x + w / 2) / width
            target_y = (y + h / 2) / height
            confidence = float(face[-1])
            # Smooth movement to avoid jitter between sampled frames.
            last_x = last_x * 0.62 + target_x * 0.38
            last_y = last_y * 0.62 + target_y * 0.38
        else:
            # Center cutaways and non-human shots instead of holding a stale
            # presenter position across the entire visual sequence.
            last_x = last_x * 0.85 + 0.5 * 0.15
            last_y = last_y * 0.85 + 0.5 * 0.15
        frame_number = min(total_frames, round((source_frame / max(source_fps, 1.0)) * fps))
        track.append({
            "frame": frame_number,
            "xPct": round(last_x * 100, 3),
            "yPct": round(last_y * 100, 3),
            "facePresent": face_present,
            "confidence": round(confidence, 3),
        })

    capture.release()
    if not track:
        track = center_track(duration, fps)
    metadata["focusMode"] = "face-aware-yunet-smoothed" if faces_found else "center-fallback-no-face"
    metadata["focusTrack"] = track
    metadata["focusSamples"] = len(track)
    metadata["faceSamples"] = faces_found
    write_result(metadata, args.metadata, args.public_metadata, {
        "focusMode": metadata["focusMode"],
        "samples": len(track),
        "faces": faces_found,
        "durationSeconds": duration,
    })


if __name__ == "__main__":
    main()
