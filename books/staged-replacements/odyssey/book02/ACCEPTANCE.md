# The Odyssey, Book 2 — acceptance record

**Accepted 2026-09-12 at `candidate-v2.json`**, under `../WORKFLOW.md` step 8:
*accept only when no substantive issue remains.*

| | |
|---|---|
| Accepted file | **`candidate-v2.json`** |
| sha256 | **`71816de3e761932c43a5bc3d5699e5dd2cb8811d0024b1048ca17e76b3445126`** |
| Readable copy | `candidate-v2-readable.md` |
| Source | `source-book2.json`, sha256 `3cc4f38c171e0e1d72ad741e75c745b31c7f330dfb3ed79910832ae4d04714c7` — byte-identical to chapter 2 of `app/public/data/editions/odyssey-original-en.json`, sha256 `da03f6ac9dfd5a19b9912adabfb9b0b48ed66bd85d8e1507a6b323a374822f07` |
| PG base text | `../source-texts/pg1727-butler-1900.txt`, sha256 `ffbdb29c3dda284b65c11243db1a98167826a70c81bca2ed4b6232f86c905fb9` (Project Gutenberg #1727, Samuel Butler, 1900) |
| Frozen predecessor | `candidate-v1.json`, sha256 `2b5a0280719312bbabb214f0bcbf400cde62541ab7e9c892ce2c2b65bb4273ea` — **not edited**, with `candidate-v1-readable.md` and the twelve review packets (**D10**) |
| Review rounds applied | **1** |
| Second round | **Not run, and not required**: round 1 returned zero substantive findings, and every paragraph-level finding it did raise was applied. No finding was declined. |
| Paragraphs | 35, one-to-one with the source, in order |
| Word ratio | **1.0002** (4,185 / 4,184); v1 was 0.9993 |
| Butler token retention | **0.902**; v1 was 0.889, accepted Book 1 is 0.727 (corrected at R2, Book 4 round 1; quoted here as 0.721 until 2026-09-12) |
| Built by | `../scripts/build_book02_v2.py` |

## Step 1 — the source, verified twice and independently

**By this package**, `../scripts/verify_source_book2.py`: Book 2 reconstructed
from raw PG #1727 by a rule devised for this Book and audited against the raw
lines before it was trusted, then diffed against the staged original — **35 of
35 paragraphs byte-identical, zero diffs, 4,184 words compared word-for-word**,
with two negative controls proving the check can fail.

**By the round-1 reviewer, on a different kind of rule**, which is what makes
it independent rather than a re-run: it identifies nothing in advance, anchors
structurally on `BOOK II` / `BOOK III` rather than on digits or on
`FOOTNOTES:`, rebuilds Book 2 **with PG's apparatus still in it**, and then
*derives* every difference by character-level diff, requiring each one to be
classified before anything is removed. Result: **7 differences in 5 paragraphs,
every one a pure deletion of a bare footnote-marker digit run, and nothing else
of any kind**; after removing exactly those, 35 of 35 byte-identical.

Both runs confirm the two traps this package had recorded: **`FOOTNOTES:`
occurs twice** in PG #1727 — line 75 inside the table of contents (indented)
and line 10843, the real section — so anchoring on the first makes the body
empty and any marker relation vacuously true; and Book 2's markers are never
preceded by a space, so the drafter's whitespace clause is a no-op here.

**The reviewer's method establishes one thing the drafter's cannot**, and this
is now the package's preferred approach: because it derives the differences
instead of stripping a class, it also proves the absence of everything nobody
thought to look for — a dropped word, a normalized quotation mark, a line
joined with a space, a silently repaired `[do not]` would all have appeared in
the opcode list as a non-digit difference. None did.

## Step 4–5 — the review

Independent reviewer session spawned by the coordinator; did not draft the
candidate and did not consult the drafter. `review/findings-v1.md`. Twelve
packets read in order with their `CONTEXT ONLY` neighbours, then the candidate
read straight through. **Coverage complete**: every ID `B02-P001`…`B02-P035`
carries exactly one entry — a numbered finding or "No material issue found".

**Verdict: Accept after corrections.**

| Severity | Count | Applied |
|---|---|---|
| substantive | **0** | — |
| minor | 16 (14 paragraph-level + 2 records) | **16** |
| optional | 11 by the reviewer's table; **10 enumerated** (8 paragraph-level + 2 records) | **all of them** |
| no material issue | 19 paragraphs | — |

**Nothing was declined.** The count discrepancy on optional findings is the
reviewer's summary table against its own numbered entries; every numbered
optional finding in the file is applied and listed in `changes-v1-to-v2.md`,
which records the discrepancy rather than quietly reconciling it.

The reviewer also ran the README's mechanical-check block **verbatim** and five
checks of its own: per-paragraph word ratios for all 35; a capitalized-token
census source against candidate (no name silently substituted, dropped, added
or mis-mapped); the possessive and case hazards checked **for vacuity** rather
than assumed (Book 2 contains no `Ulysses’` possessive and no `Same`, so
glossary hazards 3 and 4 do not fire here at all and the build's silence on
them means nothing); a quantity and negation census paragraph by paragraph; and
a full word-level opcode diff of all 35 paragraphs, read in full.

## Step 6 — corrections applied

**23 substitutions in 15 paragraphs** — B02-P001, P002, P004, P006, P007, P009,
P010, P011, P013, P015, P020, P023, P026, P031, P034. Every one is listed
against its finding in `changes-v1-to-v2.md`, including a recorded reason for
each of the eight optional findings (decision **D11**: a finding is answered
either way, never carried forward as a preference).

**Nineteen of the twenty-three put a word of Butler's back** — `comely`,
`comeliness`, `noble`, `aggrieved`, `sacrificing`, `sailing`, his causal `for`,
`many`, `set upon`, `myself`, `infinite`, `rose`, `may expect`, and the removal
of a supplied `my` and a supplied `down`. Word ratio and retention both rose,
in the same direction, which is the shape a correction round should have.

### Three things this round settled beyond Book 2's own text

1. **Finding 11.1 reaches accepted Book 1.** The marriage-gifts formula moves
   Butler's claim from custom to desert, and at B02-P011 it is **Eurymachus**
   who speaks it mid-threat. Applied in both Books at once: here, and as
   `../book01/candidate-v3.json` (sha256
   `c97e20f5b929d0e02b4cd1a3cd0ce8dceec86f71c935371360ab3bd14807b57c`), a
   **recorded successor** to accepted Book 1 with its own change list, leaving
   Book 1's `candidate-v2.json` and `ACCEPTANCE.md` byte-unchanged.
2. **Decision D12 — Butler's square brackets, written by class.** The Book 2
   disposition of `[do not]` stands and its recorded *reason* was wrong:
   Butler's footnote 18 says he supplied the words himself, so it is a
   translator's supplement and not a textual mark, which makes keeping them his
   judgement rather than ours. All fifteen brackets in the translation body are
   enumerated in `../GLOSSARY.md` in three classes. **Class C is open and
   blocks Book 4.**
3. **Decision D13 — `Mycene`.** Split by referent: the woman keeps Butler's
   spelling, the city (Book 3, Book 21) becomes `Mycenae` under **D8**. Settled
   before Book 3 is drafted, per `../WORKFLOW.md` step 2.

## Step 7 — the continuous flow read

The corrected Book was read straight through for voice, pacing, repetition,
terminology and transitions. **No further change was made.** Three things were
checked because the corrections touched them: `rose` is now one verb in one
Book (B02-P001 and B02-P004, matching Butler both times); `whereon` is rendered
two ways and the difference is principled rather than residual (`and then` for
immediate sequence at B02-P009 and B02-P034, `and after that` at B02-P007,
which covers three years) and is written into `continuity.md` so a later Book
does not flatten it; and the two `plainly and in all honesty` tags are still
identical and now carry Butler's sequential `then` rather than an announced
comparison.

## Step 8 — what remains open

Nothing blocks acceptance. Recorded for later Books:

- **Class-C brackets are undecided and block Book 4** (D12). Books 1–3 contain
  none.
- **The archaism assert-list is a regression guard, not a check** (records
  finding R3). It cannot catch a dead word respelled — `whereupon` walked
  through it — and nothing in this package should be read as claiming it can.
- **The retention measure replaces the two weak counter-checks** Book 2's v1
  offered against its near-1.0 word ratio. Both were satisfiable by a rewrite
  that changed one word per paragraph. Later Books record retention.
- **Book 10's disposition** still needs a coordinator decision (ledger A2),
  unchanged by this round.
- Two Butler spellings stand flagged and unflattened, on opposite sides of the
  same rule: `Ilius` beside his own `Troy` (no Cast display name, so D8 is
  silent, and the two answer to Homer's two names), and `Mycene` the woman
  beside `Mycenae` the city (D13).

## Reproduction

```bash
cd books/staged-replacements/odyssey
python3 scripts/build_book_package.py 2      # the frozen v1 artefacts
python3 scripts/build_book02_v2.py           # v2 from v1
python3 scripts/verify_source_book2.py       # the independent source check
```

The README's mechanical-check block was re-run verbatim after acceptance and
printed:

```
OK — 35 paragraphs, coverage exact, packets verbatim, names and hazards held, ratio 1.0002
OK — accepted at v2: 15 paragraphs differ from v1, Butler token retention 0.902
```

Nothing in this package is merged, registered or deployed.
