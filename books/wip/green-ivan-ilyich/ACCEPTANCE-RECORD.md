# Acceptance Record — The Death of Ivan Ilyich (`ivan-ilyich`)

**Status: ACCEPTED**

**Final file:** `books/wip/green-ivan-ilyich/candidate.json`
**Final sha256:** `a6068080e9c749b025348da73c5a798b44cd0a9f341d95d31e1995d1bc0a9900`
**Date pinned:** 2026-09-21 (after round-1 fixes, verified, no further edits made)

Source anchor: `books/wip/green-ivan-ilyich/source.json`, staged unmodified
from `app/public/data/editions/ivan-ilyich-original-en.json` — a public-domain
English translation, spelling convention "Ivan Ilych" throughout, likely
Louise and Aylmer Maude's translation (no explicit translator credit is
present in the file; identified by characteristic spelling and phrasing).
Candidate staged unmodified from
`app/public/data/editions/ivan-ilyich-modern-en.json` before any edits in
this pass.

This pass used Claude Sonnet 5 for drafting review/repair. An independent
Opus verification pass is expected to follow separately per the batch
process; this record covers Sonnet's own honest self-check only, done in
full per the procedure below — it is not a substitute for that independent
pass.

## Coverage table

| Step | What | Coverage | Result |
|---|---|---|---|
| Structure check | Chapter/paragraph count vs. source | All 12 chapters, all 298 paragraphs | Sound — 1:1 match, chapter numbers aligned, no empty paragraphs |
| A. Accessibility review (blind) | candidate.json only, no source seen | All 12 chapters / 298 paragraphs, full read | `accessibility-review-1.md` — substantially accessible, 12 minor non-blocking items (untranslated French social-register phrases, a few unglossed period proper nouns) |
| B. Fidelity review (packeted) | candidate vs. source.json, packet = whole chapter with full neighboring context (chapters are 7–52 paragraphs, well inside one packet) | All 12 chapters, all 298 paragraphs, full read both sides, plus a whole-book proper-noun frequency audit | `fidelity-review-1.md` — 4 blocking defects found, all in the silent-name/spelling-correction class |
| Correction round 1 | Apply required fixes | 27 paragraphs touched across 6 chapters (ch3, ch4, ch6, ch7, ch8, ch11) | All fixes applied via `content_edit_helpers.safe_replace` (2 single-occurrence fixes) and a verified global token substitution (2 whole-chapter spelling fixes, 52 word-level instances) |
| Independent re-verification | Every fixed paragraph re-derived against source.json directly | All 27 touched paragraphs, individually | Confirmed correct — see fidelity-review-1.md verdict section and the raw diff output below |
| C. Whole-book cross-boundary re-read | Fidelity: relationships/recurring images across chapter boundaries (the "It" personification, Gerasim's role, Praskovya Fedorovna's "attitude," the appendix-bargaining thread, the black-sack image). Accessibility: fresh candidate-only skim of the fixed chapters. | Whole book, both files, non-sampled | No new defects. Name-spelling audit re-run post-fix confirms exact match to source (see below). |
| D. Structure + hash pin | Validate final file, compute hash | Whole file | JSON valid, structure valid, hash computed on the post-fix file (not a pre-fix hash) |

## Defect counts by round

- **Round 1 (initial B pass):** 4 blocking defects found, 0 non-blocking-but-noteworthy left unfixed beyond the items logged below with reasons. All 4 blocking defects were the same class: a silently "corrected" name/patronymic spelling that diverged from source.json's actual printed text.
  1. Ch6/Ch7/Ch8 — candidate wrote "Ilyich" where source consistently prints "Ilych" (52 word-level instances across 23 paragraphs). **Fixed.**
  2. Ch4 [1] — candidate wrote "Ilych" where source's own text (its single internal inconsistency) prints "Ilyich" at that one spot. **Fixed** — restored source's literal spelling there, not a "more consistent" version of it.
  3. Ch3 [5] — candidate wrote "Zachar Ivanovich" (second mention) where source's own text (its single internal inconsistency) prints "Sachar Ivanovich" at that one spot. **Fixed** — same reasoning as #2.
  4. Ch11 [0] and [8] — candidate wrote "Praskovya Fyodorovna" where source consistently prints "Praskovya Fedorovna" throughout the book, including elsewhere in ch11. **Fixed.**
