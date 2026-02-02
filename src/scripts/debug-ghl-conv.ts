
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

async function debugConversations() {
    try {
        console.log('--- Testing High Limit ---');
        const url = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1000`; // Try 1000
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
        });
        const data = await res.json();
        console.log('Response Keys:', Object.keys(data));
        console.log('Meta:', JSON.stringify(data.meta));
        console.log('Total:', data.totalConversationCount || data.total);
        console.log('Fetched Count:', data.conversations?.length);

    } catch (e) { console.log('Error in High Limit Test:', e); }

    console.log('--- Debugging Conversations GET ---');
    const url = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1`;

    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
        });
        const data = await res.json();
        console.log('Response Keys:', Object.keys(data));
        console.log('Meta:', JSON.stringify(data.meta));

        const firstId = data.conversations?.[0]?.id;
        const lastConv = data.conversations?.[data.conversations.length - 1];

        if (lastConv) {
            console.log('Last Conv Keys:', Object.keys(lastConv));
            console.log('Last Conv ID:', lastConv.id);
            console.log('Last Conv dateUpdated:', lastConv.dateUpdated);
            console.log('Last Conv lastMessageDate:', lastConv.lastMessageDate);
            console.log('Last Conv sort:', lastConv.sort);

            // Test Page 2 with startAfterId
            console.log('\n--- Testing Page 2 with startAfterId ---');
            const url2 = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1&startAfterId=${lastConv.id}`;
            const res2 = await fetch(url2, {
                headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
            });
            if (res2.ok) {
                const data2 = await res2.json();
                console.log('Page 2 Count:', data2.conversations?.length);
                console.log('Page 2 First ID:', data2.conversations?.[0]?.id);
                if (data2.conversations?.[0]?.id === firstId) console.log('⚠️ Loop detected!');
            } else {
                console.log('❌ Page 2 Failed:', await res2.text());
            }

            // Test offset
            console.log(`\n--- Testing Page 2 with offset=1 ---`);
            const urlOffset = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1&offset=1`;
            const resOffset = await fetch(urlOffset, {
                headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
            });
            if (resOffset.ok) {
                const dataOffset = await resOffset.json();
                console.log('Offset First ID:', dataOffset.conversations?.[0]?.id);
                if (dataOffset.conversations?.[0]?.id === firstId) console.log('⚠️ Loop detected!');
                else console.log('✅ Success! New data.');
            }

            // Test skip
            console.log(`\n--- Testing Page 2 with skip=1 ---`);
            const urlSkip = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1&skip=1`;
            const resSkip = await fetch(urlSkip, {
                headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
            });
            if (resSkip.ok) {
                const dataSkip = await resSkip.json();
                console.log('Skip First ID:', dataSkip.conversations?.[0]?.id);
                if (dataSkip.conversations?.[0]?.id === firstId) console.log('⚠️ Loop detected!');
                else console.log('✅ Success! New data.');
            }

            // Test page
            console.log(`\n--- Testing Page 2 with page=2 ---`);
            const urlPage = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1&page=2`;
            const resPage = await fetch(urlPage, {
                headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
            });
            if (resPage.ok) {
                const dataPage = await resPage.json();
                console.log('Page First ID:', dataPage.conversations?.[0]?.id);
                if (dataPage.conversations?.[0]?.id === firstId) console.log('⚠️ Loop detected!');
                else console.log('✅ Success! New data.');
            }

            // Test searchAfter (value from sort)
            const sortVal = lastConv.sort && lastConv.sort[0];
            if (sortVal) {
                console.log(`\n--- Testing Page 2 with searchAfter=${sortVal} ---`);
                const url4 = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1&searchAfter=${sortVal}`;
                const res4 = await fetch(url4, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
                });
                if (res4.ok) {
                    const data4 = await res4.json();
                    console.log('P4 Count:', data4.conversations?.length);
                    console.log('P4 First ID:', data4.conversations?.[0]?.id);
                    if (data4.conversations?.[0]?.id === firstId) console.log('⚠️ Loop detected!');
                    else console.log('✅ Success! New data.');
                } else {
                    console.log('❌ P4 Failed:', await res4.text());
                }

                console.log(`\n--- Testing Page 2 with search_after=${sortVal} ---`);
                const url5 = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1&search_after=${sortVal}`;
                const res5 = await fetch(url5, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
                });
                if (res5.ok) {
                    const data5 = await res5.json();
                    console.log('P5 Count:', data5.conversations?.length);
                    console.log('P5 First ID:', data5.conversations?.[0]?.id);
                    if (data5.conversations?.[0]?.id === firstId) console.log('⚠️ Loop detected!');
                    else console.log('✅ Success! New data.');
                } else {
                    console.log('❌ P5 Failed:', await res5.text());
                }
            }

            // Test Page 2 with startAfter (timestamp)
            // Usually dateUpdated or lastMessageDate
            const ts = lastConv.lastMessageDate || lastConv.dateUpdated;
            if (ts) {
                console.log(`\n--- Testing Page 2 with startAfter=${ts} ---`);
                const url3 = `${baseUrl}/conversations/search?locationId=${locationId}&limit=1&startAfter=${ts}`;
                const res3 = await fetch(url3, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Version': '2021-04-15' }
                });
                if (res3.ok) {
                    const data3 = await res3.json();
                    console.log('Page 3 Count:', data3.conversations?.length);
                    console.log('Page 3 First ID:', data3.conversations?.[0]?.id);
                    if (data3.conversations?.[0]?.id === firstId) console.log('⚠️ Loop detected!');
                } else {
                    console.log('❌ Page 3 Failed:', await res3.text());
                }
            }
        }
    } catch (e) { console.log('Error:', e); }
}

debugConversations();
