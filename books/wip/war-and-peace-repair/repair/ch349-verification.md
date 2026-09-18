Model: opus

# Verification — chapter 349 (First Epilogue, Chapter 12)

Independent verifier. I did not draft, review or correct this chapter.
Files: `ch349-source.json` (Maude), `ch349-candidate.json` (pre-correction), `ch349-corrected.json`, `ch349-corrections-log.md`, `ch349-fidelity.md` (context only).
Paragraph numbers below are **1-based** (JSON index = N−1), matching the log and the fidelity review.

## 1. Diff — candidate vs corrected

Computed by paragraph-wise string comparison of the two JSON files (not from the log).

Changed paragraphs: **¶5, ¶6, ¶10, ¶11, ¶13, ¶17, ¶20, ¶25, ¶32** — 9 of 33.

Log entries: ¶5, ¶6, ¶10, ¶11, ¶13, ¶17, ¶20, ¶25, ¶32 — 9 entries.

**Match: exact.** Every logged change is present in the file; every changed paragraph has a log entry. No unlogged edits, no claimed-but-absent edits. No mismatch findings.

## 2. Per-change verdicts (re-derived from the source, not from the log)

| ¶ | Source reading | Corrected reading | Verdict |
|---|---|---|---|
| 5 | "a slim lad of fifteen, delicate and intelligent, with curly light-brown hair and beautiful eyes"; "Platón Karatáev (of whom he had heard from Pierre)" | "a slim, delicate, intelligent boy of fifteen, with curly light-brown hair and beautiful eyes"; "Platon Karataev, of whom he had heard from Pierre" | **PASS.** All four attributes restored to the boy; "intelligent" is his again and "beautiful eyes" is back. The invented apposition ("a peasant who had shared that captivity with him") is gone in full, leaving exactly what the source paragraph carries. No residue, no new drift. |
| 6 | "From broken remarks"; "appeared to him a divinity who could not be pictured" | "From broken remarks"; "appeared to him a divinity he could not picture" | **PASS.** "overheard" removed, "a kind of" hedge removed. Both restorations are literal to the source. |
| 10 | "Pierre felt the different outlooks of these various worlds and made haste to satisfy all their expectations." | "Pierre sensed the different outlooks of these various worlds, and hurried to satisfy all their expectations." | **PASS.** The source's two-term distinction (what each world *sees* / what it *expects*) is restored; the hinge sentence now gathers the enumeration above it as the source does. |
| 11 | "Though the most absent-minded and forgetful of men"; "neglect of herself" | same | **PASS.** Rhetorical doubling removed; the general trait is general again, not narrowed to grooming. Rest of the paragraph untouched, as the log says. |
| 13 | "and so that way of life proved economical" | "So that way of life proved economical." | **PASS.** Added hedge "in that sense" gone; the flat statement is flat again. |
| 17 | "It was a ruble an arshin, I suppose?" | identical | **PASS.** The appended narratorial gloss sentence is gone and "It was" is restored. Dropping the gloss outright was the fully faithful of the two options the review offered; nothing is now inside Natasha's dialogue paragraph that the source does not have. |
| 20 | "Adèle tempted me" | "Adèle tempted me" | **PASS.** Diacritic restored, consistent with "écossaise" kept in ¶4 and with the drop-Russian-stress / keep-non-Russian-diacritics rule. |
| 25 | "was for her evidently merely a pretext" | identical | **PASS.** The narrator's inference is back to the source's strength; "plainly"/"nothing but" gone. |
| 32 | "that we must all become like her" | identical | **PASS.** Person restored. The narrator-and-reader "we" is what the Latin tag two clauses later answers, and the chapter's last move now lands as the source lands it. The fix is confined to that clause; the rest of the sentence is unchanged. |

No correction overshot, and none introduced a new departure from the source.

## 3. Read as a new reader

All nine paragraphs read cleanly. Two are worth naming:

- ¶5 is the chapter's densest paragraph and it was the one to re-check after correction. It now reads without a stumble: "his captivity, Platon Karataev, of whom he had heard from Pierre, his love for Natasha, of whom the boy was also especially fond" — the two parallel "of whom" clauses carry the list, and the earlier apposition was actually working against them. Clearer after the fix than before it.
- ¶17 loses nothing a reader needs. "It was a ruble an arshin, I suppose?" is legible as a price-per-length guess from context (she is feeling the material), which is all the scene requires.

## 4. Structure and punctuation

- Paragraph count: source 33, candidate 33, corrected 33. Order unchanged.
- Chapter number and title identical across all three files ("First Epilogue (1813 - 20) — Chapter 12").
- No empty or whitespace-only paragraphs.
- Per-paragraph `?` and `!` parity against the source: **all 33 paragraphs match**, no exceptions to explain.
- Em dashes: 20 unspaced, 0 spaced — consistent with the conventions file and with chapter 351.
- No paragraph falls below 75% of its source word count.
- JSON parses.

## 5. Findings

No blocking findings.

- MAJOR remaining: **none** (the review found none).
- MODERATE remaining: **none.** Both — the invented Karataev apposition (¶5) and the "we"→"all of them" person shift (¶32) — are fixed.
- MINOR remaining: none of the ten survive.
- COSMETIC carried forward (non-blocking): ¶32 "once as full of life as they themselves now were" still has the tense muddle the review logged against the source's "formerly as full of life as themselves". Graded COSMETIC, meaning recoverable, left as-is.
- Glosses in the shipped file: "écossaise — a Scottish country dance, and his only piece" (¶4) and the "Memento mori"—remember that you must die— translation (¶32). Both were explicitly ruled ALLOWED by the review, and I agree on re-derivation: the first states only a category, the second translates a retained foreign tag. The arshin gloss is gone, so the chapter no longer glosses a unit of measure while glossing a dance — the treatment is now internally consistent.

Verification: ACCEPT
sha256: e45fb3ed662d9d9fe0ab663063effc8250020ae30b1844466260c88ef81c036e
