# Acceptance Record — The Oresteia (`oresteia`, modern-en)

**Book id:** `oresteia`
**Edition:** `modern-en`
**Round 1 (Sonnet):** 2026-09-21 — 13 defects fixed, self-certified clean.
**Round 2 (independent Opus verification, this record):** 2026-09-21 — **ACCEPTED.**
**Pool status:** Backup pool book (gate sim 0.614, 4 REAL-HEAVY/22 REAL
buckets), pulled into the second batch after several primary pool books
were parked/skipped.

**Model note.**
- Round 1 — drafting review, blind accessibility review, source-based
  fidelity review, fix application, whole-book re-read: **Claude Sonnet 5**
  (`claude-sonnet-5`).
- Round 2 — independent adversarial fidelity verification, rebuilt from
  `source.json` from scratch without reusing round 1's word lists:
  **Claude Opus** (`claude-opus-5`).

No paid API calls were made in either round. No app, registry, audio, or
deploy action was taken. This directory only.

**Staged files:** `source.json` (unmodified, locked), `candidate.json`
(round-1 + round-2 corrections), `candidate_readable.txt` (regenerated from
the final `candidate.json`), `source_readable.txt`, `accessibility-review-1.md`,
`fidelity-review-1.md`, `accepted-paragraph-hashes.tsv`.

**Accepted file hash (candidate.json, sha256):**
`8daaaf8606b4e9d24bf6d4e2a759ca4464df42f0d547bf993cb55b91fa36b371`

**Source hash (unmodified, sha256):**
`c6189c462535c35845f110ed8a4c4fab2ac5be8ca9e5ce0879fc185fea54818c`

**Hash note.** Round 1 pinned
`958f586d55c2ad850d5cca698eb2e1179673a435eb8a2de8a82e8bcdd3b1235c`. Round 2
independently recomputed that hash on the file as received and it **matched**
— round 1's pin was accurate for its own output. The accepted hash differs
only because round 2 applied three further corrections (below). The accepted
hash is pinned to the file state *after* those corrections and *after* their
re-verification, per `TRANSLATION_PROTOCOL.md` step D.

---

## Structure (independently re-derived in round 2, not carried over)

- 26 chapters and **771 paragraphs** in both files; chapter `number`
  sequence and per-chapter paragraph counts identical, chapter by chapter:
  **8**, 34, 21, 14, 36, 16, 26, 17, 83, 71, 3, 8, 41, 19, 63, 6, 105, 4, 9,
  38, 14, 25, 9, 62, 6, 33.
- All 26 are real Act/Scene-equivalent reading units (Agamemnon 10, The
  Libation Bearers 8, The Eumenides 8). No apparatus, collation, editorial
  or scene-crosswalk chapters.
- JSON valid in both files; no empty or whitespace-only paragraph.

**Correction to round 1's record.** Round 1's per-chapter paragraph list
opened with `10` for chapter 1; the true count is **8**, and round 1's
printed list sums to 773 rather than 771. The underlying files were always
correct and aligned — this was a transcription error in the round-1 record
only, corrected here.

## Source completeness (re-checked in round 2 with different passages)

Round 2 did not rely on round 1's spot-checks. Independently confirmed
present and complete: the Watchman's opening speech (ch1); the chorus's
account of the fleet at Aulis, the thwarting Strymon blast and Iphigenia's
sacrifice (ch2); Clytemnestra's beacon-relay speech in full, all relay
points Ida → Lemnos → Athos → Macistus → Messapius → Euripus → Asopus →
Cithaeron → Gorgopis → Aegiplanctus → the Saronic cape → Arachne's peak →
the roof of Atreus's sons (ch3 p16); the purple-carpet stichomythia (ch7);
Cassandra's full prophecy scene (ch9, 83 paragraphs); the three-blow murder
account and the Thyestean-banquet narration (ch10); Orestes' recognition
scene with Electra — lock, footprints and woven robe (chs13–14); the Kommos
(ch15); the matricide stichomythia (ch17); the Furies' binding song (ch21);
the Areopagus trial with the twelve judges, Apollo's parentage argument and
Athena's casting vote (ch24); the closing torchlit procession and final
chant (ch26). **Source is structurally complete.**

## Round-2 methodology (rebuilt from scratch; round 1's lists not reused)

1. **Full non-sampled word-for-word read of all 771 aligned source/candidate
   paragraph pairs**, read as an interleaved S/C file end to end — not
   sampled, not packet-scoped.
