# TradeVault Deployment Guide (Zero-Cost Setup)

This guide walks you through pushing the `/TradeVault_Live` folder to production.

## 1. Source Control (GitHub)
1. Initialize a Git repository in `d:\portfolio manager\TradeVault_Live`.
2. Commit files and push to a new GitHub repository named `TradeVault_SaaS`.

## 2. Database (Supabase)
1. Go to [Supabase.com](https://supabase.com) and create a free project.
2. Navigate to the SQL Editor.
3. Paste and execute the contents of `database/schema.sql`.
4. Go to Settings > API and copy your `Project URL` and `anon public` key.

## 3. Backend (Render)
1. Go to [Render.com](https://render.com) and create a new Web Service.
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Render will automatically detect the `requirements.txt` and `Procfile`.
5. Under Environment Variables, add:
   - `SUPABASE_URL` = (From Step 2)
   - `SUPABASE_KEY` = (From Step 2)
   - `ALLOWED_ORIGINS` = `https://your-frontend-vercel-domain.vercel.app`

## 4. Frontend (Vercel)
1. Go to [Vercel.com](https://vercel.com) and import the same GitHub repository.
2. Set the Root Directory to `frontend`.
3. Vercel automatically deploys static HTML/JS files perfectly.
4. Once deployed, open `frontend/apiClient.js` in your code editor. Change:
   `const API_BASE = "https://tradevault-api.onrender.com/api";` 
   to your actual Render URL, commit, and push. Vercel will auto-update.

## 5. Domain Name
1. Since `tradevault.com` is taken, purchase an alternative on Namecheap (e.g., `usetradevault.com`).
2. Add the domain in Vercel. Vercel will provide external DNS records.
3. Log into Cloudflare, add your Namecheap domain, and input the Vercel DNS records.

## 6. Automated Verification (Testing)
Before going fully live, you should run the automated backend test suite to verify the Gunicorn APIs.
1. Open terminal inside the `backend` folder.
2. Run `pip install -r requirements.txt`.
3. Run `pytest tests/test_api.py -v`.
4. Ensure all unit tests pass (Health Check, Pricing API, Trade Log mock).

Your MVP is now a globally distributed, highly available SaaS application costing $0/month in infrastructure.
