"use client"

import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

interface SyncButtonProps {
    entity: string
    onSync: () => Promise<void>
    className?: string
}

export function SyncButton({ entity, onSync, className }: SyncButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleClick = async () => {
        if (loading) return
        setLoading(true)
        try {
            await onSync()
        } catch (err) {
            console.error("Sync failed", err)
            alert(`Sync failed for ${entity}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                "h-9 px-4 py-2",
                className
            )}
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                </>
            ) : (
                <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync {entity === 'all' ? 'All' : ''}
                </>
            )}
        </button>
    )
}
