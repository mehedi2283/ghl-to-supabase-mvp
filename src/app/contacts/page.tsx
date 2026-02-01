import { supabaseAdmin } from "@/lib/supabaseServer"
import { ContactsClient } from "./ContactsClient"

export const dynamic = 'force-dynamic'

export default async function ContactsPage() {
    const { data: contacts } = await supabaseAdmin
        .from('ghl_contacts')
        .select('*')
        .order('last_synced_at', { ascending: false })
        .limit(100)

    return <ContactsClient initialContacts={contacts || []} />
}
