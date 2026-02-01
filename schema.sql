-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Contacts
create table if not exists ghl_contacts (
  id uuid primary key default gen_random_uuid(),
  location_id text,
  ghl_contact_id text unique not null,
  full_name text,
  email text,
  phone text,
  business_name text,
  date_added timestamptz,
  last_activity_at timestamptz,
  tags text[],
  raw jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now()
);

-- 2. Pipelines
create table if not exists ghl_pipelines (
  id uuid primary key default gen_random_uuid(),
  location_id text,
  ghl_pipeline_id text unique not null,
  name text,
  raw jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now()
);

-- 3. Opportunities
create table if not exists ghl_opportunities (
  id uuid primary key default gen_random_uuid(),
  location_id text,
  ghl_opportunity_id text unique not null,
  pipeline_id text,
  stage_id text,
  contact_id text,
  contact_name text,
  contact_email text,
  contact_phone text,
  source text,
  name text,
  status text,
  value numeric,
  raw jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now()
);

-- 4. Conversations
create table if not exists ghl_conversations (
  id uuid primary key default gen_random_uuid(),
  location_id text,
  ghl_conversation_id text unique not null,
  contact_id text,
  full_name text,
  contact_name text,
  email text,
  company_name text,
  phone text,
  last_message_at timestamptz,
  last_message_body text,
  last_message_type text,
  last_message_direction text,
  unread_count int default 0,
  tags text[],
  raw jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now()
);

-- 5. Sync Runs
create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  parent_run_id uuid references sync_runs(id) on delete set null,
  entity text not null, -- contacts, pipelines, opportunities, conversations, all
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null, -- running, success, failed
  fetched_count int not null default 0,
  upserted_count int not null default 0,
  error text
);

-- Indexes for performance
create index if not exists idx_ghl_contacts_email on ghl_contacts(email);
create index if not exists idx_ghl_opportunities_pipeline on ghl_opportunities(pipeline_id);
create index if not exists idx_sync_runs_status on sync_runs(status);
create index if not exists idx_sync_runs_started_at on sync_runs(started_at desc);

-- 5. Messages
create table if not exists ghl_messages (
  id uuid primary key default gen_random_uuid(),
  ghl_message_id text unique not null,
  conversation_id text not null,
  contact_id text,
  body text,
  direction text, -- inbound or outbound
  status text,
  message_type text, -- SMS, Email, etc.
  sent_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now()
);

create index if not exists idx_ghl_messages_conversation on ghl_messages(conversation_id);
create index if not exists idx_ghl_messages_contact on ghl_messages(contact_id);

-- 6. Disable RLS (Since we are using Anon key for now or want simple write access)
alter table ghl_contacts disable row level security;
alter table ghl_pipelines disable row level security;
alter table ghl_opportunities disable row level security;
alter table ghl_conversations disable row level security;
alter table ghl_messages disable row level security;
alter table sync_runs disable row level security;
