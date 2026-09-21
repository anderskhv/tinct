# Acceptance Record — The Oresteia (`oresteia`, modern-en)

**Book id:** `oresteia`
**Edition:** `modern-en`
**Accepted (round 1, this record):** 2026-09-21
**Pool status:** Backup pool book (gate sim 0.614, 4 REAL-HEAVY/22 REAL
buckets), pulled into the second batch after several primary pool books
were parked/skipped.

**Model note.** This entire pass — drafting review, blind accessibility
review, source-based fidelity review, fix application, and whole-book
re-read — was done in one session by **Claude Sonnet 5** (`claude-sonnet-5`).
No paid API calls were made. Per the task instructions, this record does
**not** include a RELEASE-PACKET.md or `accepted-paragraph-hashes.tsv`; a
separate independent Opus verification pass is expected to run after this
record and will produce those.

**Staged files:** `books/wip/green-oresteia/source.json` (unmodified,
locked), `books/wip/green-oresteia/candidate.json` (round-1 corrections
below), `books/wip/green-oresteia/candidate_readable.txt` (regenerated
from the final `candidate.json`), `books/wip/green-oresteia/source_readable.txt`
(reference copy of source), `accessibility-review-1.md`,
`fidelity-review-1.md` (this round's review artifacts).

**Final file hash (candidate.json, sha256):**
`958f586d55c2ad850d5cca698eb2e1179673a435eb8a2de8a82e8bcdd3b1235c`

**Source hash (unmodified copy, for reference, sha256):**
`c6189c462535c35845f110ed8a4c4fab2ac5be8ca9e5ce0879fc185fea54818c`

No app, registry, audio, or deploy action was taken. This directory only.

---

## Structural completeness gate (run before any review work)

Per this task's explicit instruction — two of the last three books
checked in this batch (Henry V, Macbeth) turned out to have missing
content in the locked source parse — `source.json` was spot-checked for
completeness *before* being trusted as the fidelity baseline:

- Beacon-chain speech (ch. 3): present, all 14 named relay-points in
  order (Ida → Lemnos → Athos → Macistus → Messapius → Euripus → Asopus →
  Cithaeron → Gorgopis → Aegiplanctus → Saronic bay → Arachne's peak →
  the house of Atreus).
- Purple-carpet scene (ch. 7): present in full.
- Cassandra's prophecy (ch. 9, 83 paragraphs): present in full.
- Murder cries and Clytemnestra's confession (ch. 10): present in full,
  including the three-blow account.
- Recognition scene, Kommos invocation, matricide dialogue, Furies'
  pursuit (chs. 13–18): present in full.
- Furies' binding song and the Areopagus trial with the twelve
  citizen-judges and the tied vote (chs. 20–24): present in full.
- Transformation and closing procession (chs. 25–26): present in full.

**Verdict: source is structurally complete.** Full detail in
`fidelity-review-1.md` §0.

## Structure (verified against both files)

- 26 chapters in both files, all real Act/Scene-equivalent reading units
  by play and structural section (Agamemnon: Prologue, Parodos, First–
  Fourth Episode, First–Third Stasimon, Exodos — 10 chapters; The
  Libation Bearers: Prologue, Parodos, First–Third Episode, Kommos,
  Second Stasimon, Exodos — 8 chapters; The Eumenides: Prologue, Parodos,
  First–Third Episode, First–Second Stasimon, Exodos — 8 chapters). No
  apparatus, editorial-note, collation, or scene-crosswalk chapters.
- Chapter `number` sequence identical between source and candidate.
- Per-chapter paragraph counts identical, chapter by chapter: 10, 34, 21,
  14, 36, 16, 26, 17, 83, 71, 3, 8, 41, 19, 63, 6, 105, 4, 9, 38, 14, 25,
  9, 62, 6, 33 — **771 paragraphs total in both files**, order locked, no
  empty or whitespace-only paragraph on either side.
- JSON valid in both files (`python3 -m json.tool`).

## Methodology (per this book's specific task instructions, not a
generic scoped sweep)

Full detail in `accessibility-review-1.md` and `fidelity-review-1.md`.
Summary:

1. Full non-sampled read of the entire candidate (all 771 paragraphs) for
   accessibility, before any source comparison.
2. Full non-sampled paragraph-by-paragraph comparison against source for
   fidelity.
3. Location-keyed proper-noun/epithet cross-reference for 41 names,
   checked in both directions across all 771 aligned paragraph pairs —
   built from names actually present in this book, not a preset list.
4. Rare/archaic-vocabulary cross-reference, built fresh from words
   actually noticed while reading, swept whole-book before and after
   fixes.