2. **Structure + hash re-derivation** from both JSON files directly.
3. **Compression/content-loss sweep** over all 771 paragraphs by word-count
   ratio. Lowest ratio in the whole book is **0.82**; only 34 paragraphs
   fall below 1.00, all by one to three words. Every sub-1.00 paragraph was
   read in full. No dropped clause, sentence or image found.
4. **Similarity sweep.** Mean paragraph similarity 0.635 — a genuine
   rendering, not mechanical modernization. The 64 byte-identical paragraphs
   are **all stage directions**, which are already plain modern English;
   `Exeunt`, `Exeunt omnes`, `Re-enter` and `Exit` are preserved throughout
   (the Merchant-of-Venice `Exeunt`→`Exit` failure class is absent here).
5. **Erasure sweep (both directions).** Every word form present in source
   but absent from candidate (904 of them) was enumerated and triaged; every
   content-bearing one — `losel`, `beldame(s)`, `leech`, `recreant`, `gauds`,
   `victual`, `teen`, `welter`, `wight`, `batten`, `charnel-scent`, `corse`,
   `bride-bed`, `marriage-bed`, `spouse`, `banquet`, `babes`, `wanton(s)`,
   `sucks`, `sucking`, `atridae`/`atrides` — was read at its exact location
   against its candidate counterpart. All are legitimate synonym
   substitutions with meaning preserved. The reverse direction (657
   candidate-only word forms) was also enumerated: all are ordinary
   modernization vocabulary; no invented content, no imported proper noun,
   no wording from another translation.
6. **Independent charged-content register audit**, word list built fresh
   from this book's own vocabulary (89 terms across violence, sexual/marital,
   bodily and cannibalism classes), each discrepancy read in full at its
   location.
7. **Location-keyed proper-noun/epithet map**, built independently, including
   epithet variation across the three plays.
8. **Rare-word / archaic-vocabulary cross-reference** built fresh from the
   candidate's full 4,515-word vocabulary, read in full.
9. **Re-derivation of all 13 round-1 fixes** from `source.json` at their exact
   locations, plus a sibling sweep for every fixed word in both files.

## Round 1's 13 fixes — independently re-verified

All 13 were re-derived from `source.json` at their exact locations and
**confirmed correct**: `appanage`, `glozes`, `forsooth`, `puissant`,
`handselled`, `baulked`+`wried`, `unannealed`, `weird`, `besprinkle`,
`assoils`, `avouched`, `avaunt`, and the `rapine` fidelity fix.

Specifically on `rapine` (ch5 p3): source reads *"at Fate's judgment-seat the
robber stands / Condemned of rapine, and his prey is torn / Forth from his
hands."* "Rapine" here is plunder/violent seizure — the subject is *the
robber*, the object *his prey torn from his hands*, and the sibling
occurrence at ch2 p1 ("wrought the rapine fell") is correctly rendered
"did the savage robbery". Round 2 confirms "plunder" **restores** the
source's meaning rather than merely swapping a synonym: the candidate's
earlier "rape" narrowed a general charge of violent theft into a specific
sexual one the line does not make. The passage's sexual dimension is not
erased by the fix — the same paragraph still reads "for his guilt and lust".

None of the 12 modernized words was load-bearing: each was checked for a
deliberate stylistic or ritual function. The one genuine ritual formula
among them (`besprinkle`, inside the quoted purification law at ch22 p22)
keeps its quoted-maxim framing and its exact ritual content
("a suckling creature's blood is sprinkled on him").

## Round-2 defects found and fixed — 3 total

Round 1 stated its post-fix sweep found "zero remaining instances of all 12
flagged words" and that a second whole-book pass "found no further defects".
Round 2's independent sweep found three live defects.

| # | Ch | Para (0-based) | Source | Round-1 candidate | Corrected to | Class |
|---|---|---|---|---|---|---|
| 1 | 9 | 14 | "Cureless, abhorred, that one is plotting here" | "a **curseless**, abhorrent thing…" | "an **incurable**, abhorrent thing…" | fidelity — meaning inversion |
| 2 | 21 | 3 | "there where thou shalt dree / **The weird** of agony" | "endure the **weird** of agony" | "endure **your fated** agony" | accessibility — missed sibling of a round-1 fix |
| 3 | 23 | 3 | "**[**O Justice, aid! aid, O ye thrones of Hell!**]**" | brackets dropped | brackets restored | source printed form |

**Why each is narrow and mechanical, not a recurring class:**

1. **ch9 p14 `Cureless` → `curseless`.** A single-character typo that
   inverts the sense: the source calls the plotted crime *incurable*; the
   candidate called it *without a curse*, in a speech whose entire point is
   that the house's curse is compounding. `curseless` appears exactly once
   in the candidate and nowhere in the source, and it is not an English word
   in this context. One location, one unambiguous correct reading.
