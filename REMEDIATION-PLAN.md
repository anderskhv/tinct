# Tinct Remediation Plan — June 2026

**Status:** Approved for execution. Written 2026-06-10 from a full codebase scan (4 parallel investigations + architecture review).
**Executor:** A coding agent working phase by phase. Read this entire file before writing any code.
**Prime directive:** No material degradation of the live reading experience. Every phase is independently deployable and independently revertible. Deploy one phase at a time, soak before the next.

---

## Ground rules for the executing agent (NON-NEGOTIABLE)

1. **Authority order: `AGENTS.md` is the source of truth for the executing agent** (per AGENTS.md:7). Consult `CLAUDE.md` for the Invariants section (7 rules), the guard-test gate, and project history — those are codebase facts, not Claude-specific workflow. Where AGENTS.md and CLAUDE.md conflict on process, AGENTS.md wins; where CLAUDE.md documents an invariant or a test, it is binding regardless of agent.
2. **`npm test` (guard tests in `app/src/hooks/useReadingPosition.guards.test.ts`) must pass before AND after every change** that touches `useReadingPosition.ts`, `useAudioSpeed.ts`, `supabaseStorage.ts`, or position-related effects in `App.tsx`. If a guard test fails, the change is wrong — do not edit the test to match.
3. **One commit per numbered task** (e.g. `fix(1.1): guard progress-cleanup against finished books`). This makes `git revert` surgical.
4. **NO deploy without explicit approval.** Do not run `npm run deploy` unless Anders explicitly says "deploy this task/phase" (AGENTS.md rule; overrides any "deploy" phrasing elsewhere in this plan — read every "deploy" below as "prepare for deploy, verify locally, then ask Anders"). When approval is given, deploy = full Pre-Deploy Checklist (`npm run dev` manual verify → `npm run build` → stash-build check → `npm run deploy` → `./scripts/smoke-test.sh` → exercise the change on https://tinct.app). Never raw `wrangler deploy` or raw `vite build`.
5. **After each phase: STOP.** Report what was done, what was verified, and wait for go-ahead before the next phase. Exception: Phase 0 tasks may be done in one session.
6. **Mobile verification is mandatory** for tasks marked 📱 — the bugs being fixed manifest on mobile. Test at mobile viewport width in dev tools at minimum; real-device check via Anders where noted.
7. Working directories: git from `/Users/andershvelplund/Documents/Projects/Tinct`, build/test from `.../Tinct/app`. Use `git -C <path>`, never `cd && git`.
8. Zero Anthropic API spend in development (see CLAUDE.md API Cost Rule). The streaming work in Phase 2 is tested against the dev worker with Anders's explicit go-ahead for a handful of test messages — ask first.

---

## Execution strategy

Aggressive remediation is approved because current Supabase usage shows no non-Anders user at or above 25% of Anders's usage level. Latest check: 11 profiles, 16,067 analytics events, 795 `user_data` rows; Anders baseline score 44,185; 25% threshold 11,046; highest non-Anders user 3,752 / 8.5%, with only 12 durable `user_data` keys and 2 reading chapters. The practical blast radius is Anders's account plus test/family accounts, not organic users.

Interpret that as:

- **One aggressive implementation workstream through Phases 0-4 is allowed locally.** Do not stop after each phase unless a verification gate fails or a task exposes a new architectural risk.
- **Keep commits split by numbered task or tight subtask.** Aggressive does not mean one giant commit. Rollback must remain surgical.
- **Feature-flag the riskiest behavior until final verification:** streaming chat fallback, live `readerSession` position writer, local-first render, and service-worker app-shell precache. Prefer flags/config switches over long-lived parallel code paths.
- **DB changes are allowed in the aggressive workstream but must be backward-compatible.** Versioned writes/tombstones must let old clients keep working during rollout, and behavior must be disable-able if the new writer misbehaves.
- **Run focused tests continuously and the full local gate at the end:** guard tests before/after position work, readerSession tests, chat-history tests, auth probe tests, build, verify-bundle, and manual browser verification.
- **No deploy without explicit approval.** "Aggressive" means local implementation plus verification, not automatic production deploy.

---

## Phase 0 — Urgent, tightly scoped (do immediately, single session)

Risk is NOT uniform here: 0.1–0.3 are low-risk; **0.4 touches payment-webhook and admin-page behavior and must be tested with the same rigor as a Phase 1 bug fix** — do not under-test it because it sits in Phase 0.

### 0.1 ⏰ Model migration — chat breaks in production on June 15
`claude-sonnet-4-20250514` retires 2026-06-15 (verified against the official model catalog). Replacement: **`claude-sonnet-4-6`** — same $3/$15 pricing, drop-in (no prefills or temperature+top_p combos in our code).

- **Replace every occurrence found by `rg -n "20250514" app/src/`** — as of 2026-06-10 there are SIX:
  - `app/src/worker.ts:27` (`CHAT_MODEL` — the one that actually controls /api/chat; the worker ignores `body.model`)
  - `app/src/worker.ts:1506` (related-content endpoint — also server-controlled)
  - `app/src/hooks/useClaude.ts:183`, `app/src/App.tsx:1130`, `app/src/App.tsx:2635`, `app/src/App.tsx:2709` (client-sent model fields; consistency-only since the worker overrides, but replace all so the next grep is clean)
- Re-run the rg after editing; zero occurrences before committing.
- After Anders approves deploy: deploy, then verify by sending one real chat message on https://tinct.app (this is prod usage, allowed). Confirm a normal-quality response.
- **Rollback:** revert the commit (old model still serves until June 15).

### 0.2 Secrets hygiene
- `.gitignore` already fixed (now has `.env.*` + `!.env.example`) — verify with `git check-ignore app/.env.save`.
- Delete `app/.env.save` from disk — **ask Anders for confirmation first** (delete rule). `.env` holds the live values; `.env.save` is a redundant copy containing `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_API_TOKEN`, `ANTHROPIC_API_KEY`.
- No key rotation required (verified: never committed, never pushed).

### 0.3 Dead-file cleanup (grep-trap removal)
Untracked Finder duplicates that will poison future greps/refactors:
- `app/src/hooks/useReadingPosition 2.ts`
- `app/src/services/supabaseStorage 2.ts`
- `dist/assets/index-BGiOi1_5 2.css` (if present)

Verify each is unimported (`grep -r "useReadingPosition 2\|supabaseStorage 2" app/src/`) then delete — ask Anders in the same confirmation as 0.2.

### 0.4 Worker security hardening (small, isolated, no UX surface)
1. **Stored XSS in admin review page** — audit, don't blind-patch line numbers (some sites are already escaped). Grep ALL interpolations of `report.comment`, `report.selected_text`, and any other anonymous-report field into HTML strings in `worker.ts`, and wrap every UNESCAPED one in the existing `htmlEscape()` helper. Confirmed unescaped as of 2026-06-10: `worker.ts:1431` (report comment). Re-audit the reject-form page (~:2090 region) — it renders attacker-controlled content on the tinct.app origin in Anders's browser and is the live attack surface; its `selected_text` handling only neutralizes `"`, not `<`.
2. **Stripe chat-pack double-credit** — `worker.ts:676-685`: reorder so the `payments` insert (UNIQUE on `stripe_session_id`) happens FIRST. `supabaseInsert` already sends `Prefer: return=representation` (`worker.ts:165`) — the work is in handling the insert RESPONSE, and a UNIQUE violation arrives as a **non-OK 409** from PostgREST, not an empty body. Exact behavior:
   - Insert succeeds (2xx) → call `credit_messages`, return 2xx to Stripe.
   - Insert returns 409 / duplicate-key error → duplicate webhook delivery: SKIP the credit, return 2xx to Stripe (so it stops retrying).
   - Insert fails with any other error → return non-2xx so Stripe retries the delivery; do NOT credit.
   Keep the existing subscription-path guard (:700-710) untouched.
3. **`/api/report-status` filter injection** — `worker.ts:1824`: add the `isValidUUID(id)` check used by every other endpoint; return `{status:'unknown'}` on failure.

**Verification:** `npm run build` clean; smoke test; submit one test issue report and open the admin review page; confirm a `<img src=x onerror=alert(1)>` comment renders as text. Stripe path: code review only (do NOT fire test webhooks at prod) — verify by reading the handler logic and unit-testing the insert-first ordering if a test harness exists.

---

## Phase 1 — The four recurring bugs (one task = one commit = one deploy candidate)

Order within phase: 1.1 → 1.2 → 1.3 → 1.4. Each is independent; if one stalls, skip and continue.

### 1.1 📱 Finished books reappearing as "currently reading"

**Root cause:** the progress-cleanup effect at `App.tsx:1317-1337` deletes `progress:{bookId}` whenever `highestCompletedChapter > position.chapterNumber + 3`. It cannot distinguish poisoned data (the B1 bug it was written for) from a genuinely finished book re-opened at an early chapter. The delete propagates to Supabase but NOT to other devices (realtime DELETE events are dropped at `supabaseStorage.ts:504-505` because the handler reads `payload.new`, empty on DELETE), producing the observed desktop-says-finished / mobile-says-reading split. Intermittency comes from the cleanup running against mixed-freshness data on the quick-return init path (`App.tsx:212-215`).

**Changes (all four):**
1. **Guard the cleanup** (`App.tsx:1317-1337`): skip any book where `progress.highestCompletedChapter >= progress.totalChapters` OR a `book-completed:{bookId}` record exists. Additionally, retire the heuristic after one successful run per device: set a `tinct:progress-cleanup-v1-done` localStorage flag and skip entirely when present (the B1 poisoning it targeted is 6 weeks old; one more pass per device is enough).
2. **Defer until cloud truth is present:** gate the cleanup on Phase A `init()` completion, not first `storageReady` (the quick-return and 5s-timeout paths install the provider with an empty/stale cache — comparing stale local progress vs stale local position is what makes the bug intermittent). Expose a `provider.hasInitSucceeded()` (or reuse `supabaseInitTick`) and only run the cleanup after it.
3. **Handle realtime DELETEs** (`supabaseStorage.ts:503-518`): on `payload.eventType === 'DELETE'`, read `payload.old.key`, then `cache.delete(key)` + `localStorageProvider.delete(key)` + notify listeners. This fixes delete propagation for ALL key types, not just progress.
4. **Make completion authoritative and synced:** add `key.like.book-completed:*` to the Phase A `init()` filter (`supabaseStorage.ts:154-162`) so the records hydrate cross-device. Then thread completion into the BookStore derivation — **note the API shape:** `isFinished(p)` at `BookStore.tsx:42-46` receives only a `ReadingProgress`, so it cannot check `book-completed:` keys itself. Load the set of completed bookIds where the rails are derived (`BookStore.tsx:174-181` — e.g. a `completedBookIds: Set<string>` read from storage alongside progress) and change the rail logic to `finished = isFinished(progress) || completedBookIds.has(book.id)`. (Today the record is written at `App.tsx:2786` but never hydrated cross-device and never consulted — dead weight.)

**Data repair:** after deploy, The Awakening's progress record may already be deleted in Anders's cloud account. Write a one-shot console snippet (or have Anders open the book's last chapter and tap through to the end) to restore `highestCompletedChapter = 39`. Confirm with Anders which finished books to repair.

**Tests:** add unit tests for the cleanup guard (pure-function extract: `shouldCleanupProgress(progress, position, completedRecord) → bool`) in the guards test file pattern. Run `npm test`.

**Verification:** 📱 dev server — mark a test book finished, reload at mobile width 10×, confirm it stays in Finished. Then prod: Anders checks The Awakening on phone AND desktop after repair.

### 1.2 Cross-book chat bleed

**Root cause (twin of the 2026-05-09 position bleed, no equivalent guard exists in chat):** on cloud-sync book switches (`App.tsx:607` and `:866` set `currentBookId` directly), nothing clears the live chat thread synchronously. In the same effect flush, the history-load effect (`App.tsx:1174-1210`) nulls the dedup ref, then the recorder effect (`App.tsx:2559-2588`) re-runs with the OLD book's messages still in its closure — and `recordMessage` (`useChatHistory.ts:85`) stamps the NEW bookId onto them, defeating the defensive filters at `App.tsx:1185/1190` permanently. Second path: an in-flight Claude reply (no AbortController, ~6s retry window, `useClaude.ts:123-257`) resolves after a switch and appends to the new book's thread.

**The durable invariant to implement (everything below serves it):** *every chat message carries the bookId it was created under, and persistence refuses any message whose bookId mismatches the store it's being written to.*

**Changes (all three, layered defense):**
1. **Skip-on-book-change guard in the recorder effect** (`App.tsx:2559`): keep a `prevBookIdRef`; when it differs from `book.id`, update the ref and return without recording. Reuse the pure-function pattern from `useReadingPosition.guards.ts:116` (`shouldSkipOnBookChange`). Also add `clearMessages()` to the centralized Invariant-2 bookId-change effect (`App.tsx:710-748`) so cloud-sync switches clear the live thread at all.
2. **Honest bookId on messages:** in `useClaude.sendMessage`, capture `sendBookId` from options at call time and stamp it onto both the user message and the assistant reply at creation. At resolve (line ~244), if the current options bookId ≠ `sendBookId`, drop the append (the reply belongs to a book the user left). 
3. **`recordMessage` refuses mismatches** (`useChatHistory.ts:83-88`): if `message.bookId` exists and ≠ the hook's `bookId`, log to the readerSession shadow and refuse to persist. This single change makes both bleed paths non-persistent even if a UI race slips through.

**Duplicate-recording hazard:** the manual send path at `App.tsx:2591-2607` records the USER message itself (separately from useClaude's message array, which the recorder effect at :2559 also observes). When stamping bookIds, make sure each message is recorded exactly once — trace both paths before and after the change and assert in the new guard test that a send produces exactly one user entry and one assistant entry in history.

**Same class, Feed tab (do in the same commit if quick):** `useNotes.ts` (~:30-43) and `useHighlights.ts` (:40-52) persist effects can fire with the old book's array under the new book's key during a switch — add the same `prevBookIdRef` skip.

**Tests:** new `app/src/hooks/useChatHistory.guards.test.ts` covering: (a) recorder skip on bookId change, (b) recordMessage mismatch refusal, (c) late-resolve drop, (d) one send → exactly one user + one assistant history entry. Document the new invariant in **AGENTS.md first, then CLAUDE.md** (both files; the guard-test-per-invariant pattern is established in CLAUDE.md's Invariants section).

**Verification:** dev server — open book A, send a chat message, switch to book B via the header while the reply streams; confirm B's chat stays clean and A's history is intact. Check `readerSessionShadow` entries confirm no mismatched writes.

### 1.3 📱 Logged-out flash on reload

**Root cause:** `useAuth.ts:82-85` hard-caps `getSession()` at 3 seconds; on timeout with `user` still null, App.tsx's else-branch (`App.tsx:287-309`) renders the full anonymous UI, runs `setAnonymousMode`, can trigger the one-time `clearLocalUserData()` wipe, and `clearSignedInCookie()` fires on a null result (`useAuth.ts:95`). Mobile is worse because backgrounded sessions hold expired tokens → network refresh routinely exceeds 3s. Secondary: `landing.html` has no `pageshow` handler, so bfcache back-navigation can show a signed-in user the landing page (P0 per decision log).

**Changes:**
1. **Optimistic auth seed** (`useAuth.ts`): at hook init, synchronously probe for `likelyAuthenticated` = (any localStorage key matching `sb-*-auth-token(\.\d+)?` — same regex landing.html uses at `landing.html:6-53`) OR `tinct_auth=1` cookie. Expose it from the hook.
2. **Don't drop to logged-out while likely authenticated:** when the timeout fires AND `likelyAuthenticated`, keep `isLoading` true with a longer cap (12s) and show the existing "Restoring your reading…" treatment (`App.tsx:3455`) instead of the anonymous UI. On a genuine no-token device, behavior is unchanged (instant logged-out render — no regression for anonymous users).
3. **Gate the anonymous side-effects:** the else-branch at `App.tsx:287-309` must not run `setAnonymousMode` / `clearLocalUserData` while `likelyAuthenticated && isLoading-extended`. 
4. **Cookie protection:** only `clearSignedInCookie()` on an explicit `SIGNED_OUT` event, never on a null `getSession()` result while an `sb-*` token exists (`useAuth.ts:95`).
5. **bfcache fix** (`app/public/landing.html`): add `window.addEventListener('pageshow', e => { if (e.persisted) reRunAuthCheck() })` re-running the same cookie/localStorage probe and `location.replace('/read')` on hit. Bump whatever cache-busting applies to landing.html.
6. **Failure handling:** if the 12s extended window expires with no session, fall through to logged-out WITHOUT wiping local data (a transient network failure must not destroy state) — show the SignInBanner so recovery is one tap.

**Tests:** unit-test the probe function (`likelyAuthenticated`) against key formats: plain, chunked `.0/.1`, absent. 

**Verification:** 📱 dev tools → Network throttled to Slow 3G, signed in, reload 5× — must see spinner → signed-in, never the anonymous UI. Desktop normal reload unaffected. Anders real-device check on phone after deploy.

### 1.4 Split-screen highlight selecting the wrong pane

**Root cause:** split rows interleave panes in DOM order (`SplitReader.tsx:941-971`: left[i], right[i], left[i+1]…) with zero `user-select` containment (`index.css:2594-2598`, `:1150`), so native selection sweeps the opposite pane on any multi-line drag. The cross-pane guard at `SplitReader.tsx:605-707` derives the anchor from `range.commonAncestorContainer` with a `querySelector` fallback (line 627) that always resolves to the LEFT pane — so right→left drags pass the guard and store a degenerate 0..0 highlight on the wrong edition.

**Changes:**
1. **Pane-scoped selection (the visible fix):** on `mousedown`/`touchstart` (handlers exist at `SplitReader.tsx:849-857`), set `readerRef.current.dataset.selectingSide = 'left'|'right'` from `e.target.closest('.split-left, .split-right')`; clear on mouseup/touchend AND on `mouseleave`/`blur` (so an off-reader drag-end doesn't leave a pane unselectable). CSS:
   ```css
   .reader[data-selecting-side="left"] .split-right,
   .reader[data-selecting-side="right"] .split-left {
     -webkit-user-select: none; user-select: none;
   }
   ```
   Browsers exclude `user-select:none` content from selection painting and `toString()` — drags stay in one pane.
2. **Fix the anchor derivation (the correctness fix):** at `SplitReader.tsx:622-628`, resolve the paragraph from `selection.anchorNode` (where the user started), DELETE the `querySelector` fallback, and treat "focus not inside any paragraph" (line 635) as a rejection instead of a pass-through.
3. **DO NOT** apply permanent `user-select:none` to `.split-right` — it legitimately supports highlights, copy, and issue reports.

**Adjacent fix (same commit, small):** right-pane highlight notes are silently dropped — `SplitReader.tsx:1159-1161` only calls `onUpdateHighlightNote` for `side === 'left'`, and the click-on-mark popup (:531-558) only matches `.split-left`. Extend both to handle the right pane with `splitEditionKey`.

**Verification:** dev server, split pane on — (a) drag down 3 paragraphs in left pane: right pane never lights up; (b) start in right pane: highlight lands on right edition at correct offsets; (c) select across panes deliberately: cleanly rejected; (d) add/edit a note on a right-pane highlight; (e) dark mode + mobile width sanity check; (f) single-pane (non-split) highlighting unchanged.

---

## Phase 2 — Chat experience (quality-neutral speedups)

Order matters: 2.1 before 2.2 (streaming re-renders the message list per chunk; memoize first).

### 2.1 Typing lag
1. **Extract `ChatInput`** — move the input row + form (`Chat.tsx:683-775`) into a leaf component owning the `input` state (currently `Chat.tsx:210`), calling `onSendMessage` up. Voice-input refs/handlers move with it (they only touch `input`). A keystroke then re-renders only the textarea row.
2. **`MessageItem = React.memo(...)`** with `useMemo(() => renderMarkdown(msg.content), [msg.content])` inside — kills the full-conversation markdown re-parse per render (`Chat.tsx:639-670`). Apply the same to the expanded past-conversation renderer (:545-585).
3. **Memoize `filteredMessages`** (`Chat.tsx:456`) so the search box doesn't invalidate the divider memo per keystroke.
4. **Auto-grow reflow** (`Chat.tsx:301-306`): try CSS `field-sizing: content` with the JS path as fallback for unsupported browsers.

**Verification:** React DevTools Profiler — type into chat with a 30-message conversation loaded; confirm only ChatInput renders per keystroke. Functional: send message, search history, voice input, message dividers all behave identically.

### 2.2 Streaming chat (largest perceived improvement in the app)
1. **Worker** (`worker.ts:240-349`): add `stream: true` to the Anthropic request body; return the upstream SSE body directly (`new Response(response.body, {headers})` — Workers pass streams through natively). Keep the non-streaming path behind a fallback flag for one release.
   - **`ctx` plumbing required first:** `handleChat(request, env)` at `worker.ts:240` has no `ExecutionContext` parameter, and the route at `worker.ts:2641` doesn't pass one. Thread `ctx` through exactly as `handleReportIssue` does (`worker.ts:1733` signature, `worker.ts:2649` call site).
   - **Charging semantics (when does `use_message` deduct?):** wrap the upstream stream in a `TransformStream` (or tee it); fire `ctx.waitUntil(supabaseRpc('use_message', ...))` exactly once, when the FIRST `content_block_delta` is forwarded to the client. Rules: upstream non-200 or error before any delta → no charge (return the error, client retries). Error or disconnect AFTER partial content → still charged (content was delivered; do not attempt refunds). This replaces the current post-completion deduction at `worker.ts:341-343`.
2. **Client** (`useClaude.ts`): parse SSE `content_block_delta` events, append text into the assistant message incrementally. Preserve: the 3-attempt retry on overloaded/5xx (retry only before first token arrives — never mid-stream), the bookId fence from task 1.2, and error states. On stream error mid-response, keep partial text + show the existing error treatment.
3. **Recorder interplay:** the recorder effect must not persist a still-streaming message — record on stream completion (add an `isComplete` flag to the message rather than relying on `isLoading`).

**Verification:** ask Anders for go-ahead, then a handful of live messages on dev worker: first token <2s, full answer renders progressively, history records exactly one final message, quota decrements once. Test an aborted mid-stream (kill network) — graceful error, no corrupt history entry. Mobile check.

### 2.3 Prompt caching
Restructure `system` from one concatenated string (`useClaude.ts:173`) into blocks:
```
[ {text: basePrompt + chapterText, cache_control: {type:"ephemeral"}},
  {text: chatMemory + visibleText} ]
```
- Stable prefix (base ~1k + chapter ≤3k tokens) clears Sonnet 4.6's 2048-token cache minimum for typical chapters; short chapters simply won't cache (harmless).
- `visibleText` (changes per page flip) currently sits inside the single string and invalidates everything — it must be in the second, uncached block.
- **Worker validator change required (this is the blocker):** `worker.ts:306` currently does `typeof body.system === 'string' ? body.system.slice(0, MAX_SYSTEM_PROMPT_LENGTH) : ''` — an array-form `system` is silently coerced to the empty string, dropping the entire prompt. Change the validator to accept BOTH shapes: a string (legacy, keep the slice) or an array of `{type:'text', text, cache_control?}` blocks. For the array form, validate each block's shape, enforce the length limit on the SUM of block texts (same `MAX_SYSTEM_PROMPT_LENGTH` budget), strip any unexpected fields, and cap `cache_control` to `{type:'ephemeral'}` only. Reject (400) malformed blocks rather than coercing.
- **Verify with `usage.cache_read_input_tokens` > 0** on the second message of a conversation (log it server-side temporarily).

### 2.4 Pre-check latency (~200-400ms)
In `handleChat` (`worker.ts:240-349`): after `verifyUser` resolves, run `checkRateLimit` and the profile quota `supabaseGet` in `Promise.all` (independent given userId); parse `request.json()` concurrently with `verifyUser`. Skip the local-JWT-verification idea for now (bigger change, defer).

---

## Phase 3 — Kill the bug class: productionize readerSession + versioned writes

**This is the structural fix.** Do NOT start until Phases 0-2 are deployed and soaked ≥3 days with no regressions. Plan-mode review with Anders before starting — this touches the Invariants.

This is **not** a from-scratch rewrite. The repo already contains the better position-writing model in shadow/prototype form under `app/src/readerSession/`:
- `readerSession/reducer.ts` models one validated `ReaderLocation` with explicit statuses (`ready`, `switching-book`, `loading-edition`).
- `readerSession/writer.ts` converts a valid location to a storage position and rejects invalid/cross-book locations.
- `readerSession/shadow.ts` logs local would-write decisions to `window.__tinctReaderSessionV2`; it is observational only and does not write production positions.
- Current focused tests pass under Node 24: `npm test -- readerSession useReadingPosition.guards` → 3 files / 47 tests.

Phase 3 should **promote readerSession to the live source of truth**, not invent a separate atom.

### 3.1 One location atom
- Promote the existing `readerSession` reducer into live app state: one location atom `{bookId, chapterNumber, paragraphIndex, scrollFraction, editionKey, activeView, source, revision}` plus status `'loading-edition'|'switching-book'|'ready'`.
- A book switch becomes one `OPEN_BOOK` / `EDITION_READY` flow carrying a coherent tuple, not six setState calls spread across renders.
- The existing `canPersistLocation` / readerSession shadow code (`App.tsx:1522-1540`) currently observes whether a location would be persistable. Convert that from derived telemetry into the write gate.
- Migration is incremental: wire the live app to dispatch readerSession events alongside existing state, make writes read from readerSession, then migrate readers/navigation to consume readerSession directly, then delete the old composed-at-save-time path.

### 3.2 One writer
- New `positionSync` service exposing `commit(location, cause)`. The six write triggers (state-change effect, 30s heartbeat, visibilitychange, pagehide, beforeunload, blur — `useReadingPosition.ts:350-411`) collapse to: explicit `commit` from navigation handlers + one heartbeat that reads the atom + one flush-on-hide.
- `writeSuspended`'s 9 OR'd conditions (`App.tsx:1425-1442`) collapse to `location.status !== 'ready'`.
- **Keep every guard test.** Re-point them at the new writer. `shouldBlockRegression` and `markUserNav` semantics carry over. If a guard becomes structurally impossible (e.g. Invariant 7), keep the test as a tripwire asserting the impossibility.

### 3.3 Versioned writes + tombstones
- Add `rev` (monotonic int per key) to `user_data` writes; a Postgres trigger or RPC rejects `rev <= existing`. Client increments from last-seen rev; on rejection, re-read and reconcile instead of overwriting.
- Replace row DELETEs with `value: null` tombstones so realtime UPDATE events carry deletions to all devices (supersedes the 1.1 DELETE-handler patch — keep that patch, this makes it rarely needed).
- Replace the 4s echo-suppression window (`supabaseStorage.ts:507-511`) and client-clock `pickLatest` (`App.tsx:69`) with rev comparison.
- **DB schema change → escalate to Anders before applying** (per Autonomy Framework). Migration must be backward-compatible: old clients without rev keep working during rollout (server treats missing rev as legacy LWW).

### 3.4 Update AGENTS.md and CLAUDE.md
Structural invariant changes land in **AGENTS.md first** (it's the executing agent's source of truth), then mirror to CLAUDE.md (which Claude Code sessions load). In both: rewrite the Invariants section to describe the new architecture; mark superseded invariants as historical with pointers to the new tests. The two files must not disagree about an invariant when this task is done.

**Verification:** full guard suite green; two-device test protocol with Anders (phone + desktop): read on A, switch books on A, confirm B follows; background/resume cycles on mobile; deliberate offline writes on both → reconcile. Soak 1 week before Phase 4.

---

## Phase 4 — Cold-load speed (after Phase 3, which makes #1 safe)

In impact order:
1. **Local-first render:** remove the <15min restriction on the quick-return path (`App.tsx:181-215`) — render from the localStorage mirror immediately whenever it exists, writes suspended, reconcile cloud in background, shift view only if cloud differs (with the existing position-restore animation). Safe now because Phase 3's versioned writes make a stale-cache render unable to poison cloud state. Target: signed-in repeat visitor sees their page in <1s.
2. **Code-split** (`React.lazy`): BookStore, SettingsSheet, PricingModal, UsageDashboard, TierChooser, admin metrics — already on the Open Audit list. ~50-80 KB gz off the critical bundle (currently one 834 KB raw / 237 KB gz chunk, zero lazy).
3. **Per-chapter edition JSON:** build script splits `{bookId}-{edition}.json` into per-chapter files + a slim manifest (chapter titles/counts for TOC). Loader fetches current chapter + prefetches ±1. Keep whole-book files for the offline DownloadManager. This is the biggest payload win (2 MB → ~20-30 KB for an Anna Karenina chapter) but touches 395 content files' delivery path — verify the editionLoader integrity checks and SW caching still work, and audio paragraph alignment is unaffected.
4. **Fonts:** self-host the 3 actually-used families (Playfair Display, EB Garamond, IBM Plex Mono) as woff2 with `font-display: swap` + preload; drop the render-blocking Google Fonts CSS and the 2 unused families.
5. **SW app-shell precache:** extend `sw.js` (currently editions/audio only) to precache the shell with proper versioning — careful: stale-bundle serving has historically been a prod failure mode here; include the bundle hash in the cache name and verify `npm run deploy`'s verify-bundle step still catches mismatches.

---

## Phase 5 — SEO mechanical fixes (independent of Phases 1–4; can run any time after Phase 0)

From the 2026-06-10 SEO review (full strategy + data in `SEO-STRATEGY.md`). Mechanical items only — content/strategy work is tracked in SEO-STRATEGY.md, not here. Same governance: no deploy without explicit approval.

**Status 2026-06-10 (evening):** 5.1 DONE (`4ae0c2f2`, og-image approved by Anders), 5.3 DONE (`7bc77cab`, 4,894 files committed after sampling), 5.4 partially DONE (`b3841a7a`, lastmod on all 3,956 URLs; landing JSON-LD + Book schema injection still open), 5.5 partially DONE (`a43f91df`, static hub at `app/public/read/index.html` — needs one worker route line, see below). Remaining for the worker-touching agent: **5.2** (soft-404s + `/{bookId}` canonicals), **Book JSON-LD in `serveSpaWithMeta`**, **`/read` route → serve static hub** (worker.ts:2916 currently intercepts `/read` with the SPA shell; either rewrite to `/read/index.html` via ASSETS or 301 to `/read/`), **landing.html JSON-LD + ~20-book footer links** (blocked until the in-flight landing.html diff lands). 5.6 is Anders-in-browser (crawl-rate maxed 2026-06-10). **5.7 DECIDED 2026-06-10 (see DECISIONS.md): AI crawlers allowed.** Anders opened the Cloudflare edge layer; executor now updates the worker UA-403 list (`worker.ts:2522-2536` — keep junk scrapers like Bytespider blocked, allow OAI-SearchBot/ChatGPT-User/PerplexityBot/Claude-User/GPTBot/ClaudeBot/Google-Extended), mirrors robots.txt, and adds `llms.txt` (+ optional `llms-full.txt`) describing the catalog and the Tinct Editions. `/data/` and `/api/` remain blocked.

### 5.1 og:image (minutes, sitewide effect)
Every page references `https://tinct.app/og-image.png` (`worker.ts:2568`, `landing.html:63`) but the file does not exist — prod returns the SPA HTML fallback with `content-type: text/html`, so every social share renders imageless. Create a 1200×630 PNG in the Tinct visual identity (paper `#ece7db`, ink, deep-teal accent, Playfair Display wordmark) at `app/public/og-image.png`. Show Anders the image before shipping. Verify after deploy: `curl -sI https://tinct.app/og-image.png` returns `image/png`, and a Twitter card validator pass.

### 5.2 Soft-404s and `/{bookId}` duplicates (~1 hr)
- The SPA fallback (`worker.ts:2859-2867` region) returns HTTP 200 + generic shell for ANY path. For `/{bookId}` where bookId is registered: serve the shell with the book's injected meta and a canonical pointing to `/read/{bookId}` (reuse `serveSpaWithMeta`). For unrecognized paths: add `X-Robots-Tag: noindex` (keep 200 so deep-linked app states still work).
- Re-run `app/scripts/audit-seo.cjs --base=https://tinct.app` after; zero soft-404/duplicate findings.

### 5.3 Commit the SEO surface (critical operational risk)
~4,894 modified/untracked files under `app/public/read/` (static SEO pages) exist in prod builds but not fully in git — a clean-checkout deploy would delete the 3,900-page SEO surface. Review in batches, commit. The stash-build pre-deploy check only protects honestly after this lands.

### 5.4 Sitemap + structured data hygiene
- Add `<lastmod>` to every sitemap URL (`scripts/generate-sitemap.cjs`) — content-file mtime or build date.
- JSON-LD: `WebSite` + `Organization` on landing.html; `Book` on `/read/{bookId}` routes (inject in `serveSpaWithMeta`, data from `bookMetaGenerated.ts`); `BreadcrumbList` on chapter pages (breadcrumbs already render visually).
- Validate 3 sample pages with Google's Rich Results test.

### 5.5 Internal linking (the ranking unlock)
- Static crawlable library hub at `/read/` — plain HTML list of all 96 books with one-line descriptions, linking to each `/read/{bookId}/summary`.
- Footer book list (top ~20 books) on landing.html — currently the homepage links to zero books.
- "Read next" cross-book links (3 related books) on each summary page — derive relatedness from the Houses/Shelves taxonomy in `bookRegistry.ts`.

### 5.6 Bing + indexing operations (no code — Anders or agent-with-browser)
- Click the crawl-quota boost in Bing Webmaster Tools (it flags "limited crawl capacity," high severity).
- Run the existing IndexNow script over the full sitemap.
- Record GSC Pages report numbers (indexed vs discovered) in SEO-STRATEGY.md — this ratio is the health metric for the May expansion.

### 5.7 AI-crawler policy (DECISION REQUIRED from Anders — do not implement without it)
robots.txt + worker UA-blocks (`worker.ts:2522-2536`) currently 403 AI crawlers. Recommendation: allow reputable AI crawlers (GPTBot, ClaudeBot, PerplexityBot) on the static SEO pages and add `llms.txt` (Poetry Editor's pattern); keep `/data/` and `/api/` blocked. Rationale in SEO-STRATEGY.md §AI search. Reverses a deliberate decision — Anders decides.

---

## What is explicitly OUT of scope
- No pricing, tier, or onboarding changes.
- No new dependencies without escalation (streaming/SSE parsing is hand-rolled, ~40 lines, not a library).
- No edition/content regeneration.
- No switch away from Sonnet-tier for chat (Haiku degrades literary discussion quality).
- No trimming of chapter context in the chat prompt (exists to fix a documented quality bug, `useClaude.ts:62-71`).

## Suggested deploy cadence
(Each deploy below still requires Anders's explicit go-ahead — this is the proposed rhythm, not standing authorization.)
- **Day 1:** Phase 0 (model swap ships same day — hard deadline June 15).
- **Days 2-4:** Phase 1, one bug per deploy, Anders real-device check after 1.1 and 1.3.
- **Week 2:** Phase 2.
- **Week 3+:** Phase 3 after plan-mode review; Phase 4 after Phase 3 soaks.
