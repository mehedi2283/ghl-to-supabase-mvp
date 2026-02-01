import { Phone, MessageSquare, Heart, FileText, CheckCircle2, Calendar, UserPlus } from 'lucide-react'

interface OpportunityCardProps {
    opportunity: {
        id: string
        name: string
        value: number
        status: string
        contact_id: string
        contact_name?: string
        contact_email?: string
        contact_phone?: string
        source?: string
    }
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
    return (
        <div className="glass-card p-4 rounded-xl border border-slate-700/50 hover:border-violet-500/50 transition-all cursor-pointer group shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-100 group-hover:text-violet-300 transition-colors line-clamp-2">
                    {opportunity.name || 'Untitled Opportunity'}
                </h3>
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-violet-500/30 group-hover:text-violet-400 transition-all">
                    <UserPlus className="w-4 h-4" />
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>Opportunity Source:</span>
                    <span className="text-slate-300 normal-case font-normal">{opportunity.source || 'Direct'}</span>
                </div>

                <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>Opportunity Value:</span>
                    <span className="text-emerald-400 font-bold">${(opportunity.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
            </div>

            {/* Icons row like GHL */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50 bg-slate-900/-5">
                <div className="flex items-center gap-3 mr-auto">
                    <Phone className={cn("w-3.5 h-3.5", opportunity.contact_phone ? "text-slate-400" : "text-slate-600")} />
                    <MessageSquare className={cn("w-3.5 h-3.5", opportunity.contact_email ? "text-slate-400" : "text-slate-600")} />
                    <div className="relative">
                        <Heart className="w-3.5 h-3.5 text-slate-600" />
                        <span className="absolute -top-1.5 -right-1.5 bg-violet-600 text-[8px] text-white px-1 rounded-full border border-slate-900 font-bold">3</span>
                    </div>
                    <FileText className="w-3.5 h-3.5 text-slate-600" />
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                </div>

                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${opportunity.status === 'open'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : opportunity.status === 'won'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                    }`}>
                    {opportunity.status}
                </span>
            </div>
        </div>
    )
}

import { cn } from '@/lib/utils'
