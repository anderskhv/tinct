# Tinct Security Audit

**Date:** 2026-03-20
**Scope:** Full codebase at `/Users/andershvelplund/Documents/Projects/Tinct/tinct/`
**Stack:** React 18 + TypeScript + Vite + Claude API + Supabase + Stripe

---

## Summary

The Tinct codebase has **3 Critical**, **2 High**, **3 Medium**, and **2 Low** severity findings. The most urgent issues are plaintext secrets on disk, a `VITE_`-prefixed API key that risks client-side exposure, and a password file that may be tracked by git.

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 2 |
| Medium | 3 |
| Low | 2 |

---

## Findings

### 1. CRITICAL: Anthropic API Key Uses `VITE_` Prefix (Client Exposure Risk)

**File:** `tinct/.env` line 1
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-OUJBPRgsUMrgRdnKpxP6KVz-...
```

**The problem:** Vite automatically exposes ALL environment variables with the `VITE_` prefix to client-side code via `import.meta.env`. While the key is currently only consumed in `vite.config.ts` (server-side dev middleware) and not referenced anywhere in `src/`, the `VITE_` prefix means:
- Any developer who writes `import.meta.env.VITE_ANTHROPIC_API_KEY` in a component will silently embed the key into the production JavaScript bundle.
- Vite's `define` plugin replaces these at build time -- the key is available for injection even if not currently used.

This is a ticking time bomb. One accidental reference and the key ships to every browser.

**Fix:**
1. Rename to `ANTHROPIC_API_KEY` (no `VITE_` prefix) in `.env`.
2. Update `vite.config.ts` line 21 to read `env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY`.
3. In the Vercel production environment, set `ANTHROPIC_API_KEY` as a server-side env var (no `VITE_` prefix).

---

### 2. CRITICAL: Plaintext Secrets in `.env` File

**File:** `tinct/.env`

The `.env` file contains real, usable credentials in plaintext:
- **Anthropic API key** (`sk-ant-api03-...`) -- full production key
- **Supabase URL and anon key** -- public-facing but still sensitive
- **Supabase service role key** (`sb_secret_...`) -- this is an admin key that bypasses Row Level Security

While `.env` is listed in `tinct/.gitignore`, it is NOT listed in the parent `.gitignore` at `Projects/Tinct/.gitignore`. If any git operation runs from the parent directory, the `.env` could be committed.

**Fix:**
1. Rotate the Anthropic API key immediately (it was visible in this audit and may have been exposed in chat history).
2. Rotate the Supabase service role key.
3. Add `.env` to the parent `.gitignore` at `Projects/Tinct/.gitignore`.
4. Verify the key was never committed: `git log --all --diff-filter=A -- tinct/.env`.

---

### 3. CRITICAL: Password File on Disk, Possibly Git-Tracked

**File:** `tinct/Passwords/Passwords`
```
Supabase database: f6uTkHGLeqk1oVBw
```

A plaintext file containing the Supabase database password. This directory is:
- NOT in `tinct/.gitignore`
- NOT in `Projects/Tinct/.gitignore`

If this has been committed to git, the password is permanently in the repository history.

**Fix:**
1. Delete the `Passwords/` directory entirely.
2. Add `Passwords/` to `.gitignore`.
3. Store the password in a password manager (1Password, Bitwarden, etc.) -- never in the repo.
4. Rotate the Supabase database password.
5. If committed, purge from git history: `git filter-branch` or `git filter-repo`.

---

### 4. HIGH: Anonymous Users Can Use AI Chat Without Authentication

**File:** `api/chat.ts` lines 44-57

The `/api/chat` endpoint allows unauthenticated requests. When no auth header is provided, it still proxies to the Anthropic API and only rate-limits by IP address (10 req/min).

**The problem:**
- Anyone can hit `/api/chat` directly with curl and use your Anthropic API key.
- IP-based rate limiting is trivially bypassed with rotating proxies.
- The in-memory `rateLimitMap` resets on every Vercel function cold start (effectively no rate limit in production).
- No CORS restrictions on the API endpoint.
- Anonymous balance tracking is client-side only (localStorage) and trivially reset.

**Combined impact:** An attacker can run up unlimited Anthropic API charges at your expense.

**Fix:**
1. For production, require authentication for `/api/chat`. The $2 free tier should require a verified email at minimum.
2. Replace in-memory rate limiting with a persistent store (Supabase table, Upstash Redis, or Vercel KV).
3. Add CORS headers to restrict API calls to your domain only.
4. If anonymous access is important for UX, implement a CAPTCHA or proof-of-work before the first API call.

---

### 5. HIGH: Supabase Service Role Key in VITE-Prefixed Env Var Context

**File:** `tinct/.env` line 6
```
SUPABASE_SERVICE_ROLE_KEY=<REDACTED>
```

While this key does NOT have the `VITE_` prefix (good), it sits in the same `.env` file that Vite loads with `loadEnv(mode, process.cwd(), '')` in `vite.config.ts` line 6. The empty string third argument (`''`) tells Vite to load ALL env vars, not just `VITE_`-prefixed ones. This means:
- In dev mode, this key is available to the Vite dev server (used correctly for the proxy).
- It is NOT exposed to the client bundle (confirmed by grepping `dist/`).
- However, if anyone ever adds `import.meta.env.SUPABASE_SERVICE_ROLE_KEY` in client code, it would NOT be exposed because Vite only injects `VITE_`-prefixed vars to client. So this is currently safe but confusing.

**The real risk:** The service role key bypasses all Row Level Security. It's being used correctly in `api/chat.ts` and `api/webhook.ts` (server-side Vercel functions), but the presence of both this key and `VITE_`-prefixed keys in the same `.env` creates confusion about what's safe.

**Fix:**
1. Use a separate `.env.local` or Vercel environment variables for server-only secrets.
2. Document clearly which keys are server-only vs. client-safe.

---

### 6. MEDIUM: In-Memory Rate Limiting Is Ineffective in Serverless

**File:** `api/chat.ts` lines 6-20

```typescript
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
```

Vercel serverless functions have no persistent memory between invocations. Each cold start creates a fresh empty `rateLimitMap`. Under load, multiple function instances run in parallel, each with their own map. The rate limit provides essentially zero protection in production.

**Fix:**
1. Use Vercel KV (Redis) or Upstash for persistent rate limiting.
2. Alternatively, use Supabase to track request counts per user/IP with a simple table and timestamp check.
3. As a quick interim fix, add IP-based rate limiting via Vercel's built-in edge middleware.

---

### 7. MEDIUM: Open Redirect via `req.headers.origin` in Stripe Checkout

**File:** `api/create-checkout.ts` line 86

```typescript
success_url: `${req.headers.origin || 'https://tinct.app'}?payment=success`,
```

The `Origin` header is attacker-controllable. An attacker could set `Origin: https://evil.com` and the Stripe checkout would redirect the user to `https://evil.com?payment=success` after payment. This is a phishing vector.

