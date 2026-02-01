# GHL -> Supabase Sync Application

A Next.js 14 (App Router) application that synchronizes data from GoHighLevel to Supabase.

## Features
- **Dashboard**: View sync status and stats for Contacts, Pipelines, Opportunities, and Conversations.
- **Manual Sync**: Trigger syncs for individual entities or all at once.
- **Logging**: Detailed `sync_runs` table tracks every execution.
- **Resilience**: JSONB storage for raw data ensures no data loss if schema changes.

## Tech Stack
- Next.js 14 + TypeScript
- Supabase (Postgres)
- Tailwind CSS
- Server Actions / Route Handlers for API logic

## Setup

1. **Clone & Install**
   ```bash
   git clone <repo>
   npm install
   ```

2. **Supabase Setup**
   - Create a new Supabase project.
   - Go to SQL Editor and run the contents of [`schema.sql`](./schema.sql).

3. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
   - Fill in your GHL credentials.

4. **Run**
   ```bash
   npm run dev
   ```

## Architecture Decisions

- **Sync Strategy**: We use an "Upsert" strategy. 
    - We fetch data from GHL.
    - We try to match existing records by their GHL ID (`ghl_*_id`).
    - If found, we update; if not, we insert.
    - Raw JSON is always stored in `raw` column to allow future backfilling of columns without re-fetching.
- **Server-Side Only**: All GHL interactions happen on the server to protect API tokens.
- **Sync Logs**: We persist a log of every run in `sync_runs` to provide visibility into the system's health.

## Testing
- Use the Dashboard buttons to trigger syncs.
- Check the "Activity Feed" or the `sync_runs` table in Supabase to verify success.
