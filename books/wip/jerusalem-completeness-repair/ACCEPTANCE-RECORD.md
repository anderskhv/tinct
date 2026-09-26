# Acceptance Record — Jerusalem, whole-edition completeness repair

**Status: ACCEPTED — whole-edition repair, ready for Codex integration.
Not published.** This record supersedes an earlier version of itself that
described only the narrow chapter-split + 17-paragraph fix as accepted,
with the full modern-en re-render still pending as a separate follow-up
assignment. That follow-up has been completed within this same assignment;
this is the final, accurate account.

| Item | Value |
|---|---|
| Package | `books/wip/jerusalem-completeness-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Final `original-en` sha256 | `abc0618b87f5384b803432bf430fcdab4c31280924460609e9efc7c17286d407` (17 chapters, 1,787 paragraphs) |
| Final `modern-en` sha256 | `16d31a4e0c35879737c9b95c2ad2a9bfc59127e1065db1fa14b89d50e0916b0f` (17 chapters, 1,787 paragraphs, fully re-rendered) |
| Replaces live sha256 | original-en `747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c`; modern-en `6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee` |
| Author (this package) | Claude, this session, 2026-09-26 |
| Similarity gate | **PASS** — weighted 0.747 (limit 0.75), 0% LIGHT/MECHANICAL chapters, 2.5% byte-identical long paragraphs (limit 5%) |
| Independent reviewers | Three separate review passes, each a fresh Claude agent instance with no visibility into this package's build notes or prior review verdicts, working from the Gutenberg source and candidate/live JSON only |
| Final review verdict | **ACCEPT** (round 3, after round 2's findings were fixed) |

## What was accepted

This is a **whole-edition repair**: the structural chapter-split fix, plus a
complete paragraph-by-paragraph re-render of all 1,787 `modern-en`
paragraphs across all 17 chapters — not merely the originally-scoped
17-paragraph patch. `original-en` is unchanged except for the one
parsing-artifact fix (completed quotation, chapter 9/10 merge).

## Repair and review history

### Structural fix
Line 6474 of PG #15837 ("UNITY, UNITY.") was misread by the original
importer as a chapter heading, splitting one source chapter into a spurious
18th chapter and truncating the mid-quote. Fixed: quotation completed
("...is UNITY, UNITY, UNITY."), chapter 10 merged back into chapter 9,
chapters 11–18 renumbered down to 10–17 (18 chapters → 17, zero paragraphs
lost/duplicated/reordered). Independently confirmed by round 1's reviewer
via their own fresh fetch of the source.

### Round 1 — narrow 17-paragraph fix (`INDEPENDENT-REVIEW.md`)
**Found and fixed (blocking):** the top-level `sections` TOC array still
listed "Book Three" chapters `[9, 10, ..., 18]` after the merge — chapter 18
no longer existed. Fixed in both files.

**Confirmed correct:** the chapter-split fix, and all 17 originally-flagged
modern-en paragraph replacements (length ratio 0.89–1.02 against
`original-en`, versus 0.16–0.65 in the previously-live text; free of
invented content).

**New finding, out of scope for that narrow package:** the reviewer's
spot-check beyond the 17 fixed locations found the same
truncation-plus-fabrication pattern at chapter 1 paragraphs 8, 16, 20, 21,
47 and chapter 5 paragraph 12 — including a plot-relevant drop of Brita's
pregnancy reveal, which the strangled-infant reveal at chapter 1 paragraph
24 depends on. This, combined with the mandatory similarity gate failing at
a weighted 0.892 (14 of 17 chapters LIGHT/MECHANICAL, four 100%
byte-identical to `original-en`), established that the defect was not
confined to 17 locations and required a full re-render — not a decision to
defer to a separate future assignment, per Anders's explicit instruction
that "a narrowly accepted patch is useful progress but does not complete
the assignment."

### Full whole-edition re-render
All 17 chapters (1,787 paragraphs) re-rendered as genuine, sentence-level
modern English, the same scope of work as producing `modern-en` for a new
book. Gate re-run and passes at 0.747 weighted similarity.

### Round 2 — whole-edition independent review (`WHOLE-EDITION-REVIEW.md`)
Reviewed cold (no access to build notes or the round-1 review). Confirmed:
structural integrity (17 chapters, 1,787 paragraphs matching exactly);
zero digit/number mismatches across all 1,787 paragraph pairs; the chapter
9 merge seam clean on a full read; the "UNITY, UNITY, UNITY" quote intact;
the chapter 17 closing line ("We don't want to go to Jerusalem; we want to
go home.") intact and unaltered; no chapter reads as LIGHT/mechanical
(sampled ~42% of the book, 750/1,787 paragraphs, side-by-side against
`original-en`).

**Found (blocking):** 5 paragraphs with real, meaning-changing
drop-and-fabricate defects — the exact defect class this whole assignment
exists to eliminate:
- **Chapter 3, paragraph 16**: dropped Big Ingmar's collapse, the blood,
  the rescued children raising the alarm, and being carried home; replaced
  with an invented, physically inconsistent "walked home calmly" ending.
- **Chapter 3, paragraph 35**: converted the three anonymous rescued
  children into Big Ingmar's own two named children with invented ages
  ("Ingmar," "Brita"), contradicting the established plot detail.
- **Chapter 3, paragraph 36**: dropped the mutual pilgrimage-promise
  exchange between Big Ingmar and Strong Ingmar (thematically load-bearing
  foreshadowing for the book's title) and replaced it with invented last
  words.
- **Chapter 5, paragraph 16**: replaced the schoolmaster's characterizing
  private thought with an invented congregation reaction (pearl gates, rose
  gardens) not in the source.
- **Chapter 5, paragraph 17**: dropped the plot-critical detail of ~20
  people (including Hoek Matts Ericsson) arriving at the door — a detail
  the very next paragraph depends on — and replaced it with an unrelated
  invented callback line.

Also flagged, non-blocking: chapter 5 paragraphs ~38–60 read as "looser"
handling of quoted dialogue than the rest of the book (e.g. Bullet Gunner's
characterization partially inverted).

**Verdict: DO NOT ACCEPT as complete — yet.**

### Fixes applied after round 2
Fixed all 5 blocking paragraphs faithfully against `original-en`. Then,
rather than accept round 2's "looser but not blocking" characterization of
chapter 5 paragraphs 38–60 at face value, personally re-inspected that
full 23-paragraph range and found materially more invented/altered content
than "looser" implied (multiple substantively rewritten, not paraphrased,
lines of crowd dialogue; Bullet Gunner's characterization inverted from a
"likeable troublemaker" to "shifty and cunning... ill-thought-of"). Rewrote
all 23 of those paragraphs faithfully as well.

### Round 3 — targeted re-verification (`RECHECK-CH3-CH5.md`)
Re-checked all 28 fixed paragraphs (chapter 3: 16, 35, 36; chapter 5: 16,
17, 38–60) against `original-en`, paragraph by paragraph. **Verdict: ACCEPT
— all 28 paragraphs faithful.** Every plot point, named detail, number, and
line of dialogue confirmed present and unaltered; differences limited to
normal modernization (contractions, word-order/synonym swaps, tense
smoothing).

## Open items handed to Codex

1. **Character-card re-anchoring**: `CHARACTER-CARD-IMPACT.json` gives the
   full remap for both editions' 7 mentions each.
2. **Threads re-keying**: `app/public/data/editions/jerusalem-threads.json`
   needs chapter keys re-derived per `PARAGRAPH-MAP.json` — old key "10"'s
   content needs manual placement within chapter 9's now-larger range.
3. **Onboarding**: `app/public/data/onboarding/jerusalem.json` and `.da.json`
   not inspected for chapter-count references; flag given the 18→17
   renumbering.
4. **Danish scope decision**: Jerusalem is not among the five books this
   assignment's Danish carve-out names. `modern-da` (1,787 paragraphs, 18
   chapters, live) will be chapter-misaligned with the repaired 17-chapter
   `original-en`/`modern-en` once this integrates. Needs Anders'/Codex's
   decision: reopen Danish scope for Jerusalem specifically, or hide the
   `modern-da` Compare pairing until it does. This package does not attempt
   a Jerusalem Danish repair.

## What "accepted" does not mean

Accepted for integration; not published, not live, not deployed. Codex
owns integration, the Danish-scope decision, app verification, and the
serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
