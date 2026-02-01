import { NextResponse } from 'next/server'
import { ghlClient } from '@/lib/ghlClient'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Validate input: at least email or phone is required
        if (!body.email && !body.phone) {
            return NextResponse.json(
                { error: 'Either email or phone is required' },
                { status: 400 }
            )
        }

        // 1. Upsert to GHL
        const ghlResponse = await ghlClient.upsertContact(body)

        if (!ghlResponse || !ghlResponse.contact) {
            throw new Error('GHL API returned an invalid response')
        }

        const contact = ghlResponse.contact

        // 2. Upsert to Supabase (to keep in sync)
        const row = {
            ghl_contact_id: contact.id,
            location_id: contact.locationId,
            full_name: [contact.firstName, contact.lastName].filter(Boolean).join(' ') || null,
            email: contact.email || null,
            phone: contact.phone || null,
            business_name: contact.companyName || null,
            date_added: contact.dateAdded ? new Date(contact.dateAdded).toISOString() : null,
            last_activity_at: (contact.dateUpdated || contact.dateAdded) ? new Date(contact.dateUpdated || contact.dateAdded).toISOString() : null,
            tags: Array.isArray(contact.tags) ? contact.tags : [],
            last_synced_at: new Date().toISOString(),
            raw: contact
        }

        const { error: upsertError } = await supabaseAdmin
            .from('ghl_contacts')
            .upsert(row, {
                onConflict: 'ghl_contact_id'
            })

        if (upsertError) {
            console.error('Supabase upsert error:', upsertError)
            // We don't fail the request if Supabase fails, as GHL succeeded
        }

        return NextResponse.json({ success: true, contact })
    } catch (error: any) {
        console.error('Contact upsert error:', error)

        // Extract the actual error message from GHL API if available
        let errorMessage = error.message || 'Failed to save contact'
        let statusCode = 500

        // Try to parse GHL API error from the error message
        const ghlErrorMatch = errorMessage.match(/GHL API Error \[(\d+)\].*?: (.+)/)
        if (ghlErrorMatch) {
            statusCode = parseInt(ghlErrorMatch[1]) || 500
            try {
                const errorBody = JSON.parse(ghlErrorMatch[2])
                if (errorBody.message) {
                    errorMessage = errorBody.message
                } else if (Array.isArray(errorBody.errors)) {
                    errorMessage = errorBody.errors.join(', ')
                } else if (errorBody.error) {
                    errorMessage = errorBody.error
                }
            } catch {
                // If parsing fails, use the original message
            }
        }

        return NextResponse.json({ error: errorMessage }, { status: statusCode })
    }
}
