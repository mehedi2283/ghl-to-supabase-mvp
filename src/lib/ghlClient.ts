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
        // Use upsert endpoint for both create and update
        // GHL handles duplicate detection based on Location settings
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
        let startAfterId: string | undefined = undefined
        let startAfter: number | undefined = undefined
        const seenIds = new Set<string>()

        console.log(`[GHL Client] Starting full fetch for ${endpoint}...`)

        // High safety limit (2,000 pages = 200,000 records) to prevent absolute hangs
        // while fulfilling the "no limit" request for almost all practical cases.
        for (let i = 0; i < 2000; i++) {
            const params: any = { limit: 100 }

            // GHL API requires BOTH startAfterId AND startAfter for proper pagination
            if (startAfterId && startAfter) {
                params.startAfterId = startAfterId
                params.startAfter = startAfter
            }

            const data = await this.fetchAPI(endpoint, params)
            const items = data[listKey] || []

            if (!Array.isArray(items) || items.length === 0) {
                console.log(`[GHL Client] End of data reached for ${endpoint}.`)
                break
            }

            // Filter out duplicates using ID tracking
            const newItems = items.filter((item: any) => {
                if (!item.id || seenIds.has(item.id)) {
                    return false
                }
                seenIds.add(item.id)
                return true
            })

            if (newItems.length === 0) {
                console.log(`[GHL Client] All items in this page were duplicates. Stopping pagination for ${endpoint}.`)
                break
            }

            allItems = allItems.concat(newItems)
            console.log(`[GHL Client] Fetched ${newItems.length} new items (${items.length - newItems.length} duplicates, Total: ${allItems.length}) from ${endpoint}`)

            // GHL V2 Pagination logic
            let hasNext = false

            if (data.meta) {
                const meta = data.meta

                // Check if there are more pages based on meta information
                // Method 1: Check if meta.total indicates more records
                if (meta.total && allItems.length < meta.total) {
                    hasNext = true
                }

                // Method 2: Check if meta.nextPage exists
                if (meta.nextPage !== null && meta.nextPage !== undefined) {
                    hasNext = true
                }

                // Get pagination tokens - GHL requires BOTH for proper pagination
                if (hasNext) {
                    const newStartAfterId = meta.nextStartAfterId || meta.startAfterId
                    const newStartAfter = meta.startAfter

                    if (newStartAfterId && newStartAfter) {
                        startAfterId = newStartAfterId
                        startAfter = newStartAfter
                    } else {
                        console.warn(`[GHL Client] Meta indicates more pages but missing pagination tokens for ${endpoint}. Stopping.`)
                        hasNext = false
                    }
                }
            }

            // If we have less than 100 NEW items, we might be at the end
            if (newItems.length < 100) {
                console.log(`[GHL Client] Last page reached for ${endpoint} (received ${newItems.length} new items).`)
                break
            }

            // If no more pages indicated by meta, stop
            if (!hasNext) {
                console.log(`[GHL Client] No more pages indicated by meta for ${endpoint}. Stopping.`)
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
