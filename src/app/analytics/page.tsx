import { supabaseAdmin } from "@/lib/supabase";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { BarChart2 } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
    // Fetch all sessions (or limit to a recent window) to aggregate stats
    const { data: sessions } = await supabaseAdmin.from('sessions').select('browser, os, country');

    const rawBrowsers: Record<string, number> = {};
    const rawOs: Record<string, number> = {};
    const rawCountries: Record<string, number> = {};

    sessions?.forEach(s => {
        rawBrowsers[s.browser] = (rawBrowsers[s.browser] || 0) + 1;
        rawOs[s.os] = (rawOs[s.os] || 0) + 1;
        rawCountries[s.country] = (rawCountries[s.country] || 0) + 1;
    });

    const browsers = Object.entries(rawBrowsers)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const os = Object.entries(rawOs)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

    const countries = Object.entries(rawCountries)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

    return (
        <div className="p-6 space-y-6 h-full flex flex-col overflow-y-auto">
            <header>
                <h1 className="text-2xl font-bold tracking-wider text-slate-100 flex items-center gap-3">
                    <BarChart2 className="w-6 h-6 text-cyan-400" />
                    ANALYTICS DASHBOARD
                </h1>
                <p className="text-slate-400 mt-2 text-sm">Aggregated metrics and intelligence from all recorded sessions.</p>
            </header>

            <AnalyticsCharts browsers={browsers} os={os} countries={countries} />
        </div>
    );
}
