# Book XI — independent review, round 1

Reviewer session spawned by the coordinator; did **not** draft the candidate and
did not consult the drafter. Findings are in `findings-v1.md`.
Content only: nothing outside `book11/review/` was touched, no app code, no
merge, no deploy, and no Anthropic API call — every word here was written in
this session.

**Verdict: Accept after corrections.** 0 substantive, 8 minor (five
paragraph-level, three records), 3 optional, 31 paragraphs with no material
issue. Every paragraph XI.1–XI.39 has an entry.

## Hashes verified (all recomputed locally, all match)

| File | sha256 | Result |
|---|---|---|
| `book11/candidate-v1.json` | `d0db3918d436dfe970dd2eb6a1050cb87fdf9ff7d727dc454b5cc2b1fd821028` | matches the assignment, `provenance.json` and `README.md` |
| `meditations-original-en.staged.json` | `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` | unchanged; 487 paragraphs, 12 chapters, profile 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, **39**, 36 |
| `book11/source-book11.json` | `41ff9b0757dadcff4c9e47ffe7f268eb62e3323bbb683905a3adf1618199fef4` | matches; byte-identical to chapter 11 of the staged original |
| `source/pg15877-long-1862.txt` | `6584df7e90d6035eece30d8028527290bf2508076963ee0376cb41db9cf88d5b` | the PG base |

The mechanical-check block in `book11/README.md` was extracted and run verbatim:
printed `OK` and the three expected hashes. It passes in full, including the
bracket-arithmetic assertion (6 folds + 5 D11 drops + 0 D13 drops = 11 source
brackets), the "shall" inventory, the no-thou-form scan, the punctuation tallies
and the seven byte-identical paragraphs.

## What was checked

1. **Source verification, the strong way, and the rules audit.** See below.
2. **All 13 packets in order**, three paragraphs at a time with the
   `CONTEXT ONLY` neighbours, Long's 1862 text beside the candidate; coverage
   `B11-P001`…`B11-P039`, each exactly once, confirmed against
   `manifest.json`. Then `candidate-v1-readable.md` read straight through for
   voice, pacing, terminology and transitions.
3. **A token-level diff of every one of the 39 paragraphs**, so that no
   difference between Long and the candidate could pass unexamined. Every
   difference is accounted for by a documented decision.
4. **The 0.977 ratio, paragraph by paragraph rather than in aggregate** — each
   paragraph's ratio recomputed and each classified by whether its source
   carries apparatus.
5. **The "shall" inventory**, all eight, each against the rule as widened at
   Book IX acceptance.
6. **Every square bracket in the source**, recounted and classified against
   D11, D13 and the glossary's fold rule.
7. **Glossary stability across the book**, by scanning the candidate and the
   source for every row that Book XI touches, including the two rows fixed
   before drafting.
8. **The base-text work**: the PG slip at XI.18, the four places PG is preferred
   to Standard Ebooks, the typographic repair, the invisible slip, the two open
   variants under D6, the hyphenation normalisations and Long's broken XI.18
   ending.
9. **The five flagged decisions and the point offered for confirmation**, plus
   the two further questions the ledger puts to the reviewer (the Epictetus
   references and the seven byte-identical paragraphs).
10. **The newly found build rule** that closes up a space before `,;:.?!`.

## The no-rebuild claim and the rules audit — how they were tested

Neither script was re-run as proof. Two independent steps, in this order.

**Step 1 — my own reconstruction, written before opening the drafter's script.**
I re-extracted PG lines 6376–6816 with rules chosen independently of the build's
and of `verify_book11_source.py`'s. In particular my footnote rule keys on
**indentation depth** (drop maximal indented runs at four spaces) where the
build's keys on an `[A-D]` opener followed by blank-or-indented consumption —
a deliberately different rule, so that a shared blind spot would show up as a
disagreement. It reconstructs **39 paragraphs** and differs from the staged
Book XI in **exactly three paragraphs — XI.8, XI.15, XI.17 — each by one `+`**,
the three dagger marks `PROVENANCE.md` §4 documents. A second rule set
reproducing the staged file to the byte is the strongest form this check takes.

**Step 2 — the drafter's rules audited class by class against the raw range.**
I read `build_original_en_from_pg15877.py` to find the rule that can fail
silently: the footnote state machine consumes every following **indented or
blank** line until flush-left text resumes, so it will swallow indented verse
that follows a footnote with only blank lines between.

