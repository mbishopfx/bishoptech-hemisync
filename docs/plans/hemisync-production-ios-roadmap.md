# HemiSync Production Theme + iOS Roadmap

> **For Hermes:** Use this plan task-by-task before implementation.

**Goal:** Turn BishopTech HemiSync into a production-grade web platform with premium branding, Gemini-powered AI workflows, per-user storage and tiers, community/session tracking, and a clean path to a native iOS app.

**Architecture:** Keep the Next.js web app as the system of record and the marketing/admin surface. Use Supabase for auth, Postgres, storage, and RLS. Use a provider layer for AI so Gemini AI Studio can power journaling, session coaching, moderation, and future community tooling without binding product logic to one vendor. Keep the audio engine server-side for renders, and let the iOS app consume the same APIs and storage.

**Tech Stack:** Next.js App Router, React, Tailwind, Supabase, Gemini API, current Node audio pipeline, AVFoundation/SwiftUI for iOS, Supabase Swift SDK, optionally AudioKit later if native synthesis is needed.

---

## What already exists

- Web app routes: `/`, `/generate`, `/api/audio/*`, `/api/journal`, `/api/chat`
- Supabase schema for `profiles`, `session_specs`, `chat_messages`, `renders`
- Current theme is already partially premium, but it needs a stronger product identity and a less template-like finish
- Two new design references are available:
  - `newfrontpage.html` = marketing / landing direction
  - `newdash.html` = dashboard / builder direction

## Immediate product direction

1. Make `newfrontpage.html` the source of truth for the public homepage aesthetic.
2. Make `newdash.html` the source of truth for the authenticated dashboard / builder aesthetic.
3. Keep the design dark, cinematic, and high-contrast, but reduce the generic AI/glow look.
4. Route product flows cleanly so every button lands somewhere real.
5. Build the data model first so web and iOS share the same backend truth.

---

## Phase 1: Production theme overhaul

### Task 1: Lock the visual system

**Objective:** Convert the new HTML direction into a reusable design system for the app.

**Files to touch:**
- Modify: `app/globals.css`
- Modify: `app/layout.js`
- Modify: `components/ui/*` as needed
- Modify: `components/visuals/*` as needed

**Work:**
- Define a premium palette, gradients, and elevation scale
- Add reusable surface classes for glass panels, cards, sections, and action bars
- Standardize typography scale and spacing tokens
- Ensure mobile breakpoints feel native, not desktop-shrunk
- Add motion rules that feel restrained and expensive

**Acceptance:**
- Homepage and dashboard look like the same product family
- Buttons, cards, and panels share a consistent visual system
- No random neon clutter or mismatched shadows

### Task 2: Rebuild the homepage from `newfrontpage.html`

**Objective:** Turn the landing page into a polished, conversion-ready homepage.

**Files to touch:**
- Modify: `app/page.js`
- Possibly create: `components/marketing/*`

**Work:**
- Translate the HTML sections into React components
- Keep the hero, social proof, workflow, and product explanation sections
- Make CTAs route to real app paths
- Add concise, premium copy that explains what HemiSync is without sounding clinical or hypey

**Primary routes:**
- Hero CTA → `/generate`
- Secondary CTA → `/pricing` or `/library`
- Community CTA → `/community`
- Session history CTA → `/sessions`

**Acceptance:**
- Public visitors understand the product in under 10 seconds
- The homepage feels premium on mobile and desktop
- No dead links or placeholder anchors

### Task 3: Rebuild the dashboard from `newdash.html`

**Objective:** Make the builder/dashboard feel like a real studio, not an MVP.

**Files to touch:**
- Modify: `app/generate/page.jsx`
- Possibly create: `app/dashboard/page.jsx`
- Possibly create: `components/dashboard/*`

**Work:**
- Break the dashboard into reusable sections: current session, builder controls, waveform/preview, saved sessions, session stats
- Use the new dashboard HTML as the layout and motion reference
- Make the UI support real navigation and real state instead of static mock values
- Add empty states for new users and low-tier users

**Acceptance:**
- The dashboard visually matches the new design direction
- Core actions are obvious: build, save, play, export, share
- Dashboard scales cleanly to mobile

---

## Phase 2: Backend readiness for premium audio generation

### Task 4: Stabilize the audio pipeline

**Objective:** Make the render engine predictable, high quality, and easy to evolve.

**Files to touch:**
- Review/modify: `lib/audio/*`
- Review/modify: `app/api/audio/generate/route.js`
- Review/modify: `app/api/audio/combined/route.js`
- Review/modify: `app/api/audio/journey/route.js`

**Work:**
- Confirm the audio engine uses a deterministic synthesis path
- Separate preview generation from full render generation
- Keep mastering, normalization, and artifact writing isolated
- Add guardrails for max length, loudness, and render time

**Acceptance:**
- Full renders are reproducible
- Previews do not require the same cost as full renders
- The backend can survive growth without becoming brittle

### Task 5: Add an AI provider abstraction and Gemini integration

**Objective:** Replace hardwired AI calls with a provider layer that can use Gemini AI Studio.

**Files to touch:**
- Modify: `lib/openai/client.js` or replace with a provider-agnostic client
- Modify: `app/api/chat/route.js`
- Modify: `app/api/journal/route.js`
- Modify: any AI helper modules under `lib/ai/*`

**Work:**
- Create a single AI gateway module with provider selection
- Use Gemini for journaling, prompts, summaries, moderation, session coaching, and community moderation
- Keep schema outputs structured so backend logic stays deterministic
- Add a fallback path if Gemini is unavailable

