-- TradeVault Live : Supabase PostgreSQL Schema
-- Deployment Target: Supabase Free Tier

-- ==========================================
-- 1. USERS TABLE (Integrated with Clerk Auth)
-- ==========================================
-- Supabase automatically handles 'auth.users'. We create a public profile table
-- that links directly to the Clerk/Supabase Auth ID.
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL, -- The user ID provided by Clerk Auth
    email TEXT UNIQUE NOT NULL,
    subscription_plan TEXT DEFAULT 'free', -- Integrates with Stripe (free, pro)
    stripe_customer_id TEXT,
    max_daily_loss DECIMAL(10, 2) DEFAULT 10000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. TRADES TABLE (Core Journal)
-- ==========================================
CREATE TABLE public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Trade Details
    symbol TEXT NOT NULL,
    direction TEXT NOT NULL DEFAULT 'LONG', -- LONG or SHORT
    quantity DECIMAL(10, 4) NOT NULL,
    entry_price DECIMAL(10, 2) NOT NULL,
    exit_price DECIMAL(10, 2),
    sl_price DECIMAL(10, 2),
    target_price DECIMAL(10, 2),
    
    -- Execution Metrics
    pnl DECIMAL(12, 2),
    status TEXT DEFAULT 'OPEN', -- OPEN, CLOSED
    
    -- Qualitative Data
    tags TEXT[], -- Array of strings mapping to the UI tags
    execution_note TEXT,
    chart_url TEXT, -- URL to Supabase Storage image
    
    -- Verification & Analytics
    discipline_score INTEGER, -- 0-100% based on pre-trade checks
    actual_rr DECIMAL(10, 2), -- Actual Risk:Reward ratio upon closing
    segment TEXT DEFAULT 'NSE_EQ', -- Tracks if equity or F&O
    lot_size INTEGER, -- Multiplier for options
    
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 3. Row Level Security (RLS) - CRITICAL FOR SUPABASE
-- ==========================================
-- Ensure users can only see their own trades.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can view their own trades" ON public.trades FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can insert their own trades" ON public.trades FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
CREATE POLICY "Users can update their own trades" ON public.trades FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

-- ==========================================
-- 4. OPTIMIZATION INDEXES
-- ==========================================
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_created_at ON public.trades(created_at);
CREATE INDEX idx_users_clerk_id ON public.users(clerk_id);

-- ==========================================
-- 5. STORAGE BUCKETS
-- ==========================================
-- Create a public storage bucket for chart screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('trade_charts', 'trade_charts', true)
ON CONFLICT (id) DO NOTHING;

-- Allows anyone to view the images
CREATE POLICY "Public read access for charts" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'trade_charts' );

-- Note: Uploads will be handled via the Backend API using the SERVICE_ROLE key, 
-- or via Frontend if Supabase Auth is fully synced with Clerk.
