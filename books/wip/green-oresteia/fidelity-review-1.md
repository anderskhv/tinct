# Fidelity Review 1 — The Oresteia (`oresteia`, modern-en)

**Reviewer:** Claude Sonnet 5 (`claude-sonnet-5`)
**Source:** `source.json` (locked, unmodified — sha256 of the raw copy
recorded in ACCEPTANCE-RECORD.md)
**Candidate at start of this review:** `app/public/data/editions/oresteia-modern-en.json`
as copied into this directory, before any edits.

## Methodology note

Per the task instruction for this book, this review was **not** a
scoped/list-based defect sweep. It was built as follows, in order:

0. **Source-completeness check (before any review work).** Confirmed the
   source is structurally complete before trusting it as ground truth —
   see "Structural completeness" below. This gate is required by this
   task because two of the batch's last three books (Henry V, Macbeth)
   turned out to have missing content in the locked source parse itself.
1. **Full non-sampled paragraph-by-paragraph read**, comparing every one of
   the 771 candidate paragraphs against its aligned source paragraph, done
   in the course of reading both files end to end (not by packet sampling).
2. **Location-keyed proper-noun/epithet cross-reference**, built fresh from
   the actual character/place names in this book (not a preset list),
   checked in both directions: every source occurrence of each name
   confirmed present at the *same* (chapter, paragraph) in candidate, and
   every candidate occurrence checked for a source counterpart, across all
   771 aligned paragraph pairs.
3. **Rare/marked-vocabulary cross-reference**, built from words actually
   noticed while reading (not a pre-made list), grepped word-boundary
   across the whole book both before and after fixes.
4. **Charged/violent-content spot audit**, built from terms actually
   present in this text (blood, slay/kill/murder, net/snare/robe/trammel,
   lion/serpent/snake imagery, curse, vengeance, matricide, and separately
   the play's sexual/marital vocabulary — paramour, concubine, harlot, bed,
   couch, lust, rape/rapine, defile, pollution, incest, ravish, virgin,
   shame), counted source-vs-candidate whole-book, with every count
   discrepancy above a small tolerance read in full context, both
   directions, not assumed innocent from the count alone.
5. **Speaker-tag/OCR-artifact audit** — every capitalized speaker tag in
   source enumerated, to catch any tag inconsistency (deliberate source
   form vs. OCR/typesetting glitch) and confirm candidate's handling of
   each was a correction of a genuine artifact, not an erasure of a
   deliberate source form.
6. **Whole-book re-read (step C)** after fixes, specifically hunting for
   what a scoped, list-based sweep would miss, per this task's explicit
   instruction — see "Second-pass findings" below.

This is a single-session pipeline: the same session performed drafting
review (A), fidelity review (B), and the cross-boundary re-read (C). It is
not the two-independent-reviewer setup the general protocol describes for
in-house drafting; it follows this task's own explicit instructions
instead, which specify exactly this methodology for this book.

## 0. Structural completeness of `source.json`

Before trusting `source.json` as the fidelity baseline, checked for the
kind of content loss that hit Henry V (missing Prologue) and Macbeth
(missing "unsex me here" and dagger soliloquies) earlier in this batch:

- **The beacon-chain speech** (Agamemnon, ch. 3 para. 16) — present, and
  every one of the 14 named relay-points (Ida, Lemnos, Athos, Macistus,
  Messapius, Euripus, Asopus, Cithaeron, Gorgopis, Aegiplanctus, the
  Saronic bay, Arachne's peak) is present in order.
- **The purple-carpet/tapestry scene** (ch. 7) — present in full, both
  Clytemnestra's persuasion and Agamemnon's refusal-then-yielding.
- **Cassandra's prophecy** (ch. 9, 83 paragraphs) — present in full,
  including the "children of Thyestes" vision, the net/snare prophecy of
  Agamemnon's murder, and her own death foretelling.
- **The murder cries and Clytemnestra's confession speech** (ch. 10) —
  present, including the three-blow account and the "sweeter than rain"
  line.
- **The recognition scene, the invocation at the tomb (Kommos), the
  matricide dialogue (stichomythia with Clytemnestra), and Orestes's
  pursuit by the Furies** (chs. 13–18) — present in full.
- **The Furies' binding/blood-drinking song and the trial scene at the
  Areopagus with the twelve citizen-judges and the tied vote** (chs.
  20–24) — present in full, including Apollo's defense (the
  "mother is not the true parent" argument) and Athena's tie-breaking
  vote.
