import { supabaseAdmin } from "@/lib/supabase";
import { Clock, ShieldAlert, FileText, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function SessionsPage() {
    // We repurpose the "Sessions" sidebar link to show a raw Global Event Log
    const { data: events } = await supabaseAdmin
        .from('events')
        .select(`
            *,
            sessions ( visitor_uuid, ip_address, country )
        `)
        .order('timestamp', { ascending: false })
        .limit(200);

    return (
        <div className="p-6 space-y-6 h-full flex flex-col">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <Clock className="w-6 h-6 text-cyan-400" />
                    GLOBAL EVENT LOG
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Chronological ledger of the most recent network requests.</p>
            </header>

            <div className="glass-panel flex-1 overflow-hidden flex flex-col border border-slate-800">
                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 sticky top-0">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-widest">Time</th>
                                <th className="px-6 py-4 font-bold tracking-widest">Target Path</th>
                                <th className="px-6 py-4 font-bold tracking-widest">Source IP</th>
                                <th className="px-6 py-4 font-bold tracking-widest">Type</th>
                                <th className="px-6 py-4 font-bold tracking-widest text-right">Dossier</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                            {events?.map((ev) => (
                                <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                        {new Date(ev.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-emerald-400 truncate max-w-[300px]" title={ev.path}>{ev.path}</div>
                                        {ev.referer && ev.referer !== 'null' && (
                                            <div className="text-[10px] text-slate-500 truncate max-w-[300px] mt-1">Ref: {ev.referer}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-300">{ev.sessions?.ip_address}</div>
                                        <div className="text-[10px] text-slate-500">{ev.sessions?.country}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {ev.is_bot ? (
                                            <span className="flex items-center gap-1 text-rose-500 bg-rose-500/10 px-2 py-1 rounded w-fit">
                                                <ShieldAlert className="w-3 h-3" /> BOT
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded w-fit">
                                                <FileText className="w-3 h-3" /> HUMAN
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/visitors/${ev.session_id}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-cyan-400 transition-colors">
                                            <LinkIcon className="w-3 h-3" /> Target
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {(!events || events.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No events recorded.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
