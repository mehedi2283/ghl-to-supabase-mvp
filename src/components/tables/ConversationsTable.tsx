"use client"

import { DataTable } from "@/components/DataTable"

const columns = [
    { key: 'contact_id', label: 'Contact ID' },
    {
        key: 'last_message_at',
        label: 'Last Message',
        render: (row: any) => row.last_message_at ? new Date(row.last_message_at).toLocaleString() : '-'
    },
    { key: 'ghl_conversation_id', label: 'GHL ID' },
    {
        key: 'last_synced_at',
        label: 'Last Synced',
        render: (row: any) => row.last_synced_at ? new Date(row.last_synced_at).toLocaleString() : 'Never'
    },
]

interface ConversationsTableProps {
    data: any[]
}

export function ConversationsTable({ data }: ConversationsTableProps) {
    return <DataTable columns={columns} data={data} />
}
