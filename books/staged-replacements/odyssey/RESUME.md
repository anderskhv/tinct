# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi` (worker 3).

## State

| Book | Step reached | Accepted file | sha256 | Retention |
|---|---|---|---|---|
| 1 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `c97e20f5…4807b57c` | 0.721 |
| 2 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `dcf1e301…6f24088ac` | 0.902 |
| 3 | **8 — accepted** | `candidate-v2.json` | `7095ef4f…4989b905` | 0.897 |
| 4 | **step 4 done — round 1 returned, accept after corrections; awaiting steps 5–8** | `candidate-v1.json` (frozen) | `9c7d54af…b912e6553` | 0.960 |

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
- **Book 4 steps 1–3 done, and the step-4 artefacts built.**
  `scripts/verify_source_book4.py` is a fourth kind of rule (needle-located
  from the served file's own words, character-exact, every difference
  classified before anything is removed): 81 of 81 paragraphs byte-identical,
  8,042 words word-for-word, 0 mismatches. `candidate-v1.json` is **frozen**
  at sha256 `9c7d54af4bc6e32fefe5d3946a08565820b76d3d3c58a9fc45ec138b912e6553`
  — 81 paragraphs, ratio 0.9999, retention **0.960**, 27 packets. The
  `GLOSSARY.md` name table gained three enumerated rows (Venus → Aphrodite,
  Juno → Hera, Vulcan → Hephaestus).

## Next, in order

1. **Book 4 steps 5–8.** Round 1 is **done** — `book04/review/findings-v1.md`,
   by a separate reviewer session: **accept after corrections**, 1 substantive,
   16 minor, 11 optional, 7 records findings, coverage complete. Apply at
   `candidate-v2.json` via a `build_book04_v2.py` in the established pattern,
   then verification, flow read, `ACCEPTANCE.md`.
   - **The substantive one is S-1, the answer to the retention question.**
     0.960 is half the source's and half the drafter's: Book 4's Butler is less
     archaic per word than Book 3's but carries the package's densest supply of
     sixty-word sentences (17 in 8,042 words), and the draft breaks **one of
     seventeen** where accepted Books 1–3 broke 100%, 43% and 33%. Nine
     paragraphs to recast (B04-P009, P021, P029, P035, P037, P040, P041, P045,
     P050), three to look at (P011, P064, P066), and **B04-P038 deliberately
     left long**. Every recast is a division of a sentence Butler already
     wrote; no new wording. Retention should barely move — do not chase 0.897.
   - All five flagged decisions **upheld**; the three name rows keep their
     rows but their recorded *warrant* is corrected (records finding R3).
   - Seven records findings R1–R7 touch `README.md`, `continuity.md`,
     `provenance.json`, `GLOSSARY.md`, `PUNCTUATION.md`, `PROVENANCE.md` and
     `RESUME.md`'s own 0.721 baseline (R2: not reproducible; the package's own
     `token_retention()` gives 0.727).
3. **Book 5** after that, in numerical order. Nothing blocks it: D12 class C
   is settled, and D14 covers the served-original defect class.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
