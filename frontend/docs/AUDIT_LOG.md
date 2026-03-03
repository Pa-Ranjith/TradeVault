# TradeVault — Audit Log

> Chronological record of all changes made to the application.

---

## 2026-03-03 — V3.0 Release

### Session: Symbol Search Fix + V3 Enhancements

**Time:** 11:00 IST – 12:00 IST
**Commit:** Pending push

#### Changes Made

| # | Change | Files Modified | Impact |
|---|--------|---------------|--------|
| 1 | Fixed symbol search bug | `PositionSizer.tsx` | Market state init was `'NSE'` but dropdown uses `'INDIAN_EQUITIES'` — search never matched |
| 2 | Added `guardReady` to AppContext | `AppContext.tsx` | New boolean state for trade execution gating |
| 3 | PreTradeGuard pushes readiness | `PreTradeGuard.tsx` | Computes psych ≥50% + analysis ≥1, pushes via `setGuardReady` |
| 4 | Execute Trade gated by guard | `PositionSizer.tsx` | Button disabled unless `guardReady === true` |
| 5 | Market switch full reset | `PositionSizer.tsx` | Clears symbol, qty, SL, target, tags, price source, dropdown on market change |
| 6 | Refactored symbol data to JSON | `PositionSizer.tsx` + 5 JSON files | Removed hardcoded arrays, loads from `/public/data/*.json` |
| 7 | Created US equities data | `us_equities.json` | 200+ stocks across all sectors |
| 8 | Created crypto data | `crypto.json` | 80+ coins: DeFi, L1, L2, memes, AI |
| 9 | Created forex data | `forex.json` | 46 pairs: major, minor, exotic |
| 10 | Created commodities data | `commodities.json` | 35 instruments: metals, energy, agriculture |
| 11 | Created indices data | `indices.json` | 57 global indices + ETFs |
| 12 | Added INDICES market option | `PositionSizer.tsx` | New dropdown option with INDEX exchange badge |
| 13 | Journal full-page detail | `Journal.tsx` | Complete rewrite: list view → click → detail page with notes, screenshots, ratings |
| 14 | News Terminal redesign | `NewsTerminal.tsx` + `api/news/route.ts` | Thumbnail cards, category badges, freshness labels, auto-refresh, server-side proxy |

#### Root Cause Analysis

| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Symbol search returned nothing | State init `'NSE'` ≠ filter check `'INDIAN_EQUITIES'` | Changed init to `'INDIAN_EQUITIES'` |
| Execute Trade always enabled | No communication between PreTradeGuard and PositionSizer | Added `guardReady` context bridge |
| Market switch kept stale data | Reset didn't clear tags, price source, dropdown | Added comprehensive reset |

---

## 2026-02-28 — V2.0 Release

### Session: Feature Expansion

- Trade reason tags
- Live CMP with failsafe API chain
- Font upgrade (Outfit + DM Sans)
- Analytics overhaul
- Journal with screenshots
- Settings page

---

## 2026-02-28 — V1.0 Release

### Session: Foundation Build

- Core position sizer
- Risk/reward calculator
- Sidebar navigation
- Theme toggling
