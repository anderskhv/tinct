# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi` (worker 3).

## State

| Book | Step reached | Accepted file | sha256 | Retention |
|---|---|---|---|---|
| 1 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `c97e20f5…4807b57c` | 0.721 |
| 2 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `dcf1e301…6f24088ac` | 0.902 |
| 3 | 6 done; 7–8 in progress this session | `candidate-v2.json` | `7095ef4f…4989b905` | 0.897 |
| 4 | not started | — | — | — |

## Done

- Book 3 step 6 landed in commit `6e4eef382`: 29 findings applied, 32
  substitutions in 27 of 38 paragraphs, none declined, retention 0.895 → 0.897.
  Verified this session by re-running `scripts/build_book3_v2.py` — byte-identical
  output, clean tree.
- `book02/candidate-v3.json` was produced in the same commit (finding 27.1's
  cross-Book hyphen drift, `mixing bowls` → `mixing-bowls` at B02-P034).

## Next, in order

1. **Book 3 step 7** — whole-Book flow read → `book03/flow-read.md`.
2. **Records findings R1–R5** — correct `GLOSSARY.md`, `book03/continuity.md`,
   `book03/README.md`'s guard block. (R5's guard already lives in
   `scripts/build_book3_v2.py`; the README block still exempts `sceptr`.)
3. **Book 3 step 8** — `book03/ACCEPTANCE.md`.
4. **D14 and the D12 class-C ruling** into `00-progress-ledger.md` and
   `GLOSSARY.md`. Class C settled ⇒ **Book 4 is unblocked**.
5. **Book 4 steps 1–3(+4 artefacts)** — verify source by an independent rule,
   draft, freeze, packets.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
