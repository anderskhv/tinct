# Lab Switchover Review — 2026-09-04

Reviewed: `app/src/lab/` and the lab Worker routes at commit `45a4252c`, run locally
(Vite dev, Chromium at 390×844 and 1440×900). tinct.app was not reachable from the
review sandbox, so chat, voice, and audio network paths were reviewed in code, not
exercised live. `npm test` on `src/lab` + worker lab routes: 287/287 passing.

**Verdict: not ready to replace v1.** The reading chrome itself works well. The
blockers are gaps around it: Bible-only, no auth/billing, separate storage,
unmetered guest AI routes, and no routing/offline/onboarding parity.

Items marked **[seen]** were reproduced in the browser; others are traced in code.

## Blockers before the switch

1. **P0 — Anonymous visitors get paid AI chat and realtime voice.**
   `/api/lab-chat` and `/api/lab-voice-session` skip auth, quota, and billing
   (`worker/routes/chat.ts:167`, `voice.ts:35`). Only gate is a per-minute IP
   limiter that fails open on KV error (`worker.ts:87`). Client picks the guest
   route whenever there is no token (`useLabAsk.ts:360`).
2. **P0 — Position, highlights, chat live outside v1 storage.** Positions → Worker
   KV `lab-position:{userId}`; chat → KV; highlights → localStorage only. No
   `commit_user_data`, no tombstones, no sign-out wipe, `cloudDoneRef` never reset
   per user so account switches leak pins (`useLabPositionSync.ts:90-125`).
   `tinct:chat-history:lab` sits inside the v1 prefix and gets migrated into
   Supabase in the wrong shape (`labTalkHistory.ts:190`).
3. **P1 — Bible only.** `labSource.ts:6-8`, `labPrefs.ts:60`, `labListen.ts:421`,
   position key parsed from chapter title (`labPosition.ts:59-77`), Odyssey chat
   never persisted (`labTalkHistory.ts:18`), prompt wording (`labAsk.ts:130,264`).
4. **P1 — No sign-in/out, pricing, or 402 handling.** 401 → dead-end notice
   (`LabAskPane.tsx:81`, `useLabAsk.ts:371`).
5. **P1 — No library, deep links, or URL state.** `labRoute.ts` only knows
   `/lab*`; no `?chapter/edition/compare`; `seo.ts` forces noindex on `/lab*`.
6. **P1 — No offline, e-ink, onboarding, Capacitor hooks.** SW never registered
   and `sw.js` excludes `/lab*`; no e-ink CSS; `LabReadingFeed.tsx`,
   `LabBookPage.tsx`, `LabHearingStage.tsx` unmounted and reference missing copy keys.

## Bugs in what is built

