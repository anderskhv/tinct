# Accessibility Review 1 — The Oresteia (`oresteia`, modern-en)

**Reviewer:** Claude Sonnet 5 (`claude-sonnet-5`)
**Scope:** `candidate.json` only, read as a standalone text (this review was
done candidate-only, before the source-comparison fidelity pass, per the
protocol's ordering — though in this single-session pipeline the same
session performed steps A and B in sequence rather than as two independent
reviewers; see the methodology note below).

## What was read

The full candidate text, all 26 chapters, all 771 paragraphs, rendered to
`candidate_readable.txt` and read start to finish in four sequential passes
covering lines 1–1568 of that file (Agamemnon in full, The Libation Bearers
in full, The Eumenides in full). Not sampled.

## Methodology

Because this book is a translated verse text being rendered as modern prose
(not an English-original novel), the accessibility bar applied was: would a
reader unfamiliar with 19th-century verse-translation diction understand
every sentence without external help, and does elevated/ritual register
(choric odes, invocations, oracular speech) read as intentionally formal
rather than as leftover archaism the drafter missed?

Two techniques were used, in addition to continuous reading:

1. **Archaic-word sweep.** After the full read, a word-list built fresh from
   what was actually noticed while reading (not a pre-existing list) was
   grepped with word-boundaries across the whole candidate text, to catch
   any additional occurrences of flagged words the continuous read might
   have missed a repeat of.
2. **Judgment split between blocking and non-blocking archaism.** Some
   period-flavored words are still current enough in general reading
   (Bible-familiar idiom, common poetic use) that they do not block
   comprehension and were left as legitimate register choices for a formal
   choric/ritual text; others are genuinely obscure and were treated as
   defects. The reasoning for each call is below.

## Findings — blocking (fixed; see fidelity-review-1.md for the exact edits)

These are words carried over unchanged from the source translation's own
1900s diction that a contemporary reader would very likely have to look up,
found by the full read and confirmed absent nowhere else, then confirmed
fixed by a targeted regex sweep of the corrected file:

| Location (ch, para, 0-based) | Word | Why it blocks |
|---|---|---|
| 7, 19 | `appanage` | Obsolete French-derived legal/heraldic term (a hereditary grant); no ordinary modern use. |
| 9, 45 | `glozes` | Archaic verb ("to gloze" = flatter/gloss over); no modern cognate a reader would recognize. |
| 9, 45 | `forsooth` | Marked as deliberately archaic/comic in modern English; reads as costume-drama filler rather than the sarcastic "indeed" it carries in source. |
| 15, 14 | `puissant` | Archaic for "powerful"; low general recognition. |
| 15, 39 | `handselled` | Very obscure (to "handsel" = inaugurate with a first gift/use); no modern reader would parse this unaided. |
| 20, 1 | `baulked` | Archaic spelling/sense ("baulked your chase" = escaped/thwarted your pursuit); easily misread via the modern "balk" (hesitate), which reverses the sense. |
| 20, 1 | `wried` | Essentially obsolete ("wried his face" = twisted it); no modern use. |
| 21, 0 | `unannealed` | Metalworking term used metaphorically for "not purified"; opaque without the source-language gloss. |
| 21, 6 | `weird` (in "weave the weird dance") | Modern readers will default to the current sense ("strange/odd"), not the source's Old English sense ("fate-bound"); this is a false-friend risk, not just an obscure word. |
| 22, 22 | `besprinkle` (inside a quoted ritual-law formula) | Archaic verb form inside a quoted maxim; per the drafting rules, quoted formulas get modernized too, not exempted. |
| 24, 22 | `assoils` | Obsolete ("to assoil" = absolve/atone for); no modern cognate. |
| 25, 2 | `avouched` | Archaic/legal-flavored past tense of "avouch"; reads as unmodernized rather than deliberately formal. |
| 26, 19 | `avaunt` | Archaic imperative ("begone"); notably, the *same word* was already correctly modernized to "Get out" at ch. 20 para. 16 — its survival at ch. 26 para. 19 is an inconsistency as well as an archaism. |
| 5, 3 | *(fidelity, not accessibility — see fidelity review)* `rapine` → `rape` | Found during the cross-check pass; not an accessibility issue but a meaning-shift, documented and fixed in the fidelity review. |

## Findings — reviewed and judged non-blocking

Words that are dated/formal but still within ordinary modern reading
competence (recognizable from Bible idiom, historical fiction, or common
poetic register), left as legitimate stylistic register for a chorus/oracle
voice rather than treated as reader-blocking:

- `hark` (7 occurrences) — still an active, if literary, English word; used
  consistently at moments of alarm/prophecy (Cassandra's visions, the
  murder cries), which reads as a deliberate device rather than an
  oversight.
- `yonder` (2), `unto` (8), `meed` (4 — reward/due), `troth` (5, always in
  "plighted troth" or similar fixed collocations), `plighted` (3),
  `dowered` (1), `wend` (1), `forthwith` (1), `ere` (2), `anon` (3 — twice
  as the slave's "Anon, anon!" doorway-answer idiom), `whence` (1).
- Rationale: none of these produces a false reading (unlike `weird` or
  `baulked`) and all remain in active, if formal, English use. Rewriting
  all of them would flatten the chorus's ritual register without a
  corresponding accessibility gain, and the drafting rules explicitly say
  already-clear wording may stay and there is no rewrite-percentage target.
  These are documented here, not silently passed over, so a future reviewer
  can re-open the call if they disagree.

## General accessibility read

Outside the archaic-word class above, the candidate's syntax is genuinely
rebuilt into ordinary modern sentence structure throughout — long
Aeschylean periodic sentences are broken into readable units, inverted
verse word order (source's "Ten livelong years have rolled away" style) is
straightened into normal English clause order, and stichomythia (rapid
one-line exchanges) reads cleanly as dialogue. No paragraph was found where
sentence length or syntax alone (independent of vocabulary) created a
comprehension barrier.

## Coverage statement

All 26 chapters / 771 paragraphs read in full, not sampled. Archaic-word
sweep run against the whole book before and after fixes (see
fidelity-review-1.md for the fix log); zero blocking terms remain after
the round-1 corrections.
