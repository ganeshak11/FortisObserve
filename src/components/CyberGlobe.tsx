"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

const COUNTRY_COORDS: Record<string, [number, number]> = {
  "US": [37.0902, -95.7129],
  "IN": [20.5937, 78.9629],
  "CN": [35.8617, 104.1954],
  "JP": [36.2048, 138.2529],
  "GB": [55.3781, -3.4360],
  "DE": [51.1657, 10.4515],
  "FR": [46.2276, 2.2137],
  "BR": [-14.2350, -51.9253],
  "AU": [-25.2744, 133.7751],
  "CA": [56.1304, -106.3468],
  "RU": [61.5240, 105.3188],
  "SG": [1.3521, 103.8198],
  "NL": [52.1326, 5.2913],
  "IE": [53.1424, -7.6921],
  "TZ": [-6.3690, 34.8888],
  "Unknown": [0, 0]
};

// User's Node IP Coordinates (Roughly India based on IP)
const MY_LAT = 20.5937;
const MY_LNG = 78.9629;

export default function CyberGlobe({ activeSessions = [] }: { activeSessions?: any[] }) {
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [arcsData, setArcsData] = useState([]);
  const [countries, setCountries] = useState({ features: [] });
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  useEffect(() => {
    // 1. Fetch GeoJSON for country borders
    fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(setCountries);

    // 2. Generate arcs from User Node to all Session IPs
    const arcs = activeSessions.map(session => {
        const country = session.country || "Unknown";
        if (country === "Unknown" || !COUNTRY_COORDS[country] || COUNTRY_COORDS[country][0] === 0) {
            return null;
        }
        
        const coords = COUNTRY_COORDS[country];
        
        // Add slight random jitter to coordinates so arcs don't perfectly overlap if they are from the same country
        const jitterLat = coords[0] + (Math.random() - 0.5) * 4;
        const jitterLng = coords[1] + (Math.random() - 0.5) * 4;

        return {
            startLat: MY_LAT,
            startLng: MY_LNG,
            endLat: jitterLat,
            endLng: jitterLng,
            color: ['#22d3ee', '#10b981', '#a855f7'][Math.floor(Math.random() * 3)],
            ip: session.ip_address
        };
    }).filter(arc => arc !== null);

    setArcsData(arcs as any);

    if (globeEl.current) {
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.5;
        globeEl.current.pointOfView({ lat: MY_LAT, lng: MY_LNG, altitude: 2 });
    }
  }, [activeSessions]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDimensions({ width, height });
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="flex items-center justify-center w-full h-full cursor-move min-h-[350px]">
        {dimensions.width > 0 && (
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                backgroundColor="rgba(0,0,0,0)"
                
                // Country Borders
                hexPolygonsData={countries.features}
                hexPolygonResolution={3}
                hexPolygonMargin={0.7}
                hexPolygonColor={() => '#0f172a'}
                
                // Connection Arcs
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={0.1}
                arcDashAnimateTime={2000}
                arcStroke={0.5}
                
                width={dimensions.width}
                height={dimensions.height}
            />
        )}
    </div>
  );
}
