# Acceptance Record — Twelfth Night (`twelfth-night`, modern-en)

**Status: ACCEPTED** (round 4, independent adversarial verification).
**Book id:** `twelfth-night` · **Edition:** `modern-en`
**Accepted:** 2026-09-21

**Final candidate.json sha256 (fidelity anchor):**
`2388962f1d10a2619b72d9e47f74f4b695abe9eeb87bb9bd4d235c9e4c8b7374`

**source.json sha256** (copied unmodified from
`app/public/data/editions/twelfth-night-original-en.json`, never edited at
any point in any round):
`bf69ddee77f588e6032f726a7cb81a18b3d60ca37f380ed2d76a5f9d756baed3`

**accepted-paragraph-hashes.tsv sha256:**
`a5d14b0df7ab7f91d0f2d1ed19b92d3d7a9e1d629152b77b615151ad53ce8bf4`
(1,120 rows, `chapter<TAB>paragraph<TAB>sha256`, **1-based** on both
chapter number and paragraph index; each hash is the sha256 of the
paragraph string as UTF-8.)

Both file hashes were recomputed independently in round 4 and match the
values round 3 declared. Round 4 made **no edits** to `source.json` or
`candidate.json` — the accepted content is exactly round 3's output. No
app, registry, audio, SEO, or deploy action was taken in any round. This
directory only. No paid API calls.

**Paragraph-numbering convention:** every location in this file and in
`PARKED-RESOLVED.md`'s round-2/3/4 sections is **1-based** — chapter `ch`,
paragraph `p` means `chapters[ch-1].paragraphs[p-1]`. Round 1's own
locations were 0-based reported as 1-based; that error is corrected
wherever round 1's findings are restated here.

---

## Model attribution by round

