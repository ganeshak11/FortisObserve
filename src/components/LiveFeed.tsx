"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabaseClient";

export function LiveFeed() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Subscribe to new INSERTS on the 'events' table
    const channel = supabaseClient
      .channel('realtime_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        setEvents((prev) => {
           const newEvents = [payload.new, ...prev];
           return newEvents.slice(0, 50); // Keep last 50 events in memory to prevent DOM bloat
        });
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  if (events.length === 0) {
     return <div className="text-slate-500 italic animate-pulse text-xs text-center mt-10">Listening for telemetry...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto font-mono text-xs space-y-2 pr-2">
      {events.map((ev) => {
        const timeString = new Date(ev.timestamp).toLocaleTimeString('en-US', { hour12: false });
        return (
            <div key={ev.id} className="flex items-center gap-2">
                <span className="text-cyan-500 shrink-0">[{timeString}]</span>
                {ev.is_bot ? (
                    <span className="text-rose-500 font-bold shrink-0">BOT</span>
                ) : (
                    <span className="text-emerald-400 shrink-0">IN</span>
                )}
                <span className="text-slate-300 truncate">{ev.path}</span>
            </div>
        );
      })}
    </div>
  );
}
