"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#06b6d4', '#10b981', '#a855f7', '#f43f5e', '#f59e0b', '#3b82f6'];

export function AnalyticsCharts({ 
    browsers, os, countries, visitorTypes = [], topPages = [], topReferrers = [] 
}: { 
    browsers: any[], os: any[], countries: any[], visitorTypes?: any[], topPages?: any[], topReferrers?: any[] 
}) {
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

            {/* Returning vs New Visitors */}
            <div className="glass-panel p-6 border border-slate-800 flex flex-col h-80 lg:col-span-1">
                <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6">Visitor Retention</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={visitorTypes}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {visitorTypes.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
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
                    {visitorTypes.map((v, i) => (
                        <div key={v.name} className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: i === 0 ? '#10b981' : '#f59e0b' }}></span>
                            <span className="text-slate-400">{v.name} ({v.value})</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Pages */}
            <div className="glass-panel p-6 border border-slate-800 flex flex-col h-80 lg:col-span-1">
                <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-4">Top Pages</h3>
                <ul className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2">
                    {topPages.map((page, i) => (
                        <li key={page.name} className="flex justify-between items-center group">
                            <span className="text-cyan-400 truncate pr-4" title={page.name}>{page.name}</span>
                            <span className="text-slate-300 bg-slate-800/50 px-2 py-1 rounded">{page.value}</span>
                        </li>
                    ))}
                    {topPages.length === 0 && <li className="text-slate-500 italic text-center mt-10">No page data available.</li>}
                </ul>
            </div>

            {/* Top Referrers */}
            <div className="glass-panel p-6 border border-slate-800 flex flex-col h-80 lg:col-span-1">
                <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-4">Top Referrers</h3>
                <ul className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-2">
                    {topReferrers.map((ref, i) => (
                        <li key={ref.name} className="flex justify-between items-center">
                            <span className="text-emerald-400 truncate pr-4 capitalize" title={ref.name}>{ref.name}</span>
                            <span className="text-slate-300 bg-slate-800/50 px-2 py-1 rounded">{ref.value}</span>
                        </li>
                    ))}
                    {topReferrers.length === 0 && <li className="text-slate-500 italic text-center mt-10">No referrer data available.</li>}
                </ul>
            </div>

        </div>
    );
}