- **The Eumenides' transformation into the "Kindly Ones" and the closing
  procession** (chs. 25–26) — present in full.

Term-frequency spot check across the whole source text (beacon 9, net 16,
Cassandra 41, Furies 16, Orestes 113, Clytemnestra 73, Apollo 64, Athena
45, matricide 6, trial-adjacent "vote" 10, "Areopagus" 1) is consistent
with a complete trilogy, not a text missing a major speech or scene.

**Verdict: source is structurally complete.** Proceeded with the review.

## 1. Structure verification

- 26 chapters in both files, real reading units by play/scene:
  Agamemnon (Prologue, Parodos, First–Fourth Episode, First–Third
  Stasimon, Exodos — 10 chapters), The Libation Bearers (Prologue,
  Parodos, First–Third Episode, Kommos, Second Stasimon, Exodos — 8
  chapters), The Eumenides (Prologue, Parodos, First–Third Episode,
  First–Second Stasimon, Exodos — 8 chapters). No apparatus, editorial,
  or crosswalk chapters.
- Chapter numbers and paragraph counts identical between source and
  candidate, chapter by chapter (10, 34, 21, 14, 36, 16, 26, 17, 83, 71,
  3, 8, 41, 19, 63, 6, 105, 4, 9, 38, 14, 25, 9, 62, 6, 33 = **771 total**
  in both files).
- JSON valid in both files; no empty or whitespace-only paragraph on
  either side.

## 2. Proper-noun / epithet location cross-reference

Checked in both directions for 41 names (Loxias, Phoebus, Pallas,
Pythian, Delphi, Argos, Argive, Troy, Ilion, Priam, Scamander, Aegisthus,
Orestes, Electra, Pylades, Cassandra, Clytemnestra, Agamemnon, Atreus,
Thyestes, Aulis, Iphigenia, Cronos, Zeus, Apollo, Hermes, Athena,
Erinyes, Areopagus, Delphos, Pheres, Ixion, Thebes, Hades, Persephone,
Tantalus, Pleisthenes, Strophius, Phocis, Pelops, Scylla, Althea,
Geryon) across all 771 aligned paragraph pairs:

- **Zero** names present in a source paragraph and missing from its
  aligned candidate paragraph.
- Six apparent "extra" occurrences in candidate were individually
  checked and are all legitimate: two OCR-glitch speaker tags in source
  (`OSESTES` → `ORESTES`, `CLYTEMNESTSA` → `CLYTEMNESTRA`) correctly
  normalized, not erasures of a deliberate form (source's own
  case-glitch tag `KlLISSA`/`A NURSE` alternation was independently
  confirmed to be the *source's own* inconsistency, and the candidate
  preserves that same alternation, correcting only the letter-case OCR
  artifact); and four instances of the Greek patronymic "Atridae"/
  "Atrides" ("sons of Atreus", a form a modern reader will not
  recognize) glossed into "Atreus's son(s)" — an accessibility gloss of
  a name-form already explicit in source's own words (the patronymic
  literally means "son of Atreus"), not an invented identification of
  anything source leaves ambiguous.

## 3. Rare/archaic-vocabulary cross-reference

Full whole-book grep, word-boundary, case-insensitive, run before any
fixes: found 12 genuinely obscure archaic words retained unmodernized
(`appanage`, `assoils`, `unannealed`, `avouched`, `besprinkle`, `glozes`,
`wried`, `baulked`, `forsooth`, `avaunt`, `handselled`, `puissant`) plus
one false-friend risk (`weird` used in its obsolete "fate" sense inside
"weave the weird dance," where a modern reader will default to "strange").
Full detail and rationale in `accessibility-review-1.md`. All 13 fixed
this round (see "Fixes applied" below); post-fix sweep confirms zero
remaining.

## 4. Charged/violent/sexual-content audit

Whole-book term counts, source vs. candidate (tolerance ±2 or ±15%,
whichever is larger; every discrepancy above that read in full):