2. **ch21 p3 `weird`.** Source uses the obsolete noun `weird` (= fate) at
   exactly two locations, ch21 p3 and ch21 p6. Round 1 fixed p6 ("Weave the
   weird dance" → "Weave the fateful dance") and missed p3, while reporting
   the word cleared. This is the partial-fix-of-a-repeated-form shape that
   hard-parked other books in this batch — but here the class is a single
   word with exactly two occurrences, one of which was already decided, so
   the remaining fix is mechanical and the policy was already set by round 1.
   A whole-book sibling sweep was run for **all** 13 round-1 fixed words in
   both files: `weird` was the only one with a survivor.
3. **ch23 p3 brackets.** The source sets certain interjected/quoted cries
   inside square brackets, distinct from its bracketed stage directions.
   The candidate preserves those brackets at ch6 p14, ch10 p2 and ch26 p31
   and dropped them at ch23 p3 alone. Restoring them makes the treatment of
   the source's own printed form consistent. Punctuation only; no wording
   changed.

All three were applied with `books/content_edit_helpers.py`'s
`safe_replace()` (exact-match, fails on missing or ambiguous target),
validated per touched chapter with `validate_structure()` and
`assert_only_changed()`, and confirmed book-wide: the set of paragraphs that
actually changed is exactly `{(9,14), (21,3), (23,3)}` and nothing else.
JSON re-validated; 26 chapters / 771 paragraphs / no empty paragraph
re-confirmed against source after the edits; each changed paragraph re-read
against source with neighbouring context.

## Register and frank-content verdict (round 2's own audit)

The dispatch brief's specific risk for this book — choric/lyric passages
flattened into ordinary conversational prose — **did not materialize.** The
odes keep an elevated, formal register: apostrophe and vocative order are
preserved ("O Earth — woe, woe, for you, for me!"), ritual refrains are
repeated verbatim where source repeats them (the Furies' "Hear the hymn of
hell" strophe, the "Woe upon you, younger gods!" refrain at ch25 p0/p4, the
"Ah, sorrow and sorrow! but may the outcome be fair!" parodos refrain),
inversions are retained where they carry weight ("Of Justice are we
ministers", "hard at his side are we!", "Bonds not of brass ensnared you"),
and the grave accents in `stainèd`, `damnèd`, `singèd` are preserved.

**Nothing in the trilogy's dark content is softened.** Verified word for
word at source: the Thyestean cannibalism, twice — Cassandra's
"the entrails on which their father fed" (ch9 p44) and Aegisthus's full
narration including the hidden fingers and feet, the eating, and the
spewing forth of the foul fragments (ch10 p47); Iphigenia's sacrifice with
the bit in her mouth and the saffron robe (ch2 p32–33); the three-blow
murder with the "bubbling jets of gore" and Clytemnestra's "I was glad to
feel that dew" (ch10 p22); the "seeress and harlot… true prophetess and
true paramour" passage with the rower's-bench line intact (ch10 p29); the
Furies' blood-drinking threat, "red, clotted, gout by gout… I will waste you
living, nerve and vein" (ch21 p3) and "living shall you see your flesh
become my food" (ch21 p5); Apollo's mutilation catalogue, "heads lopped from
necks, eyes plucked from their sockets, hacked flesh, the flower of youthful
seed crushed out… men impaled" (ch20 p16); the incest reference, "the
brother's couch, the incestuous love that brought forth hatred against the
ravisher" (ch9 p30); the sexual-violence image "when man's force opens the
virgin gates" (ch12 p6); the serpent-at-the-breast dream with the teat and
the clot of blood in the milk (ch15 p50–59); Clytemnestra baring her breast
to Orestes (ch17 p59); "he died the death the law bids adulterers die"
(ch17 p92). Charged-term counts run essentially 1:1 source-to-candidate
across 89 terms, and every divergence was read in context and explained by
legitimate synonym choice.

## Reviewed and judged non-blocking (round 2, with reasons)

- **`Be steel deep-dyed` (ch5 p22)** → "Steel must run deep with blood
  before you look to see ill joy or ill fame from any other man — least of
  all in me!" The candidate supplies the image "with blood" that the
  source's "deep-dyed" only implies. Left as is: the source line is an
  obscure adynaton (Clytemnestra naming an impossibility), the candidate
  preserves that "never" sense and its dramatic irony, and re-rendering it
  risks making an already-difficult line worse for no fidelity gain.
  Documented so a future reviewer can re-open the call.
- **Residual archaic vocabulary — correcting round 1's overstated claim.**
  Round 1's accessibility review asserted "zero blocking terms remain".
  That is an overstatement. A fresh sweep of the candidate's full
  4,515-word vocabulary finds period words round 1 neither fixed nor listed
  among its documented non-blocking set: `fane`, `laver`, `lustral`,
  `glaive`, `spilth`, `furze`, `kine`, `bier`, `eyrie`, `obsequies`,
  `festal`, `coeval`, `imbrued`, `dastard`, `despiteful`, `aweless`,
  `bethink`, `wroth`, `wont`, `straitly`, `bale`, `alack`, `hist`.
  **Not treated as blocking, and deliberately not "fixed" by round 2**, for
  reader-centred reasons: (a) none of these is a fidelity defect — each is
  the source's own word retained, which is the opposite of the erasure class
  that parked other books in this batch; (b) none produces a false reading
  the way `weird` and `baulked` would; (c) several (`laver`, `lustral`,
  `obsequies`, `festal`, `kine`, `bier`) are the text's ritual and
  sacrificial register, where a flatter word would cost more than it gains;
  and (d) the drafting rules set no rewrite-percentage target and allow
  already-clear wording to stand. What the candidate does do is modernize
  most of these inconsistently — source→candidate paragraph counts run
  `fane` 7→4, `bale` 7→1, `spilth` 3→2, `dastard` 2→1, `imbrued` 2→1,
  `straitly` 2→1, `aweless` 3→2 — i.e. the same word is rebuilt at some
  locations and kept at others. That inconsistency is an **accessibility
  polish item, logged here for a future pass**, not an acceptance blocker,
  and it is recorded rather than silently passed over so the call can be
  re-opened.
- **Source's own OCR artifacts** (`OSESTES`, `CLYTEMNESTSA`, `KlLISSA`,
  `Abhorredd`, `hast'not`, `Mv`, `Chalics`, `flex-mesh`, `tine`) — round 2
  independently confirmed each is a transcription glitch, not a deliberate
  source form, and that the candidate's normalization of them does not erase
  the source's *genuine* `A NURSE`/`KILISSA` speaker-tag alternation, which
  is preserved.

## Coverage table (round 2)

| Step | Coverage |
|---|---|
| Structure + hash re-derivation | Whole book, from both JSON files directly |
| Source-completeness re-check | Whole book, passages chosen independently of round 1 |
| Word-for-word source/candidate read | 26/26 chapters, **771/771** paragraphs, non-sampled |
| Compression/content-loss sweep | 771/771 paragraphs; all 34 sub-1.00-ratio paragraphs read in full |
| Erasure sweep (source→candidate) | All 904 missing word forms triaged; all content-bearing ones read at location |
| Addition sweep (candidate→source) | All 657 candidate-only word forms enumerated |
| Charged/violent/sexual register audit | 89 terms, whole book, every divergence read in context |
| Proper-noun / epithet location map | 771/771 aligned pairs, both directions |
| Rare-word / archaic sweep | Candidate's full 4,515-word vocabulary, read in full |
| Round-1 fix re-derivation | 13/13 re-derived from source at exact location, plus sibling sweep for each |
| Fixes applied (round 2) | 3/3, `safe_replace`-scoped, structure-revalidated, changed-set confirmed book-wide |
| Verify + pin | Final structural re-check passed; hash computed on the post-fix file |

## Verdict

**ACCEPTED.** Source confirmed structurally complete by an independent
re-check. Structure matches source exactly: 26/26 chapters, 771/771
paragraphs, aligned, no empty paragraphs, valid JSON. Round 1's 13 fixes all
independently confirmed correct at their exact locations. Round 2's own
from-scratch sweeps found three further defects — one meaning-inverting typo,
one missed sibling of a word round 1 had already decided, one dropped bracket
pair — each narrow, each with a single unambiguous correct answer, each
fixed and re-verified. They do not constitute a recurring class requiring
further judgment: the erasure/register-softening pattern that hard-parked
Merchant of Venice, Merry Wives and Romeo and Juliet is **absent** here, and
a full non-sampled word-for-word read of every paragraph found no dropped
content, no imported wording from another translation, no invented
interpretation, no proper-noun or epithet loss, and no softening anywhere in
this trilogy's very dark material.

Accepted text is pinned to
`8daaaf8606b4e9d24bf6d4e2a759ca4464df42f0d547bf993cb55b91fa36b371`,
with per-paragraph hashes in `accepted-paragraph-hashes.tsv` (771 rows,
1-based paragraph numbering).
