# Continuity Sheet — Odyssey Book 10 (Tinct Clear pilot)

Prepared before drafting `candidate-v1.json`, per the drafting procedure. This
sheet governs the choices made in the frozen draft; it is descriptive of what
was actually used, not aspirational.

## Source

- `app/public/data/editions/odyssey-original-en.json`, chapter `number: 10`,
  title `"Book 10 — Aeolus, the Laestrygones, Circe"` (source spelling).
- Samuel Butler's public-domain prose translation of the Odyssey. See
  `provenance.json` → `edition_source_attribution` for the exact confidence
  level of this attribution and why it is a recorded uncertainty rather than
  a verified citation.
- Book 10 is the direct continuation of Odysseus's first-person narrative to
  the Phaeacians that begins in Book 9. Every paragraph in the source opens
  with an opening curly quote (“) because the entire book is inside that
  frame narration; it does not close and reopen per paragraph the way normal
  dialogue would.

## Characters and name mapping used in this chapter

Butler's usage → Tinct Clear usage, applied consistently:

| Butler (source) | Tinct Clear (candidate) | Notes |
|---|---|---|
| Ulysses | Odysseus | Per Tinct's established Greek-form house style; matches the Book 9 pilot. |
| Jove | Zeus | Appears once, describing Aeolus's authority over the winds. |
| Mercury | Hermes | Appears as the god who meets Odysseus on the way to Circe's house. |
| Proserpine | Persephone | Appears three times, always paired with Hades as queen of the underworld. |
| Circe | Circe | Unchanged — already the Greek form. |
| Aeolus | Aeolus | Unchanged. |
| Antiphates | Antiphates | Unchanged. |
| Laestrygonians / Laestrygones | Laestrygonians | Source chapter title spells it "Laestrygones"; body text uses "Laestrygonians." Candidate uses "Laestrygonians" throughout, including in the title, for internal consistency — this is a spelling normalization within one already-Greek name, not a translation substitution. |
| Eurylochus | Eurylochus | Unchanged. |
| Polites | Polites | Unchanged. |
| Elpenor | Elpenor | Unchanged. |
| Teiresias | Teiresias | Kept Butler's spelling (not modernized to "Tiresias") — instructions bar silently correcting Butler from outside knowledge. |
| Cyclops / Polyphemus | Cyclops / Polyphemus | Referenced once, in Eurylochus's speech (P35), recalling Book 9. Matches the name used in the Book 9 pilot for continuity. |
| Aeetes | Aeetes | Unchanged. |
| Perse | Perse | Unchanged. |
| Oceanus | Oceanus | Unchanged — already Greek. |
| Hades | Hades | Unchanged — already Greek. |
| Erebus, Acheron, Styx, Cocytus, Pyriphlegethon | unchanged | All already Greek geographical/mythological names; no Roman equivalents in play. |

No other named figures appear in this chapter.

## Recurring terms and formulas

- **"When Dawn's fingers reddened the sky"** — used once in this chapter
  (source paragraph 12, candidate P14), rendering Butler's "When the child of
  morning, rosy-fingered Dawn, appeared." This is the same formula used
  consistently in the Book 9 pilot candidate for the recurring Homeric
  dawn-formula; reused here for cross-chapter consistency per rule 10
  (consistent wording for recurring formulas).
- **Guest-suppliant scenes** — Odysseus and his men "sit down as suppliants
  on the threshold" at Aeolus's house (P05); preserved literally, since it
  matters that this is a formal supplication, not just an entrance.
- **Circe's epithets** — Butler repeatedly has Circe address Odysseus as
  "Ulysses, noble son of Laertes." Rendered consistently as "Odysseus, noble
  son of Laertes" every time it recurs (P32/candidate, P37/candidate,
  P40/candidate — source paragraphs 30, 36, 39), rather than varied for
  style, per the no-variation-for-its-own-sake rule.
- **"struck [him] with her wand" / "anointed... with a[nother] drug"** —
  Circe's two distinct magical actions (cursing into pig form, then reversing
  it) are kept as two distinct actions with two distinct instruments (wand
  vs. drug/ointment), matching the source's physical mechanics exactly. Do
  not collapse into one generic "spell."

## Necessary first-use glosses

Kept to the shortest useful explanation, per the "under eight words" target:

- **cubit** (source paragraph 42 / candidate P44): glossed inline as
  "roughly eighteen inches" at first (only) use, since it is a real unit of
  measurement that determines the physical size of the sacrificial trench,
  and a general modern reader would not otherwise know its length.
- **fathom** (source paragraph 11 / candidate P13): Butler's "a fathom or so
  of good stout rope" is rendered directly as "a stout rope about six feet
  long," folding the conversion into the description itself rather than
  keeping the word "fathom" plus a gloss, since the length (not the
  nautical term) is what matters to the action of binding the stag's feet.
  This matches the approach the editorial rules use as their own example
  ("hawsers" → "mooring ropes").
- **moly** (source paragraph 22 / candidate P24) is kept as the proper name
  "moly" — Butler already glosses it in-text ("the gods call it Moly"), so no
  additional gloss was added; adding one would be redundant with the source's
  own explanation.

## Editorial bracket note (not a source corruption)

Source paragraph 6 (candidate P08) contains two bracketed insertions in the
source JSON itself: "...driving in his sheep and goats **[to be milked]**
salutes him who is driving out his flock **[to feed]**..." These square
brackets are Butler/Gutenberg editorial insertions already present in the
source file, not paragraph corruption and not something introduced by this
draft. The candidate folds their meaning into ordinary prose ("a shepherd
driving his flock home to be milked greets another driving his flock out to
pasture") rather than reproducing the brackets, since bracketed glosses
inside modern reading prose would read as an editorial intrusion. Flagging
here per the instruction to flag rather than silently invent when source
paragraphs contain apparatus — this is apparatus-adjacent but not corrupted
or fragmentary, so no content was invented to compensate.

## Unresolved source issues

- **Edition provenance file missing.** No `SOURCE.md`, Gutenberg header, or
  translator credit was found in the repository specifically for
  `odyssey-original-en.json`. The Butler attribution rests on textual
  identification (matches Butler's well-known Odyssey prose translation,
  and matches what the Book 9 pilot session independently concluded), not on
  a located citation. Recorded as an open item — see `provenance.json`.
- **"Aeolus, the Laestrygones, Circe" vs. "Laestrygonians" spelling.** The
  source chapter title and source body text spell the same people two
  different ways ("Laestrygones" in the title, "Laestrygonians" in the
  prose). Both forms are Butler's; this is not a corruption, just an
  inconsistency inherited from the source. The candidate normalizes to
  "Laestrygonians" throughout (see name-mapping table above) for a
  consistent reader-facing edition.
- **Elpenor's death (source paragraph 45 / candidate P47).** Butler does not
  say explicitly why Elpenor was sleeping on the roof beyond "to sleep off
  his liquor in the cool" — no further explanation is given for why the roof
  specifically (flat rooftops for sleeping were ordinary in the source
  culture, but Butler doesn't state this). Nothing was added to explain it
  further; the candidate keeps Butler's own level of explanation.
- No corrupted, truncated, or mid-sentence source paragraphs were found in
  this chapter. All 49 source paragraphs are complete sentences/passages
  ending in terminal punctuation.
