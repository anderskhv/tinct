-- Premium's first month free for every existing reader (Anders approved,
-- 22 Oct 2026; docs/social/PROFILE-FLOW-BRIEF.md section 1).
--
-- ANDERS RUNS THIS BY HAND, once the release is live (23 October 2026).
-- Changes data. Safe to run twice: a second run finds every granted account
-- already Premium and changes nothing.
--
-- Every account that is not paying and is not Tinct's own (internal or test)
-- gets Premium by grant until 2026-11-22 05:00 UTC (30 days from 07:00
-- Copenhagen on 23 October): subscription_status 'canceled' with that
-- subscription_period_end, so it lapses back to Free by itself. The Worker
-- recognises the grant by that exact end (app/src/worker/lib/aiAllowance.ts
-- FREE_MONTH_START / FREE_MONTH_END: the two must match). Its AI allowance
-- window starts at FREE_MONTH_START, so earlier use does not count and every
-- granted reader starts with the full allowance; top-up credit is untouched.
--
-- Left alone: an active, trialing, past-due, unpaid or incomplete Stripe
-- subscription, and a canceled one still paid through a future date (this
-- includes Premium already granted by hand). No Stripe object is created or
-- changed. Settings and the You card read "Premium · first month free".
--
-- The guard stops a late run: if the release moved, move the dates here and
-- in aiAllowance.ts together first.

do $$
begin
  if now() > timestamptz '2026-10-26 00:00:00+00' then
    raise exception 'First month free: these dates are for a release on 23 October 2026. Move FREE_MONTH_START/END here and in app/src/worker/lib/aiAllowance.ts first.';
  end if;
end $$;

update public.profiles p
   set subscription_status = 'canceled',
       subscription_period_end = timestamptz '2026-11-22 05:00:00+00'
 where not p.is_test
   and not public.is_test_email(p.email)
   and not exists (select 1 from public.reader_profiles rp where rp.id = p.id and rp.internal)
   and coalesce(p.subscription_status, '') not in ('active', 'trialing', 'past_due', 'unpaid', 'incomplete')
   and not (p.subscription_status = 'canceled' and p.subscription_period_end > now());
