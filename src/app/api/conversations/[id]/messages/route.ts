import { NextResponse } from 'next/server'
import { ghlClient } from '@/lib/ghlClient'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: conversationId } = await params
        console.log('[Messages API] Fetching messages for conversation:', conversationId)

        // 1. Fetch messages from GHL
        let messages = []
        try {
            messages = await ghlClient.getConversationMessages(conversationId)
            console.log('[Messages API] Fetched from GHL:', messages.length, 'messages')
        } catch (ghlError: any) {
            console.error('[Messages API] GHL fetch failed:', ghlError.message)
            // Continue to try database even if GHL fails
        }

        // 2. Upsert to database
        if (messages.length > 0) {
            const rows = messages.map((msg: any) => ({
                ghl_message_id: msg.id,
                conversation_id: msg.conversationId || conversationId,
                contact_id: msg.contactId,
                body: msg.body,
                direction: msg.direction, // inbound or outbound
                status: msg.status,
                message_type: msg.type,
                sent_at: msg.dateAdded ? new Date(msg.dateAdded).toISOString() : null,
                raw: msg,
                last_synced_at: new Date().toISOString()
            }))

            // Deduplicate
            const deduped = Array.from(
                new Map(rows.map(row => [row.ghl_message_id, row])).values()
            )

            const { error } = await supabaseAdmin
                .from('ghl_messages')
                .upsert(deduped, {
                    onConflict: 'ghl_message_id',
                    ignoreDuplicates: false
                })

            if (error) {
                console.error('[Messages API] Failed to upsert messages', error)
                return NextResponse.json({ error: error.message }, { status: 500 })
            }
            console.log('[Messages API] Upserted', deduped.length, 'messages')
        }

        // 3. Fetch from database (to get consistent format)
        const { data, error: fetchError } = await supabaseAdmin
            .from('ghl_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('sent_at', { ascending: true })

        if (fetchError) {
            console.error('[Messages API] Database fetch failed:', fetchError)
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        console.log('[Messages API] Returning', data?.length || 0, 'messages from database')
        return NextResponse.json({ messages: data || [] })
    } catch (err: any) {
        console.error('[Messages API] Unexpected error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
