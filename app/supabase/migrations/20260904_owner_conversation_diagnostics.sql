-- Owner-only, explicitly opted-in conversation diagnostics.
-- Additive and reversible: drop the four tables below to remove the feature.

create table if not exists public.diagnostic_consents (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  raw_content_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint diagnostic_raw_requires_enabled check (not raw_content_enabled or enabled)
);

create table if not exists public.diagnostic_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null check (length(session_id) between 1 and 100),
  turn_id text check (turn_id is null or length(turn_id) between 1 and 100),
  provider_id text check (provider_id is null or length(provider_id) between 1 and 100),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);

create index if not exists diagnostic_events_owner_session_time
  on public.diagnostic_events (user_id, session_id, created_at);
create index if not exists diagnostic_events_expiry on public.diagnostic_events (expires_at);

-- Raw text is deliberately separated from lifecycle metadata. It is never
-- selected by the ordinary diagnostic timeline endpoint.
create table if not exists public.diagnostic_payloads (
  event_id uuid primary key references public.diagnostic_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '14 days')
);
create index if not exists diagnostic_payloads_expiry on public.diagnostic_payloads (expires_at);

create table if not exists public.diagnostic_access_audit (
  id bigint generated always as identity primary key,
  operator_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  session_id text,
  created_at timestamptz not null default now()
);

alter table public.diagnostic_consents enable row level security;
alter table public.diagnostic_events enable row level security;
alter table public.diagnostic_payloads enable row level security;
alter table public.diagnostic_access_audit enable row level security;

-- Intentionally no anon/authenticated policies. All access crosses the Worker
-- service boundary, which validates the immutable auth subject against the
-- server secret and requires site-admin membership for reads/deletes.
revoke all on public.diagnostic_consents from anon, authenticated;
revoke all on public.diagnostic_events from anon, authenticated;
revoke all on public.diagnostic_payloads from anon, authenticated;
revoke all on public.diagnostic_access_audit from anon, authenticated;
