import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { UAParser } from "ua-parser-js";

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
    const startTime = performance.now();
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
        let latitude = parseFloat(req.headers.get("x-vercel-ip-latitude") || "0");
        let longitude = parseFloat(req.headers.get("x-vercel-ip-longitude") || "0");

        // Simple Bot Detection based on User-Agent
        const rawUA = userAgent || req.headers.get("user-agent") || "";
        const uaLower = rawUA.toLowerCase();
        const isBot = uaLower.includes("bot") || uaLower.includes("crawler") || uaLower.includes("spider");

        // Advanced device/os/browser parsing using UAParser
        const parser = new UAParser(rawUA);
        const parsedOS = parser.getOS();
        const parsedBrowser = parser.getBrowser();
        const parsedDevice = parser.getDevice();

        const os = parsedOS.name || "Unknown";
        const browser = parsedBrowser.name || "Unknown";
        let device = "Desktop"; // Default to Desktop if device type is undefined
        
        if (parsedDevice.type) {
            // device.type can be 'console', 'mobile', 'tablet', 'smarttv', 'wearable', 'embedded'
            // We capitalize the first letter to keep it clean (e.g., 'Mobile', 'Tablet')
            device = parsedDevice.type.charAt(0).toUpperCase() + parsedDevice.type.slice(1);
        }

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
                    if (latitude === 0 && ipData.loc) {
                        const [lat, lng] = ipData.loc.split(",");
                        latitude = parseFloat(lat);
                        longitude = parseFloat(lng);
                    }
                }
            } catch (err) {
                console.error("IPInfo fetch failed:", err);
            }
        }
        
        // Data Center IP Checking
        const ispLower = isp.toLowerCase();
        const isDataCenter = 
            ispLower.includes("amazon") || 
            ispLower.includes("google") || 
            ispLower.includes("microsoft") || 
            ispLower.includes("azure") || 
            ispLower.includes("digitalocean") || 
            ispLower.includes("ovh") || 
            ispLower.includes("hetzner") || 
            ispLower.includes("linode") || 
            ispLower.includes("alibaba") || 
            ispLower.includes("tencent") || 
            ispLower.includes("choopa") || 
            ispLower.includes("contabo");

        const finalIsBot = isBot || isDataCenter;

        const backendLatency = Math.round(performance.now() - startTime);

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
            p_latitude: latitude === 0 ? null : latitude,
            p_longitude: longitude === 0 ? null : longitude,
            p_path: path,
            p_referer: referer || "",
            p_is_bot: finalIsBot,
            p_latency_ms: latencyMs || null,
            p_backend_latency_ms: backendLatency
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
