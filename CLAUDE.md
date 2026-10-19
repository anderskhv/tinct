# Tinct — Claude instructions

Read `AGENTS.md` first: it holds current state, the deploy flow, privacy rules, reader invariants and public URLs. This file adds only what Claude must not miss.

## Book tasks

- Requests to add, onboard, prepare, translate, modernize or repair a book follow [books/BOOK-TASK-WORKFLOW.md](books/BOOK-TASK-WORKFLOW.md), even from the repo root. Read it and its strategy references before editing.
- A book request is not authorisation to change code, integrate, merge to main or deploy. Code and release work needs an explicit assignment from Anders.
- Since 8 Oct 2026 Claude owns integration and publication too (Codex retired), as a separate assigned step.
- Acclaim quotes must be verifiable in a primary source; no literary folklore.

## Language

English is the strategy. Danish is optional, not a launch, QA or marketing requirement ([STRATEGY.md](STRATEGY.md#language-scope)). Keep future localization easy.

## Hard bans

- **Zero Anthropic API spend in development.** Generate content in the conversation and write it to files. The API key is for the production reader chat only.
- Never run `generate-editions.cjs`.
- Never run raw `wrangler`; use the npm scripts.

## Deploy

Deploy-after-verify (until Tinct has more than 10 users): build, verify-bundle, merge to `main`, and let the GitHub Actions deploy workflow release it. Do not ask first unless Anders said local-only. Details and the completion checklist are in `AGENTS.md`.

## Data and privacy

- Anders's own account data (reading time, profile, stats) may be read at any time as ground truth. Other readers' data needs his approval per `AGENTS.md`. Nothing of his goes into the repo.
- Keep `app/public/privacy.html` true: changes to what personal data is collected, where it goes, how long it is kept or who sees it follow the Privacy section of `AGENTS.md`. Book, reader and layout work needs no privacy check.

## SQL for Anders

When Anders must run SQL, give him in one message:
1. the editor link: https://supabase.com/dashboard/project/yazjyiqsxjystvpkyouk/sql/new
2. the complete SQL in one copy-paste block (not a file path);
3. one line: what it does, whether it changes data, whether it is safe to run twice.

Check it against the latest migration on main first. Read-only queries touch only his own rows.

## Browser cache advice

Never recommend `Cmd+Shift+R`. Suggest, in order: a private/incognito window; in Chrome with DevTools open, right-click reload, "Empty Cache and Hard Reload"; in Safari, Develop, Empty Caches. For embedded iframes, only a private window is reliable.

## Working rules

- **Verification means running it.** A passing build is not done; exercise the change and confirm it with your own eyes.
- **Never lose reading position.** Every view, edition, language, font or layout change must keep the reader's place.
- **Bug fixes:** trace the real data flow and reproduce before patching; grep for every reference to a removed or renamed symbol. Two failed attempts means stop, instrument, and tell Anders honestly. No third guess.

## Reading-position invariants

The legacy `App.tsx` reader was deleted on 2026-09-30; the live reader is `src/lab/` at `/reader`. The invariants in `AGENTS.md` (Reader And Position Invariants) apply to `src/lab/labPosition*`, `labPositionStore` and the sync code. Each guards a real past bug (cross-book position bleed, writes behind overlays, chapter regressions). If a rule looks redundant, run `npm test` from `app/` before touching it; never change a test to match new behaviour.

## Ask Anders first

Deleting books or features; changing the reading UX paradigm (split pane, chat placement); database schema changes; spending money; new external dependencies; pricing or content strategy. UI-heavy features: show a faithful mockup before building.

## Design preferences

Rules live in `docs/design-system.md`. The ones Anders cares about most:
- Playfair Display for page and dialog titles, EB Garamond for book text and titles, system UI for all chrome. At most two families per screen.
- Never mono (figures use tabular-nums). Sentence case: no all-caps buttons or labels.
- No filler text: every line names, instructs or informs a decision.

## Product policies

- Reading angle is free for everyone and always skippable.
- Signed-in users never see the landing page (`app/public/landing.html` redirects before render). A regression is P0.
- Supabase email confirmation is off: sign-up lands straight in the reader.
- Every book and edition is visually QA'd page by page before shipping.

## Decisions

Log decisions in `DECISIONS.md` when they are made (`| Date | Decision | Category | Escalated? | Reasoning |`), including ones made alone (`Escalated? No`). After a correction from Anders, log the pattern there.
