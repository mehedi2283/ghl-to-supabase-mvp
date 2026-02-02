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
        let url: URL
        if (endpoint.startsWith('http')) {
            url = new URL(endpoint)
        } else {
            url = new URL(`${this.baseUrl}${endpoint}`)
        }

        const method = options.method || 'GET'

        // Always attach locationId if not present (unless it's an absolute URL which likely has it)
        if (!endpoint.startsWith('http')) {
            if (!params.locationId && !params.location_id && this.locationId && !options.body?.locationId) {
                // Only opportunities/search uses location_id, everything else uses locationId
                if (endpoint.includes('/opportunities/search')) {
                    params.location_id = this.locationId
                } else {
                    params.locationId = this.locationId
                }
            }
        }

        // Append params
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                // If the key already exists (e.g. from absolute URL), delete it first to override? 
                // Or just append? URLSearchParams supports multiple values. 
                // GHL might not like multiple values. Safest is set() or delete then append.
                if (url.searchParams.has(key)) {
                    url.searchParams.delete(key)
                }
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
        // Use POST search for robust pagination
        return this.fetchSearch('/contacts/search', 'contacts')
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

    /**
     * Generic fetcher for POST search endpoints (like /contacts/search) that use 
     * ElasticSearch-style pagination (searchAfter in the last item).
     */
    private async fetchSearch(endpoint: string, listKey: string) {
        let allItems: any[] = []
        let searchAfter: any[] | undefined = undefined
        const seenIds = new Set<string>()

        console.log(`[GHL Client] Starting search fetch for ${endpoint}...`)

        let pageCount = 0
        while (true) {
            pageCount++
            const payload: any = {
                locationId: this.locationId,
                pageLimit: 100
            }
            if (searchAfter) {
                payload.searchAfter = searchAfter
            }

            const data = await this.fetchAPI(endpoint, {}, {
                method: 'POST',
                body: payload
            })

            const items = data[listKey] || []

            if (!Array.isArray(items) || items.length === 0) {
                console.log(`[GHL Client] End of data reached for ${endpoint}.`)
                break
            }

            // Filter duplicates
            const newItems = items.filter((item: any) => {
                if (!item.id || seenIds.has(item.id)) {
                    return false
                }
                seenIds.add(item.id)
                return true
            })

            if (newItems.length === 0) {
                console.log(`[GHL Client] All items in this page were duplicates. Stopping search for ${endpoint}.`)
                break
            }

            allItems = allItems.concat(newItems)
            console.log(`[GHL Client] Page ${pageCount}: Fetched ${newItems.length} new items. Total: ${allItems.length}`)

            // Get cursor for next page from the last item
            const lastItem = items[items.length - 1]
            if (lastItem && lastItem.searchAfter && Array.isArray(lastItem.searchAfter)) {
                searchAfter = lastItem.searchAfter
            } else {
                console.log(`[GHL Client] Last item has no searchAfter cursor. Stopping.`)
                break
            }
        }

        console.log(`[GHL Client] Finished search for ${endpoint}. Total items: ${allItems.length}`)
        return allItems
    }

    private async fetchAllPages(endpoint: string, listKey: string) {
        let allItems: any[] = []
        let nextUrl: string | null = null
        const seenIds = new Set<string>()

        console.log(`[GHL Client] Starting full fetch for ${endpoint}...`)

        let pageCount = 0
        while (true) {
            pageCount++

            // First page params
            const params: Record<string, any> = {}
            if (pageCount === 1) {
                params.limit = 100
            }

            // Use nextUrl if available, otherwise use initial endpoint
            const currentEndpoint = nextUrl || endpoint

            // If using nextUrl, we don't pass 'limit' param again as it should be in the URL,
            // UNLESS we want to override it. fetchAPI logic will override if we pass params.
            // But if nextUrl comes from GHL, it likely has the limit of the previous req (which is 100).

            const data = await this.fetchAPI(currentEndpoint, params)
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
            console.log(`[GHL Client] Page ${pageCount}: Fetched ${newItems.length} new items (${items.length - newItems.length} duplicates, Total: ${allItems.length}) from ${endpoint}`)

            // Pagination Logic
            nextUrl = null

            if (data.meta) {
                if (data.meta.nextPageUrl) {
                    nextUrl = data.meta.nextPageUrl
                }
                // Fallback for endpoints that use nextStartAfterId but not nextPageUrl (rare in V2 but possible)
                else if (data.meta.nextStartAfterId) {
                    // Construct URL manually if needed
                    console.log(`[GHL Client] No nextPageUrl, using nextStartAfterId construction.`)
                    const url = new URL(`${this.baseUrl}${endpoint}`)
                    url.searchParams.set('limit', '100')
                    url.searchParams.set('startAfterId', data.meta.nextStartAfterId)
                    if (data.meta.startAfter) {
                        url.searchParams.set('startAfter', data.meta.startAfter)
                    }
                    // We must ensure locationId is there too if constructed manually
                    url.searchParams.set('locationId', this.locationId)

                    nextUrl = url.toString()
                }
            }

            if (!nextUrl) {
                console.log(`[GHL Client] No next page URL/token found in meta. Stopping.`);
                break
            }
        }

        console.log(`[GHL Client] Finished fetch for ${endpoint}. Total items: ${allItems.length}`)
        return allItems
    }
}

export const ghlClient = new GHLClient()