5. Charged/violent/sexual-content term-count audit (built from this
   book's own vocabulary, not a preset list), every discrepancy above
   tolerance read in full, both directions.
6. Speaker-tag/OCR-artifact audit across every distinct tag form in
   source, to separate genuine OCR glitches from deliberate source forms.
7. A second full whole-book re-read after fixes, specifically hunting for
   what the scoped checks above would not catch on their own.

## Defects found and fixed (round 1) — 13 total

**12 accessibility defects** (archaic words from the source translation's
own 1900s diction, left unmodernized against the drafting rule requiring
difficult period vocabulary to be rebuilt into ordinary contemporary
wording): `appanage`, `glozes`, `forsooth`, `puissant`, `handselled`,
`baulked`+`wried` (same paragraph), `unannealed`, `weird` (false-friend
risk, not just obscurity — modern readers default to "strange," not the
source's "fate-bound" sense), `besprinkle` (inside a quoted ritual-law
formula — quoted formulas are not exempt from modernization per the
drafting rules), `assoils`, `avouched`, `avaunt` (also an internal
consistency fix — the same word was already correctly modernized to "Get
out" earlier in the book).

**1 fidelity defect:** ch. 5 para. 3, source's "rapine" (plunder/robbery)
was rendered as "rape," a meaning-narrowing substitution that doesn't
match the surrounding robber/prey imagery or the sibling occurrence of
the same source word two chapters earlier (correctly rendered "savage
robbery"). Fixed to "plunder."

Full before/after text, exact locations, and the reasoning for each fix
are in `fidelity-review-1.md`. All fixes applied with
`books/content_edit_helpers.py`'s `safe_replace()`, verified with
`validate_structure()` and `assert_only_changed()` per touched chapter,
and independently re-read against source after application. A
second full whole-book re-read after all fixes (step C) found no further
defects; the archaic-word sweep and proper-noun cross-reference were both
re-run against the corrected file with clean results.

## Reviewed and judged non-blocking (with reader-centered reasons)

- **Mild period vocabulary still in active modern use**: `hark` (7×,
  deliberately consistent at moments of alarm/prophecy), `yonder`,
  `unto`, `meed`, `troth`/`plighted troth`, `dowered`, `wend`,
  `forthwith`, `ere`, `anon` (2× as the doorway idiom "Anon, anon!"),
  `whence`. Reason: none of these risks a false reading (unlike `weird`
  or `baulked`), all remain within ordinary modern reading competence via
  Bible idiom, historical fiction, or common literary use, and rewriting
  all of them would flatten the chorus's deliberately formal/ritual
  register without a corresponding accessibility gain. The drafting
  rules explicitly allow already-clear wording to stand.
- **`wanton`/`couch` raw-count drops** (3→1 and 13→8 respectively): both
  investigated instance-by-instance against source; every "missing"
  instance is a legitimate synonym substitution with meaning fully
  preserved (in one case, "coupled with the wolf" for "Couched with the
  wolf" is arguably *more* explicit about the mating sense, not less).
  Not a softening — a false alarm from surface word-counting, documented
  as such rather than silently dismissed.
- **Apollo's varying epithets** (Loxias / Phoebus / Healer / "king
  Apollo") kept exactly where source uses each, not homogenized into one
  form — this is the source's own deliberate variation across the
  trilogy, not drift.
- **"Furies" (never "Erinyes")** kept consistent with source throughout;
  no alternate name invented.
- **Source's own OCR-era typos** in two speaker tags (`OSESTES`,
  `CLYTEMNESTSA`) and one case-glitch (`KlLISSA`) corrected to the
  evident intended spelling — this is fixing a transcription artifact,
  not altering a deliberate source form; source's own genuine
  inconsistency (alternating `A NURSE`/`KILISSA` as the speaker tag) is
  preserved as-is.
- **Four "Atridae"/"Atrides" → "Atreus's son(s)" glosses**: this Greek
  patronymic (literally "son of Atreus") is not a form a general modern
  reader will parse, and the gloss states nothing beyond what the
  patronymic itself already names — not an invented identification of
  anything source leaves ambiguous.

## Frank/violent/sexual content — verified at full force, not softened

Checked directly against source, not assumed from aggregate counts alone:
the full three-blow murder account and "sweeter than rain" line (ch. 10),
Cassandra's visions of the children of Thyestes and her own death
foretelling (ch. 9), the "seeress and harlot… true paramour" passage and
Iphigenia's sacrifice account (chs. 2, 10), the Furies' blood-drinking
threats ("suck it out, red, clotted, gout by gout… waste you living,
nerve and vein," ch. 21), and Apollo's graphic catalogue of battle
mutilation (ch. 20, "heads lopped from necks, eyes plucked from their
sockets… men impaled"). Nothing diluted, nothing euphemized beyond what
modern vocabulary requires.

## Coverage table

| Step | Coverage |
|---|---|
| Structural-completeness gate | Whole book, before any review work |
| Accessibility read (candidate-only) | 26/26 chapters, 771/771 paragraphs |
| Fidelity read (vs. source) | 26/26 chapters, 771/771 paragraphs |
| Proper-noun/epithet location cross-reference | 771/771 aligned paragraph pairs, 41 names, both directions |
| Archaic-vocabulary sweep | Whole book, before and after fixes |
| Charged/violent/sexual-content term audit | Whole book, both directions, every outlier read in full |
| Speaker-tag/OCR audit | All 24 distinct tag forms in source |
| Fixes applied | 13/13, each `safe_replace`-scoped, structure-revalidated, `assert_only_changed`-confirmed |
| Second whole-book re-read (step C) | 26/26 chapters, 771/771 paragraphs, post-fix |
| Verify + pin | Final structural re-check passed; hash computed on final file |

## Verdict

**ACCEPTED (round 1).** Source confirmed structurally complete before
review. Structure matches source exactly: 26/26 chapters, 771/771
paragraphs, aligned, no empty paragraphs, valid JSON. Thirteen defects
found by a genuinely non-scoped, non-sampled methodology (twelve
accessibility, one fidelity), all fixed and independently re-verified
against source at their exact location; a dedicated second pass
afterward, built specifically to catch what a scoped sweep would miss,
found nothing further. No dropped content, no epithet erasure, no
proper-noun loss, no register-softening of violent or sexual material, no
imported wording from another translation, no invented interpretation.

Accepted text is pinned to
`958f586d55c2ad850d5cca698eb2e1179673a435eb8a2de8a82e8bcdd3b1235c`.

**READY FOR INDEPENDENT VERIFICATION.**
