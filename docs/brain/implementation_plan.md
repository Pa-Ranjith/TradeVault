# Implementation Plan - Phase 14: Global News & UX Refinement

## Proposed Changes

### [Component] Frontend UI (`index.html` & `style.css`)

#### [MODIFY] [style.css](file:///d:/portfolio manager/TradeVault_Live/frontend/style.css)
- **Checklist UX**: 
    - Remove `text-decoration: line-through` and `opacity: 0.5` from `.check-item.checked`.
    - Add a subtle emerald glow (`box-shadow`) and a soft background highlight for checked items.
    - Animate the transition for a premium feel.

#### [MODIFY] [index.html](file:///d:/portfolio manager/TradeVault_Live/frontend/index.html)
- **News Terminal**: 
    - Add a new section `#news-terminal` below the `guardrails-panel`.
    - Style it as a dark, terminal-style ticker with high-vibrancy headlines.
    - Ensure it fits perfectly in the "Split-Wing" grid flow.

#### [MODIFY] [app.js](file:///d:/portfolio manager/TradeVault_Live/frontend/app.js)
- **News Logic**:
    - Implement `fetchGlobalNews()` function.
    - Add a 3.5-minute auto-refresh interval using `setInterval`.
    - Handle loading states and error gracefully without blocking core trade logic.

### [Component] Backend (`api.py`)

#### [MODIFY] [api.py](file:///d:/portfolio manager/TradeVault_Live/backend/api.py)
- **News Bridge**:
    - Add `/api/news` endpoint.
    - Implement a fetching mechanism that pulls from high-quality financial RSS feeds (e.g., Yahoo Finance/CNBC) or a public API if available.

### [Component] Documentation

#### [MODIFY] [APP_LIFECYCLE.md](file:///d:/portfolio manager/TradeVault_Live/docs/APP_LIFECYCLE.md)
- Log the UX transition and the integration of the real-time News Terminal.

## Verification Plan

### Automated Tests
- Check if `/api/news` returns a valid JSON array of 4-5 headlines.

### Manual Verification
- **Checklist UX**: Tick a rationale item and verify it glows instead of striking out.
- **News Refresh**: Wait 4 minutes and check if headlines update.
- **Responsive Layout**: Ensure the News Terminal doesn't break the layout on smaller windows.

