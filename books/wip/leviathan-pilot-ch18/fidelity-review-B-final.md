# Fidelity Review — Leviathan, Ch. 18 (Hobbes Ch. 17) — Candidate B (final), Round 2

**Reviewer:** Independent fidelity reviewer (per `books/prompts/fidelity-review-prompt.md`)
**Source anchor:** `source.json` (locked)
**Candidate:** `candidate-B-revised.json` (= `candidate-Y.json`)
**Scope of this pass:** Targeted verification of the six items listed by the requester, read in full paragraph context (paragraphs 0, 1, 3, 5, 6–11, 11, 12, 13, 14 read individually; paragraphs 2, 4 skimmed as surrounding context only — not independently certified this pass, no changes claimed there). Whole-chapter re-read was **not** repeated this round since this is a targeted re-verification of specific prior fixes, not a fresh full-chapter certification.

Paragraph indices below follow the JSON array (0-indexed, 16 paragraphs total, indices 0–15).

## Item-by-item findings

**1. Paragraph 5 — unclosed parenthesis (fixed?)**
Source: `(which are therefore by Aristotle numbred amongst Politicall creatures;)` — parenthetical, properly closed in source too, so the candidate's earlier bug was self-inflicted.
Candidate now: `...live sociably with one another, which is why Aristotle counted them among the political creatures — that is, creatures naturally suited to live in organized communities — and yet they have no direction...`
No parentheses at all now (rewritten with em-dashes); no broken/unclosed markup. **CONFIRMED FIXED.**
Side note (not one of the six items, flagged for completeness): the em-dash clause `— that is, creatures naturally suited to live in organized communities —` is a gloss not present in the source. It doesn't misstate anything and reads as compatible with "Politicall creatures," but it is technically an addition beyond the source text. Since the prior review only flagged this paragraph for the broken parenthesis (implying the gloss itself was already accepted), I am **not** re-opening it as blocking, only noting it exists, consistent with how item 3's CIVITAS gloss was explicitly sanctioned.

**2. Paragraph 0 — "keep them in check" reverted to "keep them in awe" (fixed?)**
Source para 0: `...when there is no visible Power to keep them in awe...`
Candidate para 0: `...whenever there is no visible power to keep them in awe and to bind them...`
Confirmed reverted. Cross-checked consistency:
- Para 3 (source: `without a common Power to keep them all in awe`) → candidate: `without a common power to keep them all in awe` ✓
- Para 11 (source: `a Common Power, to keep them in awe`) → candidate: `a common power to keep them in awe` ✓
All three now consistent. **CONFIRMED FIXED, no regressions.**

**3. Paragraph 12 — invented/redundant CIVITAS gloss (fixed?)**
Source: `...is called a COMMON-WEALTH, in latine CIVITAS.` (no gloss at all in the source).
Prior (flagged) version: `CIVITAS (Latin for 'commonwealth,' or 'state')` — redundant, since "commonwealth" was already stated a half-clause earlier.
Candidate now: `...is called a COMMONWEALTH, or in Latin, CIVITAS — the Latin word for "state."`
This is a single, non-redundant clarification, matching exactly what the prior review asked for ("streamlined to a single non-redundant clarification," not "delete the gloss entirely"). **CONFIRMED FIXED as specified.** (Still technically an addition relative to the bare source, but it is the addition the requester explicitly asked to keep in reduced form — not a new defect.)

**4. Paragraph 1 — "claim" reverted to "pretext" (fixed?)**
Source: `enlarge their Dominions, upon all pretences of danger...`
Candidate para 1: `For their own security they enlarge their dominions on any pretext of danger or fear of invasion...`
Confirmed reverted to "pretext," restoring the skeptical/ironic connotation. **CONFIRMED FIXED.** Rest of paragraph 1 re-checked against source in the same pass (small-family/robbery/honor material, "Lawes of Honour," "instruments of husbandry" → "farming tools," etc.) — no actor swaps, no dropped clauses, no added claims found.

**5. Paragraph 12 — capitalization normalization + plurality gloss (new, unreviewed)**
Source: `...beare their Person; and every one to owne, and acknowledge himselfe to be Author of whatsoever he that so beareth their Person, shall Act...This is...a reall Unitie of them all, in one and the same Person...the Multitude so united in one Person, is called a COMMON-WEALTH...`
Candidate para 12: consistently lowercases every instance — "bear their person," "the author of," "the bearer of their person," "one and the same person," "united in one person" (4 occurrences of person/author, all lowercase).

