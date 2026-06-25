import { createClient } from "@supabase/supabase-js";

// This client is safe to use in the browser. 
// It uses the Anon key. Ensure Row Level Security (RLS) is enabled!
export const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
