# Fidelity Review — The Epic of Gilgamesh (modern-en candidate)

Reviewer/drafter/repair agent: Claude Sonnet 5 (this session), acting as
Reviewer B per `books/prompts/fidelity-review-prompt.md`, and also
performing the round-D corrections per `TRANSLATION_PROTOCOL.md`. This
record covers the full pipeline in one pass rather than a separate
drafter + independent reviewer, because the work was a repair/acceptance
pass on an already-existing candidate, not fresh drafting — every claimed
defect below was independently re-derived directly against `source.json`
(not trusted from any prior note), and every fix was independently
re-checked against source after being applied, per the "Applying
corrections without introducing new defects" section of the protocol.

**Coverage:** Full, non-sampled. All 12 chapters / 253 paragraphs of
`source.json` vs `candidate.json` were read side by side in ~5-10
paragraph packets with neighboring context, followed by a whole-book
cross-boundary re-read (round 2, below) and a final proper-noun sweep
(`re.findall` over every capitalized token in both files, counted and
diffed) to catch any remaining silent renamings a linear read could miss.

## Round 1 — packeted read, defects found and fixed

All fixes applied via `content_edit_helpers.safe_replace`, each verified
against `source.json` and structure-validated
(`validate_structure`/`diff_report`) after every edit.

1. **Silent name "correction" — Bel → Enlil.** Tablet I §16: source reads
   "Anu, Bel, and Ea are whispering (wisdom) into his ear." Candidate had
   "Anu, Enlil, and Ea whisper wisdom into his ear." Every other Enlil
   occurrence in the book (17 of them) is genuinely "Enlil" in source too
   — this one paragraph is the sole "Bel" in source, and it had been
   silently harmonized to the more common name. **Fixed**: restored "Bel."

2. **Silent name "correction" — Imini → Irnini.** Tablet V §0: source's
   sole use of "Imini" (an epithet for the cedar-mountain sanctuary,
   printed once in the whole book) had been "corrected" to the
   more scholarly-standard "Irnini." **Fixed**: restored "Imini."

3. **Systematic name harmonization — Sirudi/Urshinabi → Siduri/
   Urshanabi, chapter 10 only.** Source itself spells the tavern-keeper's
   name inconsistently *within Tablet X specifically* — "Siduri" once,
   then "Sirudi" six times (even within the same paragraph, §0) — and
   spells the boatman "Urshinabi" throughout Tablet X but "Urshanabi" in
   Tablet XI. This is very likely a seam between two source fragments
   stitched into one translation, exactly like the Sirudi/Siduri
   inconsistency itself, and — per the standing instruction not to
   silently harmonize a source's own internal name variation — needed to
   be preserved chapter by chapter. The candidate had normalized *all* of
   Tablet X to "Siduri"/"Urshanabi," erasing the Tablet X vs Tablet XI
   distinction. **Fixed**: restored "Sirudi"/"Urshinabi" throughout
   Tablet X (paragraphs 0-3, 6-18) to match source's actual chapter-10
   spelling; left Tablet XI's "Urshanabi" untouched since that already
   matches source there.

4. **Systematic word substitution — "Hades" → "underworld"/"afterlife," 13
   of 13 occurrences.** Source deliberately uses the proper noun "Hades"
   in Tablets III, VI, VII, VIII, IX, and XII (13 instances total),
   alongside a separately-used "netherworld" that appears specifically
   within Tablet XII (itself drawn from a different source tradition, the
   Sumerian "Gilgamesh and the Netherworld" poem tacked onto the Akkadian
   epic). The candidate had replaced every "Hades" instance with
   "underworld" or, once, "afterlife," erasing the source's own
   terminology choice and the Hades/netherworld distinction between
   tablets. **Fixed**: restored "Hades" at all 13 source locations
   (Tablet III §9; Tablet VI §7; Tablet VII §1, §10; Tablet VIII §7;
   Tablet IX §3 [×2], §4; Tablet XII §0, §1, §2, §3, §17), leaving
   Tablet XII's genuine "netherworld" paragraphs (§4-§7) untouched since
   those already match source.

