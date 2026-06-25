import { GlobeWrapper } from "@/components/GlobeWrapper";
import { Globe2 } from "lucide-react";

export default function MapPage() {
    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <Globe2 className="w-6 h-6 text-cyan-400" />
                    GLOBAL THREAT RADAR
                </h1>
                <p className="text-slate-400 mt-2 text-sm">3D Geographic visualization of traffic sources and endpoints.</p>
            </header>
            <div className="glass-panel flex-1 flex items-center justify-center relative overflow-hidden">
                <GlobeWrapper />
            </div>
        </div>
    );
}