- **Seventeen maximal indented runs**, enumerated independently with their
  indentation profiles; my listing agrees with the drafter's line for line.
  Twelve at **four** spaces (eleven `[A-D]` openers at 6398, 6401, 6420, 6459,
  6461, 6554, 6647, 6702, 6750, 6753, 6757, plus the unmarked continuation of
  footnote [A]'s two-paragraph body at 6558–6559); **three verse runs in XI.6 at
  six spaces** (6441–6442, 6446, 6450); two verse citations at 26 and 17 (6777,
  6780).
- **The six-space verse and the four-space footnotes are separated by
  indentation *and* by flush-left text**, checked by eye in the raw file: the
  preceding footnote run ends at 6422 and is followed by the whole of XI.4, XI.5
  and the opening of XI.6 flush left; Long's connectives "And again,—" (6444),
  "And,—" (6448) and "And other things of the same kind." (6452) stand flush
  left between the three verse runs; the next footnote run opens at 6459 after a
  flush-left paragraph. **The consumption rule cannot have reached the verse,
  and both quoted lines are present in the staged file and in both
  reconstructions.**
- **The marker recount reconciles exactly**: ten `[A-D]` markers on flush-left
  lines (6388, 6395, 6416, 6437, 6549, 6645, 6700, 6734, 6742, 6746) plus **one
  at the end of the indented verse line 6442** — eleven in-text markers for
  eleven indented openers. The marker embedded in the verse is real and is
  correctly accounted for.
- **No flush-left footnote opener** (searched `^\[[A-D]\]` across the range), so
  the VII.45 class does not recur; a flush-left footnote *body* would have been
  read as ordinary text by both reconstructions and would have shown as an
  inserted paragraph or inserted words, and none did.
- **No illustration caption** (the Book IV class).
- **Only three standalone short flush-left lines**, all Long's XI.6 connectives
  — no running head, page number or catchword.
- **No Greek in the body**: every `[Greek: …]` occurrence sits on an indented
  footnote line, and the staged Book XI contains no `(Greek:` at all. The
  package's numeral is off: **seven spans on five lines**, not five spans —
  finding **C1**.
- **Three daggers**, at 6488, 6544, 6577, and they are the only diffs.
- Boundaries checked by eye: 6375 `XI.`, 6377 the opening of XI.1, 6813–6815 the
  end of XI.39, 6817 `XII.`. `git status` clean.

**Both hold. The no-rebuild finding is correct, the rules audit is sound, and no
accepted book is reopened.**

**The space-before-punctuation rule** was verified in the build source
(`re.sub(r'\s+([,;:.?!])', r'\1', t)`, applied after marker and dagger removal)
and traced across the whole translation body independently. Reproducing it in
the reconstruction and documenting it rather than rebuilding is the right call
— it changes no word, and D12's standard is not engaged because no paragraph
would change. Two corrections follow: it fires on **four** body lines, not five
(PG 4889 is inside a Book VII footnote body the build strips, and staged VII.66
has no ellipsis at all) — finding **C2**; and it should get a ledger row of its
own, proposed as **D14** — finding **C3**.

## Next steps for the drafter

Step 6 (`candidate-v2.json`), then steps 7–8. In priority order:

1. **1.1** XI.1 `differs not at all` → `does not differ at all`.
2. **18.1** XI.18 `greatly resentful` → `deeply resentful`.
3. **26.1** XI.26 restore the partitive (`one or another of the men of former
   times`, or keep Long's `some one of`); the X.36.2 ruling does not reach a
   partitive.
4. **21.1** XI.21 decide the paragraph's two subject–verb commas alike;
   removal is the X-book precedent.
5. **19.1** XI.19 fix the dangling "see the flagged decisions" in `continuity.md`
   (twice); the rendering `the superior faculty` stands.
6. **C1**, **C2**, **C3** — the two miscounts and the new ledger row.
7. Optional: **12.1**, **15.1** (I would take it), **34.1** (I would leave it).

All five flagged decisions are ruled on in `findings-v1.md`, and all five are
**upheld** — "flattering", the nine-word bracket fold (on the ground that the
bracket carries the word *first* in a nine-item enumeration, which is stronger
than the "no frame" argument the sheet gives), XI.10's D11 drop, XI.26's
"[Ephesians]" fold, and the reasoning behind XI.15's replacement for
"forthwith", where only the chosen word is queried. "Pancratium" is confirmed.
The four Epictetus references are rightly dropped. The seven byte-identical
paragraphs are each rightly identical. **D13 does not fire anywhere in Book XI**,
tested bracket by bracket.