5. **Proper noun dropped — Asakku → "Disease."** Tablet XII §4-§7: source's
   refrain names the specific demon "Asakku" ("Asakku has not snatched him
   away") four times; candidate had genericized this to "Disease" each
   time. **Fixed**: restored "Asakku" in all 4 occurrences.

6. **Proper place names dropped.** Tablet XII §5-§7: source has Gilgamesh
   pray at three named temples — "Ekur the House of Enlil," "Ur the House
   of Sin," "Eridu the Temple of Enki" — candidate dropped all three place
   names ("Ekur," "Ur," "Eridu"), keeping only the generic "House of X" /
   "Temple of X." **Fixed**: restored all three place names.

7. **Proper noun dropped — Ebabbara.** Tablet VII §2: source has Enkidu
   say he would have rafted the door "to Ebabbara to place you as portal
   to the temple of Shamash" — candidate dropped "Ebabbara" (Shamash's
   temple name at Larsa/Sippar) entirely, leaving only "the temple of
   Shamash." **Fixed**: restored "Ebabbara."

8. **Silent name "correction" — Niir → Nisir.** Tablet XI §14: source's
   "Mount Niir" (×2 in that paragraph) had been silently corrected to the
   more standard scholarly spelling "Nisir." **Fixed**: restored "Niir."

9. **Lacuna markers erased instead of preserved (7 instances).** Per the
   standing instruction not to invent bridging text for a source's own
   marked gaps:
   - Tablet II §18, §21; Tablet IX §8 — source has a leading run of dots
     (`………`) before a quoted line, signaling missing lead-in text.
     Candidate dropped the dots and began the quote as if it were
     complete. **Fixed**: restored a leading ellipsis in each.
   - Tablet II §21 — additionally, the candidate had filled *inside* the
     gap with an invented connective ("There is Humbaba, the terrible
     one...") rather than preserving the dots. This is the clearest case
     of inventing replacement text for a lacuna. **Fixed**: restored both
     internal ellipsis runs, removed the invented "There is."
   - Tablet III §9 — source has a trailing `…………` after the closing
     quote, signaling the tablet breaks off. Candidate dropped it.
     **Fixed**: restored a trailing ellipsis.
   - Tablet V §3 — source has an internal `…….` *and* a short surviving
     fragment after it ("in my belly"), i.e. genuine content plus a
     lacuna, not just a lacuna. The candidate had dropped both the dots
     **and** the surviving fragment "in my belly" — an outright content
     omission, not just a marker loss. **Fixed**: restored both the
     ellipsis and "in my belly."
   - Tablet X §1 — source's "But Gilgamesh listened…." (trailing off,
     followed by a terse present-tense fragment "Lifts up his chin")
     likely reflects the tablet's own rough/telegraphic state at this
     point. Candidate had smoothed this into an unmarked plain sentence.
     **Fixed**: restored the ellipsis; kept the tense-normalization to
     past tense (an ordinary, licensed modernization, not a fidelity
     issue) since only the *marker* needed restoring, not the archaic
     tense.
   - Tablet XI §7 — source has an explicit bracketed lacuna, "the […] men
     […]," between "the reed-worker with his flattening-stone" and "The
     rich men brought pitch." Candidate had replaced the bracketed gap
     with an invented full sentence, "Everyone assembled." This is the
     same class of defect as item 9's Tablet II §21 case (inventing
     bridging text for a marked gap) and, per the task's explicit
     standing instruction (see the Oedipus at Colonus precedent), is a
     hard rule violation. **Fixed**: restored the bracketed gap as
     "The [...] men [...]."; this same paragraph had also lost the name
     "Atra-hasis" (Utnapishtim's self-reference by his other epithet,
     "Atra-hasis's gate") in favor of "my gate" — restored, see item 10.

10. **Name dropped inside a first-person narration — "Atra-hasis."**
    Tablet XI §7 and §20: Utnapishtim's flood narrative twice refers to
    himself in the third person by his other name, "Atra-hasis" — once as
    "Atra-hasis's gate," once in Ea's quoted speech ("I only caused
    Atra-hasis to see it in a dream"). Candidate had silently replaced
    both with "my gate" / "Utnapishtim" respectively, erasing the
    deliberate dual-name device. **Fixed**: restored "Atra-hasis" in both.

