# Acceptance Record — The Prince (Machiavelli), modern-English candidate

- **Title:** The Prince
- **Book ID:** `green-the-prince` (working id; final registry id TBD at publication)
- **Author:** Niccolò Machiavelli
- **Source:** `source.json` — 27 chapters (Dedication + 26 numbered chapters), 254 paragraphs. Public-domain English translation (W. K. Marriott, with translator's footnotes/apparatus retained as footnote-style paragraphs — an intentional, previously-accepted structural pattern).
- **Candidate origin:** `candidate.json`, staged from the live app's edition files. The ch22p8 gate flag raised during staging was pre-confirmed a false positive before this review began.
- **Date of this record:** 2026-09-21

## Review coverage, all rounds

| Round | Scope | Method | Result |
|---|---|---|---|
| Round-1 accessibility review | Whole book, first-time-reader read | Manual read, no source consulted | 6 gloss gaps found: sanjaks, condottieri, Guelph/Ghibelline, hectic fever, Soldan, Praetor |
| Round-1 fidelity review | Whole book vs. source | Manual close read + spot diff | 8 silent proper-noun-correction defects found (name spellings modernized without authorization), plus the Petrarch "cuor"→"cor" wording substitution |
| Name-sweep round 2 | All 27 chapters, independent pass | Word-level mechanical diff + manual verification | 15 further instances found across 6 new defect classes (Sinigalia/Sinigaglia, Forli/Forlì, Vaila/Vailà missed occurrences, Allesandria/Alessandria, Sclavonia/Slavonia, Tribu/Tribù), plus one lower-confidence translation-choice flag (Bernabo "da Milano"→"of Milan", left as-is) |
| Name-sweep round 3 | Full re-check | Targeted verification | 3 more instances found (Ætolians, x3 occurrences) |
| Accessibility fix pass | 6 flagged terms | Inline gloss insertion | All 6 glosses applied: sanjaks, condottieri, Guelph/Ghibelline, hectic fever, Soldan, Praetor |
| **Round 4 (this task) — proper-noun/quoted-wording sweep** | All 27 chapters, programmatic extraction + diff + close read | Diacritic-injection scan (regex over all paragraphs, both directions), capitalized-token set diff per paragraph with near-match/edit-distance check, targeted re-check of Petrarch quote | **5 new instances found and fixed** (see below) |
| **Round 4 — whole-book fidelity re-read** | All 27 chapters, source vs. candidate | Full non-sampled read, every paragraph | Clean — voice, causal claims, and terminology consistent throughout; no actor-swaps, negation flips, or invented/omitted content beyond the items fixed in this round |
| **Round 4 — fresh accessibility read** | All 27 chapters, candidate only | First-time general-adult-reader read, no source/prior reviews consulted | Clean — all previously-flagged glosses present and legible in context; no new blockers |

## Defect counts by round (proper-noun/quoted-wording class specifically)

This book needed an unusually long tail on this specific defect class — four successive passes, each catching what the prior pass(es) missed:

- Round 1: 8 instances
- Round 2: 15 instances
- Round 3: 3 instances
- Round 4: 5 instances

**Total: 31 silent proper-noun/quoted-wording corrections found and reverted across four independent sweeps.** This is worth stating plainly rather than downplaying: a single review pass on this book was not sufficient to catch this defect class, and even a second and third pass each missed instances the others found. The pattern held true a fourth time — this final sweep found defects invisible to the prior three, all in material the earlier passes had not specifically re-examined (a Latin epigraph, an English verse translation, and one Russian transliteration inside a footnote).

## Round-4 fixes (this task)

1. **ch9 p8** — footnote quoting Burd: `"crudelta"` had gained an unauthorized accent → `"crudeltà"`. Reverted to source's plain `"crudelta"`.
2. **ch21 p7** — footnote quoting a letter from Fortunati: the mid-quote attribution `"...," wrote Fortunati, "..."` had been silently collapsed into a single unbroken quotation, dropping the words "wrote Fortunati." Restored the attribution exactly as printed in source.
3. **ch22 p9** — footnote on the word "artel": the transliterated Russian verb `"rotisya"` had been silently respelled `"rotitsya"`. Reverted to source's `"rotisya"`.
4. **ch27 p13** — the Petrarch verse quotation (flagged going into this task): `Virtù`/`Prenderà`/`è` carried diacritics the source's printed text lacks, `Furore` had been lowercased to `furore`, and the candidate had reformatted the four-line verse with `/` line-break slashes not present in source (source prints it as continuous prose). Reverted all diacritics and capitalization to source's plain forms and removed the slash formatting.
5. **ch18 p4 and p6** — found during the generalized check the task asked for (the same slash-formatting defect recurring elsewhere in the book, not just at the flagged Petrarch location): the Latin epigraph ("Res dura, et regni novitas...") and its English verse translation (Christopher Pitt's, "...against my will, my fate...") had both been reformatted with `/` line-break slashes not in source, and the English verse translation had additionally lost its archaic contractions and lead-in — "pow'rs" modernized to "powers," the source's ". . ." omission-marker dropped, and quotation marks added around a passage source prints unquoted. Reverted both paragraphs to match source's continuous-prose formatting and exact wording/punctuation, keeping the book's established straight-quote house style for the one quoted line (p4) that source itself prints in quotes.

All five fixes applied via direct paragraph replacement (source-verified before and after each edit), followed by full re-validation.

## Sweep methodology (round 4)

- Programmatic diacritic scan: every candidate word containing an accented/extended-Latin character was checked against the same source paragraph verbatim; any such word not literally present in source was flagged. Run in both directions (candidate-has-diacritic-source-doesn't, and the reverse) — the reverse direction found zero defects, confirming no source diacritics were being dropped.
- Full-book non-ASCII character inventory: confirmed final candidate.json contains only Æ, em/en dashes, and ellipsis as non-ASCII characters — no stray accents anywhere.
- Capitalized-token set diff per paragraph (all 254 pairs) with edit-distance matching between source-only and candidate-only tokens, to surface any remaining spelling variants beyond the diacritic class. This surfaced the Fortunati and rotisya defects (word-level, not diacritic).
- Verified all previously-fixed name locations (Sinigaglia, Forlì, Vailà, Slavonia, Tribù, Domnia/Bernabò, Nicolò, Ætolians) remain correctly reverted and none had regressed.
- Confirmed Alessandria/Allesandria's book-internal inconsistency (ch27p8 vs ch27p9) is preserved faithfully per-paragraph, matching the round-2 finding that source itself is inconsistent and each paragraph's own printed form must be reproduced rather than normalized.

## Deliberately-preserved non-blocking items

- **Footnote-style biographical asides** (e.g., "Philopoemen, 'the last of the Greeks,' born 252 BC, died 183 BC.") as short standalone paragraphs — an inherited structural/formatting pattern from the source translation's apparatus, not a translation defect. Present throughout and left as-is.
- **Long, clause-stacked sentences** in the denser historical chapters (3, 8, 9, 13, 20) — a feature of Machiavelli's own argumentative style carried faithfully into the modern-English rendering, not an accessibility failure.
- **British→American spelling normalization** (favour→favor, valour→valor, honour→honor, defence→defense, practised→practiced, etc.) throughout ordinary prose — a deliberate, consistent modernization choice distinct from the proper-noun/quoted-wording defect class, and not reverted.
- **Roman-numeral regnal titles** (Louis XII, Alexander VI, Charles VII, etc., replacing source's "Louis the Twelfth," "Alexander the Sixth") — an accepted modern-convention choice, consistent throughout, not a name-fidelity defect.
- **Straight-quote house style** (candidate uses `"`/`'` throughout in place of source's curly `"..."`/`'...'`) — a consistent, deliberate typographic choice applied uniformly across the whole book; not reverted except where the underlying wording/diacritics inside a quotation were themselves wrong.

## Final validation

- JSON valid (`python3 -m json.tool`).
- 27/27 chapters, chapter numbers matching source 1:1.
- 254/254 paragraphs total; per-chapter paragraph counts match source exactly for all 27 chapters.
- No diacritic-injection defects remain (programmatic scan, zero results).
- All 6 accessibility glosses (sanjaks, condottieri, Guelph/Ghibelline, hectic fever, Soldan, Praetor) confirmed present in final text.

**Final sha256 (candidate.json):**
```
fbdf701292f34f01d5c0af0aad55975853de0157a3260ad3ebde164cfb7d1589
```

**Date:** 2026-09-21
