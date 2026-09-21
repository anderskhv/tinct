# Acceptance Record — The Death of Ivan Ilyich (`ivan-ilyich`)

**Status: ACCEPTED**

**Final file:** `books/wip/green-ivan-ilyich/candidate.json`
**Final sha256:** `2132e58a400175fa679ecd5e811d66d4bd89fa9ce3b1f12270f004a62b311cbc`
**Date pinned:** 2026-09-21 (after round-3 verification and its two micro-corrections; no edits after the hash)

Source anchor: `books/wip/green-ivan-ilyich/source.json`, staged unmodified
from `app/public/data/editions/ivan-ilyich-original-en.json` — a public-domain
English translation, spelling convention "Ivan Ilych" throughout, likely
Louise and Aylmer Maude's translation (no explicit translator credit is
present in the file; identified by characteristic spelling and phrasing).
Candidate staged unmodified from
`app/public/data/editions/ivan-ilyich-modern-en.json` before any edits in
this pass.

Reviewers: drafting review/repair by Claude Sonnet 5 (round 1); independent
fidelity verification by Claude Opus (round 2); final adversarial gate by
Claude Opus (model id `claude-opus-5`, round 3, this record).

**Honest note on round 1's self-check:** the round-1 record claimed a clean
whole-book audit. That claim did not hold. Round 1's proper-noun audit was
**count-based** (does name X appear N times book-wide?) rather than
**location-based** (is every occurrence, at its own paragraph, source's exact
form?). A count-based audit cannot see a missing instance in one paragraph
offset by an extra instance in another. Rounds 2 and 3 replaced it with a
per-paragraph occurrence map. That method change is the main lesson from this
book.

## Coverage table

| Step | What | Coverage | Result |
|---|---|---|---|
| Structure check | Chapter/paragraph count vs. source | All 12 chapters, all 298 paragraphs | Sound — 1:1 match, chapter numbers aligned, no empty paragraphs |
| A. Accessibility review (blind) | candidate.json only, no source seen | All 12 chapters / 298 paragraphs, full read | `accessibility-review-1.md` — substantially accessible, 12 minor non-blocking items (untranslated French social-register phrases, a few unglossed period proper nouns) |
| B. Fidelity review (packeted) | candidate vs. source.json, packet = whole chapter with full neighboring context (chapters are 7–52 paragraphs, well inside one packet) | All 12 chapters, all 298 paragraphs, full read both sides, plus a whole-book proper-noun frequency audit | `fidelity-review-1.md` — 4 blocking defects found, all in the silent-name/spelling-correction class |
| Correction round 1 | Apply required fixes | 27 paragraphs touched across 6 chapters (ch3, ch4, ch6, ch7, ch8, ch11) | All fixes applied via `content_edit_helpers.safe_replace` (2 single-occurrence fixes) and a verified global token substitution (2 whole-chapter spelling fixes, 52 word-level instances) |
| Independent re-verification | Every fixed paragraph re-derived against source.json directly | All 27 touched paragraphs, individually | Confirmed correct — see fidelity-review-1.md verdict section and the raw diff output below |
| C. Whole-book cross-boundary re-read | Fidelity: relationships/recurring images across chapter boundaries (the "It" personification, Gerasim's role, Praskovya Fedorovna's "attitude," the appendix-bargaining thread, the black-sack image). Accessibility: fresh candidate-only skim of the fixed chapters. | Whole book, both files, non-sampled | No new defects **found by this pass** — but its name audit was count-based, and rounds 2/3 later showed a count-based audit cannot detect a per-paragraph mismatch. Superseded by the round-3 location-based sweep. |
| E. Round 2 — independent Opus fidelity verification | Re-derived round 1's 4 fixes from source; fresh location-based read for softening, glosses, imported wording | Whole book, both files | 4 round-1 fixes held; no softening found; **5 further blocking defects found and fixed** (ch1 [35], ch3 [18], ch7 [3], ch12 [7], ch12 [15]) |
| F. Round 3 — final adversarial gate (Claude Opus, `claude-opus-5`) | Re-derive all 5 round-2 fixes; location-by-location occurrence map for 30+ recurring names/terms; two book-wide capitalized-token screens; self-chosen softening/imported-wording spot checks; length screen | Whole book, both files, non-sampled on the mechanical screens | **0 blocking defects.** 2 micro-corrections applied and re-verified (ch5 [11], ch12 [7]) |
| D. Structure + hash pin | Validate final file, compute hash | Whole file | JSON valid, structure valid, hash computed on the post-fix file (not a pre-fix hash) |

