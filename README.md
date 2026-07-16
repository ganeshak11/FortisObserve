# 👁️‍🗨️ FORTIS_OBSERVE [v1.0.0]

> **COMMAND CENTER & TELEMETRY OBSERVATORY**
> A decoupled telemetry and visitor analytics platform.

---

## ⚡ SYSTEM OVERVIEW
**FortisObserve** is a telemetry ingestion and visualization platform built to monitor traffic and identify patterns against [ganeshangadi.online](https://ganeshangadi.online). Operating entirely decoupled from the main portfolio architecture, it acts as an invisible observatory, capturing real-time visitor metrics, geolocation data, and traffic flows without impacting main thread performance.

### 🛠️ CORE ARCHITECTURE
- **Frontend Engine**: Next.js (App Router + Turbopack)
- **Styling**: TailwindCSS + Lucide React + Glassmorphism UI
- **Visualization**: `react-globe.gl` (WebGL Data Visualization)
- **Database**: Supabase (PostgreSQL + PlpgSQL RPCs)
- **Authentication**: Multi-factor authentication using TOTP and WebAuthn
- **Geolocation**: Vercel Edge Headers & `ipinfo.io` Network Layer Routing
- **Device Taxonomy**: `ua-parser-js`

> 📘 **For a deep-dive into the ingestion pipeline, data structures, and client-side tracking, see [ARCHITECTURE.md](./ARCHITECTURE.md).**

---

## 🏗️ ARCHITECTURE DIAGRAM

```text
Visitor
  │
  ▼
Portfolio (Next.js Edge)
  │
  ▼
Telemetry API (Asynchronous Fetch)
  │
  ▼
Supabase (PostgreSQL)
  │
  ▼
FortisObserve Dashboard
```

---

## 🔐 ZERO-TRUST SECURITY POSTURE
Access to the Command Center is strictly protected by a custom Next.js Edge Middleware proxy (`src/proxy.ts`), enforcing Multi-factor authentication using TOTP and WebAuthn.

1. **Terminal TOTP Gateway**: A terminal-themed lockdown screen requiring a rotating 6-digit Time-Based One-Time Password (TOTP) verified via `otplib`.
2. **Hardware Enclave (WebAuthn)**: Support for physical security keys and biometric hardware (TouchID, FaceID, YubiKey) using `@simplewebauthn`. Device public keys are securely stored in the `admin_devices` PostgreSQL table to prevent spoofing.

---

## 📡 TELEMETRY & FEATURES

### 1. The Global Radar (WebGL)
A dynamic, real-time 3D rendering of the globe utilizing `react-globe.gl`. 
- **Hexagonal Polygons**: Renders intricate, dark-mode country borders via dynamically fetched GeoJSON data.
- **Connection Arcs**: Renders animated connection arcs between visitor locations and the hosting region, visualizing traffic flows toward the hosted application endpoint.

### 2. Live Intelligence Feed
A simulated terminal output tracking HTTP requests hitting the primary portfolio.
- Extracts client IP information from trusted proxy headers (X-Forwarded-For when available).
- Displays connection statuses, exact Device/OS/Browser taxonomy, and HTTP endpoints accessed in an auto-scrolling terminal window.
- Captures UTM parameters (e.g., `?utm_source=`) to bypass privacy-stripping webviews (like LinkedIn/Instagram mobile apps) and accurately track referring domains.

### 3. Target Dossier (Visitor Analytics)
A searchable, paginated table of all unique network footprints tracking:
- Precise Browser and OS versions (e.g., Chrome 124, iOS 17) and hardware models (Tablet vs Mobile).
- First Seen and Last Seen timestamps.
- Total Request Count and precise Session Duration timers.
- Scroll Depth calculations to measure content engagement.
- Backend Latency metrics appended to every page view for system health monitoring.
- Integrates ASN details to silently flag datacenter requests (e.g., AWS, Google Cloud) as bots, keeping human metrics pristine.
- Flags sessions for "Impossible Travel" anomalies if a user jumps countries in less than 12 hours.

---

## 🚀 FUTURE ROADMAP (PLANNED)

To evolve the platform into a comprehensive SOC-like environment, the following architectural and security upgrades are planned:

- **Event Queueing**: Shifting from direct API-to-Supabase inserts to a durable message broker (Redis/RabbitMQ) handled by background workers to absorb traffic spikes.
- **Rate Limiting**: Implementing strict ingress constraints to prevent telemetry database flooding.
- **Threat Detection Scoring**:
  - Assigning heuristic risk scores to incoming requests (e.g., +20 VPN, +30 Known Bot, +40 SQLi signature).
- **Geo Heatmaps**: Visualizing threat origins, request density per hour, and top offending regions.
- **Audit Logging & RBAC**: Tracking all dashboard interactions, administrative logins, and introducing Analyst/Admin role separation.
- **Attack Timelines**: Generating SOC-style sequenced incident timelines for high-threat sessions.

---

## ⚙️ DEPLOYMENT & OPERATION

### Prerequisites
- Node.js `v20+`
- A Supabase PostgreSQL Instance
- `ipinfo.io` API Key

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=[REDACTED]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[REDACTED]
SUPABASE_SERVICE_ROLE_KEY=[REDACTED]
IPINFO_TOKEN=[REDACTED]

# Cryptography
JWT_SECRET=[GENERATED_BASE64_KEY]
ADMIN_TOTP_SECRET=[GENERATED_BASE32_KEY]
```

### Ignition Sequence
```bash
# Clone the repository
git clone https://github.com/ganeshak11/fortisobserve.git
cd fortisobserve

# Install dependencies
npm install

# Initiate development server
npm run dev
```

---

## 👨‍💻 Maintainer

**Ganesh Angadi**
- 🐙 GitHub: [@ganeshak11](https://github.com/ganeshak11)
- 🌐 Portfolio: [ganeshangadi.online](https://ganeshangadi.online)
- 💼 LinkedIn: [Ganesh Angadi](https://linkedin.com/in/ganeshangadi1301)

---

*Built with precision by Ganesh Angadi.*
*End of Line.*