| Term class | Result |
|---|---|
| blood, slay, slain, kill, murder, stroke, blow, sword, net, snare, robe, entangle, lion, serpent, snake, curse, fury/furies, vengeance, avenge, matricide, woman, wife, mother, husband, harlot, lust, bath, laver, axe, third, triple, twice, twelve | All within tolerance or explained by legitimate synonym variance (`slay`→`kill` swap net-neutral; `father` count rise fully explained by `sire`→`father` modernization). No softening found. |
| `wanton` (3→1 raw count) | Checked all 3 source instances directly: "wax wanton" → "grow reckless" (military-discipline sense, accurate), "wantons in our ill" → "runs riot in our suffering" (accurate), "wantonness" → "wantonness" (kept verbatim, still current). Not a softening — a false alarm from surface-word counting. |
| `couch` (13→8 raw count) | Checked all 13 source instances directly: every "missing" one is a legitimate synonym ("couched upon the plain"→"bivouacked on the plain", "Couched in the foeman's land"→"lying in the enemy's land", "where we couched"→"where we slept", "Couched with the wolf"→"coupled with the wolf" — if anything *more* explicit about the mating sense, not softened — "to my couch"→"to my own bed"). No softening. |
| `paramour`, `concubine`, `harlot`, `adulter-`, `defile`, `pollut-`, `incest`, `ravish`, `virgin`, `shame` | All 1:1 or within tolerance; the Chryseis/Cassandra "seeress and harlot… true paramour" passage (ch. 10) and Clytemnestra's account of Iphigenia's sacrifice (ch. 2) checked directly — full force, nothing euphemized. |
| `rape` (0→1) | **Genuine defect, found and fixed** — see below. |

### Defect found: `rapine` → `rape` (ch. 5, para 3)

