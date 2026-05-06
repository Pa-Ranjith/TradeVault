# TradeVault - Professional Trading Command Center

TradeVault is a high-performance, "Risk-First" trading journal and execution dashboard designed to help traders maintain their psychological edge and technical discipline. It transitions from a local-only tool to a production-ready SaaS, providing globally accessible, real-time market intelligence and trade management.

## 🚀 Key Features

-   **Position Sizer:** Accurate risk-based quantity calculation for Long and Short positions.
-   **Pre-Trade Guard:** A psychological checklist that forces traders to justify their entries before execution.
-   **Trade Journal:** Comprehensive logging of trades with automated P&L tracking, qualitative tagging, and chart attachments.
-   **Market Pulse Sentinel:** AI-powered narrative synthesis of global news and sentiment analysis for specific symbols.
-   **Portfolio AI Analyst:** Tactical adjustments and sector strategy recommendations based on portfolio data.
-   **Live Positions & Analytics:** Real-time monitoring of open trades and deep-dive performance metrics.
-   **Daily Risk Limits:** Integrated "Cool-off" mechanics to prevent over-trading and enforce discipline.

## 🛠️ Tech Stack

### Frontend
-   **Framework:** [Next.js](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Animations:** [Framer Motion](https://www.framer.com/motion/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Authentication:** [Clerk](https://clerk.com/)

### Backend & Database
-   **Database:** [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
-   **API Layer:** Next.js API Routes (server-side proxies for market data)
-   **Data Synchronization:** Real-time sync between frontend state and cloud storage.

### Services
-   **Market Data:** Multi-source failsafe (Yahoo Finance, Binance, Finnhub).
-   **Analytics:** PostHog (Product usage) and Sentry (Error tracking).

## 📂 Project Structure

```text
├── database/            # SQL schemas and migration scripts
├── docs/                # Comprehensive architecture and lifecycle documentation
├── frontend/            # Next.js application (UI, components, services)
│   ├── src/
│   │   ├── app/         # Next.js App Router pages and API routes
│   │   ├── components/  # Modular UI components (Sentinel, Sizer, etc.)
│   │   ├── context/     # Global state management (AppContext)
│   │   └── services/    # External API integrations and business logic
├── netlify.toml         # Netlify deployment configuration
└── README.md            # You are here
```

## 🏁 Getting Started

### Prerequisites
-   Node.js (v20+)
-   Supabase Account
-   Clerk Account

### Local Development (Frontend)
1.  `cd frontend`
2.  `npm install`
3.  `npm run dev`
4.  Open [http://localhost:3000](http://localhost:3000)

### Deployment
This project is configured for automated deployment:
-   **Frontend:** Netlify (configured via `netlify.toml`) or Vercel.
-   **Database:** Supabase (Run `database/schema.sql` in the SQL Editor).

See `docs/DEPLOYMENT_GUIDE.md` for detailed infrastructure setup.

---
*Built for traders who treat the market as a professional business.*
