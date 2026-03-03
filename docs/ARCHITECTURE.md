# TradeVault Architecture Overview

## Structural Overview
TradeVault has transitioned from a local-only MVP into a production-ready, globally distributed SaaS application built on strictly free-tier optimized resources.

### The Problem with the MVP
The original architecture relied heavily on `localStorage` acting as the database, and a local Flask development server acting as a proxy. This led to:
- **Device Locking (Database Constraint):** A trader couldn't see their logs on a mobile phone if they traded on their laptop.
- **Single-Thread Bottleneck:** The Flask development server would crash or block if multiple price requests hit it simultaneously.
- **UI Hallucinations:** Browser crashes could desync the UI from the saved `.json` files.

### The New Architecture

#### 1. Frontend (Deployed on Vercel)
- **Tech:** Vanilla JavaScript + HTML5 + CSS3 (No build steps required, instant Vercel deployments).
- **Update:** Local `.setItem()` calls have been augmented with `TradeVaultAPI.syncTradeToCloud()`, pushing the state asynchronously to the PostgreSQL database.
- **SaaS Integrations Installed:** 
  - **Clerk:** Handles secure user authentication (JWTs).
  - **PostHog:** Product analytics (tracking which strategies traders use most).
  - **Sentry:** Captures UI crashes and failed API network requests instantly.

#### 2. Backend (Deployed on Render)
- **Tech:** Python Flask wrapped in **Gunicorn** (`gunicorn api:app -w 4 -k gevent`).
- **Scale:** Gunicorn with 4 workers and `gevent` allows high concurrency, resolving the bottleneck when fetching live YFinance prices.
- **Security:** Equipped with `flask-cors` locking down requests to the `tradevault.com` (or equivalent) production origin domain.

#### 3. Database (Deployed on Supabase)
- **Tech:** Serverless PostgreSQL Database.
- **Scale:** The schema implements **Row Level Security (RLS)** linked directly to the Clerk Auth `user_id`. Traders can only ever query or modify their exact trades. No manual application-level filtering is required, guaranteeing absolute data separation.

## Enterprise B2C Standards & Justification

When scaling a B2C (Business-to-Consumer) application, the primary concerns are **high availability, data security, latency, and cost-efficiency**. Here is how our architecture aligns with the global standards used by modern consumer tech companies:

1. **Decoupled Architecture (Microservices)**
   - *Why it's standard:* By separating the Vercel Frontend and Render Backend, an issue in the frontend won't crash the database API, and the frontend can be served via a global CDN (edge network) for near-instant load times worldwide.
   - *The B2C Benefit:* Unmatched reliability and parallel development (you can hire a UI dev who never touches the backend code).

2. **Stateless Backend APIs (Gunicorn/Flask)**
   - *Why it's standard:* B2C apps experience sudden traffic spikes. A stateful backend crashes under load. Gunicorn allows spinning up identical horizontal copies (workers) of the `api.py` on demand, distributing the load easily.
   - *The B2C Benefit:* The app won't buckle during market open hours when users log in simultaneously.

3. **Database Row-Level Security (RLS in Supabase)**
   - *Why it's standard:* Legacy apps rely on the backend (Python/Node) to filter data (e.g., `SELECT * FROM trades WHERE user_id = X`). This is prone to human error—if a developer forgets the `WHERE` clause, user data leaks, destroying trust. RLS bakes security directly into the database engine.
   - *The B2C Benefit:* Bank-grade data isolation. Even if the Python API is compromised, the database physically rejects queries for unauthorized users.

4. **Offloading Identity Management (Clerk)**
   - *Why it's standard:* Building your own authentication (passwords, MFA, OAuth, password resets) in 2026 is a massive security risk and maintenance burden. B2C unicorns entirely outsource identity to providers like Clerk, Auth0, or Firebase.
   - *The B2C Benefit:* Immediate access to Apple/Google sign-in, Multi-Factor Authentication, and SOC2 compliance out of the box.

## Where Do We Go From Here? (Phase 3 Tech Stack)

As TradeVault scales beyond its initial thousands of users, the architecture is primed for modular upgrades without rewriting the core:

1. **Frontend Evolution:**
   - **Current:** Vanilla HTML/JS on Vercel.
   - **Next Step:** Migrate to **Next.js or React**. As the UI grows complex, component-based frameworks will make maintaining the code easier and allow for server-side rendering (SEO benefits for landing pages).

2. **Backend Performance:**
   - **Current:** Python API hitting Supabase directly.
   - **Next Step:** Activate the **Upstash Redis** layer. When users request their trade history, the backend can fetch it from Redis (in-memory cache) in milliseconds, rather than hitting the PostgreSQL disk every time. This drastically reduces database load.

3. **Asynchronous Processing:**
   - **Current:** Synchronous trade execution and logging.
   - **Next Step:** Introduce **Celery** or webhooks. Heavy operations, like the AI Insight Engine generating reports, shouldn't block the user. The backend will instantly return "Report Generating," while a background worker processes the heavy lifting.

4. **Monetization & Subscriptions:**
   - **Next Step:** Implement **Stripe Billing**. Provide a free tier (e.g., 50 trades/month) and gate premium features (AI analysis, advanced exporting) behind a monthly subscription. Strip hooks into the Clerk User ID for seamless access control.
