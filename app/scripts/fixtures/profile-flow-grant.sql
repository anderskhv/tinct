-- Synthetic database only. Executed against an empty disposable PostgreSQL.
CREATE TABLE public.profiles (
 id uuid PRIMARY KEY, is_test boolean, subscription_status text,
 subscription_period_end timestamptz, period_start timestamptz,
 messages_used_this_period integer, ai_period_start timestamptz,
 ai_period_allowance_micros bigint, ai_period_drawn_micros bigint,
 ai_credit_micros bigint DEFAULT 7000000
);
CREATE TABLE public.reader_profiles (id uuid PRIMARY KEY, internal boolean);
CREATE TABLE public.user_data (user_id uuid, key text, value jsonb, PRIMARY KEY(user_id,key));
INSERT INTO profiles (id,subscription_status,is_test,subscription_period_end,messages_used_this_period,ai_period_drawn_micros)
VALUES
 ('00000000-0000-4000-8000-000000000001',null,false,null,20,1000000),
 ('00000000-0000-4000-8000-000000000002','active',false,now()+interval '1 year',30,2000000),
 ('00000000-0000-4000-8000-000000000003',null,false,null,30,2000000),
 ('00000000-0000-4000-8000-000000000004',null,true,null,30,2000000),
 ('00000000-0000-4000-8000-000000000005','canceled',false,now()+interval '10 days',30,2000000),
 ('00000000-0000-4000-8000-000000000006','past_due',false,null,30,2000000),
 ('00000000-0000-4000-8000-000000000007','canceled',false,now()-interval '1 day',20,1000000);
INSERT INTO reader_profiles SELECT id, id='00000000-0000-4000-8000-000000000003' FROM profiles;
CREATE TEMP TABLE original_profiles AS SELECT * FROM profiles;
\ir ../../supabase/migrations/20261026_reading_languages.sql
\ir ../../supabase/migrations/20261026_first_month_grant.sql
DO $$ BEGIN
 IF (SELECT count(*) FROM user_data) <> 2 THEN RAISE EXCEPTION 'wrong grant count'; END IF;
 IF EXISTS (SELECT 1 FROM profiles p JOIN original_profiles o USING(id) WHERE p.id NOT IN ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000007') AND row(p.*) IS DISTINCT FROM row(o.*)) THEN RAISE EXCEPTION 'changed a protected account'; END IF;
 IF EXISTS (SELECT 1 FROM profiles WHERE id IN ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000007') AND (subscription_status <> 'canceled' OR subscription_period_end-period_start <> interval '30 days' OR ai_period_start <> period_start OR ai_period_allowance_micros <> 3000000 OR ai_period_drawn_micros <> 0 OR messages_used_this_period <> 0 OR ai_credit_micros <> 7000000)) THEN RAISE EXCEPTION 'incorrect grant or allowance reset'; END IF;
 IF EXISTS (SELECT 1 FROM reader_profiles WHERE reading_languages <> ARRAY['en']) THEN RAISE EXCEPTION 'wrong language default'; END IF;
 BEGIN
  UPDATE reader_profiles SET reading_languages=ARRAY[]::text[];
  RAISE EXCEPTION 'empty languages accepted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 UPDATE reader_profiles SET reading_languages=ARRAY['da'];
END $$;
CREATE TEMP TABLE first_grant AS SELECT * FROM profiles;
\ir ../../supabase/migrations/20261026_first_month_grant.sql
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM profiles p JOIN first_grant f USING(id) WHERE row(p.*) IS DISTINCT FROM row(f.*)) THEN RAISE EXCEPTION 'rerun extended a grant'; END IF;
 IF (SELECT count(*) FROM user_data) <> 2 THEN RAISE EXCEPTION 'duplicate grant receipt'; END IF;
END $$;
