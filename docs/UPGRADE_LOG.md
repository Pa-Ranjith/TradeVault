# TradeVault Live - System Upgrade Log

This document tracks all versions, bugs, root-cause analyses, fixes, and architectural decisions made over the lifespan of the TradeVault ecosystem.

---

## [v1.1.0] - Pre-Migration Patches (2026-03-02)

### 🐛 Bugs & Fixes
- **CMP Loading Failure (Root Cause & Fix)**
  - *Bug:* The Current Market Price (CMP) was failing to load or parse, leaving traders blind to entries.
  - *Root Cause 1:* The frontend was operating on `localhost:8089` while the Python backend `api.py` was offline or not automatically spinning up.
  - *Root Cause 2:* The frontend `fetch` request targeted `http://localhost:5000`. On Windows, IPv6 often aggressively resolves `localhost` to `::1`, but the Flask server was only listening on IPv4 (`127.0.0.1`).
  - *Fix:* Hardcoded `127.0.0.1` into the JS API fetchers to force standard IPv4 routing, avoiding the DNS mismatch. Added `BeautifulSoup4` web-scraping fallbacks to `api.py` (Google Finance & CNBC) to serve as safety nets when Yahoo Finance throttled requests.
  
- **News Panel Theme / Glassmorphism Ignored**
  - *Bug:* The "Market Updates" news terminal remained as a solid black block (`#0d1117`) regardless of the user toggling Light/Dark theme mode.
  - *Root Cause:* The CSS class `.news-terminal` utilized hardcoded hex values rather than mapping to global CSS variables (`var(--bg-panel)`). The Python backend generates JSON data, it does not dictate UI rendering.
  - *Fix:* Replaced hardcoded CSS background paths with dynamic CSS variables. Enforced a `max-height: 750px` limitation to align the bottom of the news container linearly with the Execute Trade button baseline.

- **Missing Thumbnails on specific News Articles**
  - *Bug:* Thumbnail placeholders were broken when reading articles 4 through 7.
  - *Root Cause:* The static dictionary `mockDb` in `news_article.html` only possessed article mock data for IDs 1 through 3, forcing a generic fallback on remaining IDs.
  - *Fix:* Integrated high-fidelity mock data and Unsplash imagery for all 7 items spanning the feed length.

### 🚀 Enhancements
- **"Powered by Finnhub" Refinement:** Removed the phrasing "API Insights" to tighten the visual footprint of the UI disclaimer at the bottom of the news module.
- **Micro-Animations:** Introduced scaling and glowing glassmorphic hover effects to the `.news-card-premium` elements for a more visceral, premium feeling.

---

## [v2.0.0-draft] - The Enterprise Next.js Migration 
*Status: Initial Planning Approved by User*
- *Reason for Migration:* The existing decoupled stack (Vanilla HTML/JS + Python Flask + Scraping) is prone to fragile "hallucinations", failing DOM queries, and brittle API connections (e.g. Server simply turning off). 
- *The Master Plan:* A full-stack rewrite unifying frontend and backend into **Next.js (App Router)** supported by **Tailwind CSS/Framer Motion** for bulletproof styling, and **WebSockets** (e.g., Polygon.io) for real-time institutional tick data, totally eliminating the need for web-scraping.

### 🐛 Bugs & Fixes (Next.js V2)
- **V2 Build Error / TailWind Plugin Missing**
  - *Bug:* Next.js development server failed to compile CSS with error: `Can't resolve 'tailwindcss-animate' in 'src/app/globals.css'`.
  - *Root Cause:* The global CSS file imported the `@plugin "tailwindcss-animate"` utility for UI animations, but the package was never actually installed into `package.json` alongside `framer-motion` and `lucide-react`.
  - *Fix:* Executed `npm install tailwindcss-animate` to resolve the dependency.
  - *Global Governance Learning:* Always ensure UI library plugins referenced in `globals.css` or `tailwind.config.ts` are explicitly installed via the package manager before starting or reloading the dev server.

- **V2 Feature Regression / Dropped UI Elements**
  - *Bug:* During the port from vanilla HTML/JS to Next.js React components, several key custom V1 features were accidentally simplified or omitted. These included: the original custom logo image (`logo.png`), the interactive state-driven Daily Limit dropdown menu, the article thumbnail images in the News Feed, the News Feed `max-height: 750px` limit, and the collapsible Sidebar functionality.
  - *Root Cause:* The LLM agent prioritized scaffolding the broad Component-Based architecture and Tailwind "Google Antigravity Premium" theme mapping, but failed to perfectly reference and port the granular Javascript DOM manipulation event listeners and static asset paths (`logo.png`) from the `legacy_v1` files.
  - *Fix:* Initiated "Phase 2B: Restoring V1 Feature Parity". Copied `logo.png` to the public folder. Re-implementing specific elements: Sidebar `isCollapsed` state, News Terminal `max-height` and image arrays, and Daily Limit popover mechanics.
  - *Global Governance Learning:* When migrating frameworks or languages, never assume standard boilerplate UI components replace custom-built user logic. Always retain an active contextual link to the exact HTML/JS of the legacy codebase until every single button, state, and visual asset is ported 1:1. Memory must be strictly retained across framework bounds.
- **News Terminal Alignment & Refresh Heartbeat**
  - *Bug:* The News Terminal was either too long (spilling past Execute Trade) or lacked a real-time update cycle.
  - *Fix:* Re-configured the main layout with `flex-stretch` to bind the News Terminal height exactly to the Position Sizer's bottom baseline. Implemented a 3-minute (`180000ms`) `setInterval` heartbeat in `NewsTerminal.tsx` with a visual "Last Updated" timestamp for synchronization.
  - *Global Governance Learning:* Visual layout constraints (pixel alignment) and data refresh cycles must be documented as "Hard Rules" in `GEMINI.md` to prevent UI regression during future migrations.
