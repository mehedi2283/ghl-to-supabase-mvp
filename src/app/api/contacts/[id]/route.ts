import { NextResponse } from 'next/server'
import { ghlClient } from '@/lib/ghlClient'
import { runSync } from '@/lib/syncService'

export const dynamic = 'force-dynamic'

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const contactId = params.id

        if (!contactId || contactId === 'undefined' || contactId === 'null') {
            return NextResponse.json({ error: 'Valid Contact ID is required for updates' }, { status: 400 })
        }

        const body = await request.json()
        const { firstName, lastName, email, phone } = body

        if (!email && !phone) {
            return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400 })
        }

        const ghlResponse = await ghlClient.updateContact(contactId, {
            firstName,
            lastName,
            email,
            phone
        })

        // Trigger a sync for contacts to update local DB
        await runSync('contacts')

        return NextResponse.json({ success: true, contact: ghlResponse.contact })
    } catch (err: any) {
        console.error('Update contact error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
