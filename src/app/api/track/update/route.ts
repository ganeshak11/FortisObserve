import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, path, scrollDepth, durationMs } = body;

        if (!visitorId || !path) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
        }

        const { error } = await supabaseAdmin.rpc("update_telemetry", {
            p_visitor_uuid: visitorId,
            p_path: path,
            p_scroll_depth: scrollDepth || null,
            p_duration_ms: durationMs || null
        });

        if (error) {
            console.error("Update RPC error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500, headers: corsHeaders });
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders });
    } catch (error: any) {
        console.error("Tracking update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}
