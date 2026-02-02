
import * as fs from 'fs';
import * as path from 'path';

// Manually load env vars
const envPath = 'c:\\Users\\niyao\\.gemini\\antigravity\\scratch\\.env.local';
console.log('Loading env from:', envPath);

try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1'); // removing quotes
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
} catch (e) {
    console.error('Failed to load .env.local', e);
}

import { ghlClient } from '../lib/ghlClient';

async function debugMeta() {
    console.log('--- Debugging Contacts Meta ---');
    try {
        // Access private method or use raw fetch if possible, but simplest is to just call getContacts with log
        // But getContacts calls fetchAllPages.
        // I'll manually call the API using the client's internal fetch if I can, but it is private.
        // Instead I will assume fetchAllPages logs are enough if I tweak them, OR I can just use fetch directly here.

        const baseUrl = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';
        const token = process.env.GHL_ACCESS_TOKEN || '';
        const locationId = process.env.GHL_LOCATION_ID || '';

        const url = `${baseUrl}/contacts?locationId=${locationId}&limit=1`;
        console.log(`Fetching ${url}...`);

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Version': '2021-04-15',
                'Accept': 'application/json'
            }
        });

        const data = await res.json();
        console.log('Meta:', JSON.stringify(data.meta, null, 2));
        console.log('Contacts Count:', data.contacts?.length);

    } catch (error) {
        console.error('Error:', error);
    }
}

debugMeta();
