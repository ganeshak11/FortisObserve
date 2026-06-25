# 👁️‍🗨️ FORTIS_OBSERVE [v1.0.0]

> **CLASSIFIED: COMMAND CENTER & TELEMETRY OBSERVATORY**
> A highly secure, decoupled, graph-native cyber threat intelligence and visitor telemetry dashboard.

---

## ⚡ SYSTEM OVERVIEW
**FortisObserve** is an enterprise-grade telemetry ingestion and visualization platform built to monitor traffic and identify threats against [ganeshangadi.online](https://ganeshangadi.online). Operating entirely decoupled from the main portfolio architecture, it acts as an invisible observatory, capturing real-time visitor metrics, geolocation data, and potential intrusion attempts without impacting main thread performance.

### 🛠️ CORE ARCHITECTURE
- **Frontend Engine**: Next.js 16 (App Router + Turbopack)
- **Styling**: TailwindCSS + Lucide React + Glassmorphism UI
- **Visualization**: `react-globe.gl` (WebGL Data Visualization)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Zero-Trust Hybrid (TOTP + WebAuthn)
- **Geolocation**: `ipinfo.io` Network Layer Routing

---

## 🔐 ZERO-TRUST SECURITY POSTURE
Access to the Command Center is strictly protected by a custom Next.js Edge Middleware proxy (`src/proxy.ts`), enforcing a military-grade, passwordless dual-authentication system.

1. **Terminal TOTP Gateway**: A terminal-themed lockdown screen requiring a rotating 6-digit Time-Based One-Time Password (TOTP) verified via `otplib`.
2. **Hardware Enclave (WebAuthn)**: Support for physical security keys and biometric hardware (TouchID, FaceID, YubiKey) using `@simplewebauthn`. Device public keys are securely stored in the `admin_devices` PostgreSQL table to prevent spoofing.

---

## 📡 TELEMETRY & FEATURES

### 1. The Global Radar (WebGL)
A dynamic, real-time 3D rendering of the globe utilizing `react-globe.gl`. 
- **Hexagonal Polygons**: Renders intricate, dark-mode country borders via dynamically fetched GeoJSON data.
- **Neon Arcs**: Fires live tracking lasers mapping the exact geolocation coordinates of all active sessions directly to the origin host Node IP.

### 2. Live Intelligence Feed
A simulated terminal output tracking HTTP requests hitting the primary portfolio.
- Decodes `x-forwarded-for` headers to map raw IPs.
- Displays connection statuses, User-Agent identification, and HTTP endpoints accessed in a highly stylized, auto-scrolling terminal window.

### 3. Target Dossier (Visitor Analytics)
A searchable, paginated table of all unique network footprints.
- Parses and ranks most active IPs.
- Integrates ASN details (e.g., Airtel, Jio, AWS, Google Cloud).
- Identifies Tor exit nodes and automated bots.

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

*Built with precision by Ganesh Angadi.*
*End of Line.*
