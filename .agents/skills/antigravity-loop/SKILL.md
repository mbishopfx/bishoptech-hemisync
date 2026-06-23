---
name: antigravity-loop
description: "Triggers or manages recursive agentic loops for processing content. Use when the user requests to run, spawn, or schedule a loop, or when executing tasks inside the antigravity_loops folder."
---

# Antigravity Loop Skill

This skill allows agents to run autonomous content-generation loops (e.g., turning blog posts into YouTube scripts, generating storyboard images, and rendering a final landscape video) by launching recursive child agents with full permissions.

## Loop Specifications & Rules

Any agent executing a loop task must adhere to the following rules based on the latest best practices:

### 1. Script Tone, Formatting & Pacing
* **Hook-Based Conversational Tone**: Rewrite scientific blog posts into a high-retention, casual, and easy-to-digest YouTube "talk-through-lesson" style. Focus on engaging hooks and immediate value.
* **Timestamp Format**: Script paragraphs must be prefixed with brackets and spaces in the exact format: `[MM:SS - MM:SS]`.
* **Storyboard Mapping**: The script should be split into 8 large paragraphs (totaling ~3.5 minutes) and mapped to exactly 28 sequential storyboard frames.

### 2. Upgraded Visuals & Storyboard Prompts
* **White Background**: Every prompt must explicitly request a `solid, pure, plain white background. No color, no texture, no gradients, no grey.`
* **Detailed Illustration Style**: Visuals must be requested as `detailed black ink stick-figure illustrations`.
* **Capitalized Text Labels**: Prompts must include instructions for `chalkboard style writing in ALL CAPS saying "[TEXT]"` to serve as clear text labels.
* **Fine Details**: Explicitly prompt for detailed diagrams showing coordinate axes, fine lines, dashed vectors, and arrows to clearly represent the biological or mechanical concepts.

### 3. Audio Timeline Scaling & Video Build
* **Parser Logic**: The build script must parse timestamps from the storyboard prompts section (Part 2) instead of Part 1. This ensures all 28 frame transitions are accurately captured rather than only the 8 paragraph boundaries.
* **Audio Length Scaling**: 
  - Copy the voiceover audio file to the Remotion public folder as `audio.mp3`.
  - Use `ffprobe` to determine the audio duration.
  - Scale all 28 storyboard frame timings proportionally to perfectly match the duration of the audio file.
* **ElevenLabs Wait-Hold**: Wait for the manually generated ElevenLabs TTS audio file to be placed in the project directory before executing the final Remotion render.

### 4. iCloud Asset Delivery
* When the render completes successfully:
  - Move the final compiled video to `/Users/matthewbishop/Library/Mobile Documents/com~apple~CloudDocs/YouTube:TikTok:IG/<slug>/<slug>.mp4`.
  - Move all 28 still frames to the `stills/` subfolder inside the iCloud path and delete local stills to save disk space.
  - Copy the script file to `script.md` in the iCloud folder.

## Execution Protocol

1. **Spawn a Terminal Shell**: Use the `run_command` tool in the workspace root directory.
2. **Execute agy CLI**: Launch the agent CLI with the `--dangerously-skip-permissions` flag to bypass interactive tool approval prompts.
   - Command pattern:
     ```bash
     /Users/matthewbishop/.local/bin/agy --dangerously-skip-permissions --prompt "Your prompt instructing the agent on what loop task to perform."
     ```
3. **Loop Task Prompt**: Inside the `--prompt` argument, instruct the agent to apply these rules to write the script, generate prompts, wait for the voiceover audio, scale the timings, and package everything to iCloud.
