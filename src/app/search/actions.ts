"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function performGlobalSearch(query: string) {
    if (!query || query.length < 2) {
        return { sessions: [], events: [] };
    }

    const { data: sessions } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .or(`ip_address.ilike.%${query}%,visitor_uuid.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`)
        .limit(20);

    const { data: events } = await supabaseAdmin
        .from('events')
        .select('*, sessions(ip_address, visitor_uuid)')
        .ilike('path', `%${query}%`)
        .order('timestamp', { ascending: false })
        .limit(20);

    return {
        sessions: sessions || [],
        events: events || []
    };
}
