"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#06b6d4', '#10b981', '#a855f7', '#f43f5e', '#f59e0b', '#3b82f6'];

export function AnalyticsCharts({ browsers, os, countries }: { browsers: any[], os: any[], countries: any[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Top Browsers */}
            <div className="glass-panel p-6 border border-slate-800 flex flex-col h-80">
                <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6">Top Browsers</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={browsers}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {browsers.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                                itemStyle={{ color: '#22d3ee' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs font-mono">
                    {browsers.map((b, i) => (
                        <div key={b.name} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                            <span className="text-slate-400">{b.name} ({b.value})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Operating Systems */}
            <div className="glass-panel p-6 border border-slate-800 flex flex-col h-80">
                <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6">Operating Systems</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={os} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip 
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                            />
                            <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Countries */}
            <div className="glass-panel p-6 border border-slate-800 flex flex-col h-80 lg:col-span-1 md:col-span-2">
                <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6">Top Regions</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={countries} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <YAxis hide />
                            <Tooltip 
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '0.5rem', color: '#f8fafc', fontSize: '12px' }}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
