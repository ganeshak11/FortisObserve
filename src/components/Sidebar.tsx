"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Globe, LayoutDashboard, Users, Clock, Search, Settings, FileText, BarChart2, Menu, X } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    if (pathname === '/lockdown') return null;

    const links = [
        { href: "/", label: "Command Center", icon: LayoutDashboard },
        { href: "/live", label: "Live Feed", icon: Activity },
        { href: "/map", label: "Global Map", icon: Globe },
        { href: "/visitors", label: "Visitors", icon: Users },
        { href: "/sessions", label: "Sessions", icon: Clock },
        { href: "/blogs", label: "Blog Intel", icon: FileText },
        { href: "/analytics", label: "Analytics", icon: BarChart2 },
        { href: "/search", label: "Search", icon: Search },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-md text-slate-200 shadow-lg"
            >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Backdrop */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-slate-950/80 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside className={`
                fixed md:relative top-0 left-0 z-40
                w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col shrink-0
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            `}>
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-widest text-cyan-400 flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        FORTIS OBSERVE
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Live Telemetry</p>
                </div>
                
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        const Icon = link.icon;
                        return (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                                    isActive 
                                    ? "bg-slate-800 text-cyan-400 shadow-[inset_2px_0_0_0_#22d3ee]" 
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-sm font-medium">{link.label}</span>
                            </Link>
                        );
                    })}
                </nav>
                
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>System Status</span>
                        <span className="flex items-center gap-1 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Healthy
                        </span>
                    </div>
                </div>
            </aside>
        </>
    );
}
