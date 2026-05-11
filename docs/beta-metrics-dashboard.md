# Beta Metrics Dashboard

Internal dashboard:

```text
https://tinct.app/admin/metrics
```

The page is a private SPA route. The dashboard reads `analytics_events` directly through Supabase, so access is controlled by the existing `site_admins` RLS policy.

## Grant Access

Sign in once with the account you want to use, then run:

```bash
cd /Users/andershvelplund/Documents/Projects/Tinct/app
source ~/.nvm/nvm.sh && nvm use 24
npm run admin:grant -- your-email@example.com
```

You can also grant by user id:

```bash
npm run admin:grant -- 00000000-0000-0000-0000-000000000000
```

## Verify

Before deploy, verify Supabase plumbing:

```bash
npm run admin:verify -- --email=your-email@example.com
```

After deploy, verify the live route too:

```bash
npm run admin:verify -- --base=https://tinct.app --email=your-email@example.com
```

## Dashboard Targets

The dashboard tracks the quiet-beta launch gate:

- `100` visitors
- `40` book openers
- `20` readers with at least 10 minutes of recorded reading time
- `10` accounts
- `5` AI/audio users

It also shows checkout starts, top acquisition sources, and top books opened.

## Notes

- If the page says access is denied, the signed-in user is not in `public.site_admins`.
- If the dashboard is empty, open the app with a UTM link and use it for a minute, then refresh.
- Attribution is captured from `utm_*`, `gclid`, `fbclid`, `msclkid`, `ttclid`, and `rdt_cid`.
