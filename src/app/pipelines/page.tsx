import { supabaseAdmin } from "@/lib/supabaseServer"
import { PipelinesTable } from "@/components/tables/PipelinesTable"

export const dynamic = 'force-dynamic'

export default async function PipelinesPage() {
    const { data: pipelines } = await supabaseAdmin
        .from('ghl_pipelines')
        .select('*')
        .order('last_synced_at', { ascending: false })

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Pipelines</h1>
            <PipelinesTable data={pipelines || []} />
        </div>
    )
}
