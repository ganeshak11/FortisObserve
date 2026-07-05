# 👁️‍🗨️ FORTIS_OBSERVE ARCHITECTURE

FortisObserve is a high-performance, decoupled telemetry ingestion and analytics platform designed specifically for monitoring traffic against `ganeshangadi.online`.

## 1. System Topology

FortisObserve operates asynchronously. When a user visits the primary portfolio, the Next.js Edge functions and client-side components fire non-blocking beacons (`fetch` with `keepalive: true`) to the `analytics.ganeshangadi.online/api/telemetry` endpoint. 

This ensures that the main portfolio's Time to Interactive (TTI) and Largest Contentful Paint (LCP) are completely unaffected by analytics processing.

## 2. Ingestion Pipeline

### Edge Processing (`/api/telemetry`)
The ingress point intercepts payloads and immediately processes:
- **IP Extraction:** Reads `x-forwarded-for` and `x-real-ip`.
- **Geolocation:** Reads Vercel's edge network headers (`x-vercel-ip-country`, `x-vercel-ip-city`, `x-vercel-ip-latitude`, `x-vercel-ip-longitude`) to pinpoint the exact coordinates of the request. Falls back to `ipinfo.io` if Vercel headers are missing.
- **Device Taxonomy:** Utilizes `ua-parser-js` to extract precise Operating Systems (e.g., iOS 17, Windows 11), Browsers (Chrome 124, Safari), and Device Models (Tablet, Mobile, SmartTV, Console).
- **Bot Detection & Filtering:** Analyzes the Autonomous System Number (ASN) and User-Agent. Datacenter traffic from AWS, Azure, Google Cloud, and OVH are allowed to crawl the site for SEO, but are flagged silently as `is_bot = true` in the database to prevent human analytics corruption.
- **UTM Referrer Parsing:** Aggressively checks URL parameters (`?utm_source=`, `?ref=`) to bypass privacy-stripping webviews (like the LinkedIn mobile app or Instagram) that delete the `Referer` header.

### Backend RPC Engine (`ingest_telemetry`)
Data is passed to a high-performance PostgreSQL Stored Procedure (RPC) in Supabase. The database performs atomic operations:
1. **Session Upsert:** Checks if a session exists for the `(visitor_uuid, ip_address)` pair. If it does, increments `total_visits` and updates `last_seen`.
2. **Impossible Travel Detection:** If a new session is created, the RPC checks the visitor's last known country. If the country has changed within a 12-hour window, the session is permanently flagged for "Impossible Travel".
3. **Event Insertion:** Appends the exact page path, referrer, and backend latency to the `events` table.

## 3. Client-Side Telemetry (The PortFolio)

The portfolio utilizes modern browser APIs to track user engagement without compromising UX:
- **Scroll Depth:** An `IntersectionObserver` inspired percentage calculator measures the maximum vertical scroll depth a user reaches.
- **Session Duration:** A precise timer tracks time-on-page.
- **Mobile Unload Handling:** To combat mobile operating systems (iOS/Android) that freeze tabs and strip standard `beforeunload` events, the portfolio binds to the `visibilitychange` API. The exact millisecond the browser app is backgrounded, a final telemetry update is transmitted.

## 4. Visualizations

### The CyberGlobe (`react-globe.gl`)
A dynamic 3D WebGL rendering engine.
- Plots incoming traffic on a neon wireframe globe based on precise latitude/longitude.
- Calculates and renders cubic bezier arcs from the visitor's coordinates to the hosting server's physical coordinates.

### Target Dossiers
Individual drill-down pages for every tracked visitor.
- Displays full timeline of events, exposing exact backend latency for system health monitoring.
- Shows scroll depth and session duration for every page view.
- Provides a comprehensive breakdown of the user's network footprint.
