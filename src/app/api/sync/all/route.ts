import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'
import { runSync } from '@/lib/syncService'

export const dynamic = 'force-dynamic'

export async function POST() {
    // 1. Create Parent Run
    const { data: parentRun, error } = await supabaseAdmin
        .from('sync_runs')
        .insert({ entity: 'all', status: 'running' })
        .select()
        .single()

    if (error || !parentRun) {
        return NextResponse.json({ error: 'Failed to start parent run' }, { status: 500 })
    }

    // 2. Run Child Syncs Sequentially
    const entities = ['contacts', 'pipelines', 'opportunities', 'conversations'] as const
    const results: Record<string, any> = {}
    let hasError = false

    for (const entity of entities) {
        const res = await runSync(entity, parentRun.id)
        results[entity] = res
        if (!res.success) hasError = true
    }

    // 3. Update Parent Run
    await supabaseAdmin
        .from('sync_runs')
        .update({
            status: hasError ? 'failed' : 'success',
            finished_at: new Date().toISOString()
        })
        .eq('id', parentRun.id)

    return NextResponse.json({ success: !hasError, runId: parentRun.id, results })
}
