# Cloud deploy (CI and Cursor Cloud Agents)

Tinct can deploy without Anders' Mac once **one GitHub secret** and optional account id are configured.

## What deploy does

From `app/`:

```bash
npm run build      # Vite + landing swap + service-worker stamp
npm run verify-bundle
npx wrangler deploy
```

This pushes the Worker (`app/src/worker.ts`) and static assets from `dist/`. It does **not** re-upload Worker runtime secrets (Anthropic, Stripe, Supabase service role, etc.) — those already live on the Cloudflare Worker.

## Secrets required for automated deploy

| Secret | Required | Purpose |
|--------|----------|---------|
| `CLOUDFLARE_API_TOKEN` | **Yes** | Wrangler deploy to Workers + asset upload |
| `CLOUDFLARE_ACCOUNT_ID` | Optional | Set if Wrangler cannot infer account (`58f26c4a077e8c66e0b017d2399ae1b3`) |

Create the token in Cloudflare Dashboard → My Profile → API Tokens → **Edit Cloudflare Workers** template (Workers Scripts, KV, R2 bindings).

**Do not** use the RunPod R2 upload token (`cfut_…`) for deploy. That token is for `wrangler r2 object put` on RunPod only. See `docs/workflow-boundaries.md`.

### Build-time client vars (no secret needed in CI)

When `CI=true`, `app/vite.config.ts` injects production fallbacks for:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AUDIO_BASE_URL`

Local `app/.env` is optional for CI; it is still used when present on a developer machine.

## GitHub Actions

- **Verify** (all PRs + `main` + `cursor/**`): `.github/workflows/verify.yml` — test, build, verify-bundle.
- **Deploy** (`main` push + manual): `.github/workflows/deploy.yml` — verify gates then `wrangler deploy` + `scripts/smoke-test.sh` against `https://tinct.app`.

### One-time GitHub setup

1. Repo → Settings → Secrets and variables → Actions → New repository secret:
   - `CLOUDFLARE_API_TOKEN` = Workers deploy token
2. (Optional) `CLOUDFLARE_ACCOUNT_ID`
3. Merge to `main` or run **Deploy** workflow manually from Actions tab.

## Cursor Cloud Agents

1. **Repository config**: `.cursor/environment.json` runs `cd app && npm ci` on agent start.
2. **Environment secret** (Cursor Dashboard → Cloud → Environment → Secrets):
   - `CLOUDFLARE_API_TOKEN` = same Workers deploy token as GitHub
3. Agent deploy command (from repo root):

```bash
cd app
npm run build
npm run verify-bundle
npx wrangler deploy
```

`CLOUDFLARE_API_TOKEN` must be in the agent environment; `npm run deploy` also works because Wrangler reads it from the process environment.

### Egress

If the environment uses a restricted egress policy, allow:

- `api.cloudflare.com`
- `tinct.app` (smoke tests)

## Worker runtime secrets (one-time, not per deploy)

Already on production Worker unless standing up a new account:

```bash
cd app
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put STRIPE_PRICE_PREMIUM
npx wrangler secret put STRIPE_PRICE_CHAT_100
npx wrangler secret put STRIPE_PRICE_CHAT_200
npx wrangler secret put INDEXNOW_KEY
npx wrangler secret put BREVO_API_KEY
```

## R2 audio / words.json (separate from app deploy)

Uploading MP3s and `words.json` sidecars uses the **R2 upload token** on RunPod or locally:

```bash
python3 app/tts/generate-words-sidecar.py bible kjv-en --chapter 768 --upload
```

See `books/ENGLISH_AUDIO_PIPELINE.md` (Word timings section).

## Checklist: deploy without your machine

- [ ] `CLOUDFLARE_API_TOKEN` in GitHub Actions secrets
- [ ] (Optional) `CLOUDFLARE_ACCOUNT_ID` in GitHub Actions secrets
- [ ] `deploy.yml` workflow enabled on `main`
- [ ] (For cloud agents) same token in Cursor environment secrets
- [ ] Worker runtime secrets already on Cloudflare (prod today)

After that, merging to `main` deploys automatically; cloud agents can run `npm run deploy` from `app/` when the token is present.
