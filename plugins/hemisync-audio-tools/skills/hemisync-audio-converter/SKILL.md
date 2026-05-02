---
name: hemisync-audio-converter
description: Convert a local audio file into a stereo hemisync-style output by preserving the source bed and applying controlled left/right frequency patterns, staged beat plans, gain, and safety metadata.
---

# HemiSync Audio Converter

Use this skill when the user gives Codex a local audio file and asks to convert it into a hemisync, binaural, stereo entrainment, left/right frequency, or brainwave-patterned output.

## Workflow

1. Confirm the input file exists and choose an output path next to it unless the user specifies one.
2. Use the bundled script:

```bash
node plugins/hemisync-audio-tools/scripts/hemisync_convert.mjs \
  --input /path/source.wav \
  --output /path/source-hemisync.wav \
  --beat 7 \
  --carrier 236 \
  --mix-db -18 \
  --headroom-db -1
```

3. For a staged plan, pass JSON:

```bash
node plugins/hemisync-audio-tools/scripts/hemisync_convert.mjs \
  --input /path/source.mp3 \
  --output /path/source-theta.wav \
  --plan '[{"at":0,"hz":10},{"at":0.35,"hz":7},{"at":1,"hz":5.2}]'
```

4. Return the output audio path and metadata path. Keep copy claim-careful: this is wellness/focus audio support, not medical treatment.

## Safety Defaults

- Beat frequency must stay from 0.5 to 40 Hz.
- Carrier must stay from 80 to 1000 Hz.
- Overlay mix defaults to -18 dB.
- Output is normalized to the requested headroom.
- Warn users to use headphones at moderate volume and never while driving.
