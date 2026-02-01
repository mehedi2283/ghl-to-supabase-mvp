import { supabaseAdmin } from "@/lib/supabaseServer"
import { DataTable } from "@/components/DataTable"

export const dynamic = 'force-dynamic'

export default async function LogsPage() {
    const { data: runs } = await supabaseAdmin
        .from('sync_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(50)

    const columns = [
        { key: 'entity', label: 'Entity', render: (row: any) => <span className="capitalize font-medium">{row.entity}</span> },
        { key: 'status', label: 'Status' },
        { key: 'fetched_count', label: 'Fetched' },
        { key: 'upserted_count', label: 'Upserted' },
        { key: 'started_at', label: 'Started', render: (row: any) => new Date(row.started_at).toLocaleString() },
        { key: 'error', label: 'Error', render: (row: any) => row.error ? <span className="text-red-500 text-xs">{row.error}</span> : '-' },
    ]

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Sync Logs</h1>
            <DataTable columns={columns} data={runs || []} />
        </div>
    )
}
