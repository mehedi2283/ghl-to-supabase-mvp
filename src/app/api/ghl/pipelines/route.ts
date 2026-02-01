import { NextResponse } from 'next/server'
import { ghlClient } from '@/lib/ghlClient'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const data = await ghlClient.getPipelines()
        return NextResponse.json(data)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
