import { GlobeWrapper } from "@/components/GlobeWrapper";
import { Globe2 } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export default async function MapPage() {
    const { data: globeSessions } = await supabaseAdmin.from('sessions').select('country, city, ip_address, latitude, longitude').limit(500);

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <Globe2 className="w-6 h-6 text-cyan-400" />
                    FORTIS RADAR
                </h1>
                <p className="text-slate-400 mt-2 text-sm">3D Geographic visualization of traffic sources and endpoints.</p>
            </header>
            <div className="glass-panel flex-1 flex items-center justify-center relative overflow-hidden">
                <GlobeWrapper activeSessions={globeSessions || []} />
            </div>
        </div>
    );
}
