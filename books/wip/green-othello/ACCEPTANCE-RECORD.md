# Acceptance Record — Othello (`othello`, modern-en)

**Book id:** `othello`
**Edition:** `modern-en`
**Accepted:** 2026-09-21
**Drafting/repair pass:** Claude Sonnet 5 (model id `claude-sonnet-5`).
**Independent verification:** pending — a separate Opus verification pass
runs after this record and will confirm or reopen it. Per task instructions
this pass does **not** publish a `RELEASE-PACKET.md` or
`accepted-paragraph-hashes.tsv`; those are produced after that independent
verification confirms this work.
**Staged files:** `books/wip/green-othello/source.json` (copied unmodified
from `app/public/data/editions/othello-original-en.json`),
`books/wip/green-othello/candidate.json` (copied from
`app/public/data/editions/othello-modern-en.json`, then corrected in this
round — see below).

**Final file hash (candidate.json, sha256):**
`46bc30c0636030535a680f493e0d3c9ff725c90fe57acc58a20075102538510c`
This hash is the acceptance's fidelity anchor — pinned to the file's state
*after* the round-1 fixes and *after* re-verifying those fixes directly
against source, per `TRANSLATION_PROTOCOL.md`'s pin-to-hash requirement.

Source hash (unmodified copy, for reference):
`a8e8ae40b054bce1b60dcba35fcd194f08e74829fcc0faa6665456f962b5d1df`

No app, registry, audio, or deploy action was taken at any point. This
directory only.

---

## Structure (verified)

- 15 chapters (Act 1 Sc.1–3, Act 2 Sc.1–3, Act 3 Sc.1–4, Act 4 Sc.1–3, Act 5
  Sc.1–2), all real act/scene units — no apparatus, editorial-note, or
  scene-crosswalk chapters.
- Chapter titles match source exactly (reader-facing `Act N, Scene M —
  location` form).
- 1,391 paragraphs total in both source and candidate; exact per-chapter
  paragraph-count match; paragraph order locked (verified via
  `content_edit_helpers.validate_structure`, run per chapter and re-run
  after fixes).
- No empty or whitespace-only paragraphs on either side.
- Apparatus scan (Cambridge/Gutenberg pattern) run: zero hits in either
  file.
- Speaker-tag set (23 distinct tags) and per-tag counts match exactly,
  including the case-sensitive ALL-CAPS form, between source and candidate.

## Coverage table

| Step | What was done | Coverage |
|---|---|---|
| A. Accessibility (blind) | Full read of candidate.json only, no source seen | 15/15 chapters, 1,391/1,391 paragraphs, full read not sampled |
| B. Fidelity (packets + context) | Full paragraph-by-paragraph comparison against source, full diffs produced and read chapter by chapter, plus targeted whole-book sweeps for this batch's documented recurring failure classes | 15/15 chapters, 1,391/1,391 paragraphs |
| C. Whole-book cross-boundary re-read | Full re-read after fixes, tracking the handkerchief's journey, the willow-song's payoff, and the jealousy-imagery thread across scene boundaries; dedicated case-sensitive proper-noun/epithet occurrence-location sweep (not just totals) across 14 major names | 15/15 chapters |
| D. Verify in final file + pin hash | Both fixed paragraphs independently re-derived from source.json after edit; structure re-validated per chapter; `diff_report`/`assert_only_changed`-equivalent check confirmed only the 2 intended paragraphs changed across the whole 1,391-paragraph book | 2/2 fixed paragraphs re-verified |

## Defects found and fixed (Round 1 — the only round needed)

**2 paragraphs corrected, 2 defect classes, both matching this batch's
documented recurring failure pattern:**

1. **Silently "corrected" name-form (case/short-form variant) — Ch9 ¶26.**
   Source uses the affectionate short form "sweet Desdemon" (not
   "Desdemona") in exactly two places in the play: here, and at Ch15 ¶161
   ("O Desdemon! Dead, Desdemon!"). The candidate correctly preserved the
   short form at Ch15 ¶161 but had silently normalized it to "Desdemona" at
   Ch9 ¶26 — an inconsistent partial "correction" of exactly the kind this
   batch has hit repeatedly (Bacchae's missed all-caps speaker-tag form is
   the closest prior instance). Found via a location-based occurrence map
   (not just a total count) for every major proper noun, specifically
   built because count-matching alone can hide a dropped-plus-added pair in
   different locations. Fixed: `sweet Desdemona` → `sweet Desdemon`.
