# The Tempest (`the-tempest`, modern-en) — Round 3 correction (final round)

**Model:** Claude Sonnet 5 (`claude-sonnet-5`), independent of round 2 (Claude Opus)
**Date:** 2026-09-21
**Input:** `candidate.json` as left by round 2 (unmodified by round 2), sha256
`14a4fa4f26b9290fc437a4df28153747ce930da70cce7682aced7ecd7d85b38b`
**Output:** `candidate.json` after 23 fixes across 22 paragraphs, sha256
`c60c6ffeb87f254a116d9a5f114562e4fad415b22fd0068962b92f4564566806`

## Method

1. Read `PARKED.md` in full. For every one of the 15 blocking items, searched
   `source.json` fresh by the distinctive quoted wording (not by trusting the
   cited `chapter.paragraph` coordinate) — every citation in `PARKED.md`
   turned out to be exactly right; no coordinate errors found.
2. Confirmed the defect was still live in the current `candidate.json` before
   writing any fix (all 15 were).
3. Applied each fix with `content_edit_helpers.safe_replace()` (fails loudly
   on a missing or ambiguous match — no fix here needed a full-paragraph
   overwrite).
4. Built a genuinely **location-keyed** proper-noun/deity sweep: for every
   name in {Jove, Neptune, Mars, Venus, Cupid, Dis, Hymen, Phoebus, Iris,
   Ceres, Juno, Sycorax, Setebos, Dido, Aeneas, Carthage, Naples, Milan,
   Tunis, Argier, Algiers, Bermoothes, Bermudas, Claribel, Paphos}, recorded
   every `(chapter, paragraph)` it appears at in `source.json`, then checked
   the *same coordinate* in `candidate.json` — not a book-wide total. Beyond
   the two round-2 finds (Jove 2.53, Neptune 9.11, both now fixed), the only
   other location-level "misses" were Argier→Algiers (2.77, 2.78) and
   Bermoothes→Bermudas (2.61), which are the already-accepted, consistently
   applied period-spelling modernizations from round 1's non-blocking list
   (confirmed: both are present, just spelled the modern way, not dropped).
   No further silent drops found.
5. Ran a fresh charged/crude-word and address-form sweep (`pox`, `murrain`,
   `plague`, `dropsy`, `scurvy`, `wench`, `whore`, `whoreson`, `malice`,
   `coward`, `villain`, `knave`, `slave`, `siege`, `vent`, `stinking`,
   `sirrah`, `bully`, `coragio`, `worm`, `stripes`, `mop and mow`, `league`,
   `mistress`, `hag`, `filth`, `abhorred`, `traitor`, `dog`, `monstrous`,
   `bastard`, `damn`, `hell`, `devil`, `piss`) at every source location,
   checked verbatim-or-equivalent presence at the matching candidate
   location. This surfaced 7 further non-blocking-but-worth-fixing items
   (below), everything else checked out as an acceptable synonym swap
   carrying equivalent force, or was already covered by the 15.
6. Applied a documented lexical policy (below) to the ~8 non-blocking items
   PARKED.md asked round 3 to rule on.
7. `validate_structure()` + `diff_report()` + `assert_only_changed()` after
   all fixes: exactly the 22 intended paragraphs changed, nothing else; no
   ratio outlier among them.
8. Every one of the 22 changed paragraphs independently re-read against
   `source.json` fresh, after the fix was written (not just checked against
   its own stated rationale) — see table below.

## Fixes applied (23 fixes / 22 paragraphs)

### From PARKED.md's 15 blocking items

