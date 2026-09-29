# Voltrix — Design Reference & Architecture Notes

## 1. Awwwards Reference Analysis & Inspirations

To achieve an Awwwards-level experience for **Voltrix** (an AI-powered app builder), we studied leading design patterns across high-impact developer and AI product platforms:

1. **Linear.app & Vercel** (Product & Workspace Efficiency)
   - *Key takeaway*: The tool interface must be ultra-fast, high-density, keyboard-driven, and uncluttered. Dark background (`#08090C`), crisp subtle borders (`rgba(255,255,255,0.08)`), precise status indicators, minimal decorative animation inside the editor.
   - *Application*: Workspace and Dashboard follow high-density utility, instant tab switching, 3-pane layout, compact badge tags, and clear role permissions (Viewer, Editor, Owner).

2. **Spline.design & Midjourney** (WebGL Art Direction)
   - *Key takeaway*: 3D isn't decoration; it represents the dynamic nature of generative AI. Interactive geometry reacting to mouse physics creates depth without overwhelming readable content.
   - *Application*: A wireframe icosahedron surrounded by orbital node particles and lightning voltage pulses in the Landing Hero, reacting to cursor offset and scroll progress. Calmer background scene on Login/Signup pages.

3. **Refokus & Studio Freight** (Kinetic Typography & Motion Storytelling)
   - *Key takeaway*: Scroll-driven pinning, large display typography (Space Grotesk), smooth Lenis inertia scroll, and custom magnetic cursor states elevate brand perception.
   - *Application*: GSAP ScrollTrigger for pinned feature reveals on the landing page, custom cursor with magnetic hover snaps, micro-interactions, text reveal animations, and marquee tickers.

4. **Raycast / Stripe Web Graphics** (Electric Color System & Glassmorphism)
   - *Key takeaway*: Deep near-black background contrast paired with electric violet and cyan accents gives a futuristic "voltage" feel.
   - *Application*: Primary palette of void black (`#070709`), surface card dark (`#0E0F14`), electric violet (`#8B5CF6`), high-voltage cyan (`#06B6D4`), and neon red/rose highlight (`#F43F5E`).

---

## 2. Core Design System & Tokens

- **Typography**:
  - Headings & Display: `Space Grotesk`, sans-serif (Bold, Futuristic geometric feel)
  - Interface & Body: `Inter`, sans-serif (Clean readability)
  - Code & Editor: `JetBrains Mono`, monospace
- **Colors**:
  - `bg-void`: `#070709`
  - `bg-surface`: `#0D0E15`
  - `bg-surface-hover`: `#141622`
  - `border-dim`: `rgba(255, 255, 255, 0.08)`
  - `accent-violet`: `#8B5CF6` (Glow: `rgba(139, 92, 246, 0.4)`)
  - `accent-cyan`: `#06B6D4` (Glow: `rgba(6, 182, 212, 0.4)`)
  - `accent-highlight`: `#F43F5E`
- **Atmosphere**:
  - Grain/Noise overlay: CSS SVG data pattern with light blend-mode.
  - WebGL fallback: Multi-stop radial gradients (`radial-gradient(circle at 50% 30%, rgba(139,92,246,0.15), transparent 70%)`).

---

## 3. Motion & Performance Strategy

- **Lazy Loading**: Three.js Canvas scenes and heavy GSAP triggers are dynamically loaded using `React.lazy` and `Suspense`.
- **Accessibility (`prefers-reduced-motion`)**: Automatically disables Lenis smooth scroll, pins animated sequences immediately to their final state, and hides the custom magnetic cursor.
- **FPS Target**: 60fps achieved by offloading computations to shaders, using `requestAnimationFrame`, and capping point counts on low-power devices.
- **WebGL Fallback**: If WebGL context creation fails, a CSS animated mesh gradient smoothly replaces the canvas gracefully.

---

## 4. UI Scoping: Marketing vs. Workspace

| Surface | Visual Style | Motion Level | Primary Goal |
|---|---|---|---|
| **Landing Page (`/`)** | Awwwards style, 3D Hero, Scroll-pinning | High (GSAP, Lenis, WebGL) | High conversion, brand visual impact |
| **Auth (`/login`, `/signup`)** | Glassmorphic cards over calm 3D canvas | Subtle particle drift | Quick, focused authentication |
| **Dashboard (`/projects`)** | High-density grid, project status badges | Micro-transitions | Swift project creation & navigation |
| **Workspace (`/projects/:id`)** | Linear/Vercel density, 3-pane resizable | Minimal (AI thinking orb only) | Maximum coding output & live preview |
