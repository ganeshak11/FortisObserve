-- Fortis Observe Schema

-- 1. Create Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_uuid TEXT NOT NULL,
    ip_address TEXT,
    isp TEXT,
    country TEXT,
    city TEXT,
    browser TEXT,
    os TEXT,
    device TEXT,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    impossible_travel BOOLEAN DEFAULT FALSE,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_visits INTEGER DEFAULT 1 NOT NULL,
    CONSTRAINT unique_visitor_ip UNIQUE (visitor_uuid, ip_address)
);

-- Enable RLS for sessions
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
-- (Assuming an admin-only backend, we can allow anon to insert/update, or we can use the service role key in our API)

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    referer TEXT,
    is_bot BOOLEAN DEFAULT FALSE,
    latency_ms INTEGER,
    scroll_depth_pct INTEGER DEFAULT 0,
    duration_ms INTEGER DEFAULT 0,
    backend_latency_ms INTEGER,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Upsert Function for Telemetry Ingestion
-- This RPC handles the logic to ensure we get a session ID back and update total_visits.
CREATE OR REPLACE FUNCTION public.ingest_telemetry(
    p_visitor_uuid TEXT,
    p_ip_address TEXT,
    p_isp TEXT,
    p_country TEXT,
    p_city TEXT,
    p_browser TEXT,
    p_os TEXT,
    p_device TEXT,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_path TEXT,
    p_referer TEXT,
    p_is_bot BOOLEAN,
    p_latency_ms INTEGER,
    p_backend_latency_ms INTEGER DEFAULT NULL
) RETURNS void AS $$
DECLARE
    v_session_id UUID;
    v_total_visits INTEGER;
    v_prev_country TEXT;
    v_last_seen TIMESTAMP WITH TIME ZONE;
    v_impossible_travel BOOLEAN := FALSE;
BEGIN
    -- Try to find existing session
    SELECT id INTO v_session_id FROM public.sessions 
    WHERE visitor_uuid = p_visitor_uuid AND ip_address = p_ip_address;

    IF v_session_id IS NULL THEN
        -- Check for impossible travel before creating a new session
        SELECT country, last_seen INTO v_prev_country, v_last_seen
        FROM public.sessions WHERE visitor_uuid = p_visitor_uuid ORDER BY last_seen DESC LIMIT 1;

        IF v_prev_country IS NOT NULL AND p_country != 'Unknown' AND v_prev_country != 'Unknown' AND p_country != v_prev_country THEN
            -- If they changed countries in less than 12 hours (43200 seconds), flag it
            IF EXTRACT(EPOCH FROM (timezone('utc'::text, now()) - v_last_seen)) < 43200 THEN
                v_impossible_travel := TRUE;
            END IF;
        END IF;

        -- Insert new session
        INSERT INTO public.sessions (visitor_uuid, ip_address, isp, country, city, browser, os, device, latitude, longitude, impossible_travel)
        VALUES (p_visitor_uuid, p_ip_address, p_isp, p_country, p_city, p_browser, p_os, p_device, p_latitude, p_longitude, v_impossible_travel)
        RETURNING id INTO v_session_id;
    ELSE
        -- Update existing session
        UPDATE public.sessions
        SET last_seen = timezone('utc'::text, now()),
            total_visits = total_visits + 1,
            latitude = COALESCE(p_latitude, latitude),
            longitude = COALESCE(p_longitude, longitude)
        WHERE id = v_session_id;
    END IF;

    -- 2. Insert Event
    INSERT INTO public.events (session_id, path, referer, is_bot, latency_ms, backend_latency_ms)
    VALUES (v_session_id, p_path, p_referer, p_is_bot, p_latency_ms, p_backend_latency_ms);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update Function for Continuous Telemetry (Scroll/Duration)
CREATE OR REPLACE FUNCTION public.update_telemetry(
    p_visitor_uuid TEXT,
    p_path TEXT,
    p_scroll_depth INTEGER,
    p_duration_ms INTEGER
) RETURNS void AS $$
DECLARE
    v_session_id UUID;
    v_event_id UUID;
BEGIN
    -- Find session
    SELECT id INTO v_session_id FROM public.sessions WHERE visitor_uuid = p_visitor_uuid ORDER BY last_seen DESC LIMIT 1;
    
    IF v_session_id IS NOT NULL THEN
        -- Find the most recent event for this path in this session
        SELECT id INTO v_event_id FROM public.events 
        WHERE session_id = v_session_id AND path = p_path 
        ORDER BY timestamp DESC LIMIT 1;

        IF v_event_id IS NOT NULL THEN
            UPDATE public.events 
            SET scroll_depth_pct = GREATEST(scroll_depth_pct, COALESCE(p_scroll_depth, 0)),
                duration_ms = GREATEST(duration_ms, COALESCE(p_duration_ms, 0))
            WHERE id = v_event_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
