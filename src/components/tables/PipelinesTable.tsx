"use client"

import { DataTable } from "@/components/DataTable"

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'ghl_pipeline_id', label: 'GHL ID' },
    { key: 'location_id', label: 'Location ID' },
    {
        key: 'last_synced_at',
        label: 'Last Synced',
        render: (row: any) => row.last_synced_at ? new Date(row.last_synced_at).toLocaleString() : 'Never'
    },
]

interface PipelinesTableProps {
    data: any[]
}

export function PipelinesTable({ data }: PipelinesTableProps) {
    return <DataTable columns={columns} data={data} />
}
