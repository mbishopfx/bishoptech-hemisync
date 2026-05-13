# Design System: Agentic Interface (Lovable.dev Inspired)

## Core Philosophy
The interface should feel like an intelligent, quiet operating system. It does not shout; it waits. When it acts, it is precise, smooth, and purposeful. We are moving away from standard SaaS dashboard components (like default Shadcn) towards a seamless, app-like experience heavily utilizing dark themes, subtle glows, and glassmorphism.

## Color Palette
- **Background:** True Black (`#000000`) to Deep Charcoal (`#0A0A0A`).
- **Foreground (Text):** 
  - Primary: Pure White (`#FFFFFF`) with 90% opacity for high contrast without eye strain.
  - Secondary: Slate/Zinc (`#A1A1AA` or `#71717A`) for helper text.
- **Accents (The "Agentic Glow"):**
  - Cyan/Neon Blue: `#06B6D4` / `#3B82F6` (used for active states, AI generation states).
  - Soft Purple: `#8B5CF6` (used for deep meditation/theta states).
  - Amber/Orange: `#F59E0B` (used for high energy/beta states).
- **Borders:** Extremely subtle. `#FFFFFF` at 10% opacity (`border-white/10`).

## Typography
- **Primary Font:** Sans-serif, highly legible (e.g., Inter, Geist, or system-ui).
- **Monospace (Terminal elements):** JetBrains Mono or Fira Code for technical details (frequencies, track IDs).
- **Hierarchy:**
  - Giant, thin headers for the main input/greeting.
  - Small, tracked-out uppercase caps for metadata.

## Core UI Components

### 1. The Omnibar (Main Input)
The centerpiece of the landing page.
- **Look:** A large, centered input field. No harsh borders, just a subtle inner shadow or a thin, glowing border when focused.
- **Behavior:** Expands slightly on focus (Framer Motion `scale: 1.02`). 
- **Placeholder:** "How are you feeling right now?" or "What do you need to achieve?"

### 2. Cards & Containers (Glassmorphism)
- **Look:** Translucent dark backgrounds (`bg-black/40` to `bg-zinc-900/50`) with strong background blur (`backdrop-blur-xl`).
- **Borders:** `border border-white/5` with an occasional glowing top or bottom edge to indicate active state.

### 3. Buttons
- **Primary:** Instead of solid blocks of color, use dark buttons with glowing borders, or a very subtle gradient background. On hover, the glow intensifies.
- **Text:** Clean, medium weight.

### 4. Animations (Framer Motion)
- **Fade & Slide:** Elements should fade in and slide up slightly (`y: 20` to `y: 0`, `opacity: 0` to `opacity: 1`) with a slow, ease-out spring.
- **The "Thinking" State:** When the AI is processing the mood, the input bar should pulse with a gradient border, or show a subtle wave animation, indicating cognition.

## Layout
- **Landing Page:** Minimalist. No massive feature grids above the fold. Just the Omnibar in the center, perhaps with a subtle, slow-moving ambient mesh gradient in the deep background.
- **Dashboard:** Sidebar should be un-bordered, using hover states to show selection. The main content area should remain clean, focusing on the currently playing track and the visualizer.
