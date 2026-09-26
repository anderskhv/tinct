# Independent Fidelity Review — Discourse on Inequality, Danish Chapter 4 Repair

**Reviewer:** Independent review agent (separate from the translation task)
**Date:** 2026-09-26
**Files reviewed:**
- English baseline: `app/public/data/editions/discourse-on-inequality-modern-en.json` (chapter 4, "Part 2")
- Candidate Danish: `books/wip/discourse-on-inequality-modern-da-repair/editions/discourse-on-inequality-modern-da.json` (chapter 4, "Del 2")
- Live (defective) Danish: `app/public/data/editions/discourse-on-inequality-modern-da.json` (chapter 4)

## 1. Defect confirmation

Confirmed the live served file's chapter 4 (`title: "Del 2"`, `number: 4`) contains **raw untranslated English text** identical in substance to the English edition — this is the confirmed bug the candidate is meant to fix. Paragraph 0 of the live Danish file begins "The first man who, having enclosed a piece of ground, took it into his head to say This is mine..." — pure English, not Danish.

## 2. Structural check

- English chapter 4: **67 paragraphs**.
- Candidate Danish chapter 4: **67 paragraphs**.
- Order is 1:1 — verified by zipping the two paragraph arrays and comparing indices; every paragraph in the candidate is a translation of the English paragraph at the same index (opening line "The first man who, having enclosed a piece of ground..." maps to "Den første mand, der, efter at have indhegnet et stykke jord...", and the closing paragraph 66 on moral vs. physical inequality maps correctly).
- Metadata (`title`, `number`) match between live and candidate for chapter 4 ("Del 2", 4).

## 3. Chapters 1–3 unchanged

Loaded both the **live served** `discourse-on-inequality-modern-da.json` and the **candidate** file and compared chapters 0–2 (Dedication/"Tilegnelse", Preface/"Forord", Part 1/"Del 1") as parsed JSON objects: **all three are equal** (titles, numbers, and every paragraph string byte-for-byte identical). The repair touched only chapter 4, as intended.

## 4. Fidelity / completeness check (close reading)

I read approximately 46 of the 67 Danish paragraphs in this chapter side-by-side against the English baseline in detail, including:
- The opening paragraph (0, the famous "first man who enclosed a piece of ground" passage).
- All of the longest, most argumentatively dense paragraphs (65 — the longest at 763 English words, covering Diogenes/Cato/the savage-vs-civilized-man contrast; 59, 40, 35, 31, 53, 49, 41, 45, 60, 20, 58, 38, 55, 51, 64).
- The Grotius/Ceres/Thesmophoria paragraph (27), the Locke/Barbeyrac paragraph (48), the Pliny/Trajan quote (42), the Tacitus quote (44), the long embedded first-person quoted speech paragraphs (36, 37), the Louis XIV edict quote and its citation (46, 47), the Lycurgus/Sparta paragraph (41), the gerontes-of-Sparta paragraph (55), and the closing summary paragraph (66).

As a supplementary, chapter-wide check, I computed English-vs-Danish word counts for **all 67 paragraphs**. Ratios range from 0.82–1.13 with no outliers — there is no paragraph where the Danish is suspiciously short (indicating a summary/drop) or suspiciously long (indicating invented content). This is strong corroborating evidence that the close-reading sample generalizes to the full chapter.

**Result: every clause, premise, and logical step I checked survives the translation.** Rousseau's argument structure (the state-of-nature "youth of the world," the invention of property via Ceres/agriculture, the rich man's fraud in proposing the social contract via Grotius-style natural-right reasoning, the three-part rebuttal of conquest/association theories of government's origin, the critique of Grotius/Pufendorf on alienable liberty via Locke/Barbeyrac, the cycle from elective to hereditary to despotic government, and the final civilized-vs-savage-man contrast) is fully present and in the same order and with the same logical connectives (dermed, eftersom, derfor, hvorimod, etc.) as the English.

### Proper nouns — all present and correctly localized

Checked (English count → Danish count, both = 1 unless noted): Ceres (1→1), Grotius (1→1), Locke (3→3), Sidney (1→1), Sparta (4→4), Tacitus (1→1), Lucan (1→1), Ovid (1→1), Plato→Platon (1→1), Pufendorf (1→1), Diogenes (1→1), Cato (1→1), Trajan (1→1), Barbeyrac (1→1).

