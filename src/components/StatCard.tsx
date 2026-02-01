"use client"

import { useState } from "react"
import { SyncButton } from "./SyncButton"
import { Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
    title: string
    entity: string
    lastSyncedAt?: string | null
    count?: number
    loading?: boolean
    onSync: () => Promise<void>
}

export function StatCard({ title, entity, lastSyncedAt, count, onSync }: StatCardProps) {
    const [syncedRecently, setSyncedRecently] = useState(false)

    const handleSync = async () => {
        await onSync()
        setSyncedRecently(true)
        setTimeout(() => setSyncedRecently(false), 2000)
    }

    return (
        <div className="glass-card rounded-xl p-6 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {/* Optional icon based on entity could go here */}
                <div className="h-24 w-24 bg-primary/30 rounded-full blur-3xl -mr-10 -mt-10" />
            </div>

            <div className="flex flex-col space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-medium text-lg tracking-tight text-foreground/90">{title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-mono" suppressHydrationWarning>
                            {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : "Never synced"}
                        </p>
                    </div>
                    {syncedRecently && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 animate-in fade-in zoom-in duration-300">
                            Synced
                        </span>
                    )}
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70" suppressHydrationWarning>
                        {count !== undefined ? count.toLocaleString() : "-"}
                    </div>
                </div>

                <div className="pt-2">
                    <SyncButton
                        entity={entity}
                        onSync={handleSync}
                        className="w-full bg-secondary/50 hover:bg-primary/20 hover:text-primary border-white/5"
                    />
                </div>
            </div>
        </div>
    )
}
