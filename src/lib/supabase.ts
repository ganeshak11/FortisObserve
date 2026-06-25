import { createClient } from "@supabase/supabase-js";

// We use the SERVICE_ROLE key here because this API acts as an admin ingestion engine.
// It bypasses RLS so it can insert events freely.
// DO NOT expose the service role key to the client side.

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);
