import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Allow CORS so the portfolio can send requests here from the browser
const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // Or specifically "https://ganeshangadi.online"
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { visitorId, path, referer, userAgent, latencyMs } = body;

        if (!visitorId || !path) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
        }

        // Extract IP address from Vercel headers (or standard forwarded-for)
        const ipAddress = req.headers.get("x-real-ip") || 
                          req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                          "127.0.0.1";

        // Extract Vercel Geo headers
        let country = req.headers.get("x-vercel-ip-country") || "Unknown";
        let city = req.headers.get("x-vercel-ip-city") || "Unknown";

        // Simple Bot Detection based on User-Agent
        const uaLower = (userAgent || req.headers.get("user-agent") || "").toLowerCase();
        const isBot = uaLower.includes("bot") || uaLower.includes("crawler") || uaLower.includes("spider");

        // Simple device/os/browser parsing
        let os = "Unknown";
        let browser = "Unknown";
        let device = "Desktop";

        if (uaLower.includes("windows")) os = "Windows";
        else if (uaLower.includes("mac os")) os = "macOS";
        else if (uaLower.includes("android")) { os = "Android"; device = "Mobile"; }
        else if (uaLower.includes("linux")) os = "Linux";
        else if (uaLower.includes("iphone") || uaLower.includes("ipad")) { os = "iOS"; device = "Mobile"; }

        if (uaLower.includes("chrome") && !uaLower.includes("edg")) browser = "Chrome";
        else if (uaLower.includes("firefox")) browser = "Firefox";
        else if (uaLower.includes("safari") && !uaLower.includes("chrome")) browser = "Safari";
        else if (uaLower.includes("edg")) browser = "Edge";

        // Fetch ISP from IPInfo (if we have a token and it's not localhost)
        let isp = "Unknown";
        if (process.env.IPINFO_TOKEN && ipAddress !== "127.0.0.1" && ipAddress !== "::1") {
            try {
                const ipResponse = await fetch(`https://ipinfo.io/${ipAddress}/json?token=${process.env.IPINFO_TOKEN}`);
                if (ipResponse.ok) {
                    const ipData = await ipResponse.json();
                    isp = ipData.org || "Unknown";
                    // If Vercel didn't give us city/country, we can fallback to IPInfo here
                    if (country === "Unknown" && ipData.country) country = ipData.country;
                    if (city === "Unknown" && ipData.city) city = ipData.city;
                }
            } catch (err) {
                console.error("IPInfo fetch failed:", err);
            }
        }

        // Call our Supabase RPC to ingest the telemetry
        const { error } = await supabaseAdmin.rpc("ingest_telemetry", {
            p_visitor_uuid: visitorId,
            p_ip_address: ipAddress,
            p_isp: isp,
            p_country: country,
            p_city: city,
            p_browser: browser,
            p_os: os,
            p_device: device,
            p_path: path,
            p_referer: referer || "",
            p_is_bot: isBot,
            p_latency_ms: latencyMs || null
        });

        if (error) {
            console.error("Ingestion RPC error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500, headers: corsHeaders });
        }

        return NextResponse.json({ success: true }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("Tracking error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}
