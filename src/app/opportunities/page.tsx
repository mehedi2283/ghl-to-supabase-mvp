import { OpportunityKanban } from "@/components/OpportunityKanban"

export const dynamic = 'force-dynamic'

export default function OpportunitiesPage() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <header className="flex flex-col gap-2 mb-8">
                <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                    Opportunities
                </h1>
                <p className="text-slate-400 text-lg">
                    Manage your sales pipeline and track deals across stages.
                </p>
            </header>

            <OpportunityKanban />
        </div>
    )
}
