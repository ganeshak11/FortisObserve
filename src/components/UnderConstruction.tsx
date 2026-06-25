import { HardHat } from "lucide-react";

export function UnderConstruction({ title }: { title: string }) {
    return (
        <div className="p-6 h-full flex items-center justify-center">
            <div className="glass-panel p-12 text-center max-w-md w-full border border-slate-800">
                <HardHat className="w-16 h-16 text-cyan-500 mx-auto mb-6 opacity-80" />
                <h1 className="text-xl font-bold tracking-widest text-slate-100 mb-2 uppercase">{title}</h1>
                <p className="text-slate-400 text-sm font-mono mt-4">This module is scheduled for future deployment.</p>
                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 font-mono">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    MODULE OFFLINE
                </div>
            </div>
        </div>
    );
}
