import { LiveFeed } from "@/components/LiveFeed";
import { Activity } from "lucide-react";

export default function LivePage() {
    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-cyan-400" />
                    LIVE TELEMETRY FEED
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Real-time stream of all incoming portfolio events.</p>
            </header>
            <div className="glass-panel p-6 flex-1 flex flex-col overflow-hidden">
                <LiveFeed />
            </div>
        </div>
    );
}
