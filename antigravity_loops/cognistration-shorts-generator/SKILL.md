---
name: cognistration-shorts-generator
description: "Generates 5 vertical YouTube Shorts variations with padded square images, vertical clips, and random TTS audio slices."
---

# Cognistration Shorts Generator Skill

This package automates compiling vertical (9:16) YouTube Shorts by mixing square stills, short vertical video assets, and ElevenLabs voiceovers.

## Assets Sourced
- Stills: `/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG/CognistrationStills/`
- Shorts: `/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG/CognistrationShorts/`
- TTS: `/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG/CognistrationTTS/`

## Layout Rules
- **Stills**: Scaled to width 1080 and padded to 1080x1920 with solid white background.
- **Shorts**: Scaled directly to 1080x1920.

## Output
- Directory: `/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG/shorts_varieties/output_5_shorts/`
- Contents: `shorts_variety_01.mp4` through `shorts_variety_05.mp4` and `shorts_metadata.md` containing upload copy-paste metadata (Title, Description, Tags).

## Execution
Run the loop by executing the shell script in this directory:
```bash
./run.sh
```
