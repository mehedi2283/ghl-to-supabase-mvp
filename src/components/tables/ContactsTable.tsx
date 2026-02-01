"use client"

import { DataTable } from "@/components/DataTable"
import { Phone, Mail, MessageSquare, Clock, Tag, Building2, Calendar, User, MoreHorizontal, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const columns = [
    {
        key: 'full_name',
        label: 'Contact Name',
        render: (row: any) => (
            <div className="flex items-center gap-4 py-2">
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
                    "bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
                )}>
                    {(row.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-100 group-hover:text-violet-400 transition-colors">
                        {row.full_name || 'Unknown'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">Contact</span>
                </div>
            </div>
        )
    },
    {
        key: 'phone',
        label: 'Phone',
        render: (row: any) => row.phone ? (
            <div className="flex items-center gap-2.5 text-slate-300 group-hover:text-slate-100 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/30">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-sm font-medium">{row.phone}</span>
            </div>
        ) : <span className="text-slate-600 text-xs italic ml-9">No phone</span>
    },
    {
        key: 'email',
        label: 'Email',
        render: (row: any) => row.email ? (
            <div className="flex items-center gap-2.5 text-slate-300 group-hover:text-slate-100 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-slate-800/50 flex items-center justify-center border border-slate-700/30">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="text-sm font-medium truncate max-w-[180px]">{row.email}</span>
            </div>
        ) : <span className="text-slate-600 text-xs italic ml-9">No email</span>
    },
    {
        key: 'business_name',
        label: 'Business Name',
        render: (row: any) => (
            <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-sm text-slate-400 font-medium">{row.business_name || '-'}</span>
            </div>
        )
    },
    {
        key: 'date_added',
        label: 'Created',
        render: (row: any) => row.date_added ? (
            <div className="flex flex-col gap-0.5">
                <div className="text-slate-300 text-xs font-semibold">
                    {new Date(row.date_added).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="text-[10px] text-slate-500">
                    {new Date(row.date_added).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        ) : <span className="text-slate-600">-</span>
    },
    {
        key: 'last_activity',
        label: 'Last Activity',
        render: (row: any) => {
            const date = row.last_activity_at || row.date_added;
            if (!date) return <span className="text-slate-600">-</span>;

            const now = new Date();
            const activityDate = new Date(date);
            const diffDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 3600 * 24));

            let label = 'Today';
            if (diffDays === 1) label = 'Yesterday';
            else if (diffDays > 1) label = `${diffDays} days ago`;

            return (
                <div className="flex items-center gap-2 text-violet-400 text-xs font-semibold bg-violet-400/5 px-2 py-1 rounded-full border border-violet-400/10 w-fit">
                    <MessageSquare className="w-3 h-3" />
                    <span>{label}</span>
                </div>
            );
        }
    },
    {
        key: 'tags',
        label: 'Tags',
        render: (row: any) => {
            const tags = row.tags || [];
            if (tags.length === 0) return <span className="text-slate-600 text-[10px] italic">No tags</span>;

            return (
                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                    {tags.slice(0, 2).map((tag: string, i: number) => (
                        <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-800 text-violet-300 text-[10px] font-bold border border-violet-500/20 shadow-sm">
                            {tag}
                        </span>
                    ))}
                    {tags.length > 2 && (
                        <span className="px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-500 text-[10px] font-bold border border-slate-700">
                            +{tags.length - 2}
                        </span>
                    )}
                </div>
            );
        }
    },
    {
        key: 'actions',
        label: '',
        // The render function for actions is handled directly in the tbody to pass onEdit
        // render: () => (
        //     <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-500 hover:text-slate-300">
        //         <ChevronRight className="w-5 h-5" />
        //     </button>
        // )
    }
]

interface ContactsTableProps {
    data: any[]
    onEdit: (contact: any) => void
}

export function ContactsTable({ data, onEdit }: ContactsTableProps) {
    return (
        <div className="relative group/table">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-2xl blur-xl opacity-50 group-hover/table:opacity-75 transition duration-1000"></div>

            <div className="relative glass rounded-2xl border border-slate-700/30 overflow-hidden shadow-2xl backdrop-blur-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/50 border-b border-slate-700/50">
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {data.map((row, i) => (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-6 py-4 align-middle">
                                            {col.key === 'actions' ? (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onEdit(row)
                                                    }}
                                                    className="edit-btn p-2 hover:bg-violet-500/10 rounded-lg transition-colors text-slate-500 hover:text-violet-400 group/btn"
                                                >
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            ) : col.render ? col.render(row) : (
                                                <span className="text-slate-300 text-sm font-medium">{row[col.key] || '-'}</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {(!data || data.length === 0) && (
                    <div className="py-20 text-center">
                        <User className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-slate-300 font-bold">No contacts found</h3>
                        <p className="text-slate-500 text-sm mt-1">Try syncing your data from the dashboard.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