Source: *"But at Fate's judgment-seat the robber stands / Condemned of
rapine, and his prey is torn / Forth from his hands…"* — "rapine" here
means plunder/robbery (matching "the robber stands condemned" and "his
prey is torn from his hands"), the general sense of violent seizure/theft
of Helen, not a specifically sexual charge. The candidate read *"the
robber stands condemned for his rape, and his prey is torn out of his
hands"* — substituting the narrower, sexually-specific modern word
"rape" for the source's broader "rapine" (plunder/robbery). This is a
meaning-narrowing substitution, not the same defect class as
softening — if anything it sharpens the charge in a direction the source
line doesn't specify — but it changes what is being claimed and doesn't
match the parallel "robbery" sense used at the sibling occurrence of the
same word two chapters earlier (ch. 2 para 1, "wrought the rapine fell" →
correctly rendered "did the savage robbery"). Fixed to "condemned for his
plunder," matching the sibling occurrence and the surrounding
robber/prey imagery. See "Fixes applied" below.

## 5. Speaker-tag / OCR-artifact audit

Enumerated every capitalized speaker tag pattern in source (24 distinct
tags: A NURSE, A WATCHMAN, AEGISTHUS, AGAMEMNON, ANOTHER, APOLLO, ATHENA,
CASSANDRA, CHANT, CHORUS, CLYTEMNESTRA, CLYTEMNESTSA, ELECTRA, GHOST,
GHOST OF CLYTEMNESTRA, HERALD, LEADER OF THE CHORUS, ONE OF THE CHORUS,
ORESTES, OSESTES, PYLADES, SLAVE, THE PYTHIAN PRIESTESS, VOICE OF
AEGISTHUS, VOICE OF AGAMEMNON) and separately scanned for mixed-case
glitch patterns. Found exactly two genuine OCR typos (`CLYTEMNESTSA`,
`OSESTES`) and one mixed-case glitch (`KlLISSA`, lowercase L for I) — all
three correctly normalized in candidate, and confirmed this did not
erase source's own deliberate `A NURSE`/`KILISSA` alternation (source
itself switches between the two forms; candidate preserves that same
switching pattern, spelling `KILISSA` correctly each time it's used).

## 6. Second-pass whole-book re-read (step C)

After the round-1 fixes below were applied, re-read the entire corrected
file once more, specifically hunting for what the scoped checks above
(name sweep, vocabulary sweep, term-count audit) would not catch on their
own — cross-paragraph relationships, epithet drift across the trilogy's
three plays, and any residual archaism the earlier sweep's word list
didn't anticipate:

- Re-ran the archaic-word grep against the corrected file: zero remaining
  instances of all 12 flagged words.
- Re-ran the proper-noun location cross-reference against the corrected
  file: still zero missing names, same six explained "extras."
- Recomputed word-count ratios for all 771 paragraphs against source:
  only 3 flagged outliers (ratio outside 0.7–1.6), two of which are the
  paragraphs just edited (short archaic phrases legitimately expanded
  into clear modern phrasing) and one pre-existing, unedited, and
  harmless ("Ay—were such doom at hand" → "Yes — were such a doom at
  hand," a two-word source line, no content difference).
- Checked epithet consistency for Apollo (Loxias/Phoebus/Healer/king
  Apollo — all four forms appear in source at different points across
  the trilogy and are preserved at their same locations in candidate,
  not homogenized into one form) and for the Furies (source consistently
  says "Furies," never "Erinyes" — candidate matches throughout, no
  invented alternate name introduced).
- No further defects found on this pass.

## Fixes applied (round 1)

All 13 fixes applied with `books/content_edit_helpers.py`'s
`safe_replace()` (exact-match, fails on ambiguous/missing target),
verified after application with `validate_structure()` (chapter number,
paragraph count/order, no empty paragraph) and `assert_only_changed()`
(confirms the only paragraphs that actually changed are exactly the ones
intended — no collateral edits), per chapter, then re-read directly
against source one more time after writing the fixes.

| # | Ch | Para (0-based) | Old | New | Class |
|---|---|---|---|---|---|
| 1 | 7 | 19 | "the appanage of bliss" | "it is the price that comes with good fortune" | accessibility |
| 2 | 9 | 45 | "her speech glozes and slicks her purpose smooth" | "her speech flatters and smooths her purpose over" | accessibility |
| 3 | 9 | 45 | "how eager, forsooth, to greet her chief restored!" | "how eager, indeed, to greet her chief restored!" | accessibility |
| 4 | 15 | 14 | "puissant Furies of the slain" | "powerful Furies of the slain" | accessibility |
| 5 | 15 | 39 | "the net they handselled for you" | "the net they first cast upon you" | accessibility |
| 6 | 20 | 1 | "He has baulked your chase… he has wried his face in scorn" | "He has escaped your chase… he has twisted his face in scorn" | accessibility |
| 7 | 21 | 0 | "a red-handed slayer unannealed" | "a red-handed slayer still uncleansed" | accessibility |
| 8 | 21 | 6 | "Weave the weird dance" | "Weave the fateful dance" | accessibility (false-friend risk) |
| 9 | 22 | 22 | "a suckling creature's blood besprinkle him" | "a suckling creature's blood is sprinkled on him" | accessibility (quoted formula) |
| 10 | 24 | 22 | "death assoils her deed" | "her death has already paid for what she did" | accessibility |
| 11 | 25 | 2 | "his own prophet-god avouched the same" | "his own prophet-god confirmed as much" | accessibility |
| 12 | 26 | 19 | "Avaunt, fell Famine" | "Away with you, cruel Famine" | accessibility (also fixes ch/ch inconsistency) |
| 13 | 5 | 3 | "condemned for his rape" | "condemned for his plunder" | fidelity (meaning-narrowing substitution) |

Each fix verified: `safe_replace` succeeded (exact, unambiguous match);
`validate_structure` passed per touched chapter; `assert_only_changed`
confirmed the changed-paragraph set matched exactly what was intended,
chapter by chapter; JSON re-validated; final structural re-check (26
chapters, 771 paragraphs, all aligned, no empty paragraphs) passed
against the edited file.

## Coverage statement

All 26 chapters / 771 paragraphs read in full against source, not
sampled, across two full passes (before and after fixes). Proper-noun
cross-reference covers all 771 aligned paragraph pairs for 41 names in
both directions. Vocabulary sweep covers the whole book, before and
after fixes. Term-count audit covers the whole book for both violent and
sexual/marital vocabulary classes. Speaker-tag audit covers every
distinct tag form in source.

## Verdict

Thirteen defects found (twelve accessibility — archaic words the
drafting rules require rebuilding into contemporary vocabulary, left
over from the source translation's own 1900s diction; one fidelity — a
meaning-narrowing word substitution). All fixed, all independently
re-verified against source at their exact location, and a full
second-pass re-read after the fixes found nothing further. No dropped
content, no register-softening of violent or sexual material, no
epithet erasure, no proper-noun loss, no invented content, no imported
wording from another translation.
