-- ==========================================================
-- SAHAY-24 Database Schema (Supabase / PostgreSQL)
-- Core Tables: users, mock_balances, saved_contacts, interaction_events
-- ==========================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. MOCK BALANCES TABLE
CREATE TABLE IF NOT EXISTS public.mock_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    account_number TEXT NOT NULL,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_mock_balances_user UNIQUE (user_id)
);

-- 3. SAVED CONTACTS TABLE
CREATE TABLE IF NOT EXISTS public.saved_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    account_number TEXT,
    upi_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. INTERACTION EVENTS TABLE (Friction Telemetry)
CREATE TABLE IF NOT EXISTS public.interaction_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    screen_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    meta JSONB NOT NULL DEFAULT '{}'::jsonb,
    CONSTRAINT chk_event_type CHECK (
        event_type IN ('mistap', 'hesitation', 'back_nav', 'abandon_retry', 'erratic_scroll')
    )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interaction_events_user_ts 
    ON public.interaction_events (user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_saved_contacts_user 
    ON public.saved_contacts (user_id);

-- Enable Row Level Security (RLS) and grant open access for hackathon dev/demo
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_events ENABLE ROW LEVEL SECURITY;

-- Development policies: allow full read/write access to anon & authenticated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public access to users'
    ) THEN
        CREATE POLICY "Allow public access to users" ON public.users FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'mock_balances' AND policyname = 'Allow public access to mock_balances'
    ) THEN
        CREATE POLICY "Allow public access to mock_balances" ON public.mock_balances FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'saved_contacts' AND policyname = 'Allow public access to saved_contacts'
    ) THEN
        CREATE POLICY "Allow public access to saved_contacts" ON public.saved_contacts FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'interaction_events' AND policyname = 'Allow public access to interaction_events'
    ) THEN
        CREATE POLICY "Allow public access to interaction_events" ON public.interaction_events FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
