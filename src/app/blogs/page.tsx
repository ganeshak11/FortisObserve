import { supabaseAdmin } from "@/lib/supabase";
import { FileText, Eye } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function BlogsPage() {
    // Fetch all blog events
    const { data: blogEvents } = await supabaseAdmin
        .from('events')
        .select('path, is_bot')
        .like('path', '/blog/%');

    const counts: Record<string, { total: number, bots: number }> = {};
    
    blogEvents?.forEach(e => {
        if (!counts[e.path]) counts[e.path] = { total: 0, bots: 0 };
        counts[e.path].total += 1;
        if (e.is_bot) counts[e.path].bots += 1;
    });

    const leaderboard = Object.entries(counts)
        .map(([path, stats]) => ({ path, ...stats }))
        .sort((a, b) => b.total - a.total);

    return (
        <div className="p-6 space-y-6 h-full flex flex-col overflow-y-auto">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-cyan-400" />
                    BLOG INTELLIGENCE
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Traffic analysis specifically filtered for your published articles.</p>
            </header>

            <div className="glass-panel overflow-hidden border border-slate-800">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-widest">Article Path</th>
                            <th className="px-6 py-4 font-bold tracking-widest">Total Views</th>
                            <th className="px-6 py-4 font-bold tracking-widest">Human vs Bot</th>
                            <th className="px-6 py-4 font-bold tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                        {leaderboard.map((item, index) => {
                            const humanPercent = Math.round(((item.total - item.bots) / item.total) * 100);
                            return (
                                <tr key={item.path} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 flex items-center gap-3">
                                        <span className="text-slate-600 font-bold w-4">{index + 1}.</span>
                                        <span className="text-emerald-400">{item.path}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-200">
                                        {item.total.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-32 h-2 bg-rose-500/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-cyan-500" style={{ width: `${humanPercent}%` }}></div>
                                            </div>
                                            <span className="text-slate-500 text-[10px]">{humanPercent}% Human</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`https://ganeshangadi.online${item.path}`} target="_blank" className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors">
                                            <Eye className="w-4 h-4" />
                                            View Live
                                        </Link>
                                    </td>
                                </tr>
                            )
                        })}
                        {leaderboard.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">No blog traffic recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
