import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.resolve(process.cwd(), '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            env[key] = value;
        }
    });
}

const token = env['GHL_ACCESS_TOKEN'];
const locationId = env['GHL_LOCATION_ID'];
const baseUrl = env['GHL_BASE_URL'] || 'https://services.leadconnectorhq.com';

if (!token) {
    console.error('Missing GHL_ACCESS_TOKEN in .env.local');
    process.exit(1);
}

console.log(`Testing GHL Connection...`);
console.log(`URL: ${baseUrl}`);
console.log(`Location ID: ${locationId}`);

async function test() {
    try {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Version': '2021-04-15',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        // Test 1: Fetch Pipelines
        // SDK hint: highLevel.opportunities.getPipelines -> likely /opportunities/pipelines
        let pipelineUrl = `${baseUrl}/opportunities/pipelines?locationId=${locationId}`;
        console.log(`\nFetching Pipelines from: ${pipelineUrl}`);
        const pRes = await fetch(pipelineUrl, { headers });

        if (!pRes.ok) {
            const body = await pRes.text();
            console.log(`⚠️ Pipeline Fetch Failed [${pRes.status}]: ${body}`);
            // Fallback attempt to old endpoint just in case
            console.log("   Trying fallback to /pipelines...");
            const fallbackUrl = `${baseUrl}/pipelines?locationId=${locationId}`;
            const fRes = await fetch(fallbackUrl, { headers });
            if (!fRes.ok) {
                console.log(`   Fallback Failed [${fRes.status}]: ${await fRes.text()}`);
            } else {
                console.log("   Fallback Success!");
            }
        } else {
            const pData = await pRes.json();
            console.log(`✅ Success! Found ${pData.pipelines?.length || 0} pipelines.`);
        }

        // Test 2: Fetch Contacts
        // User suggested: locationId, startAfterId, startAfter, query='John', limit=20
        // We'll skip specific query to get ANY contact, but use limit 20.
        let contactUrl = `${baseUrl}/contacts/?locationId=${locationId}&limit=20`;
        console.log(`\nFetching Contacts from: ${contactUrl}`);
        const cRes = await fetch(contactUrl, { headers });

        if (!cRes.ok) {
            const body = await cRes.text();
            throw new Error(`Contact Fetch Failed [${cRes.status}]: ${body}`);
        }

        const cData = await cRes.json();
        console.log(`✅ Success! Fetched contacts.`);
        if (cData.contacts && cData.contacts.length > 0) {
            const c = cData.contacts[0];
            console.log(`   Sample Contact: ${c.contactName || c.firstName || 'No Name'} (${c.email})`);
        } else {
            console.log(`   (No contacts found)`);
        }

    } catch (err) {
        console.error('❌ Verification Failed:', err.message);
    }
}

test();
