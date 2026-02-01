import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')
        const offset = (page - 1) * limit

        const { data, error, count } = await supabaseAdmin
            .from('ghl_contacts')
            .select('*', { count: 'exact' })
            .order('date_added', { ascending: false, nullsFirst: false })
            .range(offset, offset + limit - 1)

        if (error) throw error

        return NextResponse.json({
            contacts: data || [],
            total: count || 0,
            page,
            limit
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
