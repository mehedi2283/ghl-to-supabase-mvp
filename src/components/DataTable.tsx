"use client"

import { cn } from "@/lib/utils"

interface DataTableProps {
    columns: { key: string; label: string; render?: (row: any) => React.ReactNode }[]
    data: any[]
    loading?: boolean
}

export function DataTable({ columns, data, loading }: DataTableProps) {
    if (loading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading data...</div>
    }

    if (!data || data.length === 0) {
        return <div className="p-8 text-center text-muted-foreground border rounded-md">No records found.</div>
    }

    return (
        <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="h-10 px-4 text-left font-medium text-muted-foreground">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                            {columns.map((col) => (
                                <td key={col.key} className="p-4 align-middle" suppressHydrationWarning>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
