# Agentic Platform Redesign & Tone Library Plan

## Background & Motivation
The goal is to transition the platform to a minimalist, "agentic" look and feel inspired by `lovable.dev`. The core user experience will be simplified to a central, plain-text input on the landing page where users describe how they are feeling. An LLM will parse this mood and instantly orchestrate the appropriate 3-minute binaural/iso-chronic tone to help them re-center. 

## Scope & Impact
- **Audio Library:** Pre-generation of ~100 distinct 3-minute tracks spanning various brain states (Alpha, Beta, Theta, Gamma, Delta).
- **Agentic AI:** Integration with Gemini API (`gemini-3-flash-preview`) to match natural language mood inputs to the pre-generated audio tracks.
- **Access Control:** Allowing exactly 1 free generation without an account, enforced via `localStorage`, followed by a signup wall.
- **UI/UX Redesign:** A complete visual overhaul of the landing page and the logged-in dashboard to reflect the new agentic design language (dark mode, glassmorphism, Framer Motion animations, minimalist layout), moving away from default Shadcn styling.

## Proposed Solution

### Phase 1: Tone Library Pre-Generation
1. Create a Node.js script (`scripts/generate-tone-library.mjs`).
2. Define a diverse set of 100 parameters mapping to different states (e.g., deep focus/beta, relaxation/alpha, meditation/theta, sleep/delta) with variations in background noise (pink/brown) and carrier waves.
3. Execute the script to generate the 3-minute audio buffers using the existing `pipeline.js` and upload them to Supabase Storage.
4. Save the track metadata (id, target mood/state, frequencies, URL) to a new Supabase table or a static JSON catalog.

### Phase 2: Gemini Mood-to-Tone Engine
1. Implement a new AI utility (`lib/ai/gemini-matcher.js`) utilizing the provided Gemini API key.
2. The prompt will provide Gemini with the catalog of 100 tracks and instruct it to select the most appropriate `trackId` and return an encouraging, agentic 1-sentence response based on the user's input.
3. Create a Next.js Route Handler (`app/api/agent/route.js`) to process the request.

### Phase 3: Agentic UI Redesign
1. Create the new visual language in `Design.md` (see `conductor/Design.md`).
2. **Landing Page (`app/page.js`):** Replace current hero with a centered, glowing text input area. Add smooth Framer Motion enter animations.
3. **Dashboard (`app/dashboard/page.jsx`):** Align the layout to the new sleek look. Keep the sidebar/tools but restyle them with glassmorphism and minimal borders. 

### Phase 4: Free Tier Tracking (LocalStorage)
1. In the landing page component, track usage via `localStorage.getItem('free_generation_used')`.
2. On successful generation, set the flag.
3. If the user attempts a second generation without a valid session, show a beautiful, agentic signup modal.

## Alternatives Considered
- **Dynamic On-the-Fly Generation:** Considered mapping the prompt to audio parameters and synthesizing in real-time. **Rejected** in favor of pre-generation to ensure instant playback (reducing the ~5-10s synthesis latency).
- **IP-based Rate Limiting:** Considered tracking the free tier via edge middleware and IP. **Rejected** for the simpler `localStorage` approach to prioritize development speed, as requested.

## Verification & Testing
1. Run the generation script and verify 100 tracks are successfully saved to Supabase Storage.
2. Test the Gemini agent endpoint with diverse inputs ("I'm super stressed", "I need to focus on coding") to ensure accurate track selection.
3. Verify the `localStorage` correctly blocks a second attempt and routes to the signup flow.
4. Visually inspect the landing page and dashboard against the `Design.md` guidelines.

## Migration & Rollback
- The old `/api/audio/generate` endpoint will remain intact to avoid breaking any existing features.
- The UI changes are standard React updates; rollback is as simple as reverting the git commit.
