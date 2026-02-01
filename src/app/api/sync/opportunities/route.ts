import { NextResponse } from 'next/server'
import { runSync } from '@/lib/syncService'

export const dynamic = 'force-dynamic'

export async function POST() {
    const result = await runSync('opportunities')
    return NextResponse.json(result)
}
