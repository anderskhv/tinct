# Confessions — Modern English Repair — Progress Log

**Owner:** Claude (translation content agent), session branch `claude/friendly-albattani-qgyqfi`
**Scope:** Content only. No live edition files, app code, registry, audio, or defaults touched. All candidates staged under `books/wip/confessions-repair/`.
**Started:** 2026-09-17

## Source & treatment

- Source: `original-en` = Pusey (1838) translation, public domain, correctly attributed in `bookRegistry.ts` ("Pusey (1838)", translator Edward Bouverie Pusey, year 1838).
- Treatment: genuine modernization (not light word-swap). See CLAUDE.md session instructions for the full quality standard.
- 13 books total. Structural check: paragraph counts match `original-en` exactly in every book (no missing content structurally).

## Audit finding (2026-09-17, whole-book similarity scan)

Per-paragraph `difflib` similarity between `original-en` and current `modern-en`, all 13 books:

| Book | Paragraphs | Avg similarity | Near-identical | Verdict |
|---|---|---|---|---|
| 1 | 38 | 0.354 | 4/38 | genuinely modernized |
| 2 | 18 | 0.198 | 0/18 | genuinely modernized |
| 3 | 21 | 1.000 | 21/21 | **untouched passthrough — needs repair** |
| 4 | 31 | 1.000 | 31/31 | **untouched passthrough — needs repair** |
| 5 | 25 | 1.000 | 25/25 | **untouched passthrough — needs repair** |
| 6 | 27 | 1.000 | 27/27 | **untouched passthrough — needs repair** |
| 7 | 27 | 0.163 | 0/27 | genuinely modernized |
| 8 | 31 | 1.000 | 31/31 | **untouched passthrough — needs repair** |
| 9 | 38 | 1.000 | 38/38 | **untouched passthrough — needs repair** |
| 10 | 70 | 1.000 | 70/70 | **untouched passthrough — needs repair** |
| 11 | 41 | 0.242 | 0/41 | genuinely modernized |
| 12 | 42 | 1.000 | 42/42 | **untouched passthrough — needs repair** |
| 13 | 53 | 1.000 | 53/53 | **untouched passthrough — needs repair** |

9 of 13 books (3,4,5,6,8,9,10,12,13 — 396 of 462 paragraphs) need genuine modernization. Books 1, 2, 7, 11 are sound existing prose — preserve, do not rewrite.

**Danish (`modern-da`):** not touched this session per instruction. Will need re-translation from the repaired `modern-en` once books are accepted — flagged for later, not started.

## Book-by-book status

| Book | Draft (Sonnet) | Independent review (Opus) | Corrected | Verified | Accepted |
|---|---|---|---|---|---|
| 3 | in progress | — | — | — | — |
| 4 | queued | — | — | — | — |
| 5 | queued | — | — | — | — |
| 6 | queued | — | — | — | — |
| 8 | queued | — | — | — | — |
| 9 | queued | — | — | — | — |
| 10 | queued | — | — | — | — |
| 12 | queued | — | — | — | — |
| 13 | queued | — | — | — | — |

## Frozen candidates (hashes recorded on freeze, i.e. once independent review has run against them)

(none frozen yet — Book 3 draft in progress)

## Next action

Book 3 draft in progress (Sonnet). On completion: freeze candidate, hash it, run independent Opus review in ~3-paragraph packets against locked source, then correct + re-verify.

## Models actually used

- Drafting: Claude Sonnet (via Agent tool, `model: sonnet`)
- Independent review: Claude Opus (via Agent tool, `model: opus`) — to be run per book after drafting
- No paid Anthropic API calls used (agent-conversation generation only, per instruction).
