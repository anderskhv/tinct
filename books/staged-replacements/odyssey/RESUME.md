# RESUME — where this package stands, for the next worker

Updated continuously. Read this first, then `WORKFLOW.md`.

**Last updated:** 2026-09-12, session `session_01K5bL9oWzAagjTMExsyUADi` (worker 3).

## State

| Book | Step reached | Accepted file | sha256 | Retention |
|---|---|---|---|---|
| 1 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `c97e20f5…4807b57c` | 0.721 |
| 2 | 8 — accepted, with recorded successor `candidate-v3.json` | `candidate-v2.json` (successor v3) | v3 `dcf1e301…6f24088ac` | 0.902 |
| 3 | **8 — accepted** | `candidate-v2.json` | `7095ef4f…4989b905` | 0.897 |
| 4 | **1–3 done, frozen at v1; step-4 packets built** | `candidate-v1.json` | `9c7d54af…b912e6553` | 0.960 |

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

1. **Book 4 step 4 — the independent review.** A **separate reviewer session**,
   following `book04/review-instructions.md`; findings go under
   `book04/review/`. This task does not review its own draft. The first thing
   put to that reviewer is the **retention figure 0.960**, the package's
   highest — `book04/continuity.md` §6 states the evidence both ways and does
   not defend it.
2. **Book 4 steps 5–8** on the findings: `candidate-v2.json` via a
   `build_book04_v2.py` in the established pattern, verification, flow read,
   `ACCEPTANCE.md`.
3. **Book 5** after that, in numerical order. Nothing blocks it: D12 class C
   is settled, and D14 covers the served-original defect class.

## Hard rules

Content-only, under `books/staged-replacements/odyssey/` alone. Zero Anthropic
API spend. English only. Nothing merged, deployed, registered, and the served
`app/public/data/editions/**` is never written.
