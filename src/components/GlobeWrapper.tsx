"use client";

import dynamic from "next/dynamic";
import { Globe2 } from "lucide-react";

// Disable SSR for the globe since it relies on WebGL and the window object
const CyberGlobe = dynamic(() => import("./CyberGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
        <Globe2 className="w-16 h-16 text-cyan-500 animate-pulse mb-4" />
        <p className="text-sm text-cyan-400 font-mono tracking-widest">INITIALIZING 3D RENDER...</p>
    </div>
  )
});

export function GlobeWrapper({ activeSessions }: { activeSessions?: any[] }) {
  return <CyberGlobe activeSessions={activeSessions || []} />;
}