## Defect counts by round

### Round 1 — Sonnet draft review + repair (4 blocking defects, all fixed)

All four were the same class: a silently "corrected" name/spelling that
diverged from source.json's actual printed text.

1. Ch6/Ch7/Ch8 — "Ilyich" written where source prints "Ilych" (52 word-level
   instances across 23 paragraphs). **Fixed.**
2. Ch4 [1] — "Ilych" written where source's own text (one internal
   inconsistency) prints "Ilyich" at that one spot. **Fixed** — source's
   literal form restored, not a "more consistent" one.
3. Ch3 [5] — "Zachar Ivanovich" written where source prints "Sachar
   Ivanovich" at that one spot. **Fixed** — same reasoning.
4. Ch11 [0] and [8] — "Praskovya Fyodorovna" written where source prints
   "Praskovya Fedorovna" throughout. **Fixed.**

### Round 2 — independent Opus verification (5 further blocking defects, all fixed)

Round 1's four fixes were re-derived from source and confirmed correct, and
no content softening was found. But the independent pass, using a
location-based sweep, caught five defects round 1's count-based "whole-book
audit" had missed:

5. **Ch1 [35]** — source prints "Praskoyva Fedorovna's nerves" (a source-side
   typo); candidate had silently normalized it to "Praskovya". Same class as
   defects 2 and 3, and the direct product of the count-based method: the
   book-wide "Praskovya" count still looked right. **Fixed** — source's
   "Praskoyva" restored.
6. **Ch7 [3]** — "Hessian apron" and "print shirt" had been changed to
   "canvas apron" and "cotton shirt," replacing specific period fabrics with
   generic ones. **Fixed.**
7. **Ch3 [18]** — an accessibility gloss assigned a gender ("the woman who had
   founded") to a figure source leaves ungendered ("the distinguished
   founder"). **Fixed.**
8. **Ch12 [7]** — an added causal explanation ("too weak to correct it") not
   present in source. **Fixed.**
9. **Ch12 [15]** — "Something rattled in his throat" had become "in his
   chest." **Fixed.**

### Round 3 — final adversarial gate, Claude Opus (this pass): 0 blocking defects, 2 micro-corrections

- **All five round-2 fixes re-derived from source independently** and confirmed
  to match source's wording and meaning at their own locations (ch1 p35
  "Praskoyva" present; ch7 p3 "Hessian apron"/"print shirt" present; ch3 p18
  ungendered "distinguished founder"; ch12 p7 no invented causal clause;
  ch12 p15 "rattled in his throat").