Several names are correctly rendered in their standard Danish forms rather than left in English/Latin/French spelling, which is the linguistically correct choice and not an error:
- **Lycurgus → Lykurg** (2→2)
- **Pliny → Plinius** (1→1)
- **Louis XIV → Ludvig XIV** (1→1, verified in context — para 46, the 1667 edict passage)
- **Thesmophoria → Thesmoforierne** (1→1, para 27, the Ceres/Grotius passage)

No proper noun was dropped, garbled, or left in the wrong form.

### No untranslated English left behind

Ran a scan of the full candidate chapter 4 for stray English words/fragments; the only "hits" were false positives from English-looking substrings that are common inside ordinary Danish words (e.g., "vis", "kris", "-ed" endings) — manual inspection of every flagged paragraph confirmed the text is fully and fluently Danish throughout, with no accidental leftover English clauses or sentences.

## 5. Prose quality

The Danish is fluent, idiomatic, and appropriately formal/literary for philosophical argument — not a stiff calque of English syntax and not machine-translation-style. Sentence structures are restructured naturally for Danish (subordinate clause order, comma placement, "eftersom"/"idet"/"hvorimod" connectives used correctly), long periodic sentences (e.g., para 65, 763 words in English) are carried through in idiomatic Danish without becoming unreadable run-ons, and register is consistently elevated/formal (e.g., "fornedre," "vanære," "hensigt," "bemyndigeres hensigt," "agerdyrkeren," "høvding" for "chief") in a way that matches Rousseau's tone rather than a flat contemporary register.

## 6. Defects found (minor, do not affect completeness or meaning materially)

1. **Para 55 — likely typo/malformed word.** "De ældste blandt hebræerne, **gerontsierne** i Sparta, senatet i Rom..." for EN "the Gerontes at Sparta." Standard Danish would be closer to "gerontierne" or simply "gerontes/geronterne i Sparta." "Gerontsierne" is not a recognized Danish word form — reads as an invented/misformed plural. Cosmetic, does not obscure meaning (context makes clear it refers to a Spartan council of elders).

2. **Para 66 — spelling error.** "...at de få **priviligerede** skal fråse i overflod..." The correct Danish spelling is **privilegerede** (from "privilegium/privilegeret"), not "priviligerede." This is a common Danish misspelling but is still an error and should be corrected before publication.

3. **Para 63 — minor semantic softening.** EN: "for despotism ... wherever it prevails, **admits no other master**." DA: "...hvor den end hersker, **taler ikke om andre herrer**" (literally: "does not speak of other masters"). The Danish shifts the meaning from "despotism brooks/tolerates no other authority above it" to something closer to "does not talk about other masters," which is a noticeably weaker and less precise rendering of Rousseau's point about despotism's self-sufficiency/lawlessness. This is the one place I'd flag as an actual (small) fidelity slip rather than a typo, though it is confined to a single clause in a single paragraph and does not affect the surrounding argument, which is otherwise fully and correctly translated (including the embedded Latin-derived quote "with which there is no hope from probity").

No other omissions, compressions, inventions, or dropped clauses/premises were found in the sampled or word-count-checked paragraphs.

## 7. Verdict

**ACCEPT** (with a request for a trivial follow-up copyedit pass).

This is a complete, faithful, 67/67 paragraph-for-paragraph translation of chapter 4 that fully replaces the previously untranslated-English content. Rousseau's argument survives intact — every logical step, premise, and proper noun I checked is present and correctly rendered. The prose is fluent, idiomatic, appropriately formal modern Danish, not a machine-translation calque, and shows no accidental English leftovers. Chapters 1–3 are confirmed byte-identical to the live file, so the repair is correctly scoped to chapter 4 only.

I recommend fixing three small items before or shortly after merge — none of which should block acceptance or require a re-translation:
- Para 55: "gerontsierne" → "gerontierne" (or similar recognized form).
- Para 66: "priviligerede" → "privilegerede" (spelling fix).
- Para 63: consider revising "taler ikke om andre herrer" to better capture "admits no other master" (e.g., something like "tåler ingen anden herre" / "anerkender ingen anden herre").