| Sev | Finding | Where |
|---|---|---|
| P1 | **[seen]** Any tap/click on a word creates a persisted gold highlight; dismiss never removes it, `kept` never set | `LabApp.tsx:1525,1506`, `useLabHighlights.ts:58` |
| P1 | **[seen]** Desktop pagination unstable: 16→10 pages ~2s after load with no input; resize sometimes not repaginated (21-page narrow layout survived return to 1440px) | page metrics / `labChrome.ts` |
| P1 | Cloud resume merged against the 2-chapter boot fallback (`chapters.length < 2` gate passes), non-Genesis pins dropped, `cloudDoneRef` blocks retry; boot writer can also clobber cloud before it arrives | `useLabPositionSync.ts:118-140` |
| P1 | `notePlace('hide')` during in-flight chapter load writes previous chapter ¶0 with newest timestamp | `useLabPositionSync.ts:143-174`, `LabApp.tsx:1665-1700` |
| P1 | Failed chapter fetch falls back to Genesis 1 and the next turn saves it; `goToChapter` lacks the chapter-match guard the mount effect has | `labSource.ts:325,343`, `LabApp.tsx:1665,1698` |
| P1 | Switching to Moderne Dansk changes `chapterTitle` ("Første Mosebog 1") → treated as chapter change (page 1) and pins fork to `forste-mosebog` | `LabApp.tsx:603-615`, `labPosition.ts` |
| P1 | **[seen]** Play with audio unavailable enters "Hearing" with nothing playing, no message; `listen.start()` has no catch/cancel; chapter change mid-resolve can bind old clips | `useLabListen.ts:278-305` |
| P1 | Talk/Ask context: Realtime keeps old chapter instructions after spoken next-chapter; Ask sends `paragraphIndex: focusParagraph ?? 0`; ≥20-turn thread → leading assistant msg → 400 shown raw; failed `ask_companion` hop leaves Talk in "Thinking" | `VoiceSessionController.ts:363-385,625,919`, `LabApp.tsx:475`, `useLabAsk.ts:353`, `labCompanion.ts:296-333` |
| P1 | Phone native pagination frozen during playback, not re-applied after pause | `LabApp.tsx:712-719`, `LabNativePaginator.tsx:212` |
| P1 | Effect cleanup restores `keepPlayingChapterRef` → audio auto-starts on an unrelated chapter visit | `LabApp.tsx:1706-1722` |
| P2 | **[seen]** No keyboard page turns on desktop (v1 has Arrow/PageDown/Space); Settings/TOC lack dialog role, focus trap, Escape | `LabApp.tsx` |
| P2 | **[seen]** Taps in the gutter outside the text column do nothing (x=40 no, x=60 yes) | `LabPassage.tsx:334`, `labChrome.ts:807` |
| P2 | Highlights keyed by chapter only, not edition → KJV indexes painted on WEB/modern text | `LabApp.tsx:695` |
| P2 | Server: position body cap 16 KB ≈ full-Bible state, 413 → dirty forever silently; chat merge whole-book LWW; per-page-turn KV PUT (free tier 1k writes/day shared with rate limiter); quota check fails open; voice billed at mint + per hop + retry | `routes/labPosition.ts:16`, `labChatHistory.ts:112,560`, `chatAccess.ts:427`, `voice.ts:403` |
| P2 | Downward drag-selection ≥56px opens TOC over highlight popup | `LabApp.tsx:2097-2105` |
| P2 | Edition change races chapter nav (slower edition load lands old chapter) | `LabApp.tsx:555-573` |
| P3 | Guest chat/highlights persisted; IDB `tinct-lab` written, never read/wiped; no `online` flush for position; fixture `/lab` writes real pins; listen speed not persisted; empty stream shows nothing | various |
| P3 | Copy: "facing Butler" on Bible; title "Tinct lab"; Odyssey fallback in bundle. Desktop Settings full-viewport takeover; justified rivers on phone page 1 | `labCopy.ts`, `lab.css` |

## v1 vs lab (summary)

Has: compare/split, audio + follow, TOC, chapter search, define, night mode, fonts.
Partial: editions (Bible only), chat (KV, guest route), highlights (local, chapter-keyed),
cast (page-scoped), position sync (KV), share (text only).
Missing: library, onboarding, auth, billing, journal/feed, reading log, offline/SW,
e-ink, account settings, issue report, deep links, keyboard turns, Capacitor hooks, analytics.

## Suggested order

1. Close the spend hole (drop `allowLabGuest` or cap per-IP daily + global budget; fail closed).
2. Fix the four position bugs together: chapter identity = sequential number + canonical
   book id, never localized title; no writes while a load is pending. Add guard tests.
3. Decide storage: write through `services/storage` into `user_data` with v1 keys, or a
   KV → Supabase import plus read-through. Do this before multi-book.
4. Parameterise on `bookId` (source, editions from registry, audio URLs, flat TOC, prompt copy).
5. Auth + billing UI (reuse AuthModal, TierChooser, 402 flow).
6. Routing/infra: LabApp for `/app`, `/read`, `/read/{bookId}`, `/{bookId}`; drop noindex;
   register SW; `?chapter` etc.; update AGENTS.md verify step.
7. Quick wins any time: highlight-on-tap, keyboard turns, gutter taps, Play error path, copy.

## What is solid

Pagination model, chrome measurement, gestures, compare mapping, prefs are well tested,
including chapter-advance/retreat landing invariants. Mic/WebRTC teardown is thorough.
KV route auth is correct and user-scoped. The position controller design is coherent; the
bugs are in the seams around it.
