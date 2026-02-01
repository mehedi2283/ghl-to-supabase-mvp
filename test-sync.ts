import fs from 'fs';
import path from 'path';

// 1. Load Env Vars BEFORE other imports
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading env from:', envPath);
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim();
            process.env[key] = value;
        }
    });
} else {
    console.warn('.env.local not found!');
}

// 2. Import Service (after env is set)
// We need to use dynamic import or require if we want to be strict about ordering, 
// but in ESM with modern node/tsx, top-level imports execute after this block? 
// No, imports are hoisted. We must use dynamic import.

async function main() {
    console.log('Importing syncService...');
    const { runSync } = await import('./src/lib/syncService');

    try {
        console.log('--- Syncing Pipelines ---');
        const pResult = await runSync('pipelines');
        console.log('Pipeline Sync Result:', pResult);

        console.log('\n--- Syncing Contacts ---');
        const cResult = await runSync('contacts');
        console.log('Contact Sync Result:', cResult);

    } catch (err) {
        console.error('Test Sync Failed:', err);
    }
}

main();
