# Voltrix — AI-Powered Autonomous App Builder Frontend

Voltrix is an Awwwards-caliber, high-performance web application built with React 18, Vite, TypeScript, Tailwind CSS, Three.js, GSAP, and Monaco Editor. Users describe applications in natural language, and Voltrix streams AI code generation, populates project file structures, and hosts live sandboxed previews.

---

## 🚀 Quickstart Guide

### 1. Installation
```bash
npm install
```

### 2. Local Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

---

## 🛠️ API & Service Gateway Architecture

All API requests route through the Voltrix Centralized Gateway. Service routes are defined in `src/api/config.ts`:

- `ACCOUNT_PREFIX` = `/api/v1/account`
- `WORKSPACE_PREFIX` = `/api/v1/workspace`
- `INTELLIGENCE_PREFIX` = `/api/v1/intelligence`

### Environment Variables & Vite Proxy Setup
- **`VITE_API_BASE_URL`**: Defaults to `""` (empty string for same-origin dev proxy). In production, set this to your deployed gateway or ingress URL (e.g. `https://api.voltrix.ai`).
- **Dev Server Proxy**: In `vite.config.ts`, `/api` requests are automatically proxied to `http://localhost:8082` (the local gateway target) to eliminate CORS during development.

---

## 🎨 Key Features & Stack Overview

- **3D WebGL Canvas Engine**: Interactive wireframe glowing icosahedron and node network powered by `@react-three/fiber` & `@react-three/drei`. Includes automatic CSS gradient fallbacks when WebGL is unavailable or `prefers-reduced-motion` is active.
- **GSAP & Lenis Smooth Motion**: Scroll-driven storytelling, text reveals, and inertia scrolling on marketing pages.
- **Linear-Density Workspace**: 3-pane resizable interface:
  - **Left**: Real-time POST ReadableStream SSE AI Chat parser (`streamChat()`) supporting `THOUGHT`, `MESSAGE`, `FILE_EDIT`, and `TOOL_LOG` events with an instant Stop button.
  - **Middle**: Hierarchical file tree view and read-only Monaco Editor (`@monaco-editor/react`).
  - **Right**: Live sandboxed preview iframe (`sandbox="allow-scripts allow-same-origin allow-forms allow-popups"`).
- **Multi-Role Team Collaboration**: Role-based controls for `OWNER`, `EDITOR`, and `VIEWER`.
- **Stripe Billing Integration**: Token-usage progress bar, plan tier upgrades, and checkout/portal redirects.

---

## 📜 Production Build Verification

To verify TypeScript types and build production bundles:
```bash
npm run build
```
