import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET() {
    const { data: conversations, error } = await supabaseAdmin
        .from('ghl_conversations')
        .select(`
            id,
            ghl_conversation_id,
            location_id,
            contact_id,
            full_name,
            contact_name,
            email,
            company_name,
            phone,
            last_message_at,
            last_message_body,
            last_message_type,
            last_message_direction,
            unread_count,
            tags,
            last_synced_at
        `)
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .limit(100)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversations: conversations || [] })
}