**Fix:**
1. Hardcode the domain: `success_url: 'https://tinct.app?payment=success'`.
2. Or whitelist allowed origins: `const origin = ALLOWED_ORIGINS.includes(req.headers.origin) ? req.headers.origin : 'https://tinct.app'`.

---

### 8. MEDIUM: Balance Check-Then-Deduct Race Condition

**File:** `api/chat.ts` lines 60-74 and 97-115

The balance check (line 60-74) and the deduction (line 107) are not atomic. The flow is:
1. Check if `token_balance_cents > 0`
2. Make the Anthropic API call (takes 1-5 seconds)
3. Deduct the cost

During step 2, a user could fire multiple concurrent requests that all pass the balance check but collectively overdraw their account. The comment on line 77 of `migration.sql` acknowledges this: "allow going negative to avoid race conditions."

**Impact:** Users can get free API usage by sending many concurrent requests. The financial impact is bounded per user but real.

**Fix:**
1. Use `SELECT ... FOR UPDATE` or an atomic `UPDATE ... WHERE balance >= cost RETURNING *` pattern.
2. Or pre-deduct an estimated amount before the API call and refund the difference after.

---

### 9. LOW: No Content Security Policy Headers

**File:** `index.html`, `vercel.json`

There are no CSP headers configured. While the app doesn't use `dangerouslySetInnerHTML` or `innerHTML` (good), a CSP would provide defense-in-depth against XSS via:
- Restricting script sources
- Preventing inline script injection
- Blocking unauthorized API endpoints

**Fix:**
Add to `vercel.json`:
```json
"headers": [
  {
    "source": "/(.*)",
    "headers": [
      { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.anthropic.com https://*.supabase.co; img-src 'self' data:; font-src 'self'" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "X-Frame-Options", "value": "DENY" }
    ]
  }
]
```

---

### 10. LOW: Error Messages Leak Internal Details

**Files:** `api/chat.ts` line 134, `api/create-checkout.ts` line 98

```typescript
details: err instanceof Error ? err.message : String(err),
```

Error messages from the Anthropic API or Stripe are forwarded to the client. These could contain internal details (stack traces, API version info, config paths).

**Fix:**
1. Log the full error server-side (`console.error`).
2. Return a generic message to the client: `{ error: 'An unexpected error occurred' }`.

---

## Positive Findings (What's Done Right)

1. **No `dangerouslySetInnerHTML` or `innerHTML` anywhere.** All rendering uses React's safe JSX patterns. The custom markdown renderer in `Chat.tsx` and `Notes.tsx` uses React elements, not HTML string injection. This eliminates the primary XSS vector.

2. **No `anthropic-dangerous-direct-browser-access`.** The Claude API is always called through a server-side proxy (`/api/chat`), never directly from the browser.

3. **Supabase Row Level Security is enabled** on all tables with appropriate policies. Users can only read their own data.

4. **Stripe webhook signature verification** is correctly implemented in `api/webhook.ts`.

5. **Auth token verification** uses Supabase's `getUser()` which validates the JWT server-side (not just client-side decoding).

6. **No API keys in client-side source code.** Grep of `src/` confirms zero references to `VITE_ANTHROPIC_API_KEY` or any other secret.

7. **The production build (`dist/`) contains no secrets.** Verified by grepping the built assets.

8. **Input validation on Stripe checkout amounts** (`api/create-checkout.ts` line 36) -- only allows whitelisted amounts.

9. **SECURITY DEFINER functions** in Supabase are used appropriately for atomic balance operations.

---

## Priority Action List

| Priority | Action | Severity |
|----------|--------|----------|
| 1 | Rotate the Anthropic API key (exposed in this file and chat history) | Critical |
| 2 | Rename `VITE_ANTHROPIC_API_KEY` to `ANTHROPIC_API_KEY` | Critical |
| 3 | Delete `Passwords/` directory, add to `.gitignore`, rotate DB password | Critical |
| 4 | Add `.env` to parent `.gitignore` | Critical |
| 5 | Require authentication for `/api/chat` in production | High |
| 6 | Replace in-memory rate limiting with persistent store | Medium |
| 7 | Hardcode domain in Stripe checkout redirect URLs | Medium |
| 8 | Add CSP headers to `vercel.json` | Low |
| 9 | Sanitize error messages returned to client | Low |

---

*Audit conducted by Claude on 2026-03-20. This audit covers the codebase as of the file timestamps observed. It does not include penetration testing, dependency vulnerability scanning (npm audit could not be run), or review of the Supabase dashboard configuration.*
