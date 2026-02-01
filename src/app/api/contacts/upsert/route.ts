import { NextResponse } from 'next/server'
import { ghlClient } from '@/lib/ghlClient'
import { runSync } from '@/lib/syncService'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { firstName, lastName, email, phone } = body

        if (!email && !phone) {
            return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400 })
        }

        const ghlResponse = await ghlClient.upsertContact({
            firstName,
            lastName,
            email,
            phone
        })

        // Trigger a sync for contacts to update local DB
        await runSync('contacts')

        return NextResponse.json({
            success: true,
            contact: ghlResponse.contact,
            message: 'Contact upserted successfully'
        })
    } catch (err: any) {
        console.error('Upsert contact error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
