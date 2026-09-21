# Acceptance Record — A Midsummer Night's Dream (`midsummer-modern-en`)

**Book id:** `midsummer`
**Edition:** `modern-en`
**Date:** 2026-09-21
**Drafting/repair pass:** Sonnet (this session). An independent Opus
verification pass is planned separately per programme process and has not
happened yet — this record covers the Sonnet-pass acceptance only.
**Directory:** `books/wip/green-midsummer/` (source.json / candidate.json
staged unmodified from `app/public/data/editions/midsummer-original-en.json`
and `midsummer-modern-en.json` at the start of this session; no other file
outside this directory was touched).

## Final file and hash

- File: `books/wip/green-midsummer/candidate.json`
- **sha256: `4bd297033dfc8bf1f958ff7578786519a20804dc064f4e81531d6bcb9b108adb`**
- Computed *after* all round-1 fixes were applied and independently
  re-verified — this hash covers exactly what shipped, not a pre-fix state.
- JSON validity confirmed (`python3 -m json.tool`).
- Structure validated chapter-by-chapter against source with
  `content_edit_helpers.validate_structure` — all 9 chapters pass, 641/641
  paragraphs preserved in count and order, no empty/whitespace paragraphs.

## Coverage table

| Step | What was done | Coverage |
|---|---|---|
| Structure QA | Apparatus-pollution scan (`] SCENE`, `Pope`, `Rowe`, `conj.`, `om.`, etc.) + chapter/paragraph-count parity check | All 9 chapters, both editions; scan hits were false positives (regex substrings inside ordinary dialogue, e.g. "downright," "PEASEBLOSSOM."), manually confirmed clean |
| A. Accessibility review (blind) | Full read of candidate.json only, start to finish | All 9 chapters, all 641 paragraphs, verified by script (59+43+50+43+85+141+68+18+134=641) |
| B. Fidelity review (packets + context) | Candidate vs. source.json, every paragraph individually checked | All 9 chapters, all 641 paragraphs — full source.json and candidate.json both read in full by the reviewing pass, not sampled |
| C. Cross-boundary re-read | Whole-book re-read for recurring terms/relationships (malapropism pattern, Ninny's/Ninus's distinction, love-juice plot mechanics, lovers' names) | Whole book, both files |
| D. Verify-in-file + re-derive | Every fixed paragraph independently re-read against source after applying fixes; full-text grep re-run to confirm no other instance of the same defect class remained anywhere in the book | All 5 fix sites + full-book grep sweep for each affected term |

## Defects found and fixed, round 1 (the only round needed)

All 5 defects were the same failure class: a deliberately non-standard
source wording (a character's malapropism, or a character-specific
mispronunciation) was silently "corrected" to its standard form during
drafting, erasing wordplay this book depends on. Caught independently by
both the accessibility review (paramour/paragon read as a non sequitur) and
the fidelity review (full pattern, plus the other four instances).

1. Ch2 ¶12 — Bottom's "Ercles"/"Phibbus" (garbled Hercules/Phoebus) silently
   modernized to "Hercules"/"the sun god." **Fixed**: restored "Ercles"
   (both occurrences) and "Phibbus'."
2. Ch2 ¶39 — Bottom's "obscenely" (malapropism for "seemly," already a plain
   modern word) replaced with "freely." **Fixed**: restored "obscenely."
3. Ch7 ¶17 — Bottom's "exposition" (malapropism for "disposition") replaced
   with correct phrasing. **Fixed**: restored "exposition."
4. Ch8 ¶6 — Quince's "paramour" (malapropism for "paragon") dropped
   entirely, leaving Flute's correction in ¶7 referring to nothing said — a
   genuine coherence break, not just a style loss. **Fixed**: restored
   "paramour" in Quince's line.
5. Ch9 ¶88 — Thisbe's "Ninny's tomb" (her consistent mispronunciation of
   Ninus, correctly preserved elsewhere at ¶58) silently corrected to
   "Ninus's tomb" at this one occurrence, breaking internal consistency.
   **Fixed**: restored "Ninny's tomb."

