
import * as fs from 'fs';
import * as path from 'path';

// Manually load env vars
const envPath = 'c:\\Users\\niyao\\.gemini\\antigravity\\scratch\\.env.local';
try {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const processEnv: any = process.env;
            processEnv[match[1].trim()] = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
        }
    });
} catch (e) {
    console.error('Failed to load .env.local', e);
}

const baseUrl = process.env.GHL_BASE_URL || 'https://services.leadconnectorhq.com';
const token = process.env.GHL_ACCESS_TOKEN || '';
const locationId = process.env.GHL_LOCATION_ID || '';

async function testParams() {
    console.log('--- Debugging Advanced Params ---');

    console.log('Fetching Page 1 GET to get meta...');
    const url1 = `${baseUrl}/contacts?locationId=${locationId}&limit=1`;
    const res1 = await fetch(url1, {
        headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
    });
    const data1 = await res1.json();

    if (!data1.meta) { console.log('No meta in GET P1'); return; }

    const startAfter = data1.meta.startAfter;
    const startAfterId = data1.meta.startAfterId;
    console.log(`Meta: startAfter=${startAfter}, startAfterId=${startAfterId}`);

    // Test 1: GET with quoted startAfter
    console.log('\n--- Test 1: GET with quoted startAfter ---');
    try {
        const testUrl = new URL(`${baseUrl}/contacts`);
        testUrl.searchParams.set('locationId', locationId);
        testUrl.searchParams.set('limit', '1');
        // valid JSON string maybe? or just quote?
        // Trying to treat it as string
        // If the server says "Unknown key for a VALUE_NUMBER", it received a number where it wanted 'something else'?
        // Or "key for a VALUE_NUMBER" might mean the PARAM NAME is wrong? "search_after"?

        // Let's try `startAfter` as string
        testUrl.searchParams.set('startAfter', String(startAfter));
        testUrl.searchParams.set('startAfterId', startAfterId);

        console.log('Testing URL:', testUrl.toString());
        const res = await fetch(testUrl.toString(), {
            headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
        });
        if (res.ok) console.log('✅ Success!');
        else console.log('❌ Failed:', await res.text());

    } catch (e) { console.log('Error:', e); }

    // Test 2: POST with searchAfter
    console.log('\n--- Test 2: POST with searchAfter ---');
    try {
        const postUrl = `${baseUrl}/contacts/search`;
        const payload = {
            locationId,
            pageLimit: 1,
            searchAfter: [startAfter, startAfterId] // Common ES pattern
        };
        const res = await fetch(postUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Version': '2021-04-15',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const d = await res.json();
            console.log('✅ POST searchAfter Success!');
            console.log('Response Keys:', Object.keys(d));
            console.log('Meta:', JSON.stringify(d.meta));
            if (d.contacts && d.contacts.length > 0) {
                const lastContact = d.contacts[d.contacts.length - 1];
                console.log('Last Contact Keys:', Object.keys(lastContact));
                console.log('Last Contact Sort:', JSON.stringify(lastContact.sort));
                console.log('Last Contact dateAdded:', lastContact.dateAdded);
                console.log('Last Contact ID:', lastContact.id);
            }
        }
        else console.log('❌ POST searchAfter Failed:', await res.text());

    } catch (e) { console.log('Error:', e); }
}

testParams();
