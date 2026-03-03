# TradeVault — Application Lifecycle Document

> Living document tracking every major change, decision, and deployment milestone.

---

## Architecture Overview

```
Frontend: Next.js 16 (App Router) + React 19 + Tailwind CSS 4
Styling: Glassmorphism + Outfit/DM Sans fonts
State: React Context API (AppContext) → localStorage persistence
APIs: Server-side proxy routes (/api/price, /api/news)
Data: JSON files in /public/data/ for all market instruments
```

## Module Map

| Module | File | Purpose |
|--------|------|---------|
| Planner | `page.tsx` | Main layout: PreTradeGuard + NewsTerminal + PositionSizer |
| PositionSizer | `PositionSizer.tsx` | Symbol search, risk calc, trade execution |
| PreTradeGuard | `PreTradeGuard.tsx` | Psychology + Analysis checks before trading |
| NewsTerminal | `NewsTerminal.tsx` | Live financial news with thumbnail cards |
| LivePositions | `LivePositions.tsx` | Open trade tracking |
| Journal | `Journal.tsx` | Trade history + full-page detail view |
| Analytics | `Analytics.tsx` | KPIs, equity curve, performance breakdown |
| Settings | `Settings.tsx` | Theme, config, data management |
| Sidebar | `Sidebar.tsx` | Navigation + capital display |
| AppContext | `AppContext.tsx` | Global state: currency, trades, guardReady |

## Market Data Coverage

| Market | File | Instruments | Exchange Badge |
|--------|------|-------------|----------------|
| Indian Equities | `equities.json` | 2,440 NSE stocks (dual NSE/BSE display) | NSE / BSE |
| US Stocks | `us_equities.json` | 200+ (S&P 500, tech, finance, healthcare) | NYSE/NAS |
| Crypto | `crypto.json` | 80+ (DeFi, L1, L2, memes, AI) | BINANCE |
| Forex | `forex.json` | 46 pairs (major, minor, exotic) | OANDA |
| Commodities | `commodities.json` | 35 (metals, energy, agriculture) | GLOBAL |
| Indices | `indices.json` | 57 (US, India, Europe, Asia, ETFs) | INDEX |

## API Routes

| Route | Method | Purpose | Failsafe Chain |
|-------|--------|---------|----------------|
| `/api/price` | GET | Live CMP fetch | Yahoo → Binance → CoinGecko → Finnhub |
| `/api/news` | GET | Financial news | GNews → NewsData → Static fallback |

## Key Design Decisions

1. **localStorage over DB** — V1 is offline-first, no backend dependency
2. **Server-side API proxies** — Avoid CORS, hide API keys, enable caching
3. **JSON data files** — Extensible, no rebuild needed to add instruments
4. **Guard → Context bridge** — PreTradeGuard pushes readiness via AppContext
5. **On-demand pricing** — Prices fetch when symbol selected (free API limits)

---

## Version History

### V1.0 — Foundation (Feb 2026)
- Core trading interface with position sizing
- Risk/reward calculator
- Daily limit tracking

### V2.0 — Feature Expansion (Feb 28, 2026)
- Trade reason tags (hashtag dropdown)
- Live CMP with failsafe chain
- Font upgrade (Outfit + DM Sans)
- Analytics overhaul (KPIs, equity curve)
- Journal with screenshots + evaluation
- Settings page (theme, export, import)

### V3.0 — Current Release (Mar 3, 2026)
- **Pre-Trade Guard validation** — Psychology ≥50% + Analysis ≥1 required
- **Market switch full reset** — All fields clear on market change
- **Comprehensive symbol data** — 2,800+ instruments across 6 markets
- **Indices market** — S&P 500, Nifty, Sensex, DAX, Nikkei, etc.
- **Journal full-page detail** — Click trade → dedicated detail view
- **News Terminal redesign** — Thumbnail cards, category badges, freshness, auto-refresh