| Round | Role | Model |
|---|---|---|
| 1 | Drafting/repair + self-review | Claude Sonnet 5 (`claude-sonnet-5`) |
| 2 | Independent adversarial verification (**rejected** → parked) | Claude Opus 5 (`claude-opus-5`) |
| 3 | Correction round (fixed round 2's 12 + 1 fresh find) | Claude Sonnet 5 (`claude-sonnet-5`) |
| 4 | Independent adversarial verification (**accepted**, this record) | Claude Opus 5 (`claude-opus-5`) |

---

## Structure (re-derived fresh in round 4 from both files)

- 18 chapters — Act 1 Sc.1-5, Act 2 Sc.1-5, Act 3 Sc.1-4, Act 4 Sc.1-3,
  Act 5 Sc.1. All are real act/scene reading units; no apparatus,
  editorial-note, collation, or scene-crosswalk chapters.
- Chapter titles reader-facing (`Act N, Scene M — location`) and
  **byte-identical** between source and candidate.
- 1,120 paragraphs in each; per-chapter counts match exactly:
  `10 / 23 / 70 / 17 / 139 / 14 / 9 / 103 / 50 / 100 / 74 / 32 / 17 / 190 / 35 / 68 / 7 / 162`.
- Chapter `number` fields match one-for-one; paragraph order locked.
- No empty or whitespace-only paragraphs on either side.
- Top-level keys identical (`chapters` only; no `sections` key in either).
- Speaker-tag sets identical — same tags, same per-tag counts, no tag in
  one file and not the other, no character renamed or merged.

---

## Coverage table — all four rounds

| Round | Step | What was done | Coverage | Outcome |
|---|---|---|---|---|
| 1 | Accessibility (blind-on-content) | Read of candidate's own wording for reader clarity | 18/18 ch, 1,120/1,120 ¶ | See `accessibility-review-1.md` |
| 1 | Fidelity + fix | Paragraph comparison vs. source; 3 fixes applied | 18/18 ch, 1,120/1,120 ¶ | 3 defects fixed; **"no other defects" claim was false** |
| 2 | Independent verification | Structure re-derived; location-keyed proper-noun/epithet map; capitalized-token loss sweep; compression sweep over all 1,120 pairs; full word-for-word read of willow-cabin speech, letter scene, box-tree gulling, duel scene, recognition scene, all five songs | 18/18 ch structure; targeted + hot-spot full reads | **REJECTED** — 12 defects in one class + 1 isolated drift; book parked |
| 3 | Correction | Re-derived all 13 flagged locations from source before editing; applied 13 fixes via `safe_replace`; caught and corrected its own mid-round over-correction on `Belzebub`; fresh sweep (italic-term cross-check + hapax/rare-word cross-reference over 1,190 source words) | 13/13 fixes; whole-source rare-word triage | 13 fixed (12 assigned + 1 fresh find, `cubiculo`); exactly 13 ¶ changed vs. parked state |
| 4 | Independent verification (this record) | Everything below, re-derived from scratch without trusting round 3's self-report | 18/18 ch, 1,120/1,120 ¶ | **ACCEPTED** |

### Round 4 methodology (all re-derived from source.json / candidate.json)

1. **Hashes** recomputed for both files — match round 3's declared values.
2. **Structure** re-derived fresh (see above) — exact match.
3. **All 13 round-3 fixes re-derived by searching source for the
   distinctive term**, never by trusting any prior round's cited paragraph
   number (this book has already lost a round to a 0/1-based indexing
   mismatch). All 13 confirmed at their stated 1-based locations, all
   restoring source's exact wording, and none of the replaced forms
   (`The hound`, `Shah of Persia`, `Rude fellow`, `Tartarus`, `Beelzebub`,
   `Cathayan`, `slanderer`, `Skillfully`, `Pish!`, `the proper voice`,
   `fury`, `I'll remember`, `your room`) surviving anywhere.
4. **Location-keyed capitalized-token loss sweep** — every capitalized,
   non-sentence-initial source token checked against its own candidate
   paragraph; 419 raw hits filtered to 79 genuine proper-noun candidates
   and each read in full paragraph context.
5. **Reverse sweep** — every capitalized token the *candidate* introduces
   that is absent from its source paragraph (this is what catches imported
   editorial identifications like the old "Shah of Persia"); 55 hits, all
   contractions or ordinary word choices, **no invented proper noun and no
   imported editorial identification anywhere in the book.**
6. **Whole-vocabulary missing-word sweep** — all 3,138 source word types
   checked for survival anywhere in the candidate; 840 absent types
   triaged by hand.
7. **Near-variant normalization sweep** (a method neither earlier round
   ran) — for every source word absent from its own candidate paragraph,
   look for a close spelling-variant present in that same paragraph. This
   is the exact signature of the `Cataian`→`Cathayan` /
   `Belzebub`→`Beelzebub` failure and finds it without needing a name
   list. 262 hits, all read.
8. **Named-entity count check** across 47 proper nouns, foreign phrases
   and coinages — every count matches source exactly.
9. **Italic-marker (`_..._`) parity check** on all 1,120 pairs — 108
   deltas, every one the consistent book-wide stage-direction convention
   (`[_Exit._]` → `[Exit.]`); all sung verse, letter text and Latin
   terms keep their italic marking.
10. **Compression / content-loss sweep** over all 1,120 paragraph pairs,
    recomputed from scratch. Mean length ratio 1.02. 17 paragraphs with
    source ≥15 words fell below 0.90, plus the 25 lowest and 12 highest
    ratios overall — all read in full: no dropped clause, no dropped
    claim, no invented content.
11. **Word-for-word read of 257 paragraphs across 9 chapters not
    exhaustively covered by earlier rounds** — Ch1, Ch2, Ch4, Ch7, Ch11
    (Feste/Viola wit duel), Ch12, Ch13, Ch16 (the Sir Topas dark-house
    scene), Ch17. Clean.

---

## Defects found and fixed, all rounds (final, 1-based locations)

**Round 1 — 3 fixes** (all independently re-confirmed correct in rounds 2
and 4; round 1's own cited numbers were 0-based and are corrected here):

| Loc | Restored |
|---|---|
| Ch3 ¶66 | `dam'd-colour'd stock` rendered literally ("damned-colored stocking"), not emended to a scholarly guess |
| Ch9 ¶33 | `constancy` restored (candidate had flipped it to its antonym, destroying Feste's irony) |
| Ch18 ¶76 | `incardinate` restored — Sir Andrew's malapropism, not "corrected" to `incarnate` |

**Round 3 — 13 fixes**, all found by round 2 except `cubiculo`:

| # | Loc | Restored | Class |
|---|---|---|---|
| 1 | Ch10 ¶70 | `Sowter` | A — proper noun → generic descriptor |
| 2 | Ch10 ¶83 | `the Sophy` | A |
| 3 | Ch14 ¶126 | `the Sophy` | A |
| 4 | Ch15 ¶28 | `Rudesby` | A |
| 5 | Ch10 ¶98 | `Tartar` | B — source's printed form → standard form |
| 6 | Ch18 ¶119 | `Belzebub` | B |
| 7 | Ch8 ¶37 | `Cataian` | B |
| 8 | Ch3 ¶16 | `substractor` | C — coinage/malapropism erased |
| 9 | Ch14 ¶126 | `firago` | C |
| 10 | Ch5 ¶27 | `Dexteriously` | C |
| 11 | Ch8 ¶39 | `Tilly-vally!` | C (borderline — restored) |
| 12 | Ch18 ¶123 | `_vox_` | C (borderline — restored, italics intact) |
| 13 | Ch12 ¶19 | `cubiculo` | C (round 3's own fresh find) |
| D1 | Ch13 ¶16 | `I do remember` | D — isolated tense drift |

**Round 4 judgment on the two borderline restorations.** Both were
restored verbatim rather than glossed, and round 4 concurs with both, on
reasoning it re-derived rather than accepted:

- **`Tilly-vally!` (Ch8 ¶39)** — a nonsense interjection that was nonsense
  to the source's own first readers. Its force is tonal, not semantic, so
  restoring it plainly costs the reader nothing and keeps Sir Toby's
  register. The surrounding ballad tag (`_There dwelt a man in Babylon,
  Lady, Lady._`) is intact, and the paragraph reads naturally.
- **`_vox_` (Ch8/Ch18 ¶123)** — the joke *is* the term. Feste is demanding
  to be "allowed _vox_" as a condition of reading the mad letter "as it
  ought to be"; a generic paraphrase turns a specific performative demand
  into an ordinary request and the gag stops working. Restored with the
  italic marking source prints, which round 4 verified is still present.

Round 4 also verified that round 3's stated restraint on `Belzebub` is
real: only the flagged spelling was restored, and the candidate's own
`staff's length` modernization of `stave's end` was correctly left alone
rather than re-archaized.

---

## Round 4 verdict on the recurring defect class

`PARKED-RESOLVED.md` records an honest warning from round 3: three
consecutive rounds each found at least one instance of this class that all
previous rounds missed, so "no further sweep would find another" could not
be certified. Round 4 tested that directly with three methods no earlier
round had run in combination — the reverse capitalized-token sweep, the
near-variant normalization sweep, and a named-entity count check over 47
entities — plus a 257-paragraph word-for-word read deliberately aimed
*away* from the known hot spots.

**Result: no remaining instance of the class.** Specifically:

- **No proper noun lost or replaced by a descriptor.** All 47 checked
  named entities match source counts exactly, including the ones this book
  has a history with (`Sowter`, `Tartar`, `Sophy`, `Cataian`, `Belzebub`)
  and the unglossed nonsense ones (`Pigrogromitus`, `Queubus`, `Vapians`,
  `Peg-a-Ramsey`, `Gorboduc`, `Mistress Mall`, `the bed of Ware`).
- **No editorial identification imported into the reading text.** The
  reverse sweep found none anywhere in the book.
- **No character coinage erased.** Feste's `impeticos` and `gratillity`
  (Ch8 ¶12) survive verbatim, as do Sir Toby's `cubiculo`, `firago`,
  `substractor`, Sir Andrew's `incardinate` and Feste's `Dexteriously`.
  Sir Toby's `passy-measures pavin` (Ch18 ¶85) survives as a phrase.
- **All foreign-language material intact** — `cucullus non facit
  monachum`, `Bonos dies`, `Castiliano vulgo`, `Primo, secundo, tertio`,
  the French exchange (Ch11 ¶33-34), `_vox_`.

### Documented borderline items (non-blocking, recorded for the owner)

These are the closest surviving relatives of the class. Round 4 judged
each **permitted**, because every one is an orthographic or common-noun
modernization rather than a proper noun, a referent swap or a
character-specific coinage — the same line rounds 2 and 3 drew when they
explicitly permitted `barricadoes`→barricades, `wainropes`→wagon-ropes,
`staniel`→kestrel, `bawcock`→fine fellow and `coystril`→wretch. The
candidate applies that line consistently; no referent is changed anywhere.

`Signior`→`Signor` (Ch10 ¶2, Ch14 ¶117) · `viol-de-gamboys`→`viol-da-gamba`
(Ch3 ¶14) · `sink-a-pace`→`cinquepace` (Ch3 ¶65) · `renegado`→`renegade`
(Ch12 ¶28) · `huswife`→`housewife` (Ch3 ¶55) · `Hallow`→`halloo`
(Ch5 ¶126) · `triplex`→`triple` (Ch18 ¶23) · `cockatrices`→`basilisks`
(Ch14 ¶93) · `kick-shawses`→`fancy moves` (Ch3 ¶59) · plus the four round
2 already recorded (`coystril`, `equinoctial`, `consanguineous`,
`Sneck up!`). Also non-blocking: British→American orthography applied
book-wide (`honour`/`colour`/`valour`/`offence`/`licence`), and the
stage-direction italic convention. All are consistent policies, not slips.

**No new class of defect was found.** Nothing in round 4's sweeps falls
outside the erasure-of-printed-forms pattern already resolved, and no
narrow mechanical fix was needed or applied.

---

## Deliberately preserved, non-blocking items

- **Dense wordplay in Feste's set pieces** — the `cuckold`/"beauty's a
  flower" syllogism, `cucullus non facit monachum`, the chev'ril-glove
  metaphor (Ch11 ¶7). Difficulty inherent to the character's design, not a
  wording defect.
- **Sir Andrew's confusions and garbled logic** throughout, preserved as
  source's own characterization ("Taurus? That's sides and heart," his
  fumbling of `pourquoy`).
- **Unglossed period and nonsense allusions** — `Pigrogromitus`, the
  `equinoctial of Queubus`, `the bed of Ware`, `Peg-a-Ramsey`, `King
  Gorboduc`, `the old hermit of Prague`. Inventing explanations would
  violate the rule against glossing what source leaves unexplained.
- **Bawdy and frank content unsoftened** — the "C's, U's and T's" letter-
  hand joke reproduced letter for letter including "her great P's";
  "take thee between her legs, and spin it off"; "now I let go your hand,
  I am barren"; the drunken catch-singing register of Ch8.
- **Case-sensitive speaker-tag variation** — `SIR ANDREW` / `AGUECHEEK`
  alternation preserved in its source locations, not normalized.
- **All five songs complete** — "O mistress mine," "Come away, come away,
  death," "Hey, Robin," "I am gone, sir," and the closing "When that I was
  and a little tiny boy" (all stanzas, Ch18 ¶157-161); no stanza dropped,
  no refrain flattened.

---

## Verdict

**ACCEPTED.** Round 4 re-derived structure, both file hashes, all 16 fixes
across rounds 1 and 3, and ran five independent whole-book sweeps plus a
257-paragraph word-for-word read, without trusting any prior round's
self-report. The recurring erasure-of-printed-forms class that cost this
book two rounds is resolved with no remaining instances; no new defect
class was found; no edits were required in round 4.

Fidelity anchor pinned at candidate.json sha256
`2388962f1d10a2619b72d9e47f74f4b695abe9eeb87bb9bd4d235c9e4c8b7374`, with
per-paragraph hashes in `accepted-paragraph-hashes.tsv`.
