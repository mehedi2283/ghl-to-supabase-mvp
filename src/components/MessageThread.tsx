'use client'

import { cn } from '@/lib/utils'

interface MessageThreadProps {
    conversationId: string
    contactName?: string
    lastMessageBody?: string
    lastMessageType?: string
    lastMessageDirection?: string
    lastMessageAt?: string
    email?: string
    phone?: string
}

export function MessageThread({
    conversationId,
    contactName,
    lastMessageBody,
    lastMessageType,
    lastMessageDirection,
    lastMessageAt,
    email,
    phone
}: MessageThreadProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="glass-card p-6 border-b border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-2">
                    {contactName || 'Unknown Contact'}
                </h2>
                <div className="space-y-1 text-sm text-slate-400">
                    {email && (
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Email:</span>
                            <span>{email}</span>
                        </div>
                    )}
                    {phone && (
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">Phone:</span>
                            <span>{phone}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">Conversation ID:</span>
                        <span className="font-mono text-xs">{conversationId}</span>
                    </div>
                </div>
            </div>

            {/* Last Message */}
            <div className="flex-1 overflow-y-auto p-6">
                {lastMessageBody ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span>Last Message</span>
                            {lastMessageType && (
                                <>
                                    <span>•</span>
                                    <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 text-xs">
                                        {lastMessageType.replace('TYPE_', '')}
                                    </span>
                                </>
                            )}
                            {lastMessageDirection && (
                                <>
                                    <span>•</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs",
                                        lastMessageDirection === 'outbound'
                                            ? 'bg-violet-500/20 text-violet-300'
                                            : 'bg-blue-500/20 text-blue-300'
                                    )}>
                                        {lastMessageDirection}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className={cn(
                            'rounded-2xl px-6 py-4 shadow-lg',
                            lastMessageDirection === 'outbound'
                                ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
                                : 'glass-card text-slate-100'
                        )}>
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                {lastMessageBody}
                            </p>
                            {lastMessageAt && (
                                <p className="text-xs opacity-70 mt-3">
                                    {new Date(lastMessageAt).toLocaleString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </p>
                            )}
                        </div>

                        <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                            <p className="text-sm text-slate-400">
                                <span className="font-semibold text-slate-300">Note:</span> GHL API only provides the last message.
                                For full message history, please use the GoHighLevel dashboard.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <div className="text-slate-400 text-lg mb-2">
                                No message preview available
                            </div>
                            <div className="text-slate-500 text-sm">
                                This conversation has no message data
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
