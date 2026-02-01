'use client'

import { useEffect, useState } from 'react'
import { OpportunityCard } from './OpportunityCard'
import { ChevronDown, Filter, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Pipeline {
    id: string
    ghl_pipeline_id: string
    name: string
    raw: {
        stages: {
            id: string
            name: string
        }[]
    }
}

interface Opportunity {
    id: string
    name: string
    value: number
    status: string
    contact_id: string
    pipeline_id: string
    stage_id: string
}

export function OpportunityKanban() {
    const [pipelines, setPipelines] = useState<Pipeline[]>([])
    const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null)
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [loading, setLoading] = useState(true)
    const [showPipelineSelector, setShowPipelineSelector] = useState(false)

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const res = await fetch('/api/data/pipelines')
                const data = await res.json()
                const fetchedPipelines = data.pipelines || []
                setPipelines(fetchedPipelines)

                if (fetchedPipelines.length > 0) {
                    setSelectedPipeline(fetchedPipelines[0])
                }
            } catch (err) {
                console.error("Failed to load pipelines", err)
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [])

    useEffect(() => {
        if (!selectedPipeline) return

        const loadOpportunities = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/data/opportunities?pipelineId=${selectedPipeline.ghl_pipeline_id}`)
                const data = await res.json()
                setOpportunities(data.opportunities || [])
            } catch (err) {
                console.error("Failed to load opportunities", err)
            } finally {
                setLoading(false)
            }
        }
        loadOpportunities()
    }, [selectedPipeline])

    if (loading && pipelines.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-slate-400 animate-pulse">Loading pipelines...</div>
            </div>
        )
    }

    const stages = selectedPipeline?.raw?.stages || []

    return (
        <div className="space-y-6">
            {/* Header / Toolbar */}
            <div className="relative z-30 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-4 rounded-xl border border-slate-800">
                <div className="relative">
                    <button
                        onClick={() => setShowPipelineSelector(!showPipelineSelector)}
                        className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg border border-slate-700/50 transition-all text-sm font-medium text-slate-100"
                    >
                        <Filter className="w-4 h-4 text-violet-400" />
                        <span>{selectedPipeline?.name || 'Select Pipeline'}</span>
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", showPipelineSelector && "rotate-180")} />
                    </button>

                    {showPipelineSelector && (
                        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            {pipelines.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        setSelectedPipeline(p)
                                        setShowPipelineSelector(false)
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-3 text-sm hover:bg-violet-600/10 transition-colors border-b border-slate-800 last:border-0",
                                        selectedPipeline?.id === p.id ? "text-violet-400 bg-violet-600/5" : "text-slate-300"
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search opportunities..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {stages.map(stage => {
                    const stageOps = opportunities.filter(op => op.stage_id === stage.id)
                    return (
                        <div key={stage.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                            {/* Stage Header */}
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-slate-300 text-sm whitespace-nowrap uppercase tracking-wider">
                                        {stage.name}
                                    </h3>
                                    <span className="flex items-center justify-center h-5 px-1.5 rounded bg-slate-800 text-[10px] font-bold text-slate-500">
                                        {stageOps.length}
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-500">
                                    ${stageOps.reduce((sum, op) => sum + (op.value || 0), 0).toLocaleString()}
                                </div>
                            </div>

                            {/* Cards Area */}
                            <div className="flex flex-col gap-3 min-h-[200px] p-1 rounded-xl bg-slate-900/30 border border-slate-800/50 group">
                                {stageOps.map(op => (
                                    <OpportunityCard key={op.id} opportunity={op} />
                                ))}
                                {stageOps.length === 0 && (
                                    <div className="flex flex-col items-center justify-center flex-1 text-slate-600 text-[10px] italic py-8 border-2 border-dashed border-slate-800/30 rounded-lg group-hover:border-slate-800/50 transition-colors">
                                        No opportunities
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}

                {stages.length === 0 && (
                    <div className="w-full glass-card p-12 text-center rounded-2xl border border-slate-800">
                        <div className="text-slate-400 text-lg">No stages found for this pipeline.</div>
                        <p className="text-slate-500 text-sm mt-2">Try selecting a different pipeline or sync data.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
