import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET() {
    const tables = ['ghl_contacts', 'ghl_pipelines', 'ghl_opportunities', 'ghl_conversations']
    const stats: any = {}

    for (const table of tables) {
        const entity = table.replace('ghl_', '')

        // Get count
        const { count } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true })

        // Get last synced
        const { data: last } = await supabaseAdmin
            .from(table)
            .select('last_synced_at')
            .order('last_synced_at', { ascending: false })
            .limit(1)
            .single()

        stats[entity] = {
            count: count || 0,
            lastSyncedAt: last?.last_synced_at || null
        }
    }

    // Get recent runs
    const { data: runs } = await supabaseAdmin
        .from('sync_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10)

    stats.runs = runs || []

    return NextResponse.json(stats)
}
