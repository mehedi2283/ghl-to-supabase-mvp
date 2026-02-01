'use client'

import { useState, useEffect } from 'react'
import { ContactsTable } from "@/components/tables/ContactsTable"
import { ContactModal } from "@/components/ContactModal"
import { Plus, Users, RefreshCw } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ContactsClientProps {
    initialContacts: any[]
}

export function ContactsClient({ initialContacts }: ContactsClientProps) {
    const [contacts, setContacts] = useState(initialContacts)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [limit] = useState(20)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<any | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    useEffect(() => {
        fetchContacts(page)
    }, [page])

    const fetchContacts = async (pageNum = page) => {
        setIsRefreshing(true)
        try {
            const res = await fetch(`/api/data/contacts?page=${pageNum}&limit=${limit}`)
            const data = await res.json()
            if (data.contacts) {
                setContacts(data.contacts)
                setTotal(data.total)
            } else {
                setContacts(data) // Fallback for old API style if any
            }
        } catch (err) {
            console.error('Error fetching contacts:', err)
        } finally {
            setIsRefreshing(false)
        }
    }

    const totalPages = Math.ceil(total / limit)

    const handleAdd = () => {
        setSelectedContact(null)
        setIsModalOpen(true)
    }

    const handleEdit = (contact: any) => {
        setSelectedContact(contact)
        setIsModalOpen(true)
    }

    return (
        <div className="p-8 space-y-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                        <Users className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Contacts</h1>
                        <p className="text-slate-500 text-sm mt-0.5">Manage and sync your customer relationships</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchContacts(page)}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-300 font-bold transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={isRefreshing ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-bold transition-all shadow-lg shadow-violet-600/20 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                        <span>Add Contact</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <ContactsTable data={contacts} onEdit={handleEdit} />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2 py-4 border-t border-slate-800/50">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-300">{(page - 1) * limit + 1}</span> to <span className="font-medium text-slate-300">{Math.min(page * limit, total)}</span> of <span className="font-medium text-slate-300">{total}</span> contacts
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isRefreshing}
                                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1 shadow-inner">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    // Only show a few page numbers around the current page
                                    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={cn(
                                                    "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                                                    page === p
                                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                                        : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        )
                                    }
                                    if (p === 2 && page > 3) return <span key="l-dots" className="px-1 text-slate-600">...</span>
                                    if (p === totalPages - 1 && page < totalPages - 2) return <span key="r-dots" className="px-1 text-slate-600">...</span>
                                    return null
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages || isRefreshing}
                                className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ContactModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchContacts(page)}
                contact={selectedContact}
            />
        </div>
    )
}
