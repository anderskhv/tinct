# Tinct security audit — 2026-04-27

Triggered by the Poetry Editor incident (Anthropic API key leaked into client bundle via `VITE_ANTHROPIC_API_KEY`). Anders flagged Tinct as highest priority — same stack (React + Vite + Claude API).

## Result: CLEAN

Tinct does not have the same architectural flaw. All Claude API calls go through the Cloudflare Worker (server-side); the React bundle never touches the API key.

## What I checked

### Source-side (regex grep across `app/src/`)

```
grep -rn "VITE_|NEXT_PUBLIC_|REACT_APP_|dangerouslyAllowBrowser|anthropic-dangerous-direct" app/src
```

Found:
- `VITE_SUPABASE_URL` (public by design — Supabase URL)
- `VITE_SUPABASE_ANON_KEY` (public by design — Supabase anon key, security via RLS)
- `VITE_AUDIO_BASE_URL` (public — R2 bucket URL)

No `VITE_ANTHROPIC_API_KEY`, no `dangerouslyAllowBrowser`, no `anthropic-dangerous-direct-browser-access`.

### Anthropic API call sites

```
grep -rn "api.anthropic.com|x-api-key|ANTHROPIC_API_KEY" app/src
```

All matches are in `app/src/worker.ts` — the Cloudflare Worker. Worker reads `env.ANTHROPIC_API_KEY` from Cloudflare secrets. Client cannot import worker.ts (different runtime).

### Live-bundle probe

```
curl -sL https://tinct.app/assets/index-fIGKXZVt.js | grep -oE "sk-ant-[A-Za-z0-9_-]{8,}"
# (no output)
curl -sL https://tinct.app/assets/index-fIGKXZVt.js | grep -oE "sk-[a-zA-Z0-9_-]{32,}"
# (no output)
curl -sL https://tinct.app/assets/index-fIGKXZVt.js | grep -oE "AIza[A-Za-z0-9_-]{35}"
# (no output)
curl -sL https://tinct.app/assets/index-fIGKXZVt.js | grep -c "dangerous-direct-browser"
# 0
curl -sL https://tinct.app/assets/index-fIGKXZVt.js | grep -c "x-api-key"
# 0
```

Bundle is 635 KB. No leaked key shapes for Anthropic, OpenAI, or Google.

## Why Tinct is structured correctly

- The chat endpoint is `/api/chat` (proxied by the worker, not direct to Anthropic)
- The worker holds `ANTHROPIC_API_KEY` as a Cloudflare secret (`env.ANTHROPIC_API_KEY`)
- The client calls `apiUrl('/api/chat')` which resolves to the worker
- Auth + balance + rate limiting all enforced server-side

## Defensive backlog (not urgent, since we're clean — but worth doing)

1. **Build-time grep gate** — add `npm run verify-bundle` step that greps `dist/assets/*.js` for `sk-ant-`, `sk-proj-`, `AIza` key shapes and fails the build if any match. Same shape as the verify-bundle script that already checks env vars. Free insurance against a future regression where someone accidentally adds `VITE_ANTHROPIC_*` and ships.

2. **CI/PR check** — same regex against the diff in PR review. Belt and suspenders.

3. **Document the boundary** in `app/CLAUDE.md` invariants: "Anthropic API calls MUST go through worker.ts. Client code MUST NOT include `dangerouslyAllowBrowser`, `anthropic-dangerous-direct-browser-access`, or any prefix that exposes secrets to the bundle (`VITE_*`, `NEXT_PUBLIC_*`, `REACT_APP_*` for secret values)."

## Recommendation for the broader incident

Even though Tinct is clean, the leaked Poetry Editor key may have been used to query Claude as if from the leaked-key holder. Worth:

1. Revoke the Poetry Editor key in the Anthropic console immediately.
2. Screenshot Anthropic usage dashboard for damage record before the spike disappears.
3. Confirm spending cap is in place (Anders confirmed: yes, on Anthropic console).
4. Check Anthropic dashboard for unusual usage on the Tinct key as a precaution — even though we have no evidence it leaked.

Same stack, same vendor — if one key is compromised, the procedure should be: rotate all keys, audit all bundles, confirm no others. Tinct's bundle has been confirmed clean as of this deploy (`index-fIGKXZVt.js`).
