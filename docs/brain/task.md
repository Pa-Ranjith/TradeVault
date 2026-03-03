# TradeVault Finalization Task List

## Phase 10: Advanced Resiliency & BSE Support
- [x] BSE Equities Inclusion in Symbol Database.
- [x] Implement 3-tier price failsafe (Yahoo API -> yfinance -> Google Finance Scraper).
- [x] Force browser cache invalidation for symbols_data.js.
- [x] Ensure 100% price availability even during market holidays (Fallback to Closing Price).

## Phase 11: Psychological & UI Enhancements
- [x] Rename "Est. Net Profit" to "Estimated Profit" and add enthusiastic animations.
- [x] Add "Cool" confirmation message to the Daily Limit toggle.
- [x] Align and polish the profit card for maximum enthusiasm.
- [x] Implement NSE/BSE cross-exchange search visibility.

## Phase 12: Dazzling Profit Display
- [x] Implement full-width `span 4` centering for the Estimated Profit box.
- [x] Add linear gradient background and heartbeat glow animation.
- [x] Refine typography and accessibility for high-impact visual feedback.

## Phase 14: Global News & UX Refinement
- [x] Implement subtle highlighting for checked items (remove strikethrough).
- [x] Research and integrate free Financial News API (Bloomberg-style).
- [x] Design and implement the News Terminal UI below Rationale/Guard.
- [x] Setup 3-4 min auto-refresh logic for news headlines.
- [x] Document changes in `APP_LIFECYCLE.md`.