## Non-content data defect found and fixed

11. **Stray Python-list-literal artifacts (`',` ) left on 10 paragraph
    endings, Tablet XI only** (paragraphs 3, 5, 7, 8, 9, 10, 11, 12, 15,
    19). This predates this repair session — confirmed present in the
    live production file
    `app/public/data/editions/gilgamesh-modern-en.json` before any edits
    here — and is not a fidelity issue but a mechanical generation bug: a
    literal `',` (closing quote + comma, as if from an unclosed Python
    list literal) was appended to the end of these ten paragraph strings.
    A reader would see garbage characters at the end of each. **Fixed**:
    stripped the stray `',` from all 10 paragraphs; verified the
    remaining text is otherwise byte-identical and the strip did not
    touch any real content (each ended cleanly in a colon or period
    beforehand).

## Round 2 — whole-book cross-boundary re-read

After all round-1 fixes were applied, re-read the entire book once more,
source vs. final candidate, paragraph by paragraph (not sampled), plus a
dedicated proper-noun frequency sweep (every capitalized token ≥4 letters,
counted in both files and diffed) specifically to catch any remaining
silent renaming or dropped-name pattern a linear read could miss. This
sweep is what surfaced items 4, 5, 6, and 7 above (Hades, Asakku, the
three temple names, Ebabbara) — none of these were caught in the initial
packeted read, which is why the sweep is recorded as a distinct,
mandatory step and not treated as redundant with round 1.

No further defects were found on the second pass. Recurring
epithets/names checked for cross-book consistency after every fix
(Enkidu, Shamhat, Humbaba, Utnapishtim, Ninsun, Anu, Enlil, Ea, Shamash,
Ishtar, Sirudi/Siduri, Urshinabi/Urshanabi, Ereshkigal, Namtar, Nergal,
Anunnaki, Igigi) — each grepped for full-book occurrence counts in both
files before being considered settled.

## Non-blocking items (deliberately preserved, reader-centered reason)

- **"gar" / "double-hour" units left untranslated** — see
  accessibility-review-1.md. Preserving exact sourced quantities without
  inventing a conversion is more faithful than guessing at one.
- **Tablet VII §2's bracketed translator footnote, "[1 gar = 12 or 14
  cubits]," omitted from the candidate.** This is the translator's own
  editorial aside (a unit-conversion note), not part of Enkidu's spoken
  claim to the door, and inserting it mid-sentence in the modern
  rendering would break the flow of a monologue for a footnote with no
  narrative content. Distinguished from the other lacuna cases above,
  which are gaps in the *narrative text itself*, not editorial asides.
- **"Heaven-Bull" reordered to "Bull of Heaven" throughout.** A compound
  epithet reordered to natural modern English word order; the source
  itself is inconsistent about compound ordering elsewhere ("Forest of
  Cedar" vs "Cedar Forest," both used by the source), so this is ordinary
  syntax modernization, not information loss.
- **Formulaic dropped-letter typos in source** ("Utnapishim," "Gilamesh,"
  "Gigamesh," "Gilagmesh," "Gilgamsh") normalized to the book's
  overwhelmingly dominant spelling. Distinguished from the Sirudi/Siduri
  and Urshinabi/Urshanabi cases: those are consistent, multi-instance
  spelling patterns that hold across an entire tablet (evidence of a
  genuine source-side naming choice), where these are isolated
  single-letter-dropped OCR-type typos with no pattern of their own.
- **Lacuna markers correctly already preserved and left alone**: Tablet II
  §9 ("About nine lines missing"), §16, Tablet III §11, Tablet V §1,
  Tablet VII §11, §15, Tablet VIII §8, §11, Tablet IX §10, Tablet X §21,
  §25. These were already faithfully rendered in the original candidate
  and needed no fix — confirmed by direct comparison during round 1.

## Verdict

**ACCEPT WITH FIXES REQUIRED** at the start of this review; **all required
fixes have been applied and independently re-verified against source** as
of this file's writing. Final state: **ACCEPT AS-IS**.
