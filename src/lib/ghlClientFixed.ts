export class GHLClientFixed {
    private baseUrl: string
    private token: string
    private locationId: string

    constructor() {
        this.baseUrl = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com'
        this.token = process.env.GHL_ACCESS_TOKEN || ''
        this.locationId = process.env.GHL_LOCATION_ID || ''
    }

    private async fetchAPI(endpoint: string, params: Record<string, any> = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`)

        if (!params.locationId && this.locationId) {
            params.locationId = this.locationId
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
            headers,
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

    private async fetchAllPages(endpoint: string, listKey: string) {
        let allItems: any[] = []
        let nextToken: string | undefined = undefined
        let nextParam: string | undefined = undefined
        const SAFETY_LIMIT = 50

        for (let i = 0; i < SAFETY_LIMIT; i++) {
            const params: any = { limit: 100 }

            if (nextToken && nextParam) {
                params[nextParam] = nextToken
            }

            const data = await this.fetchAPI(endpoint, params)
            const items = data[listKey] || []
            if (!Array.isArray(items)) break;

            allItems = allItems.concat(items)

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
            }

            if (items.length < 100) break;
            if (!nextToken) break;
        }

        return allItems
    }
}

export const ghlClientFixed = new GHLClientFixed()
