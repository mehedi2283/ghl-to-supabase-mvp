import { ghlClient } from "./ghlClient"
import { supabaseAdmin } from "./supabaseServer"

type SyncEntity = 'contacts' | 'pipelines' | 'opportunities' | 'conversations'

export async function runSync(entity: SyncEntity, parentRunId?: string) {
    // 1. Create Sync Run
    const { data: run, error: runError } = await supabaseAdmin
        .from('sync_runs')
        .insert({
            entity,
            status: 'running',
            parent_run_id: parentRunId
        })
        .select()
        .single()

    if (runError || !run) {
        console.error('Failed to create sync run', runError)
        throw new Error('Failed to create sync run log')
    }

    const runId = run.id
    let fetchedCount = 0
    let upsertedCount = 0
    let errorMsg: string | null = null

    try {
        // 2. Fetch Data
        let data: any[] = []

        switch (entity) {
            case 'contacts':
                data = await ghlClient.getContacts()
                break
            case 'pipelines':
                data = await ghlClient.getPipelines()
                break
            case 'opportunities':
                data = await ghlClient.getOpportunities()
                break
            case 'conversations':
                data = await ghlClient.getConversations()
                break
        }

        fetchedCount = data.length

        // 3. Upsert Data
        if (fetchedCount > 0) {
            const rows = data.map(item => mapEntityToRow(entity, item))

            // Deduplicate rows by unique constraint to prevent "ON CONFLICT DO UPDATE" errors
            const uniqueKey = getUniqueConstraint(entity)
            const deduped = Array.from(
                new Map(rows.map(row => [(row as any)[uniqueKey], row])).values()
            )

            // Upsert in batches of 100 to avoid request size limits
            const BATCH_SIZE = 100
            for (let i = 0; i < deduped.length; i += BATCH_SIZE) {
                const batch = deduped.slice(i, i + BATCH_SIZE)
                const { error: upsertError } = await supabaseAdmin
                    .from(`ghl_${entity}`)
                    .upsert(batch, {
                        onConflict: uniqueKey,
                        ignoreDuplicates: false
                    })

                if (upsertError) {
                    console.error(`Batch upsert error for ${entity}`, upsertError)
                    throw upsertError
                }
                upsertedCount += batch.length
            }
        }

    } catch (err: any) {
        console.error(`Sync error for ${entity}`, err)
        errorMsg = err.message || JSON.stringify(err)
    } finally {
        // 4. Update Sync Run Status
        await supabaseAdmin
            .from('sync_runs')
            .update({
                status: errorMsg ? 'failed' : 'success',
                finished_at: new Date().toISOString(),
                fetched_count: fetchedCount,
                upserted_count: upsertedCount,
                error: errorMsg
            })
            .eq('id', runId)
    }

    return {
        success: !errorMsg,
        fetched: fetchedCount,
        upserted: upsertedCount,
        runId
    }
}

function mapEntityToRow(entity: SyncEntity, item: any) {
    const raw = item
    const base = {
        raw,
        last_synced_at: new Date().toISOString()
    }

    switch (entity) {
        case 'contacts':
            // GHL v2 contact object structure: id, email, phone, ...
            return {
                ...base,
                ghl_contact_id: item.id,
                location_id: item.locationId,
                full_name: [item.firstName, item.lastName].filter(Boolean).join(' ') || item.contactName || item.name,
                email: item.email,
                phone: item.phone,
                business_name: item.companyName,
                date_added: item.dateAdded ? new Date(item.dateAdded).toISOString() : null,
                last_activity_at: (item.dateUpdated || item.dateAdded) ? new Date(item.dateUpdated || item.dateAdded).toISOString() : null,
                tags: Array.isArray(item.tags) ? item.tags : []
            }
        case 'pipelines':
            return {
                ...base,
                ghl_pipeline_id: item.id,
                location_id: item.locationId,
                name: item.name,
            }
        case 'opportunities':
            // Opportunities: id, contactId, pipelineId, stageId, name, status, monetaryValue
            return {
                ...base,
                ghl_opportunity_id: item.id,
                location_id: item.locationId,
                pipeline_id: item.pipelineId,
                stage_id: item.pipelineStageId,
                contact_id: item.contactId,
                contact_name: item.contact?.name || item.contact?.contactName || item.contactName,
                contact_email: item.contact?.email,
                contact_phone: item.contact?.phone,
                source: item.source,
                name: item.name,
                status: item.status,
                value: item.monetaryValue
            }
        case 'conversations':
            // Conversations: full data from GHL including contact info and last message
            return {
                ...base,
                ghl_conversation_id: item.id,
                location_id: item.locationId,
                contact_id: item.contactId,
                full_name: item.fullName,
                contact_name: item.contactName,
                email: item.email,
                company_name: item.companyName,
                phone: item.phone,
                last_message_at: item.lastMessageDate ? new Date(item.lastMessageDate).toISOString() : null,
                last_message_body: item.lastMessageBody,
                last_message_type: item.lastMessageType,
                last_message_direction: item.lastMessageDirection,
                unread_count: item.unreadCount || 0,
                tags: item.tags || []
            }
    }
}

function getUniqueConstraint(entity: SyncEntity) {
    switch (entity) {
        case 'contacts': return 'ghl_contact_id'
        case 'pipelines': return 'ghl_pipeline_id'
        case 'opportunities': return 'ghl_opportunity_id'
        case 'conversations': return 'ghl_conversation_id'
    }
}
