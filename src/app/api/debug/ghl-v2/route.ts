import { NextResponse } from 'next/server'
import { ghlClient } from '@/lib/ghlClient'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const contacts = await ghlClient.getContacts(1)
        return NextResponse.json({
            status: 'success',
            message: 'Connected to GHL',
            count: contacts.length,
            sample: contacts.slice(0, 2)
        })
    } catch (error: any) {
        return NextResponse.json({
            status: 'error2',
            message: error.message,
            stack: error.stack,
            envCheck: {
                hasToken: !!process.env.GHL_ACCESS_TOKEN,
                hasLocation: !!process.env.GHL_LOCATION_ID
            }
        }, { status: 200 })
    }
}
