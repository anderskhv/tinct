-- AI allowance and top-up credit (Anders, 2026-10-05).
--
-- ANDERS RUNS THIS BEFORE ENABLING THE ALLOWANCE (AI_ALLOWANCE_ENFORCED in
-- app/src/worker/lib/aiAllowance.ts), and before the first top-up is sold:
-- the Stripe webhook credits top-ups through credit_ai_topup() below. Until
-- this has run, a top-up webhook answers 500 and Stripe retries it, so no
-- purchase is lost. Nothing else reads these columns while the switch is off.
--
-- Idempotent: safe to run twice. Amounts are micro-dollars (1 USD = 1,000,000).
--
-- Model
--   * Premium (and the 30-day trial) has a monthly allowance in real AI cost.
--     The Worker passes it in; SQL never hard-codes the amount.
--   * Spend this period = sum(ai_usage_events.cost_usd) since the period start,
--     narration excluded (listening is never charged).
--   * Top-up credit (ai_credit_micros) carries over between periods. It is
--     drawn only by spend beyond the period's allowance.
--
-- Consumption rule (settled at read time, see ai_allowance_settle):
--   overflow  = max(0, period spend - period allowance)
--   to draw   = overflow - what this period has already drawn
--   The profile row remembers the open period (start, allowance, drawn), so
--   each settlement draws only the new overflow. When the period changes, the
--   old period is closed first, so overflow spent after its last settlement is
--   still drawn. A request that overshoots the remaining credit is forgiven
--   (bounded by one request), never carried as debt. The row is locked for the
--   settlement (FOR UPDATE), so two concurrent requests cannot draw twice.

alter table public.profiles add column if not exists ai_credit_micros bigint not null default 0;
alter table public.profiles add column if not exists ai_period_start timestamptz;
alter table public.profiles add column if not exists ai_period_allowance_micros bigint not null default 0;
alter table public.profiles add column if not exists ai_period_drawn_micros bigint not null default 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_ai_credit_nonnegative') then
    alter table public.profiles add constraint profiles_ai_credit_nonnegative check (ai_credit_micros >= 0);
  end if;
end $$;

-- Summed AI cost for one reader in [p_since, p_until), in micro-dollars.
-- p_until null = up to now. Narration (generation and listening) is excluded.
create or replace function public.ai_spend_micros(p_user uuid, p_since timestamptz, p_until timestamptz default null)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(round(sum(e.cost_usd) * 1000000), 0)::bigint
  from public.ai_usage_events e
  where e.user_id = p_user
    and e.created_at >= p_since
    and (p_until is null or e.created_at < p_until)
    and e.feature not in ('narration_listen', 'narration_generate')
$$;

-- Summed AI cost in USD since p_since (narration excluded).
create or replace function public.ai_spend_since(p_user uuid, p_since timestamptz)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  select public.ai_spend_micros(p_user, p_since, null)::numeric / 1000000
$$;

-- Settle the reader's open period and return what the Worker needs to show
-- the usage bar and gate paid features. Draws new overflow from credit.
create or replace function public.ai_allowance_settle(p_user uuid, p_period_start timestamptz, p_allowance_micros bigint)
returns table (spend_micros bigint, credit_micros bigint, drawn_micros bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start timestamptz;
  v_allow bigint;
  v_drawn bigint;
  v_credit bigint;
  v_spend bigint;
  v_delta bigint;
begin
  if p_period_start is null or p_allowance_micros is null or p_allowance_micros < 0 then
    raise exception 'invalid allowance period';
  end if;

  select p.ai_period_start, p.ai_period_allowance_micros, p.ai_period_drawn_micros, p.ai_credit_micros
    into v_start, v_allow, v_drawn, v_credit
    from public.profiles p
    where p.id = p_user
    for update;
  if not found then
    return;
  end if;

  if v_start is distinct from p_period_start then
    if v_start is not null then
      -- Close the previous period: overflow not yet drawn comes off the credit.
      -- A forward move closes at the new start; any other move closes at now.
      v_spend := public.ai_spend_micros(p_user, v_start, case when p_period_start > v_start then p_period_start else null end);
      v_delta := greatest(0, greatest(0, v_spend - v_allow) - v_drawn);
      v_credit := v_credit - least(v_credit, v_delta);
    end if;
    v_drawn := 0;
    if v_start is not null and p_period_start < v_start then
      -- The new period reaches back over time just settled: treat it as settled.
      v_drawn := greatest(0, public.ai_spend_micros(p_user, p_period_start, null) - p_allowance_micros);
    end if;
    v_start := p_period_start;
  end if;

  v_allow := p_allowance_micros;
  v_spend := public.ai_spend_micros(p_user, v_start, null);
  v_delta := greatest(0, greatest(0, v_spend - v_allow) - v_drawn);
  v_credit := v_credit - least(v_credit, v_delta);
  v_drawn := v_drawn + v_delta;

  update public.profiles
    set ai_period_start = v_start,
        ai_period_allowance_micros = v_allow,
        ai_period_drawn_micros = v_drawn,
        ai_credit_micros = v_credit
    where id = p_user;

  return query select v_spend, v_credit, v_drawn;
end;
$$;

-- One top-up purchase: records the payment and adds the credit in one
-- transaction. A replayed Stripe event (same session id) credits nothing and
-- returns false. The amount comes from the Worker's configured map by checkout
-- type, never from the client.
create or replace function public.credit_ai_topup(p_user_id uuid, p_stripe_session_id text, p_micros bigint, p_amount_cents integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer;
begin
  if p_micros is null or p_micros <= 0 or p_micros > 100000000 then
    raise exception 'invalid top-up amount';
  end if;
  insert into public.payments (user_id, stripe_session_id, amount_cents, type, status)
    values (p_user_id, p_stripe_session_id, coalesce(p_amount_cents, 0), 'chat_pack', 'completed')
    on conflict (stripe_session_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;
  update public.profiles set ai_credit_micros = ai_credit_micros + p_micros where id = p_user_id;
  return true;
end;
$$;

-- Service role only.
revoke all on function public.ai_spend_micros(uuid, timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.ai_spend_since(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.ai_allowance_settle(uuid, timestamptz, bigint) from public, anon, authenticated;
revoke all on function public.credit_ai_topup(uuid, text, bigint, integer) from public, anon, authenticated;
grant execute on function public.ai_spend_micros(uuid, timestamptz, timestamptz) to service_role;
grant execute on function public.ai_spend_since(uuid, timestamptz) to service_role;
grant execute on function public.ai_allowance_settle(uuid, timestamptz, bigint) to service_role;
grant execute on function public.credit_ai_topup(uuid, text, bigint, integer) to service_role;