**Acceptance:**
- No app logic depends directly on vendor-specific response formats
- AI calls are isolated and testable
- Gemini key can be swapped through env vars only

### Task 6: Add user buckets and per-user render storage

**Objective:** Give every user a secure storage boundary for their generations.

**Files to touch:**
- Modify: `supabase/migrations/202409240001_init.sql`
- Modify: `app/api/chat/route.js`
- Modify: `app/api/audio/*`
- Modify: any Supabase storage helper modules

**Work:**
- Use per-user buckets or bucket-scoped folder namespaces for renders
- Keep upload/download access locked to the authenticated user
- Store metadata for each render: template, length, state, timestamps, format links

**Acceptance:**
- One user cannot see another user’s renders
- Render files are tied to session records
- Storage access follows RLS rules

---

## Phase 3: Tiering and retention rules

### Task 7: Implement free tier limits

**Objective:** Enforce the business model cleanly without hurting the user experience.

**Files to touch:**
- Modify: `supabase/migrations/*`
- Modify: `lib/auth/user.js`
- Modify: `app/api/audio/generate/route.js`
- Modify: any billing/entitlement helpers

**Work:**
- Add subscription/tier fields to the profile model
- Allow one free saved generation for free-tier users
- Block additional saves with a friendly upgrade prompt
- Preserve preview access while gating save/export behavior as needed

**Acceptance:**
- Free users can experience the product before upgrading
- The one-free-save rule is enforced server-side
- Upgrade messaging feels helpful, not punitive

### Task 8: Add pricing/entitlement state in the UI

**Objective:** Make tier status visible inside the product.

**Files to touch:**
- Modify: `app/page.js`
- Modify: `app/generate/page.jsx`
- Add: `components/billing/*` if needed

**Work:**
- Show save counts, usage limits, and upgrade prompts in context
- Create clear locked states for premium actions
- Add a pricing page when the design is finalized

**Acceptance:**
- Users understand what is free, what is saved, and what is premium
- The upgrade path is obvious and calm

---

## Phase 4: Community and session logging

### Task 9: Build session logs and analytics

**Objective:** Let users track what they made, how long they listened, and how it affected them.

**Files to touch:**
- Modify: `supabase/migrations/*`
- Modify: `app/api/journal/route.js`
- Add: `app/api/sessions/*`
- Add: `components/analytics/*`

**Work:**
- Add tables for session playback, listens, favorites, notes, and ratings
- Track generated session metadata and listening completion
- Add charts for streaks, time spent, and favorite states

**Acceptance:**
- Users can see their history
- Session records support future coaching and recommendations
- Analytics feel useful, not noisy

### Task 10: Add community features

**Objective:** Create a social layer around sessions without making the app messy.

**Files to touch:**
- Add: `app/community/*`
- Add: `app/api/community/*`
- Modify: `supabase/migrations/*`

**Work:**
- Add public or semi-public shared session cards
- Allow likes, comments, and shared templates
- Add moderation and report flows
- Keep privacy controls explicit

**Acceptance:**
- Community content is safe and optional
- Sharing is useful for discovery, not spammy
- Moderation has obvious backend support

---

## Phase 5: iOS app plan

### Task 11: Define the iOS architecture

**Objective:** Make the web platform mobile-ready without redoing the backend.

**Recommended framework:**
- SwiftUI for screens and navigation
- AVFoundation for playback and downloads
- Supabase Swift SDK for auth, profile, buckets, sessions, and community data
- Optional AudioKit later only if native synthesis is needed on-device

**Work:**
- Use the same backend APIs and storage
- Make the iOS app a client, not a second backend
- Support login, session browsing, playback, favorites, notes, and uploads

**Acceptance:**
- The iOS app can ship without duplicating the audio engine
- Web and mobile share the same account and session model

### Task 12: Decide what must be native vs web-backed

**Objective:** Prevent overbuilding the iOS app.

**Recommendation:**
- Native: login, dashboard, playback, offline downloads, session logging, notifications
- Web-backed: generation requests, AI coaching, community moderation, pricing, account settings

**Acceptance:**
- Mobile work stays focused and shippable
- Heavy generation stays on the server where it belongs

---

## Phase 6: Deployment and release discipline

### Task 13: Lock main-branch deployments

**Objective:** Keep Railway and Vercel deployments clean and predictable.

**Rules:**
- All git deployments go through `main`
- No direct deploys from feature branches
- Merge only after theme, API, and data changes pass validation

**Files to touch:**
- `README.md`
- `railway.json`
- deployment docs if needed

**Acceptance:**
- The deployment path is documented
- Environment variables are documented for Gemini, Supabase, and storage
- Main branch remains the production source of truth

---

## Suggested build order

1. Theme system
2. Homepage rebuild
3. Dashboard rebuild
4. Gemini provider abstraction
5. Tiering and free-save rule
6. User buckets and storage policies
7. Session logging and analytics
8. Community features
9. iOS architecture and first native shell
10. Deployment hardening

---

## Key open decisions to resolve next

- Should the visual brand stay aligned to the current Astral Architect direction, or should HemiSync get a new product name and identity?
- Do you want Gemini to replace all AI calls, or only journaling/coaching/moderation at first?
- Should the iOS app launch as a companion client first, or should we build a full native generation UI later?

---

## Recommended next move

As soon as you send `design.md`, I should turn this into a concrete implementation blueprint with:
- exact component hierarchy
- exact route map
- database migration list
- AI provider module design
- iOS app module breakdown
- deployment checklist
