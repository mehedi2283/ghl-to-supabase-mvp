import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { data: contacts, error } = await supabaseAdmin
            .from('ghl_contacts')
            .select('*')
            .limit(5)

        return NextResponse.json({
            columns: contacts && contacts[0] ? Object.keys(contacts[0]) : [],
            sample_data: contacts
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
