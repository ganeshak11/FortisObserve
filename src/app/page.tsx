import { Activity, Globe2, ShieldAlert, Wifi, Settings } from "lucide-react";
import Link from "next/link";
import { GlobeWrapper } from "@/components/GlobeWrapper";
import { LiveFeed } from "@/components/LiveFeed";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function CommandCenter() {
  const { count: sessionCount } = await supabaseAdmin.from('sessions').select('*', { count: 'exact', head: true });
  const { count: eventCount } = await supabaseAdmin.from('events').select('*', { count: 'exact', head: true });

  const { data: isps } = await supabaseAdmin.from('sessions').select('isp');
  const ispCounts: Record<string, number> = {};
  isps?.forEach(row => {
      const isp = row.isp && row.isp !== 'Unknown' ? row.isp : 'Other';
      ispCounts[isp] = (ispCounts[isp] || 0) + 1;
  });
  
  const topSources = Object.entries(ispCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

  // Fetch active countries/cities to draw arcs on the globe
  const { data: globeSessions } = await supabaseAdmin.from('sessions').select('country, city, ip_address').limit(100);

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      {/* Header bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
          COMMAND CENTER
          <span className="text-xs font-mono bg-cyan-900/50 text-cyan-400 px-2 py-1 rounded border border-cyan-800">
            LIVE
          </span>
        </h1>
        <div className="flex flex-wrap gap-2 md:gap-4">
            <div className="glass-panel px-4 py-2 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium">Status: OPTIMAL</span>
            </div>
            <div className="glass-panel px-4 py-2 flex items-center gap-2 text-slate-300 hidden sm:flex">
                <span className="text-sm font-mono">GLOBAL OPERATIONS</span>
            </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 pb-10">
        
        {/* Left Column: Quick Stats & Heatmap */}
        <div className="xl:col-span-3 space-y-6 flex flex-col">
          <div className="glass-panel p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2">
              <Wifi className="w-4 h-4" /> Live Network
            </h2>
            <div>
              <p className="text-3xl font-mono text-white">{sessionCount?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Targets Tracked</p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-3xl font-mono text-white">{eventCount?.toLocaleString() || 0}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">Events Recorded</p>
            </div>
          </div>

          <div className="glass-panel p-5 flex-1">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">System Identity</h2>
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm font-mono space-y-2 py-4">
                <div>NODE: ALPHA-SEC-1</div>
                <div>FRAMEWORK: NEXTJS 15</div>
                <div>REGION: AP-SOUTH-1</div>
                <div className="text-cyan-500 mt-2 animate-pulse">DB: CONNECTED</div>
            </div>
          </div>
        </div>

        {/* Center Column: 3D Globe */}
        <div className="xl:col-span-6 glass-panel flex items-center justify-center relative overflow-hidden min-h-[400px] xl:min-h-0">
            <div className="absolute top-4 left-4 z-10">
                <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2 bg-slate-950/80 p-2 rounded backdrop-blur-md">
                <Globe2 className="w-4 h-4" /> Global Threat Radar
                </h2>
            </div>
            
            {/* 3D Rendered Globe */}
            <GlobeWrapper activeSessions={globeSessions || []} />
        </div>

        {/* Right Column: Alerts & Live Feed */}
        <div className="xl:col-span-3 space-y-6 flex flex-col">
          <div className="glass-panel p-5">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Top Sources</h2>
            <ul className="space-y-3 font-mono text-sm">
                {topSources.map((source, i) => (
                    <li key={source.name} className="flex justify-between items-center">
                        <span className="text-emerald-400 truncate pr-2" title={source.name}>{source.name}</span> 
                        <span className="text-slate-300 shrink-0">{source.count}</span>
                    </li>
                ))}
                {topSources.length === 0 && <li className="text-slate-500 italic">No sources detected.</li>}
            </ul>
          </div>

          <div className="glass-panel p-5 flex-1 flex flex-col overflow-hidden">
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase flex items-center gap-2 mb-4 shrink-0">
              <Activity className="w-4 h-4" /> Live Event Feed
            </h2>
            <LiveFeed />
          </div>
        </div>

      </div>
    </div>
  );
}
