"use client";

import { useState } from "react";
import { Search, Terminal, ArrowDown, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";

export function VisitorTable({ initialSessions }: { initialSessions: any[] }) {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const filteredAndSorted = initialSessions
        .filter(s => 
            s.ip_address?.includes(search) || 
            s.visitor_uuid?.includes(search) ||
            s.country?.toLowerCase().includes(search.toLowerCase()) ||
            s.city?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => {
            const timeA = new Date(a.last_seen).getTime();
            const timeB = new Date(b.last_seen).getTime();
            return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
        });

    return (
        <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center gap-4 bg-slate-900/50">
                <div className="flex items-center gap-2 text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 w-64">
                    <Search className="w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search IP, Location, or ID..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm flex-1 text-slate-200" 
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-slate-900 text-slate-400 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-6 py-4 font-bold tracking-widest">Target ID</th>
                            <th className="px-6 py-4 font-bold tracking-widest">Origin (IP)</th>
                            <th className="px-6 py-4 font-bold tracking-widest">Location</th>
                            <th className="px-6 py-4 font-bold tracking-widest">Device</th>
                            <th 
                                className="px-6 py-4 font-bold tracking-widest cursor-pointer hover:text-slate-200 flex items-center gap-2 select-none"
                                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                            >
                                Last Seen
                                {sortOrder === 'desc' ? <ArrowDown className="w-3 h-3 text-cyan-400" /> : <ArrowUp className="w-3 h-3 text-cyan-400" />}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                        {filteredAndSorted.map((session) => (
                            <tr 
                                key={session.id} 
                                className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                                onClick={() => router.push(`/visitors/${session.id}`)}
                            >
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <Terminal className="w-4 h-4 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="text-cyan-400">{session.visitor_uuid.substring(0, 8)}...</span>
                                </td>
                                <td className="px-6 py-4">{session.ip_address}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-slate-200">{session.country}, {session.city}</span>
                                        <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{session.isp}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 flex-wrap max-w-[150px]">
                                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-emerald-400">{session.os}</span>
                                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] text-emerald-400">{session.browser}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                    {new Date(session.last_seen).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'medium' })}
                                </td>
                            </tr>
                        ))}
                        {filteredAndSorted.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No matching sessions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