2. **Reversed meaning (antonym substitution) — Ch9 ¶172.** Iago's vow to
   Othello: source's "and to obey shall be in me remorse, / What bloody
   business ever" uses "remorse" in its Elizabethan sense of pity or
   compunction — Iago is (ironically) calling his obedience an act of
   pity, whatever the bloody business turns out to be. The candidate had
   rendered this as "**remorseless**" — the literal antonym of the source
   word, flipping the line from "an act of pity" to "without pity." This
   is a direction-of-meaning reversal, not a paraphrase. Fixed:
   `remorseless` → `an act of pity`.

No other defects found anywhere in the book — checked specifically for: (a)
name/spelling corrections including case-sensitive/short forms (dedicated
sweep, both defects above found this way); (b) imported wording from
another edition/translation (checked the "base Judean"/"Indian" textual
crux and the "chrysolite" line specifically — both kept source's own
wording); (c) glosses naming what source leaves deliberately unnamed/
ambiguous (none found — this play doesn't have this book's particular
failure pattern); (d) softened violent/sexual/frank content (checked every
major slur/sexual-imagery line in Act 1 Sc.1 and the "topped"/willow-song/
Emilia's-closing-speech material — none softened); (e) reversed meaning/
direction beyond the one instance above; (f) inconsistently-rendered
recurring epithets (the "ancient"→"ensign" and "napkin"→"handkerchief"
modernizations are consistent throughout and are period-vocabulary
synonyms for an identical referent, not meaningful spelling variants like
Julius Caesar's "Antonius"/"Antony," so consistent modernization is
correct here, not an error); (g) corrected malapropisms/mangled dialect
(the Clown's wordplay in Ch7/Ch10 preserved verbatim/pun-intact).

## Independent re-verification of fixes

Both corrected paragraphs were re-read against `source.json` fresh (not
trusting the fix's own stated rationale) after the edit — both match
source's wording and intent exactly. A book-wide before/after diff
(`content_edit_helpers.diff_report` over all 1,391 paragraphs) confirmed
the round touched exactly the 2 intended paragraphs (Ch9 ¶26, Ch9 ¶172) and
no others; no new word-count-ratio outliers were introduced.

## Deliberately preserved, non-blocking items (with reader-centered reasons)

- **Frank/violent/racially-charged content kept at full force throughout.**
  "Thick-lipped one" (Ch1 ¶9), "an old black ram is mounting your white
  ewe" (Ch1 ¶20), "covered by a Barbary stallion" (Ch1 ¶31), "making the
  beast with two backs" (Ch1 ¶33, verbatim), "Cassio lay with her" (Ch15
  ¶93), the willow-song and Emilia's closing speech on infidelity (Ch13) —
  all verified word-for-word against source and left exactly as forceful
  in modern vocabulary as the source is in period vocabulary, per the
  task's explicit instruction not to let modernization dilute this
  material.
- **Inherent-difficulty passages left as clear modern prose without further
  simplification:** Iago's opening complaint (Ch1 ¶4), Othello's "her
  father loved me" narrative (Ch3 ¶45), the handkerchief's "magic in the
  web of it" speech (Ch10 ¶38–40), Emilia's closing argument (Ch13 ¶48),
  and Othello's final "Speak of me as I am" speech (Ch15 ¶190) — all read
  clearly in modern vocabulary; their remaining difficulty is structural/
  rhetorical density inherent to the content (the same difficulty exists
  in the source), not unclear wording. Flattening them further would mean
  cutting content the acceptance procedure requires to be preserved.
- **Pronoun-to-name disambiguation in 4 short passages (Ch1 ¶4, Ch1 ¶10,
  Ch3 ¶95, Ch6 ¶124).** A source pronoun ("he"/"his"/"him") rendered as
  the character's name for clarity, where verse line-breaks track a
  pronoun-antecedent chain across named characters in ways modern prose
  punctuation doesn't automatically carry. In every case the referent is
  the same real character already named or clearly established moments
  earlier in the same speech — not a new interpretation, and not a name
  imposed on a figure the source leaves deliberately unnamed. Judged
  legitimate prose disambiguation per `TRANSLATION_PROTOCOL.md`'s
  instruction to rebuild difficult syntax into ordinary vocabulary, not a
  fidelity defect.
- **"Ancient" → "ensign" (9 occurrences) and "napkin" → "handkerchief" (3
  occurrences), both fully consistent.** Archaic period-vocabulary synonyms
  for an identical referent (a military rank; the same physical
  handkerchief object), not a deliberately meaningful spelling variant.
  Confirmed by location-based sweep that both are rendered the same way
  everywhere they occur.

## Verdict

**ACCEPTED.** All structural checks pass, both acceptance reviews (blind
accessibility, packet-style fidelity + whole-book cross-boundary re-read
with a dedicated case-sensitive proper-noun sweep) are complete and
non-sampled, the round's 2 defects were fixed and independently
re-verified against source in the same round, and the final hash above
covers the file's actual final state. Awaiting independent Opus
verification before a release packet is produced.
