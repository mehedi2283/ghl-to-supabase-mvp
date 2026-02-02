
import { ghlClient } from './src/lib/ghlClient';
import * as fs from 'fs';

async function testPagination() {
    try {
        console.log('Testing GHL Pagination...');

        // We'll access the private fetchAPI method or just use getContacts which calls fetchAllPages
        // Since fetchAllPages is private, we can't call it directly easily without modifying the class.
        // But we can monkey-patch or just use the public method and rely on logs if we want.

        // Better: let's verify what fetchAPI returns for a single page request
        // We can access the private method via 'any' cast or creating a test instance if it was protected

        const client = ghlClient as any;

        console.log('Fetching first page (limit=2)...');
        const data = await client.fetchAPI('/contacts', { limit: 2 });

        console.log('--- API Response Metadata ---');
        console.log(JSON.stringify(data.meta, null, 2));
        console.log('-----------------------------');

        if (data.contacts) {
            console.log(`Received ${data.contacts.length} contacts`);
            if (data.contacts.length > 0) {
                console.log('First contact ID:', data.contacts[0].id);
            }
        } else {
            console.log('No contacts array in response');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testPagination();