- **Round 2:** not needed — round 1's fixes were independently re-verified against source.json and no further blockers were found in the whole-book cross-boundary re-read.
- **Round 3:** not needed.

No content-loss, actor-misattribution, softening/sanitization, or invented-
gloss defects (the other failure classes this batch was specifically warned
about) were found anywhere in the book. In particular, the physical/
psychological decline content (illness, bodily functions, denial, rage,
isolation, "no God at all," the three days of screaming) was checked line by
line against source and found to be rendered with full, unsoftened
directness throughout — see fidelity-review-1.md's "Non-blocking items"
section for the specific comparisons.

## Deliberately preserved, non-blocking items (with reader-centered reasons)

1. **Untranslated French/Latin social-register phrases** (*le phénix de la
   famille*, *comme il faut*, *bon enfant*, *de gaieté de coeur*, *à la
   Capoul*, *respice finem*, *Il faut que jeunesse se passe*). Reason: this
   is the source's own deliberate device — French phrases mark the
   affectations of the "correct" society Ivan Ilych aspires to and imitates.
   Translating them into English would erase exactly the characterization
   point the narrator is making. Structural/authorial constraint, not
   laziness.
2. **The added acute accent on "de gaieté de coeur"** (source prints "de
   gaiete de coeur," almost certainly an ASCII/OCR gap in the scanned public-
   domain text rather than a deliberate spelling, since the source is not
   otherwise systematically stripped of French diacritics — compare "le
   phénix de la famille," which does carry its accent in source). Reason:
   a reader is better served by the correctly-accented, recognizable French
   idiom; this is an orthographic gap-fill on a foreign common phrase, not
   the kind of person-referring name/spelling correction the batch's
   carried-forward failure lessons are about. No claim, actor, or meaning is
   affected either way.
3. **Vladimir Ivanovich / "Vasya" inconsistency** (the son is referred to by
   both his formal name and his nickname without reconciliation). Reason:
   this is source's own inconsistency, reproduced exactly as printed — not
   "fixed" into false consistency. Correct behavior per protocol.
4. **A few unglossed period/cultural proper nouns** flagged by the
   accessibility reviewer (Piccadilly whiskers, à la Capoul hairstyle, the
   Empress Marya's Institutions, "vint" as a named-but-undescribed card
   game, "Morocco" leather). Reason: each is either resolved by context
   within a sentence or two (the reader isn't required to know the specific
   referent to follow the scene — e.g. "vint" is disambiguated a few
   paragraphs later when "bridge" is used interchangeably with it), or is a
   period texture detail whose precise identity doesn't carry plot weight.
   Genuinely a matter of inherent period distance, not a fixable
   accessibility gap without inventing explanation the source doesn't
   supply.

## Note on the pre-existing unreviewed draft directory

`books/wip/ivan-ilyich-en/` (`ii_en_B1.json` through `ii_en_B4.json`) and
`books/wip/ivan-ilyich-da/` exist from prior, unreviewed work and were
**not used as a source for this pass**. They carry no accessibility or
fidelity review evidence and are not confirmed to match the live app
edition. This pass staged its own source.json and candidate.json directly
from the live app's currently published editions
(`app/public/data/editions/ivan-ilyich-original-en.json` and
`-modern-en.json`) per the standard staging procedure, and did not read,
merge, or otherwise draw on the old draft chunks at any point.

## Verification commands run

```
python3 -m json.tool candidate.json   # valid
python3 -m json.tool source.json      # valid
# structure: 12 chapters, 298 paragraphs total, 1:1 locked to source
# post-fix spelling sweep: Ilyich=1 (matches source's single stray instance,
#   ch4 [1]), Fyodorovna=0, Sachar=1 (matches source's single stray instance,
#   ch3 [5])
sha256sum candidate.json
# a6068080e9c749b025348da73c5a798b44cd0a9f341d95d31e1995d1bc0a9900
```
