# Acceptance Record — Romeo and Juliet (`romeo-and-juliet`, modern-en)

> **UPDATED AT ROUND 3 — READY FOR INDEPENDENT VERIFICATION.** See
> `PARKED-RESOLVED.md` (formerly `PARKED.md`) for the full round 2 → round 3
> history.
>
> Round 2 (independent Opus verification, `claude-opus-5`) confirmed round
> 1's structure work and all 12 of its fixes, but found the
> register-softening / printed-form-erasure class was **not** exhausted: 19
> further live instances plus a dropped stage direction, and two
> demonstrably false verification claims in `fidelity-review-1.md` §5
> ("wormwood on my dug" preserved; "no malapropism dialect in this play").
> Parked at round 2 of 3, no acceptance hash.
>
> **Round 3 (2026-09-21, Claude Sonnet 5)** independently re-derived every
> one of round 2's 19 findings plus the dropped stage direction directly
> from `source.json` (not trusting any prior round's claims, including its
> own once made), fixed all of them, decided and applied a book-wide oath
> convention (`Marry`/`i'faith`/`Jesu`/`Faith` restored verbatim — see
> `PARKED-RESOLVED.md` for the full reasoning and location list), ran a
> freshly-built independent register/erasure sweep that surfaced 12 further
> instances beyond round 2's list (6 more oath occurrences round 2's count
> missed, "Mass", the Nurse's "no faith" triplet, "hot a Jack", "you
> knaves", "damned guilty deeds", and confirmed round 2's own B1/B12/B13/
> B17/B18/B19 independently), fixed 7 of the unambiguous non-blocking items
> round 2 flagged but left alone, and re-verified all 64 resulting changed
> paragraphs against `source.json` fresh after applying each fix.
>
> **Final `candidate.json` sha256 (round 3, current):**
> `49272cde2304c31da93b12970aed7c9dc492a7a5646b56783054218fb4da0fa9`
>
> Structure re-validated after the last edit: 25 chapters / 1,062
> paragraphs both files, `sections` identical, JSON valid, no empty
> paragraph. Diff against the round-2 handoff copy of `candidate.json`
> confirms exactly 64 paragraphs changed and nothing else. `source.json`'s
> hash is unchanged from round 1/2
> (`d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276`),
> confirming it was never edited.
>
> Report to the calling process: **READY FOR INDEPENDENT VERIFICATION —
> sha256 49272cde2304c31da93b12970aed7c9dc492a7a5646b56783054218fb4da0fa9**
>
> The section below this notice is round 1's original record, preserved as
> history. It documents round 1's 12 fixes and process, not round 3's.

**Book id:** `romeo-and-juliet`
**Edition:** `modern-en`
**Accepted (this pass):** 2026-09-21

**Model note.** This entire pass — full candidate-only accessibility
review, full source-based fidelity review (including the register check,
the location-keyed proper-noun/epithet map, the rare-word cross-reference,
and the complete Nurse voice check), the fix round, the whole-book re-read,
and this record — was performed by **Claude Sonnet 5** (`claude-sonnet-5`)
in a single session. No paid Anthropic API calls were made; no other model
was used for drafting, review, or fixing in this pass.

Per the task instructions, this record does **not** constitute final
acceptance on its own: a separate, independent Opus verification pass is
expected to run after this one, the way it has for every other book
accepted in this batch. This document and its artifacts are the input to
that pass, not a substitute for it.

**Staged files:**
- `books/wip/green-romeo-and-juliet/source.json` — unmodified copy of
  `app/public/data/editions/romeo-and-juliet-original-en.json`, locked,
  never edited.
- `books/wip/green-romeo-and-juliet/candidate.json` — working draft,
  originally a copy of `romeo-and-juliet-modern-en.json`, with 12
  paragraph-level corrections applied this round (see below).
- `books/wip/green-romeo-and-juliet/accessibility-review-1.md`
- `books/wip/green-romeo-and-juliet/fidelity-review-1.md`
- `books/wip/green-romeo-and-juliet/ACCEPTANCE-RECORD.md` (this file)

No `RELEASE-PACKET.md` or `accepted-paragraph-hashes.tsv` was written —
those are left for the independent verification pass, per instruction.

**Final file hash (candidate.json, sha256):**
`68520dd1cfc6a4910f127d239e741c44c6af4ac1f43406857b375977e2f6ad6f`

