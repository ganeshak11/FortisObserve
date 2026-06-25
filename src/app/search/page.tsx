"use client";

import { useState } from "react";
import { performGlobalSearch } from "./actions";
import { Search as SearchIcon, Terminal, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ sessions: any[], events: any[] }>({ sessions: [], events: [] });
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (query.length < 2) return;
        setIsSearching(true);
        const data = await performGlobalSearch(query);
        setResults(data);
        setIsSearching(false);
    };

    return (
        <div className="p-6 space-y-6 h-full flex flex-col max-w-5xl mx-auto w-full">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <SearchIcon className="w-6 h-6 text-cyan-400" />
                    GLOBAL SEARCH
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Query telemetry data by IP Address, Location, Target Path, or UUID.</p>
            </header>

            <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-cyan-500" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter search query..."
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-100 rounded-lg pl-12 pr-32 py-4 focus:outline-none focus:border-cyan-500 transition-colors font-mono shadow-lg"
                />
                <button
                    type="submit"
                    disabled={isSearching || query.length < 2}
                    className="absolute inset-y-2 right-2 bg-cyan-950 text-cyan-400 hover:bg-cyan-900 px-6 rounded font-bold tracking-widest text-xs uppercase transition-colors disabled:opacity-50"
                >
                    {isSearching ? 'Scanning...' : 'Search'}
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-8">
                {/* Session Results */}
                {results.sessions.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                            <Terminal className="w-4 h-4" /> Matching Targets ({results.sessions.length})
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {results.sessions.map(s => (
                                <Link href={`/visitors/${s.id}`} key={s.id} className="glass-panel p-4 border border-slate-800 hover:border-cyan-900 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-cyan-400 font-mono text-sm">{s.ip_address}</div>
                                            <div className="text-slate-400 text-xs mt-1">{s.city}, {s.country}</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Event Results */}
                {results.events.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 tracking-widest uppercase flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Matching Events ({results.events.length})
                        </h2>
                        <div className="space-y-2">
                            {results.events.map(ev => (
                                <Link href={`/visitors/${ev.session_id}`} key={ev.id} className="glass-panel p-3 border border-slate-800 hover:border-cyan-900 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-emerald-400 font-mono text-xs">{ev.path}</div>
                                        <div className="text-slate-500 font-mono text-[10px] hidden md:block">
                                            {ev.sessions?.ip_address} ({ev.sessions?.visitor_uuid.substring(0,8)})
                                        </div>
                                    </div>
                                    <div className="text-slate-500 text-xs whitespace-nowrap">
                                        {new Date(ev.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', timeStyle: 'short', dateStyle: 'short' })}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {!isSearching && query.length >= 2 && results.sessions.length === 0 && results.events.length === 0 && (
                    <div className="text-center py-12 text-slate-500 font-mono text-sm italic">
                        No telemetry records matched your query.
                    </div>
                )}
            </div>
        </div>
    );
}