- **Location-based proper-noun sweep, every occurrence at every paragraph**,
  over 30+ recurring names/terms (Gerasim, Schwartz, Praskovya/Praskoyva,
  Fedorovna/Fyodorovna, Ilych/Ilyich, Peter Ivanovich, Sachar/Zachar,
  Golovin, Sokolov, Petrishchev, Shebek, Trufonova, Leshchetitsky, Melvinski,
  Jean, Lisa, Vasya, Vladimir, Fedor, Petrov, Alexeev, Dmitri, "vermiform
  appendix," "floating kidney," "Empress Marya," "vint," "Morocco"). Every
  spelling-bearing term matched source occurrence-for-occurrence and
  paragraph-for-paragraph. The only per-paragraph divergences were in
  "Ilych"/"Peter Ivanovich," and each was individually opened and confirmed to
  be an ordinary pronoun↔name substitution inside a paraphrase (e.g. ch9 [5],
  where source's "he himself lay" becomes "Ivan Ilych lay" in a sentence that
  also names Gerasim), never a spelling change or a misattribution.
- **Two book-wide mechanical screens** as a backstop against the gloss-naming
  class: (a) every capitalized token present in a candidate paragraph but
  absent from its source paragraph — no new proper noun is introduced anywhere
  in the book; (b) every source proper noun absent from its candidate
  paragraph — only two hits, both benign pronoun substitutions (ch1 [13],
  ch2 [15]).
- **Independent softening check** on self-chosen passages (ch4 [0] the
  wish-him-dead passage, ch5 [13] the "life and...death" collapse, ch6 [0] and
  [5] the It personification, ch7 [2]–[3] the commode scenes, ch8 [31],
  ch9 [5] and [14], ch10 [2], ch11 [9], ch12 [2]): rendered with full,
  unsoftened directness; no euphemism, no omission, no imported wording from
  Maude, Pevear/Volokhonsky or any other translation.
- **Length screen** across all substantial paragraphs: minimum
  candidate/source character ratio 0.85, no shrinkage pattern indicating
  dropped material.

Two micro-corrections were applied in this pass. Neither is a blocking defect
and neither is a recurrence of the round-1/round-2 pattern, but both were
tightened rather than argued away:

10. **Ch5 [11]** — source: "together they went to see his friend, the doctor."
    Candidate had resolved the pronoun to "Peter Ivanovich's friend the
    doctor." Context makes that reading near-certain and both candidate
    readings name only people already named in the same sentence, so this is
    not the ch3 [18] class (no fact, gender, or figure is supplied that source
    withholds) — but source's own pronoun is now restored rather than
    silently adjudicated.
11. **Ch12 [7]** — source: "waved his hand, knowing that He whose
    understanding mattered would understand." Candidate had "trusting," which
    weakens Ivan Ilych's certainty at the book's decisive moment. Restored to
    "knowing." The unnamed capitalized referent ("the One") is preserved
    unnamed, as in source.

Structure was re-verified after these two edits: 12 chapters, 298 paragraphs,
1:1 with source, chapter numbers and titles identical, no empty paragraphs,
JSON valid. The diff against the round-2 file is exactly the two paragraphs
above.

**Three-round rule:** not triggered. The rule parks a book when correction
rounds keep leaving *unresolved blockers*. Round 3 found no blocking defect and
no recurrence of the silent-correction or gloss-naming classes; the two items
above were resolved in place and re-verified.

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

5. **Source's own typos/inconsistencies reproduced exactly** — "Praskoyva
   Fedorovna" (ch1 [35]), "Ivan Ilyich" (ch4 [1]), "Sachar Ivanovich"
   (ch3 [5]). Reason: fidelity here is to this locked public-domain edition,
   not to a normalized ideal of it. More practically for the reader: these
   sit inside paragraphs where nothing depends on the spelling, the referent
   is unmistakable from context in every case, and "correcting" them is
   precisely the habit that produced the round-1 and round-2 defects. A
   reader loses nothing; the text gains a guarantee that no name has been
   quietly edited anywhere.
6. **Pronoun↔name substitution inside paraphrase** (e.g. ch9 [5], where
   source's "he himself lay" becomes "Ivan Ilych lay"). Reason: modern
   English prose disambiguates a two-man scene by naming; source's own
   nearby sentences name the same man. This never supplies an identity the
   passage leaves open — where source genuinely leaves an antecedent
   unadjudicated (ch5 [11], "his friend, the doctor"), the pronoun is kept.

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
# structure: 12 chapters, 298 paragraphs, 1:1 locked to source, titles identical
# location-based sweep: every occurrence of 30+ recurring names/terms compared
#   per-paragraph against source (not by total count)
# post-fix spelling state: Ilyich=1 (source's single stray, ch4 [1]),
#   Fyodorovna=0, Sachar=1 (source's single stray, ch3 [5]),
#   Praskoyva=1 (source's own typo, ch1 [35]), Hessian apron=1, print shirt=1
sha256sum candidate.json
# 2132e58a400175fa679ecd5e811d66d4bd89fa9ce3b1f12270f004a62b311cbc
```
