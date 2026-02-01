"use client"

import { DataTable } from "@/components/DataTable"

const columns = [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    {
        key: 'value',
        label: 'Value',
        render: (row: any) => row.value ? `$${row.value}` : '-'
    },
    { key: 'ghl_opportunity_id', label: 'GHL ID' },
    {
        key: 'last_synced_at',
        label: 'Last Synced',
        render: (row: any) => row.last_synced_at ? new Date(row.last_synced_at).toLocaleString() : 'Never'
    },
]

interface OpportunitiesTableProps {
    data: any[]
}

export function OpportunitiesTable({ data }: OpportunitiesTableProps) {
    return <DataTable columns={columns} data={data} />
}