- *Clause preservation:* every clause is present; nothing dropped. Confirmed word-for-word structural match to source aside from case and light syntax smoothing.
- *Plurality of voices gloss:* Source: `reduce all their Wills, by plurality of voices, unto one Will`. Candidate: `reduce all their wills, by a plurality of voices (that is, by whichever choice wins the most support) to one will`. The added parenthetical glosses "plurality" (most votes / relative majority) rather than "majority" (strict >50%) — Hobbes's distinction between plurality-of-voices and absolute majority is preserved: "whichever choice wins the most support" correctly describes a plurality (relatively most support) without asserting an absolute majority. **No meaning distortion; distinction intact.** This is an addition beyond the literal source, but explanatory and non-distorting, in the same register as the item-3 CIVITAS gloss.
- *Capitalization — DEFECT FOUND:* Paragraphs 12 and 13 lowercase "person"/"author" throughout (Hobbes's specific technical sense — the artificial "Person" borne by the sovereign, central to the whole chapter's argument). But **paragraph 14**, read as required context, still capitalizes it: `And the one who carries this Person is called the SOVEREIGN...` — same referent, same technical concept introduced two paragraphs earlier, now inconsistently cased. This is the same class of problem the earlier review caught and fixed for "awe" (item 2): a recurring key term modernized in some paragraphs but left/treated differently in an adjacent one, breaking cross-paragraph consistency on Hobbes's central legal-fiction term. It does not change meaning on its own (the word itself is unchanged, only case), so it is **not a fidelity-meaning defect**, but it is a real internal-consistency defect the checklist calls for surfacing, and it directly touches the item the requester asked me to specifically compare against paragraph 14.

**6. Paragraph 13 — "have made themselves every one the Author of" → "have each made themselves the author of" (new, unreviewed)**
Source: `is "One Person, of whose Acts a great Multitude, by mutuall Covenants one with another, have made themselves every one the Author, to the end he may use the strength and means of them all, as he shall think expedient, for their Peace and Common Defence."`
Candidate: `is "one person, whose acts a great multitude, by mutual covenants one with another, have each made themselves the author of, to the end that he may use the strength and means of them all, as he thinks fit, for their peace and common defense."`
Source fronts "of whose Acts" and ends on a bare "the Author"; candidate restructures to "whose acts ... the author of" (preposition-stranding, standard modern English) — semantically identical, just reordered. "Every one" → "each" preserves the distributive sense (every single member individually made himself author) without loss. No clause dropped, no actor/negation/causality change. **CONFIRMED — no defect, syntax cleanup only, meaning fully preserved.**

## Summary of defects

| # | Location | Severity | Status |
|---|----------|----------|--------|
| — | Para 12/13 vs. Para 14: "person"/"Person" capitalization inconsistency | Non-blocking (consistency, not meaning) | **Needs fix** |

No blocking fidelity defects (actor swaps, dropped negation, causality flips, dropped clauses, invented claims that change meaning) were found in items 1–6. Items 1, 2, 3, 4, and 6 are all confirmed correctly applied with no side effects. Item 5's plurality gloss is fine. Item 5's capitalization change introduced one cross-paragraph consistency defect (not present in the six-item list as a known issue, but caught per the requester's explicit instruction to compare against paragraph 14).

## Verdict

**ACCEPT WITH FIXES REQUIRED**

Required fix (one item, mechanical, low risk):
- Paragraph 14: change `this Person` to `this person` (lowercase), to match the now-lowercased "person"/"author" usage established in paragraphs 12–13. (Alternative: re-capitalize paragraphs 12–13 instead if the drafter intends to treat "Person" as a standing term of art alongside SOVEREIGN/SUBJECT/COMMONWEALTH — either resolution is acceptable, but the two paragraphs must agree. Given the rest of the chapter already lowercases ordinary modernized nouns like "power," "multitude," and "sovereign power" while reserving full caps for true terms of art (SOVEREIGN, SUBJECT, COMMONWEALTH, CIVITAS, LEVIATHAN), lowercasing paragraph 14 is the more consistent choice.)

No other changes required. All four originally-required fixes (unclosed parenthesis, "in awe" reversion, streamlined CIVITAS gloss, "pretext" reversion) are confirmed correctly applied with no new problems introduced. Of the two previously-unreviewed changes, the paragraph 13 "each ... author of" rewording is clean with no defect; the paragraph 12 capitalization/plurality-gloss change is fine except for the single cross-paragraph capitalization inconsistency noted above.
