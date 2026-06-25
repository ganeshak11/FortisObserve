import { supabaseAdmin } from "@/lib/supabase";
import { ArrowLeft, Clock, Globe2, Laptop, Network, ShieldAlert, Terminal, Activity, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function VisitorTimeline({ params }: { params: { id: string } }) {
    // Next.js 15+ requires awaiting params
    const { id } = await params;

    const { data: session } = await supabaseAdmin
        .from('sessions')
        .select('*')
        .eq('id', id)
        .single();

    if (!session) return notFound();

    const { data: events } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('session_id', id)
        .order('timestamp', { ascending: false });

    return (
        <div className="p-6 space-y-6 h-full flex flex-col max-w-7xl mx-auto w-full">
            <header className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                <div>
                    <Link href="/visitors" className="text-cyan-500 hover:text-cyan-400 flex items-center gap-2 text-sm font-mono mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        BACK TO SESSIONS
                    </Link>
                    <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-cyan-400" />
                        TARGET DOSSIER
                    </h1>
                    <p className="text-slate-400 mt-2 font-mono text-sm">UUID: {session.visitor_uuid}</p>
                </div>
                <div className="text-left xl:text-right font-mono text-xs text-slate-500">
                    <div>FIRST SEEN: {new Date(session.first_seen).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' })}</div>
                    <div>LAST SEEN: {new Date(session.last_seen).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' })}</div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Session Details Card */}
                <div className="xl:col-span-1 space-y-6">
                    <div className="glass-panel p-6 space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                                <Network className="w-4 h-4 text-cyan-500" /> Network
                            </h3>
                            <div className="text-sm font-mono text-slate-200 break-all">{session.ip_address}</div>
                            <div className="text-xs text-slate-400 truncate" title={session.isp}>{session.isp}</div>
                        </div>
                        
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                                <Globe2 className="w-4 h-4 text-emerald-500" /> Location
                            </h3>
                            <div className="text-sm text-slate-200">{session.city}</div>
                            <div className="text-xs text-slate-400">{session.country}</div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-3 flex items-center gap-2">
                                <Laptop className="w-4 h-4 text-purple-500" /> Fingerprint
                            </h3>
                            <div className="text-sm text-slate-200">{session.device} / {session.os}</div>
                            <div className="text-xs text-slate-400 break-all">{session.browser}</div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                            <div className="text-2xl font-mono text-cyan-400">{session.total_visits}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Total Connections</div>
                        </div>
                    </div>
                </div>

                {/* Event Timeline */}
                <div className="xl:col-span-3 glass-panel p-6 flex flex-col overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" /> Activity Log
                    </h3>
                    
                    <div className="flex-1 overflow-auto pr-2 space-y-6">
                        {events && events.length > 0 ? events.map((ev: any, i: number) => (
                            <div key={ev.id} className="relative flex gap-4">
                                {i !== events.length - 1 && (
                                    <div className="absolute left-4 top-8 bottom-[-24px] w-px bg-slate-800"></div>
                                )}
                                <div className="relative shrink-0 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center z-10">
                                    {ev.is_bot ? (
                                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                                    ) : (
                                        <FileText className="w-4 h-4 text-cyan-500" />
                                    )}
                                </div>
                                <div className="flex-1 bg-slate-900/40 rounded-lg border border-slate-800 p-4 overflow-hidden">
                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4 mb-2">
                                        <div className="font-mono text-sm text-emerald-400 break-all">
                                            GET {ev.path}
                                        </div>
                                        <div className="shrink-0 text-xs font-mono text-slate-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(ev.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'medium' })}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 mt-3">
                                        {ev.referer && ev.referer !== 'null' && (
                                            <div className="truncate w-full"><span className="text-slate-600">REF:</span> {ev.referer}</div>
                                        )}
                                        {ev.latency_ms && (
                                            <div><span className="text-slate-600">LATENCY:</span> {ev.latency_ms}ms</div>
                                        )}
                                        {ev.is_bot && (
                                            <div className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">SUSPECTED BOT</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-slate-500 py-12 font-mono text-sm italic">
                                No specific events recorded for this session. (Legacy session or data cleared).
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
