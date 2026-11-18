-- Per-reader AI and audio cost ledger (Ship 3, approved by Anders 2026-09-30).
-- One row per paid event: Claude calls, Grok Talk, narration generation and
-- listening, and source search. METADATA ONLY: no message text, prompts,
-- search queries or audio are stored. The Worker writes with the service role;
-- only site admins can read. The existing public.token_usage table is untouched.
-- Idempotent: safe to run twice. Requires public.site_admins (20260325_analytics.sql).

create table if not exists public.ai_usage_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  -- NULL for signed-out callers.
  user_id uuid references auth.users(id) on delete set null,
  -- Signed-out callers: HMAC of the anonymous rate-limit key (IP); 'warm' for admin prewarming.
  guest_key text,
  feature text not null check (feature in (
    'chat', 'explain', 'librarian', 'recap', 'lab_chat', 'talk',
    'narration_generate', 'narration_listen', 'source_search'
  )),
  provider text not null check (provider in ('anthropic', 'xai', 'openai')),
  model text not null,
  input_tokens integer,
  output_tokens integer,
  cache_read_tokens integer,
  cache_write_tokens integer,
  -- Talk connected time, or narration listening time.
  seconds numeric,
  -- Narration text sent to (or served from cache for) the TTS provider.
  chars integer,
  cache_hit boolean,
  book_id text,
  -- Computed by the Worker at write time from the versioned pricing table.
  cost_usd numeric(10,5) not null default 0
);

create index if not exists ai_usage_events_user_month_idx
  on public.ai_usage_events (user_id, created_at desc);
create index if not exists ai_usage_events_guest_month_idx
  on public.ai_usage_events (guest_key, created_at desc) where guest_key is not null;
create index if not exists ai_usage_events_feature_idx
  on public.ai_usage_events (feature, created_at desc);

alter table public.ai_usage_events enable row level security;

-- No insert/update/delete policies: only the service role (which bypasses RLS) writes.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ai_usage_events' and policyname = 'ai_usage_events_select_admin'
  ) then
    create policy ai_usage_events_select_admin
      on public.ai_usage_events
      for select
      using (exists (select 1 from public.site_admins sa where sa.user_id = auth.uid()));
  end if;
end $$;

revoke all on public.ai_usage_events from anon, authenticated;
grant select on public.ai_usage_events to authenticated;
grant all on public.ai_usage_events to service_role;

-- Admin read model: one row per reader (or anonymous key) per month.
-- security_invoker makes the view obey the table's RLS, so a signed-in admin
-- sees every row, a non-admin sees none, and the service role sees all.
create or replace view public.ai_cost_by_user_month
with (security_invoker = true) as
select
  coalesce(e.user_id::text, e.guest_key) as reader_key,
  e.user_id,
  e.guest_key,
  date_trunc('month', e.created_at)::date as month,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'chat'), 0) as chat_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'explain'), 0) as explain_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'librarian'), 0) as librarian_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'recap'), 0) as recap_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'lab_chat'), 0) as lab_chat_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'talk'), 0) as talk_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'narration_generate'), 0) as narration_generate_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'source_search'), 0) as source_search_usd,
  coalesce(sum(e.cost_usd), 0) as total_usd,
  coalesce(sum(e.seconds) filter (where e.feature = 'talk'), 0) / 60.0 as talk_minutes,
  coalesce(sum(e.seconds) filter (where e.feature = 'narration_listen'), 0) / 60.0 as listening_minutes,
  coalesce(sum(e.chars) filter (where e.feature = 'narration_generate' and e.cache_hit is not true), 0) as chars_generated
from public.ai_usage_events e
group by coalesce(e.user_id::text, e.guest_key), e.user_id, e.guest_key, date_trunc('month', e.created_at)::date;

revoke all on public.ai_cost_by_user_month from anon, authenticated;
grant select on public.ai_cost_by_user_month to authenticated;
grant all on public.ai_cost_by_user_month to service_role;