| # | Loc | Fix |
|---|-----|-----|
| A1 | 3.72 | "she's so far away **in** Italy" → "so far away **from** Italy" (restores the geography: Claribel is far *from* Italy, not *in* it) |
| A2 | 9.59 | "you blasphemer who swore the ship was done for" → "you blasphemer, swearing so hard you throw grace overboard ... have you no oath left once you're on dry land?" (restores the oath/blasphemy joke, drops the invented ship claim) |
| A3 | 6.12 | "was there ever a man as brave as me" → "was there ever a coward of a man" (restores the rhetorical logic — no coward ever drank this much — and the word `coward`) |
| B1 | 2.53 | "the lightning bolts" → "Jove's lightning bolts" |
| B2 | 9.11 | "the retreating tide" → "the ebbing Neptune" |
| C1 | 9.74 | "Courage, brave monster, courage!" → "Coragio, bully-monster, coragio!" |
| C2 | 9.53 | "Look down, you gods" → "Look down, you god" (restores source's printed singular) |
| C3 | 4.12 | "loved Moll" → "loved Mall" (restores source's printed spelling) |
| D1 | 3.53 | "Don't get me started!" → "A pox o' that!" (curse restored, not just softened) |
| D2 | 6.40 | "A curse on your monster ... your fists" → "A murrain on your monster ... your fingers" (both the disease-curse and the original body part restored) |
| D3 | 2.80 | "You, as you yourself have told me" → "Thou, my slave, as you yourself have told me" (restores Prospero's master/slave address to Ariel) |
| D4 | 4.27 | "end up underneath ... can he produce Trinculos?" → "end up the siege of ... can he vent Trinculos?" (restores the scatological joke) |
| D5 | 2.2 | "pour down burning pitch" → "pour down stinking pitch" (restores the smell image, drops the wrong fire image) |
| E1 | 3.135 | added back "but only suspect there's more to discover there" (the dropped clause) |
| E2 | 4.52 | "trap the nimble monkey" → "trap the nimble marmoset"; "dig up peanuts" → "dig up pignuts" |

### From round 3's fresh sweep (not in the 15, found independently)

| Loc | Fix | Reason |
|---|-----|--------|
| 8.12 | "mop and mow" was rendered "bows and gestures" (wrong meaning — the phrase means *grimaces*, not bows) → "grins and grimaces" | meaning error, not just a register choice |
| 2.106 | "stripes" (whip-marks) → "punishment" (generic) → restored as "the lash" | same de-specification class as murrain/dropsy/marmoset |
| 5.9 | "Poor worm" → "Poor thing" (image dropped) → restored "Poor worm" | Prospero's pitying epithet, an image, not decoration |
| 5.5, 5.11, 5.22 | Ferdinand's "mistress" address to Miranda, dropped 3 of 5 times → restored at all 3, matching the one place (5.2) and the rest of the book (4.40, 8.26) where it already survives | consistency — round 1 explicitly ruled "mistress" a printed form worth keeping (fix 8, "My mistress" 4.40); dropping it elsewhere in the same play for the same speaker was an inconsistency, not a deliberate choice |
| 3.139 | "Ten leagues beyond man's life" → "ten times farther away than a man could travel in a lifetime" (a **unit → multiplier** substitution: turns a specific distance measure into a vague ratio) → restored "ten leagues" | flagged by the task explicitly as worth checking carefully; confirmed a genuine, if quiet, distortion of the source's figure, same defect shape as the disease/animal/plant de-specifications |

## Lexical policy (resolving PARKED.md's ~8 non-blocking items)

Written once, applied consistently, so future rounds don't re-litigate the
same call paragraph by paragraph:

1. **Period curse-words used as a general intensifier** (e.g. "damn'd witch"
   → "cursed witch," "pox" → "plague" at one Stephano line) are **not
   blocking** when no unique, precisely-once-used detail is lost and the
   substitute carries equivalent force. This is the standing rule from round
   1, re-confirmed. **Distinguishing, load-bearing instances** (a specific
   named affliction that's the *point* of the line — `murrain`, `dropsy`,
   `red plague` — or a curse deleted outright rather than swapped, like `a
   pox o' that!` at 3.53) are blocking and were fixed above.
2. **`scurvy`** (4.9, 4.12, 4.47, 6.32) rendered three different ways
   ("terrible," "revolting," "pathetic") is judged **non-blocking**: it's a
   generic Elizabethan all-purpose insult with no single fixed modern
   equivalent, no specific claim is attached to any one occurrence, and
   varying the translation across four different speakers/contexts reads as
   natural English rather than lost content. No change made.
3. **`sirrah`** dropped at 9.87 and 9.91 is judged **non-blocking**. Unlike
   `bully-` or `my slave`, `sirrah` has no natural single-word modern
   equivalent that isn't either archaic-sounding on its own or a false
   register match; both candidate lines already carry Prospero's contempt in
   their surrounding phrasing ("So, you wanted to be king of the island, did
   you?"; commanding him off to his cell). Consistent with how `thou` is
   modernized throughout rather than preserved. No change made.
4. **Ferdinand's `mistress`** — see fix table above: restored at 5.5, 5.11,
   5.22 for consistency with 5.2, 4.40, 8.26. This is now a fixed item, not
   a policy call.
5. **`mop and mow`** — fixed above (was a meaning error, not a register
   choice).
6. **`Ten leagues` → `ten times`** — fixed above (unit-to-multiplier
   distortion, checked carefully as the task asked).
7. **Named animals/plants** (`marmoset`, `pignuts`) and **specific
   afflictions/instruments** (`murrain`, `dropsy`, `red plague`, `stripes`)
   follow one rule: **a specific, still-recognizable named thing must not be
   generalized to a vaguer category word.** `marmoset`→`monkey` and
   `pignuts`→`peanuts` (wrong plant) were both blocking (E2, fixed above);
   `stripes`→`the lash` (this round's sweep) is the same shape at lower
   severity, fixed above too.
8. **Foreign exclamations and character-specific coinages** (`Coragio`,
   Caliban's `Cacaliban`) must survive verbatim — they are markers of a
   specific character's voice, not ordinary vocabulary to translate.
   `Cacaliban` was already fixed in round 1; `Coragio` is fixed above.
9. **Printed-form cruxes** (`My mistress` vs "My mother," `you god` vs "you
   gods," `Mall` vs "Moll") are reproduced as printed, never silently
   corrected to the more familiar modern reading — round 1's rule for "My
   mistress," now applied consistently to `you god` (C2) and `Mall` (C3).
10. **"Full fathom five" (2.124) and "Where the bee sucks" (9.16)** — judged
    **non-blocking, no change**. On inspection both songs are already
    modernized where it matters (`doth`→`does`, `I couch`→`I rest`, `do
    cry`→`cry`, `knell`→`funeral bell`) while keeping the handful of
    universally-recognized, iconic phrases ("Full fathom five," "sea-change
    / into something rich and strange," "cowslip's bell") intact. These are
    the two most quoted passages in the play; further modernizing the
    famous wording itself would trade recognizability for a marginal
    accessibility gain that the surrounding glosses (`doth`→`does`, etc.)
    already deliver. This is a deliberate accessibility policy call, not an
    oversight.

## Verification

- `validate_structure()`: passes on all 10 chapters (source vs candidate):
  same chapter numbers, same 790 total paragraphs (43,175,170,58,29,74,39,
  98,102,2), no empty/whitespace-only paragraph, valid JSON.
- `assert_only_changed()`: for every chapter, the set of paragraphs that
  actually changed between the round-2-final `candidate.json` and this
  round's output matches **exactly** the 22 intended indices — no more, no
  fewer:
  - ch2: 2, 53, 80, 106
  - ch3: 53, 72, 135, 139
  - ch4: 12, 27, 52
  - ch5: 5, 9, 11, 22
  - ch6: 12, 40
  - ch8: 12
  - ch9: 11, 53, 59, 74
- `diff_report()` ratio check: no ratio outlier (outside 0.7-1.6) among any
  of the 22 changed paragraphs.
- Every one of the 22 changed paragraphs re-read against `source.json`
  fresh, after being written — full source/candidate table in this file's
  "Fixes applied" section and the round-3 fix script's inline output.

## Final hash

`candidate.json` sha256: `c60c6ffeb87f254a116d9a5f114562e4fad415b22fd0068962b92f4564566806`