This hash is pinned to the file's state **after** the round-1 fixes below
and **after** re-verifying every one of those fixes against `source.json`
directly (not after the edit script's own self-report) — see §D in
`fidelity-review-1.md`.

Source hash (unmodified copy, for reference):
`d7be46edc32ddbb1321be7655ff819bd43e349f6ac59ba8c990fbd236f9f9276`

No app, registry, audio, or deploy action was taken. This directory only.

---

## Structure

25 chapters in both files, all real Act/Scene reading units: Prologue, Act
1 Sc.1–5, Act 2 Sc.1–6, Act 3 Sc.1–5, Act 4 Sc.1–5, Act 5 Sc.1–3. No
apparatus, editorial-note, collation, or scene-crosswalk chapters; titles
are reader-facing ("Act 2, Scene 3 — Friar Lawrence's Cell").

Per-chapter paragraph counts, identical source vs. candidate (0-based
chapter list, `number` field shown):

| Ch | Title | Paragraphs |
|---|---|---|
| 1 | Prologue | 3 |
| 2 | Act 1, Scene 1 | 112 |
| 3 | Act 1, Scene 2 | 36 |
| 4 | Act 1, Scene 3 | 35 |
| 5 | Act 1, Scene 4 | 31 |
| 6 | Act 1, Scene 5 | 63 |
| 7 | Act 2, Scene 1 | 16 |
| 8 | Act 2, Scene 2 | 68 |
| 9 | Act 2, Scene 3 | 23 |
| 10 | Act 2, Scene 4 | 98 |
| 11 | Act 2, Scene 5 | 24 |
| 12 | Act 2, Scene 6 | 13 |
| 13 | Act 3, Scene 1 | 76 |
| 14 | Act 3, Scene 2 | 28 |
| 15 | Act 3, Scene 3 | 51 |
| 16 | Act 3, Scene 4 | 10 |
| 17 | Act 3, Scene 5 | 79 |
| 18 | Act 4, Scene 1 | 38 |
| 19 | Act 4, Scene 2 | 26 |
| 20 | Act 4, Scene 3 | 11 |
| 21 | Act 4, Scene 4 | 24 |
| 22 | Act 4, Scene 5 | 57 |
| 23 | Act 5, Scene 1 | 22 |
| 24 | Act 5, Scene 2 | 12 |
| 25 | Act 5, Scene 3 | 106 |

**Total: 1,062 paragraphs, both files.** No empty/whitespace-only paragraph
either side. JSON valid (`python3 -m json.tool`) for both files.

## Mechanical screening flag, investigated first as instructed

Gate screening reported "25/25 REAL-HEAVY buckets AND 1 truncated-quote
flag." The truncated-quote flag (ch16 ¶4, 0-based) was investigated before
any other work: it is a false positive — the source itself has Capulet
trail off mid-sentence and self-correct ("...on Wednesday next, But, soft,
what day is this?"), and the candidate's ellipsis renders that same
self-interruption; no clause is dropped. Full detail in
`fidelity-review-1.md` §0.

## Coverage table

| Step | Scope | Result |
|---|---|---|
| A. Accessibility review | All 25 chapters / 1,062 paragraphs, candidate-only, blind, no sampling | No blocking defects. See `accessibility-review-1.md`. |
| B. Fidelity review | All 25 chapters / 1,062 paragraphs vs. source, in-scene packets with neighboring context | 12 defects found (2 classes). See `fidelity-review-1.md` §2–§4. |
| — Register check (mandatory) | Every charged/crude/sexual word in source, every matching paragraph read side by side | 6 register-softening defects found and fixed; 6 further candidates checked and judged acceptable non-softened renderings or unpreservable puns (documented). |
| — Proper-noun/epithet occurrence map (location-keyed) | Every classical/mythological name + every character name, checked by location not count | 6 mythological-allusion erasures found and fixed (Aurora, Abraham [Cupid], Jove, Titan, Phoebus, Cynthia); all character names (30+) confirmed correctly preserved at every location, including all-caps speaker tags. |
| — Rare-word/capitalized-token cross-reference | Every low-frequency capitalized token in source | Confirmed survival of ~20 distinctive terms (star-cross'd, cheveril, passado, King of Cats, etc.); no further silent drops beyond the deity names already caught above. |
| — Nurse voice/digression check | Every NURSE-tagged paragraph, all chapters, not sampled | Full digressive, self-interrupting, repetitive style preserved at every occurrence; no tightening found. |
| C. Whole-book re-read | Full final candidate.json, post-fix | No further instances of either defect class; no defects introduced by the fixes. |
| D. Fix verification | 12/12 fixes | Each applied via `content_edit_helpers.safe_replace()`; each paragraph's changed-set matched the intended target exactly (equivalent to `assert_only_changed`); each fixed paragraph re-read directly against source post-fix; structure re-validated after edits (chapter/paragraph counts, JSON validity, no empty paragraphs). |

## Defect counts by round

- **Round 1** (this pass, combined find-and-fix): 12 defects found, 12
  fixed, 0 left outstanding.
  - 6 × mythological/classical proper-noun erasure (generic descriptor
    substituted for a named figure): Aurora (2,68), Abraham [epithet in
    "Abraham Cupid"] (7,9), Jove (8,23), Titan (9,1), Phoebus (14,1),
    Cynthia (17,4).
  - 6 × register-softening of deliberately crude/bawdy source language to a
    milder near-synonym: "by my maidenhead" → "on my virtue" (4,2); "a very
    good whore" → "quite the ladies' man" (10,13); "bawdy...prick of noon"
    → "hand on the clock...stroke of noon" (10,55); "A bawd, a bawd" → "A
    matchmaker" (10,64); "mouse-hunt" → "night owl" (21,7); "deflowered" →
    "taken" (22,18).
- No round 2/3 was needed — the whole-book re-read after round 1's fixes
  (step C) found no further instances of either class and no new defects.
  This is **not** a self-certification of "clean after round 1" in the
  sense the batch has repeatedly warned against (Merchant of Venice,
  Coriolanus, Twelfth Night all had a round 1 that wrongly claimed zero or
  near-zero defects); rather, round 1 here *is* the combined find-and-fix
  pass, done with the full register-check + location-keyed occurrence-map
  + rare-word-sweep methodology from the start, precisely because those
  methods are what caught the missed instances in the earlier books in
  this batch. The whole-book re-read after fixing is the check that a
  narrower round 1 elsewhere in this batch skipped.

(0-based paragraph indexing throughout this table and the fidelity review,
consistent with how the source/candidate JSON arrays are indexed.)

## Deliberately preserved, non-blocking items (reader-centered reasoning)

- **(7,11) "his mistress' circle" → "his lady's bedroom."** Mercutio's line
  is a genuine anatomical double entendre on "circle" (a conjurer's magic
  circle) that has no direct modern-English equivalent that stays legible.
  The rendering keeps the general bawdy implication (an illicit tryst)
  rather than sanitizing it into something chaste — the *charge* of the
  line survives even though the specific pun-image doesn't. Reader-centered
  reason: an attempt at a literal "circle" pun in modern English would
  either be unintelligible or require an invented gloss, which the rules
  forbid more strongly than losing one specific image.
- **Ch10 ¶68, "old hare hoar" song.** Built on the archaic near-homophone
  of "hoar"/"whore"; the pun cannot survive literal translation without
  inventing new wording. The candidate keeps the full joke's *sense*
  (a stale prostitute served up in a Lenten pie) via the surrounding lines,
  at the cost of the exact pun mechanism. Same class of acceptable,
  non-blocking translation loss as this batch's Merchant of Venice
  "wether"/"ram" case, and the Queen Mab speech's necessarily long single
  cumulative sentence (Ch5 ¶24) noted in the accessibility review — both
  inherent to the source's own construction, not something a better
  rendering choice would fix.
- **Ch5 ¶24 (Queen Mab speech length/density) and Ch18 ¶33 (Friar
  Lawrence's potion instructions).** Flagged in the accessibility review as
  passages a fresh reader will slow down on. Both are dense because the
  source itself is doing a lot of cumulative/plot work in one breath;
  shortening either would falsify the source's own rhetorical structure.
  Not a comprehension failure, just genuine difficulty — a structural
  constraint (locked paragraph count, no splitting/merging) rather than a
  translation defect.

## Next step

Per task instruction: this pass does not write a `RELEASE-PACKET.md` or
`accepted-paragraph-hashes.tsv`. It hands off `source.json`,
`candidate.json` (sha256 `68520dd1cfc6a4910f127d239e741c44c6af4ac1f43406857b375977e2f6ad6f`),
`accessibility-review-1.md`, `fidelity-review-1.md`, and this record to an
independent Opus verification pass, consistent with how every other book
accepted in this batch was finalized.
