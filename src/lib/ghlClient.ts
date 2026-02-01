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
        let previousToken: string | number | undefined = undefined

        console.log(`[GHL Client] Starting full fetch for ${endpoint}...`)

        // High safety limit (2,000 pages = 200,000 records) to prevent absolute hangs
        // while fulfilling the "no limit" request for almost all practical cases.
        for (let i = 0; i < 2000; i++) {
            const params: any = { limit: 100 }

            if (nextToken !== undefined && nextParam) {
                params[nextParam] = nextToken
            }

            const data = await this.fetchAPI(endpoint, params)
            const items = data[listKey] || []

            if (!Array.isArray(items) || items.length === 0) {
                console.log(`[GHL Client] End of data reached for ${endpoint}.`)
                break
            }

            allItems = allItems.concat(items)
            console.log(`[GHL Client] Fetched ${items.length} items (Total: ${allItems.length}) from ${endpoint}`)

            // GHL V2 Pagination logic
            let hasNext = false
            previousToken = nextToken

            if (data.meta) {
                const meta = data.meta

                // Get the next token from any of the possible GHL V2 keys
                const foundToken = meta.nextPageToken || meta.nextStartAfterId || meta.startAfterId || meta.startAfter || meta.nextOffset

                if (foundToken && foundToken !== previousToken) {
                    nextToken = foundToken
                    // Set correct param name based on which meta key we found
                    if (meta.nextPageToken || meta.nextStartAfterId || meta.startAfterId) {
                        nextParam = 'startAfterId'
                    } else if (typeof meta.startAfter === 'number') {
                        nextParam = 'startAfter'
                    } else if (typeof meta.nextOffset === 'number') {
                        nextParam = 'offset'
                    }
                    hasNext = true
                }
            }

            // If we have less than 100 items, we are definitely at the end
            if (items.length < 100) {
                console.log(`[GHL Client] Last page reached for ${endpoint}.`)
                break
            }

            // If we fetched 100 items but no NEW token was found, we MUST stop to avoid infinite loop
            if (!hasNext) {
                console.log(`[GHL Client] No new pagination token found for ${endpoint}. Stopping.`)
                break
            }

            if (i === 1999) {
                console.warn(`[GHL Client] Hit 200,000 record safety limit for ${endpoint}.`)
            }
        }

        console.log(`[GHL Client] Finished fetch for ${endpoint}. Total items: ${allItems.length}`)
        return allItems
    }
}

export const ghlClient = new GHLClient()
