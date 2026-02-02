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

async function verify() {
    // Dynamic imports to ensure env is loaded first
    const { runSync } = await import('../lib/syncService');
    const { ghlClient } = await import('../lib/ghlClient');

    console.log('--- Verifying Contacts Limit Removal ---');
    try {
        console.log('Fetching contacts...');
        const result = await runSync('contacts');
        console.log('Contacts Sync Result:', result);

        if (result.fetched > 100) {
            console.log('SUCCESS: Fetched more than 100 contacts!');
        } else {
            console.log(`WARNING: Fetched ${result.fetched} contacts. If you have > 100 contacts, this may still be broken.`);
        }

    } catch (error) {
        console.error('Error syncing contacts:', error);
    }

    console.log('\n--- Verifying Conversations Limit Removal ---');
    try {
        console.log('Fetching conversations...');
        const result = await runSync('conversations');
        console.log('Conversations Sync Result:', result);

        if (result.fetched > 100) {
            console.log('SUCCESS: Fetched more than 100 conversations!');
        } else {
            console.log(`WARNING: Fetched ${result.fetched} conversations.`);
        }
    } catch (error) {
        console.error('Error syncing conversations:', error);
    }
}

verify();