Each fix was applied with `content_edit_helpers.safe_replace` (exact,
scoped, single-occurrence replacement), followed immediately by
`validate_structure` and `assert_only_changed` to confirm exactly the
intended paragraph and no other was touched. After applying, every fixed
paragraph was independently re-read against source.json directly (not
trusting the fix script's own claim), and a full-text grep for each
affected term (Ercles, Phibbus, obscenely, exposition, paramour, paragon,
Ninny, Ninus) was re-run across both files to confirm no other occurrence
of the same defect existed elsewhere in the book. All matched exactly
between source and candidate after the fix round.

No round 2 or round 3 was needed — the book cleared in one correction
round.

## Deliberately preserved, non-blocking items (with reader-centered reasoning)

- **Ch7 ¶11 — "Cavalery Cobweb" → "Sir Cobweb."** Loses Bottom's specific
  invented mock-title but keeps the mock-formal register and joke (a giant
  treating a tiny fairy with elaborate courtesy) fully intelligible on its
  own; unlike the fixed items, nothing here is broken or ambiguous for the
  reader.
- **Ch1 ¶53 — "What cheer, my love?" → "What's the matter, my love?"** Mild
  shift from a general check-in to a solicitous "is something wrong," with
  no actor/fact consequence anywhere else in the scene.
- **Ch3 ¶165 — "thy fairy kingdom" → "your entire fairy kingdom."** Minor
  intensifying addition, doesn't change what's being refused.
- **Ch5 — Thisbe's "most brisky juvenal, and eke most lovely Jew" smoothed.**
  Source line is a well-known textual crux (the word is widely read by
  editors as rhyme-driven filler rather than a literal reference); rendering
  it plainly avoids an unintended, confusing modern reading with no
  fidelity gain, since the word's own status in the source is unsettled.
- **Ch9 — "Bergomask dance" → "country dance."** Loses the specific
  place-name joke but keeps the "simple, rustic performers" humor the line
  is actually doing work for.
- **Ch9 — Wall's "the wittiest partition" → "the wittiest wall."** No
  distinction the dialogue depends on is lost.
- Multiple short-line word-count ratio outliers (`Is everyone here?`,
  `Quick, come.` → `Come on, then. Let's go.`, etc.) were individually
  inspected — all are natural modernization expansions/contractions of very
  short lines, none drop or add content. The racially charged insults in
  Act 3, Scene 2 (`Away, you Ethiope!` → `Get off me, you dark-skinned
  girl!`; `tawny Tartar` → `dark-faced foreigner`) were specifically checked
  for softening and confirmed **not** softened — the ugliness of the insult
  is preserved rather than sanitized, per this batch's standing instruction
  against softening frank/period content.

## Puns, wordplay, and character-voice check (explicit task requirement)

Specifically verified, beyond the general fidelity pass:

- All identified wordplay/pun pairs (Wall/partition, lion/asses, "die"/ace,
  fox-and-goose valor/discretion exchange, Jack-shall-have-Jill proverb,
  Ninny's/Ninus's mix-up) checked individually — all land correctly in the
  fixed candidate.
- The four lovers (Hermia, Helena, Lysander, Demetrius) keep clearly
  distinct voices through the Act 3 quarrel (ch6, 141 paragraphs) — verified
  end to end, no actor swaps, insults and hedges attributed to the correct
  speaker throughout.
- The mechanicals (Bottom, Quince, Snug, Flute, Snout, Starveling) keep
  distinct comic registers — Bottom's malapropisms/overacting (now restored
  per the fixes above), Quince's earnest organizing, Flute's reluctance,
  Snug's plainness, Starveling's anxiety are all individually intact.

## Verdict

**ACCEPTED — sha256 `4bd297033dfc8bf1f958ff7578786519a20804dc064f4e81531d6bcb9b108adb`**

This file is staged only in `books/wip/green-midsummer/`. No app, registry,
audio, or deploy action was taken. Promoting this candidate to
`app/public/data/editions/midsummer-modern-en.json` and any registry/audio
follow-up is a separate step for whoever owns publication, and should wait
for the planned independent Opus verification pass per programme process.
