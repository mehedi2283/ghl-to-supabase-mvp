import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const pipelineId = searchParams.get('pipelineId')

        let query = supabaseAdmin
            .from('ghl_opportunities')
            .select('*')

        if (pipelineId) {
            query = query.eq('pipeline_id', pipelineId)
        }

        const { data: opportunities, error } = await query.order('last_synced_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ opportunities: opportunities || [] })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
