import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { data: pipelines, error } = await supabaseAdmin
            .from('ghl_pipelines')
            .select('*')
            .order('name', { ascending: true })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ pipelines: pipelines || [] })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
