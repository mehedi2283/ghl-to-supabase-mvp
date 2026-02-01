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
        let nextToken: string | number | undefined = undefined // Can be string or number
        let nextParam: 'startAfter' | 'startAfterId' | undefined = undefined
        const SAFETY_LIMIT = 50

        for (let i = 0; i < SAFETY_LIMIT; i++) {
            const params: any = { limit: 100 }

            if (nextToken !== undefined && nextParam) {
                params[nextParam] = nextToken
            }

            const data = await this.fetchAPI(endpoint, params)
            const items = data[listKey] || []
            if (!Array.isArray(items)) break;

            allItems = allItems.concat(items)

            // Determine next page logic based on user feedback and typical patterns
            if (data.meta) {
                if (data.meta.nextStartAfterId) {
                    nextToken = data.meta.nextStartAfterId
                    nextParam = 'startAfterId'
                    continue
                }
                if (data.meta.startAfterId) {
                    if (data.meta.startAfterId === nextToken) break;
                    nextToken = data.meta.startAfterId
                    nextParam = 'startAfterId'
                    continue
                }
                if (data.meta.startAfter && typeof data.meta.startAfter === 'number') {
                    // Ensure we don't loop if it's the same
                    if (data.meta.startAfter === nextToken) break;
                    nextToken = data.meta.startAfter
                    nextParam = 'startAfter'
                    continue
                }
            }

            if (items.length < 100) break;
            if (nextToken === undefined) break;
        }

        return allItems
    }
}

export const ghlClient = new GHLClient()
