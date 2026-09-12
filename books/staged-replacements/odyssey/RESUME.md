# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi` (worker 3).

## State

| Book | Step reached | Accepted file | sha256 | Retention |
|---|---|---|---|---|
| 1 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `c97e20f5…4807b57c` | 0.721 |
| 2 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `dcf1e301…6f24088ac` | 0.902 |
| 3 | **8 — accepted** | `candidate-v2.json` | `7095ef4f…4989b905` | 0.897 |
| 4 | 1 done (source verified); drafting | — | — | — |

## Done

- Book 3 step 6 landed in commit `6e4eef382`: 29 findings applied, 32
  substitutions in 27 of 38 paragraphs, none declined, retention 0.895 → 0.897.
  Verified this session by re-running `scripts/build_book3_v2.py` — byte-identical
  output, clean tree.
- `book02/candidate-v3.json` was produced in the same commit (finding 27.1's
  cross-Book hyphen drift, `mixing bowls` → `mixing-bowls` at B02-P034).

- **Book 3 is closed.** Steps 7 and 8 done (`book03/flow-read.md`,
  `book03/ACCEPTANCE.md`), records findings R1–R5 applied to `GLOSSARY.md`,
  `book03/continuity.md` and `book03/README.md`, and
  `book02/changes-v2-to-v3.md` written for the successor pushed without one.
- **Both rulings are recorded.** **D14** (render the base text where the served
  original is demonstrably not it) and **D12 class C** (mark dropped, words
  stand, instances recorded) are in `00-progress-ledger.md`; class C's warrant,
  obligations and six corrected instances are in `GLOSSARY.md`. A3 now carries
  the exact repair text and before/after hashes. **Book 4 is unblocked.**
- **Book 4 step 1 done** — `scripts/verify_source_book4.py`, a fourth kind of
  rule (needle-located from the served file's own words, character-exact,
  every difference classified before anything is removed). 81 of 81 paragraphs
  byte-identical, 8,042 words word-for-word, 0 mismatches.

## Next, in order

1. **Book 4 step 2–3** — draft `scripts/candidates/book4.py` (81 paragraphs,
   one per source paragraph, in order), then
   `python3 scripts/build_book_package.py 4` to freeze v1 and build the
   packets. Book 4 is long: 8,042 source words, twice Book 3.
2. **Book 4 step 4** — push and stop. A separate reviewer session reviews it;
   this task does not review its own draft.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
