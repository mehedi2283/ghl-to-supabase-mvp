"use client"

import { useEffect, useState } from "react"
import { StatCard } from "@/components/StatCard"
import { SyncButton } from "@/components/SyncButton"
import { supabaseAdmin } from "@/lib/supabaseServer" // Wait, this is server only!
// Only server components can import supabaseServer. Client components must fetch or use generic client.
// Dashboard is client-side for interactivity? Or Server component with client islands?
// Let's make the Page a Server Component and pass initial data, or use a Client Component with useEffect.
// Client component is easier for "live" updates without revalidating path.
// But we need a Supabase Client for client side. 
// For this demo, I'll fetch data via an API route or just use the same "sync" routes return values? 
// Actually I need a route to "get stats".
// Or I can make the page Server Component and have a Refresh button that calls router.refresh().

// Let's go with a Client Component that fetches stats from a new API route /api/stats or just use supabase-js client side (needs anon key).
// Since I haven't set up the public key in env for the client (only service role for server), 
// I should rely on Server Actions or API routes. 
// I'll create a simple /api/stats route.

import { ArrowRight } from "lucide-react"

export default function Dashboard() {
    const [stats, setStats] = useState<any>({
        contacts: { lastSyncedAt: null, count: 0 },
        pipelines: { lastSyncedAt: null, count: 0 },
        opportunities: { lastSyncedAt: null, count: 0 },
        conversations: { lastSyncedAt: null, count: 0 },
        runs: []
    })

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats')
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Failed to fetch stats", error)
        }
    }

    useEffect(() => {
        fetchStats()
        // Poll every 5 seconds for updates
        const interval = setInterval(fetchStats, 5000)
        return () => clearInterval(interval)
    }, [])

    const handleSync = async (entity: string) => {
        await fetch(`/api/sync/${entity}`, { method: 'POST' })
        await fetchStats() // Force immediate refresh
    }

    return (
        <main className="min-h-screen p-6 md:p-12 space-y-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass rounded-2xl p-8 mb-12">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        GHL Sync Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 max-w-lg text-lg">
                        Manage synchronization between GoHighLevel and Supabase with real-time monitoring.
                    </p>
                </div>
                <SyncButton
                    entity="all"
                    onSync={() => handleSync('all')}
                    className="h-12 px-8 text-lg shadow-lg hover:shadow-primary/20 bg-primary hover:bg-primary/90 border-0"
                />
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Contacts"
                    entity="contacts"
                    lastSyncedAt={stats.contacts.lastSyncedAt}
                    count={stats.contacts.count}
                    onSync={() => handleSync('contacts')}
                />
                <StatCard
                    title="Opportunities"
                    entity="opportunities"
                    lastSyncedAt={stats.opportunities.lastSyncedAt}
                    count={stats.opportunities.count}
                    onSync={() => handleSync('opportunities')}
                />
                <StatCard
                    title="Conversations"
                    entity="conversations"
                    lastSyncedAt={stats.conversations.lastSyncedAt}
                    count={stats.conversations.count}
                    onSync={() => handleSync('conversations')}
                />
            </div>

            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground/90">Recent Activity</h2>
                    <div className="h-px bg-border flex-1 ml-4 opacity-50" />
                </div>

                <div className="glass-card rounded-xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-white/5 text-muted-foreground uppercase text-xs tracking-wider font-semibold border-b border-white/5">
                                <tr>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Synced Stats</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {stats.runs.map((run: any) => (
                                    <tr key={run.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium capitalize text-foreground/90">
                                            {run.entity}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge status={run.status} />
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs">
                                            {run.status === 'success' ? (
                                                <span className="text-muted-foreground">
                                                    <span className="text-emerald-400">+{run.fetched_count}</span> fetched / <span className="text-blue-400">+{run.upserted_count}</span> upserted
                                                </span>
                                            ) : (
                                                <span className="text-red-400 truncate max-w-[200px] block" title={run.error}>
                                                    {run.error}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                            {new Date(run.started_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                                {stats.runs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                                                    <div className="h-2 w-2 bg-white/20 rounded-full" />
                                                </div>
                                                <p>No sync activity recorded yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </main>
    )
}

function Badge({ status }: { status: string }) {
    if (status === 'success') {
        return (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                Success
            </span>
        )
    }
    if (status === 'running') {
        return (
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20 animate-pulse">
                Running
            </span>
        )
    }
    return (
        <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
            Failed
        </span>
    )
}
