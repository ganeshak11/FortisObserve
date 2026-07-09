import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { UAParser } from "ua-parser-js";

// Whitelist of allowed origins for CORS
const ALLOWED_ORIGINS = [
    "https://ganeshangadi.online",
    "http://localhost:3000",
    "http://localhost:3001"
];

function getCorsHeaders(req: NextRequest) {
    const origin = req.headers.get("origin") || "";
    return {
        "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : "https://ganeshangadi.online",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}

export async function OPTIONS(req: NextRequest) {
    return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

export async function POST(req: NextRequest) {
    const corsHeaders = getCorsHeaders(req);

    try {
        const body = await req.json();
        const { visitorId, path, referer, userAgent, latencyMs } = body;

        // 1. Validate required fields synchronously
        if (!visitorId || !path) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
        }

        // 2. Extract client-specific information synchronously before responding
        const ipAddress = req.headers.get("x-real-ip") || 
                          req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                          "127.0.0.1";

        const vercelCountry = req.headers.get("x-vercel-ip-country") || "Unknown";
        const vercelCity = req.headers.get("x-vercel-ip-city") || "Unknown";
        const vercelLat = parseFloat(req.headers.get("x-vercel-ip-latitude") || "0");
        const vercelLng = parseFloat(req.headers.get("x-vercel-ip-longitude") || "0");
        
        const rawUA = userAgent || req.headers.get("user-agent") || "";

        // 3. Define the async background processing block
        const backgroundIngestion = (async () => {
            try {
                let country = vercelCountry;
                let city = vercelCity;
                let latitude = vercelLat;
                let longitude = vercelLng;

                // Simple Bot Detection based on User-Agent
                const uaLower = rawUA.toLowerCase();
                const isBot = uaLower.includes("bot") || uaLower.includes("crawler") || uaLower.includes("spider");

                // Advanced device/os/browser parsing using UAParser
                const parser = new UAParser(rawUA);
                const parsedOS = parser.getOS();
                const parsedBrowser = parser.getBrowser();
                const parsedDevice = parser.getDevice();

                const os = parsedOS.name || "Unknown";
                const browser = parsedBrowser.name || "Unknown";
                let device = "Desktop";
                
                if (parsedDevice.type) {
                    device = parsedDevice.type.charAt(0).toUpperCase() + parsedDevice.type.slice(1);
                }

                // Fetch ISP details from IPInfo (asynchronous background network call)
                let isp = "Unknown";
                if (process.env.IPINFO_TOKEN && ipAddress !== "127.0.0.1" && ipAddress !== "::1") {
                    try {
                        const ipResponse = await fetch(`https://ipinfo.io/${ipAddress}/json?token=${process.env.IPINFO_TOKEN}`);
                        if (ipResponse.ok) {
                            const ipData = await ipResponse.json();
                            isp = ipData.org || "Unknown";
                            
                            // Fallback to IPInfo details if Vercel headers are missing
                            if (country === "Unknown" && ipData.country) country = ipData.country;
                            if (city === "Unknown" && ipData.city) city = ipData.city;
                            if (latitude === 0 && ipData.loc) {
                                const [lat, lng] = ipData.loc.split(",");
                                latitude = parseFloat(lat);
                                longitude = parseFloat(lng);
                            }
                        }
                    } catch (err) {
                        console.error("[Telemetry-Background] IPInfo fetch failed:", err);
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

                // Measure database-only latency (excl. external HTTP calls)
                const dbStartTime = performance.now();
                
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
                    p_backend_latency_ms: Math.round(performance.now() - dbStartTime)
                });

                if (error) {
                    console.error("[Telemetry-Background] Supabase RPC error:", error);
                }
            } catch (bgError) {
                console.error("[Telemetry-Background] Background execution failed:", bgError);
            }
        })();

        // 4. Register wait capability if run on Vercel/serverless environments
        if (typeof (req as any).waitUntil === 'function') {
            (req as any).waitUntil(backgroundIngestion);
        }

        // 5. Return success instantly to client
        return NextResponse.json({ success: true }, { headers: corsHeaders });

    } catch (error: any) {
        console.error("Tracking endpoint initialization error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}

