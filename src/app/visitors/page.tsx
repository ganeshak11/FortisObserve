import { supabaseAdmin } from "@/lib/supabase";
import { Users } from "lucide-react";
import { VisitorTable } from "@/components/VisitorTable";

export const dynamic = 'force-dynamic';

export default async function VisitorsPage() {
    const { data: sessions, error } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .order('last_seen', { ascending: false })
        .limit(100);

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <Users className="w-6 h-6 text-cyan-400" />
                    VISITOR SESSIONS
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Unique identified sessions across the network.</p>
            </header>

            <div className="glass-panel flex-1 overflow-hidden flex flex-col">
                <VisitorTable initialSessions={sessions || []} />
            </div>
        </div>
    );
}
