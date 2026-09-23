# Acceptance Record — Frankenstein (Mary Shelley), modern-en

- **Book id:** `frankenstein` · **Edition:** `modern-en`
- **Date:** 2026-09-23
- **Source (fidelity anchor):** `source.json`, byte-identical to the served `app/public/data/editions/frankenstein-original-en.json` (sha256 `71008d6d…9e6bb`). This is the 1831 revised text, Project Gutenberg #84 (`books/raw/frankenstein/SOURCE.md`).
  - **Completeness:** checked with a word-sequence diff against `books/raw/frankenstein/raw.txt`. The only unmatched runs are the Gutenberg table of contents and headings; no body text is missing.
- **Starting point:** the live modern-en edition, preserved as `baseline-live-modern-en.json` (sha256 `a3550019…de44c8`). The work repaired that text; it did not start over.
- **Structure:** 28 chapters (Letters 1–4 and Chapters 1–24) and 764 paragraphs. Chapter numbers, titles and per-chapter paragraph counts are identical to the source. Every edit round passed `content_edit_helpers.validate_structure()` and `assert_only_changed()`.

**Final sha256 (candidate.json):**
```
a99352b3bf5f9d1f7a78970b658f2a35722a2b5031d4037a398d284c6ab390ff
```

## Earlier external ("Astra") findings — unavailable

The brief pointed to findings in a local Codex workspace (`/Users/andershvelplund/.codex/…/astra-frankenstein-findings.md`, `review-inputs/`). That path does not exist in this cloud environment, and no branch of the repository contains those files. The findings were therefore **not** used and not guessed.

As instructed, the named opening sections (Letters 1–2 and Chapters 1–2, reader sections 1, 2, 5 and 6) were reviewed independently and in full, as part of round-1 packet 1 (chapters 1–6). That packet produced 66 local repairs in 45 paragraphs.

Because the original twelve proposals are unavailable, none of them can be matched one-to-one here. Anyone holding the Astra file can compare it against `round1/frank-p1-final.json`.

## Review coverage

| Round | Scope | Reviewer | Method | Result |
|---|---|---|---|---|
| R1 repair review ×4 packets | All 28 chapters, all 764 paragraphs | Independent source-based reviewers (Opus), one per packet | Full source-vs-candidate pair read with neighbouring context; checked for omissions, additions, meaning changes, epithets, read-aloud difficulty and references | 382 proposals (66 + 111 + 65 + 140). The lead screened each one against the source. All were applied, with the wording adjusted on 4. Rejections noted in the reviewers' reports stand. See `round1/` |
| R1 name/verse sweep | Whole book | Lead | Programmatic check of proper nouns and diacritics against the aligned source | 9 silent place-name modernizations reverted (Chamounix, Strasburgh, Petersburgh, Cæsar, Havre-de-Grace). The quoted Coleridge and Shelley verse was modernized per the protocol |
| R2 fidelity ×4 packets | All 764 paragraphs | **Fresh** independent Opus reviewers (not the R1 reviewers) | Protocol steps B+C: packets with context, then a whole-chapter re-read for cross-boundary issues; extra scrutiny on the 292 paragraphs R1 changed | 34 findings, 4 blocking (15.0, 20.36, 23.14, 28.47). All applied, 3 with adjusted wording. See `round2/frank-fid2-*` |
| R2 accessibility ×2 | All 764 paragraphs | Fresh reviewers, candidate only (never saw the source) | First-time adult reader and listener | 14 findings, 2 blocking (unannounced Shelley stanza at 14.3; "[The moon]" artifact at 15.2). 5 applied, 9 rejected (see below) |
| R2 changed-passage re-verification | The 37 paragraphs changed in R2 | Independent Opus verifier | Diff exactness, source read with neighbours, structure | 2 defects: 4.38 (hedge dropped by an R2 accessibility edit) and 24.1 (certainty and possibility swapped) |
| R3 fix + re-verification | 4.38, 24.1 | Same independent verifier | As above | **VERIFIED CLEAN** |
| Tool checks | Whole book | `books/audit-truncation.py`, `books/content-verify.py` (run with local paths) | Screening | 44 paragraphs are below a 0.75 length ratio, down from 78. Every one was read in full by two independent source-based reviews and none is an omission. content-verify flags 4 paragraphs (3.6, 15.12, 20.34, 21.4) only because sentence-initial words count as "nouns"; all four were read in full and cleared as false positives |

No sampling at any stage.

## Conventions (documented)

- **Epithets for the Creature:** the narrators' own words are restored and kept: fiend, dæmon rendered as "demon", wretch, devil, being, monster, apparition. The source's "dæmon" is consistently rendered "demon".
- **Creature's voice:** contractions are kept. His speech was not formalized.
- **Proper nouns as printed:** Chamounix, Salêve, Môle, Copêt, Chêne, Pélissier, Strasburgh, Petersburgh, Havre-de-Grace, Werter (*Sorrows of Werter*), Cæsar, Pandæmonium, Juras, St. Andrew's, Tartary (glossed).
  - "blue seasons of the south" (28.16) is kept as the source prints it.
- **Glosses:** added only where essential, in brief and accurate form. Examples: syndics, "keeping", the Ancient Mariner, Roncesvalles and the Holy Sepulchre, Cornelius Agrippa, galvanism, *schiavi ognor frementi*, chamois, Mont Cenis, sirocco, Pandæmonium, Tartary, mutability.
- **Quoted verse:** the verse is modernized, with meaning taking priority over rhyme.
  - Coleridge at 9.7; its attribution line at 9.8 reads "From Coleridge's 'Ancient Mariner.'"
  - Shelley's "Mutability" at 14.3, now introduced with an accurate attribution.
  - Wordsworth's "Tintern Abbey" at 22.19 is kept as quoted verse; its attribution line at 22.20 reads "From Wordsworth's 'Tintern Abbey.'"

## Rejected or not-applied proposals (brief)

- **Accessibility A:**
  - 5.8 Italian *schiavi ognor frementi*: kept; it is quoted in the source and glossed immediately.
  - 6.1 dense list of references: kept, since fidelity restored the source's specifics.
  - 7.16 "cried the soul of Frankenstein": the source's own wording.
  - 8.11 "Cæsar": source spelling.
  - 10.8 "little _wives_": the source's italicized joke, resolved by the next clause.
- **Accessibility B:**
  - 22.19 "the very poetry of nature" keeps its quotation marks, which the source prints.
  - 19.5 "The path of my departure was free" keeps its quotation marks. It deliberately echoes the Shelley stanza.
  - 23.7 Falkland/Goring gloss rejected: the proposed "men and women of Charles's own court" is inaccurate for the queen and the son.
  - 22.20 verse: no change proposed.
- **R1 reviewers:** each packet report lists what that reviewer considered and rejected, for example "ground sea" (4.6) and Walton calling Victor a "creature".
- **Screening note:** the old "21 shortened paragraphs" flag was treated as screening only. Length was never restored mechanically, and every short paragraph was judged on its content.

## Verdict

**ACCEPTED — ready for release handoff.** A full independent source-based fidelity review and a fresh candidate-only accessibility review cover the whole book. Every blocking finding was fixed, and every changed passage in the final rounds was independently re-verified clean. Structure matches the source.
