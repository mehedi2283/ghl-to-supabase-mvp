export class GHLClient {
    private baseUrl: string
    private token: string
    private locationId: string

    constructor() {
        this.baseUrl = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com'
        this.token = process.env.GHL_ACCESS_TOKEN || ''
        this.locationId = process.env.GHL_LOCATION_ID || ''

        if (!this.token) {
            console.warn('Missing GHL_ACCESS_TOKEN')
        }
    }

    private async fetchAPI(endpoint: string, params: Record<string, any> = {}, options: { method?: string, body?: any } = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`)
        const method = options.method || 'GET'

        // Always attach locationId (or location_id for specific endpoints)
        if (!params.locationId && !params.location_id && this.locationId && !options.body?.locationId) {
            // Only opportunities/search uses location_id, everything else uses locationId
            if (endpoint.includes('/opportunities/search')) {
                params.location_id = this.locationId
            } else {
                params.locationId = this.locationId
            }
        }

        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, String(params[key]))
            }
        })

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${this.token}`,
            'Version': '2021-04-15',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }

        const res = await fetch(url.toString(), {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
            cache: 'no-store'
        })

        if (!res.ok) {
            const errorBody = await res.text()
            throw new Error(`GHL API Error [${res.status}] for ${url.toString()}: ${errorBody}`)
        }

        return res.json()
    }

    async getContacts(limit = 20) {
        return this.fetchAllPages('/contacts', 'contacts')
    }

    async upsertContact(data: any) {
        return this.fetchAPI('/contacts/upsert', {}, {
            method: 'POST',
            body: {
                ...data,
                locationId: this.locationId
            }
        })
    }

    async getPipelines() {
        const data = await this.fetchAPI('/opportunities/pipelines')
        return data.pipelines || []
    }

    async getOpportunities(pipelineId?: string) {
        return this.fetchAllPages('/opportunities/search', 'opportunities')
    }

    async getConversations() {
        return this.fetchAllPages('/conversations/search', 'conversations')
    }

    async getConversationMessages(conversationId: string) {
        return this.fetchAllPages(`/conversations/${conversationId}/messages`, 'messages')
    }

    private async fetchAllPages(endpoint: string, listKey: string) {
        let allItems: any[] = []
        let nextToken: string | number | undefined = undefined
        let nextParam: 'startAfter' | 'startAfterId' | 'offset' | undefined = undefined
        const SAFETY_LIMIT = 200 // Max 20,000 items (100 per page)

        console.log(`[GHL Client] Starting full fetch for ${endpoint}...`)

        for (let i = 0; i < SAFETY_LIMIT; i++) {
            const params: any = { limit: 100 }

            if (nextToken !== undefined && nextParam) {
                params[nextParam] = nextToken
            }

            const data = await this.fetchAPI(endpoint, params)
            const items = data[listKey] || []
            if (!Array.isArray(items)) break;

            allItems = allItems.concat(items)
            console.log(`[GHL Client] Fetched ${items.length} items (Total: ${allItems.length}) from ${endpoint}`)

            // GHL V2 Pagination logic
            let hasNext = false
            if (data.meta) {
                // Check all known GHL pagination patterns
                const meta = data.meta

                if (meta.nextPageToken) {
                    nextToken = meta.nextPageToken
                    nextParam = 'startAfterId'
                    hasNext = true
                } else if (meta.nextStartAfterId) {
                    nextToken = meta.nextStartAfterId
                    nextParam = 'startAfterId'
                    hasNext = true
                } else if (meta.startAfterId && meta.startAfterId !== nextToken) {
                    nextToken = meta.startAfterId
                    nextParam = 'startAfterId'
                    hasNext = true
                } else if (typeof meta.startAfter === 'number' && meta.startAfter !== nextToken) {
                    nextToken = meta.startAfter
                    nextParam = 'startAfter'
                    hasNext = true
                } else if (typeof meta.nextOffset === 'number') {
                    nextToken = meta.nextOffset
                    nextParam = 'offset'
                    hasNext = true
                }
            }

            // If no next token found in meta, or we got less than 100 items, we might be at the end
            // but GHL sometimes returns exactly 100 even if there are more.
            if (!hasNext) {
                if (items.length < 100) break;
                // If we have 100 items but no meta token, we stop (GHL should provide meta for more)
                break;
            }

            if (i === SAFETY_LIMIT - 1) {
                console.warn(`[GHL Client] Hit SAFETY_LIMIT (${SAFETY_LIMIT}) for ${endpoint}. Data may be truncated.`)
            }
        }

        console.log(`[GHL Client] Finished fetch for ${endpoint}. Total items: ${allItems.length}`)
        return allItems
    }
}

export const ghlClient = new GHLClient()
