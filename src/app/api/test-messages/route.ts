import { ghlClient } from '@/lib/ghlClient'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        // Test with a known conversation ID
        const testConvId = '49lWGG0aECCjxsABJeCb'

        console.log('[Test] Attempting to fetch messages for:', testConvId)

        const messages = await ghlClient.getConversationMessages(testConvId)

        console.log('[Test] Success! Got', messages.length, 'messages')
        console.log('[Test] First message sample:', messages[0])

        return NextResponse.json({
            success: true,
            count: messages.length,
            messages: messages.slice(0, 3) // First 3 messages
        })
    } catch (error: any) {
        console.error('[Test] Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
