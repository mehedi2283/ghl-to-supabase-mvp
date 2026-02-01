Project Brief — GoHighLevel ↔ Supabase Sync Dashboard

Overview
We built a lightweight, production-ready synchronization dashboard using Next.js that securely connects GoHighLevel (GHL) with Supabase. The goal was to automatically fetch data from GHL, store it reliably, and present it in a clean, usable interface—without manual intervention.

Architecture (High Level)
- Frontend: Next.js (App Router)
- Backend: Next.js API Routes (server-side)
- Database: Supabase (PostgreSQL)
- External API: GoHighLevel (OAuth-based access)

No separate backend server was required. Next.js API routes act as the backend.

--------------------------------
How We Fetch Data (GoHighLevel)
--------------------------------
- We use official GoHighLevel APIs with OAuth access tokens.
- Required scopes (e.g. conversations.readonly) are explicitly enabled.
- Data is fetched via server-side API routes only (never from the browser).
- Example entities fetched:
  - Contacts
  - Pipelines
  - Opportunities
  - Conversations

This ensures:
- Security (tokens never exposed)
- Proper scope enforcement
- Scalable sync logic

--------------------------------
How We Save Data (Supabase)
--------------------------------
- Each entity has its own table in Supabase.
- We use an UPSERT strategy (insert or update) to avoid duplicates.
- Each record includes:
  - A unique GoHighLevel ID
  - Key searchable fields (name, email, status, etc.)
  - A `raw` JSON column containing the full original API response
  - Timestamps for sync tracking

Example approach:
- If the record already exists → update it
- If it does not exist → create it
- This makes syncing idempotent and safe to rerun

--------------------------------
How We Trigger Sync (User Interaction)
--------------------------------
- The UI provides “Sync” buttons per entity (Contacts, Pipelines, etc.)
- A “Sync All” button triggers all syncs sequentially
- Button clicks call internal API routes (POST requests)
- API routes handle:
  - Fetching data from GHL
  - Saving/updating records in Supabase
  - Returning success/error responses

--------------------------------
How We Show Data (Frontend)
--------------------------------
- The frontend is built as Client Components.
- Data is loaded from Supabase via internal API routes.
- No server functions are passed directly to the UI (clean separation).
- Pages include:
  - Dashboard summary (counts + last sync)
  - Entity tabs (Contacts, Pipelines, Opportunities, Conversations)
  - Tables rendered from Supabase data
  - Sync activity/status indicators

--------------------------------
Security & Best Practices
--------------------------------
- All secrets stored as environment variables (Vercel + local)
- Service role key used only on the server
- OAuth scopes limited to required permissions
- No direct database or GHL access from the browser

--------------------------------
Result
--------------------------------
- Fully automated sync between GoHighLevel and Supabase
- No manual data handling
- Clean, modern dashboard UI
- Scalable and production-ready structure
- Easy to extend with more entities or scheduled syncs

This implementation follows modern Next.js best practices and provides a secure, maintainable foundation for future growth.
