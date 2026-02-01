'use client'

import { useState, useEffect } from 'react'
import { MessageThread } from '@/components/MessageThread'

interface Conversation {
    id: string
    ghl_conversation_id: string
    contact_id: string
    full_name?: string
    contact_name?: string
    email?: string
    company_name?: string
    phone?: string
    last_message_at: string
    last_message_body?: string
    last_message_type?: string
    last_message_direction?: string
    unread_count?: number
    tags?: string[]
    last_synced_at: string
}

export default function ConversationsPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchConversations() {
            try {
                const res = await fetch('/api/data/conversations')
                const data = await res.json()
                setConversations(data.conversations || [])
            } catch (err) {
                console.error('Failed to fetch conversations', err)
            } finally {
                setLoading(false)
            }
        }
        fetchConversations()
    }, [])

    return (
        <div className="h-screen flex flex-col bg-slate-950">
            {/* Header */}
            <div className="glass-card border-b border-slate-700/50 p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                    Conversations
                </h1>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Conversations List */}
                <div className="w-1/3 border-r border-slate-700/50 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">No conversations found</div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {conversations.map((conv) => (
                                <button
                                    key={conv.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={`w-full text-left p-4 hover:bg-slate-800/50 transition-colors ${selectedConversation?.id === conv.id
                                        ? 'bg-slate-800/70 border-l-2 border-violet-500'
                                        : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Contact Name */}
                                            <p className="text-sm font-semibold text-slate-100 truncate">
                                                {conv.full_name || conv.contact_name || conv.email || 'Unknown Contact'}
                                            </p>

                                            {/* Last Message Preview */}
                                            {conv.last_message_body && (
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                    {conv.last_message_body}
                                                </p>
                                            )}

                                            {/* Timestamp */}
                                            <p className="text-xs text-slate-500 mt-1">
                                                {conv.last_message_at
                                                    ? new Date(conv.last_message_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    })
                                                    : 'No messages'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            {/* Unread Badge */}
                                            {conv.unread_count && conv.unread_count > 0 && (
                                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold bg-violet-500 text-white">
                                                    {conv.unread_count}
                                                </span>
                                            )}

                                            {/* Message Type */}
                                            {conv.last_message_type && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700/50 text-slate-300">
                                                    {conv.last_message_type.replace('TYPE_', '')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Message Thread */}
                <div className="flex-1 bg-slate-900/50">
                    {selectedConversation ? (
                        <MessageThread
                            conversationId={selectedConversation.ghl_conversation_id}
                            contactName={selectedConversation.full_name || selectedConversation.contact_name || selectedConversation.email || 'Unknown Contact'}
                            lastMessageBody={selectedConversation.last_message_body}
                            lastMessageType={selectedConversation.last_message_type}
                            lastMessageDirection={selectedConversation.last_message_direction}
                            lastMessageAt={selectedConversation.last_message_at}
                            email={selectedConversation.email}
                            phone={selectedConversation.phone}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-slate-400 text-lg mb-2">
                                    Select a conversation
                                </div>
                                <div className="text-slate-500 text-sm">
                                    Choose a conversation from the list to view messages
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
