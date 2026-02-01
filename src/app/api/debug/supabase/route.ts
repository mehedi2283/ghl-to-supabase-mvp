import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('sync_runs')
            .insert({
                entity: 'test_debug',
                status: 'running'
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({
                status: 'error',
                sbError: error,
                envSize: {
                    url: (process.env.SUPABASE_URL || '').length,
                    key: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').length
                }
            }, { status: 200 })
        }

        return NextResponse.json({
            status: 'success',
            data
        })
    } catch (err: any) {
        return NextResponse.json({
            status: 'exception',
            message: err.message,
            stack: err.stack
        }, { status: 200 })
    }
}
