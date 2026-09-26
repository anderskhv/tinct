# Independent Fidelity Review — Discourse on Inequality, Danish Appendix/Footnotes Merge

**Reviewer:** Independent review agent (separate from the translation task)
**Date:** 2026-09-26
**Scope:** Verify the merge of Cole's Appendix (new chapter 5, "Tillæg") and 9 new footnotes (4 in chapter 3 "Del 1", 4 in chapter 4 "Del 2" — 8 numbered footnotes + 1 cross-reference, see note below) into the already-accepted Danish `modern-da` candidate, against the already-accepted English `modern-en` ground truth.

**Files reviewed:**
- Candidate: `books/wip/discourse-on-inequality-modern-da-repair/editions/discourse-on-inequality-modern-da.json`
- English ground truth (accepted): `books/wip/discourse-on-inequality-frontmatter-repair/editions/discourse-on-inequality-modern-en.json`
- Prior Danish state (pre-merge): `git show 45d98976:books/wip/discourse-on-inequality-modern-da-repair/editions/discourse-on-inequality-modern-da.json`

## 1. Structure and counts

- Candidate is valid JSON (`json.load` succeeds).
- Exactly **5 chapters**, titles: Tilegnelse, Forord, Del 1, Del 2, Tillæg.
- Per-chapter paragraph counts: **26, 25, 56, 71, 16** — matches the requested target and the English `modern-en` chapter-for-chapter exactly (Dedication 26, Preface 25, Part 1 56, Part 2 71, Appendix 16).

## 2. Chapters 1–2 unchanged

Compared chapter 0 (Tilegnelse) and chapter 1 (Forord) between the pre-merge git state (`45d98976`) and the current candidate as parsed JSON objects: **both are equal, byte-for-byte** (title, number, and every paragraph string identical). The merge did not touch front matter.

## 3. New-paragraph positions match English exactly

The prior Danish chapter 3 (Del 1) had 52 paragraphs; chapter 4 (Del 2) had 67. The candidate has 56 and 71 respectively — a net gain of exactly 4 in each, as specified.

I aligned every prior-Danish paragraph against the candidate by exact string match (a sequential two-pointer scan). Result: **all 52 and all 67 prior paragraphs matched, in order, with zero unmatched leftovers** — confirming nothing pre-existing was reordered, dropped, merged, or altered. The only paragraphs not present in the prior state are 4 new insertions per chapter, at candidate indices:

- Del 1 (chapter index 2): **17, 35, 36, 39**
- Del 2 (chapter index 3): **35, 46, 50, 63**

I then independently located the numbered footnote paragraphs in the English `modern-en` ground truth by pattern-matching `^\d+\.\s`:

- Part 1: indices **17** ("1. See the Appendix."), **35** ("2. Justin..."), **36** ("3. Egoism should not be confused..."), **39** ("4. Juvenal...")
- Part 2: indices **35** ("5. Ovid..."), **46** ("6. Tacitus..."), **50** ("7. From \"Of the Rights...\""), **63** ("8. Distributive justice...")

These are **exactly the same indices** as the new Danish paragraphs. The 4+4 new footnotes are inserted at precisely the same relative positions as in English, with everything else in the same relative order. Positional check: **PASS**.

## 4. Fidelity — all 24 new paragraphs read against English

### Footnotes (8 total — chapters 3 and 4)

Read all 8 footnotes side by side:

| # | EN | DA | Verdict |
|---|----|----|---------|
| 1 | "1. See the Appendix." | "1. Se Tillægget." | Exact, correct cross-reference to new chapter title. |
| 2 | "2. Justin, History, ii, 2." | "2. Justin, Historier, ii, 2." | Faithful; title translated ("Historier"), consistent with how the book already translates classical work titles (see below). |
| 3 | Long footnote distinguishing egoism from self-love (10-sentence argument) | Full 10-sentence rendering, every clause present, including the Orinoco-adjacent reasoning about comparison, contempt, and injury | Complete — no summarization or dropped clauses. |
| 4 | "4. Juvenal, Satires XV, line 151." | "4. Juvenal, Satire xv, 151." | Faithful. |
| 5 | "5. Ovid, Metamorphoses XI, line 127." | "5. Ovid, Forvandlinger XI, 127." | Faithful; "Metamorphoses" rendered as "Forvandlinger," a standard Danish title for Ovid's work. |
| 6 | "6. Tacitus, Histories IV, 17." | "6. Tacitus, Historier IV, 17." | Faithful. |
| 7 | "7. From \"Of the Rights of the Most Christian Queen...\", 1667." | "7. Fra »Om Den Allerkristneste Dronnings Rettigheder over forskellige Stater i det spanske Monarki«, 1667." | Faithful, full title translated and quote-marked with Danish guillemets, consistent with book convention. |
| 8 | Long footnote on distributive justice, Isocrates, censors, magistrates (9 sentences) | Full 9-sentence rendering, every argument step present (distributive vs. equal justice, the Isocrates/Athenian reference, the censor/magistrate distinction, public opinion vs. corruption) | Complete. |

No footnote is dropped, truncated, or paraphrased down. Sentence counts match 1:1 in every case I checked in detail (footnotes 3 and 8, the two argumentative ones).

**Citation convention check (task 4):** Chapter 3/4's pre-existing prose already Danicizes classical/philosophical names selectively — e.g. "Aristoteles," "Platon," "Lykurg," "Plinius," "Ludvig XIV," "Thesmoforierne" (per the prior accepted chapter-4 review) — while leaving others (Hobbes, Locke) in their original spelling. The new footnotes follow the same pattern: work titles are translated ("Historier," "Forvandlinger") while author names close to their English/Latin form are kept as in the English source ("Justin," "Tacitus," "Ovid," "Juvenal," "Isokrates" — note Isocrates *is* Danicized to "Isokrates" in footnote 8's body text, matching the "Platon"/"Aristoteles" pattern). This is internally consistent with the book's established convention — **not a defect**.

### Appendix (chapter 5, "Tillæg," 16 paragraphs)

Read all 16 paragraphs in full against English. Findings:

- **Sentence counts match exactly** in all 16 paragraphs (verified by period-count as a proxy, cross-checked against full reads of paragraphs 0, 1, 2, 3, 7, 10, 11, 12, 15).
- **Length ratios (DA chars / EN chars)** range 0.80–1.14 across all 16 paragraphs — normal Danish/English variance, no outliers indicating a dropped clause or padded/invented content.
- Close full-text read of the densest/highest-risk paragraphs:
  - **Para 3** (savage-man-at-peace): every clause present — the meal dispute, the "no pride" reasoning, the four-stage escalation to civilized-man's needs (necessities → luxuries → wealth → subjects → slaves), the closing "moral portrait" line. Complete.
  - **Para 7** (marriage/infanticide critique): the longest and most polemically dense paragraph — all five enumerated "shameful methods" (depraved appetites, secret abortions, infant abandonment/killing, castration for singing or jealousy), the double-crime framing, the rhetorical question sequence on paternal coercion (talent wasted, forced vocations, broken marriages, mismatched spouses, mercenary marriages), and the closing direct address ("Forgive me, father and mother...") are all present, in order, with nothing summarized.
  - **Paras 10–12** (luxury/agriculture economics): the luxury-as-disease-not-cure argument, the "scorching winds... devouring insects" simile, the derivation from luxury of the liberal/mechanical arts and commerce, and the agriculture-least-profitable-because-most-necessary rule are all fully rendered.
  - **Para 1** (footnote cross-reference — see term-consistency check below).
- No paragraph is compressed, summarized, or has an invented sentence not present in the English.

**Verdict for task 4 (completeness/fidelity of all 24 new paragraphs): PASS.** Nothing dropped, nothing summarized, nothing mistranslated in a way that changes meaning.

## 5. Register/term-consistency verification (the translator's specific claim)

Checked the translator's claim that "faculty of self-improvement" in the new Appendix footnote matches the term already used at Del 1 (chapter 3) paragraph 16 (0-indexed) of this Danish edition.

- **Appendix footnote 1** (chapter 5, paragraph index 1): *"1. Se »evnen til selvforbedring«."*
- **Del 1, paragraph index 16** (the paragraph on the faculty distinguishing man from beast): *"...er der en anden meget specifik egenskab, der skiller dem ad, og som ikke tillader nogen debat: **evnen til selvforbedring**, som, med omstændighedernes hjælp, gradvis udvikler alle vores andre evner..."*

**The term matches exactly, word for word: "evnen til selvforbedring."** The claim is verified true, not just asserted.

I also spot-checked broader terminology consistency across chapters (word-count scan for `naturtilstand`, `borgerlige samfund`, `selvkærlighed`, `egoisme`, `perfektibilitet`, `medfølelse`): all key recurring terms are used consistently within the chapters where they occur, and the new footnote 3 (which explicitly defines egoisme vs. selvkærlighed) uses exactly the same two terms as the rest of Del 1, not synonyms or alternate coinages.

**Verdict for task 5: PASS — register and terminology are consistent, and the specific cross-reference claim is verified true.**

## 6. Empty paragraphs / leftover English

Scanned every paragraph in all 5 chapters programmatically for empty strings and for common English function-word patterns (` the `, ` and `, ` of `, ` is `, ` was `, ` which `). **Zero hits.** No empty paragraphs, no leftover English text anywhere in the file.

## 7. Verdict

**ACCEPT.**

- Structure: exactly 5 chapters with paragraph counts 26/25/56/71/16, matching English exactly.
- Chapters 1–2 (Tilegnelse, Forord) are byte-identical to the pre-merge Danish state — no unintended changes.
- The 4+4 new footnotes in chapters 3 and 4 are inserted at exactly the same relative positions as in the English ground truth, with every pre-existing paragraph preserved in the same relative order (verified by full sequential alignment, zero unmatched leftovers).
- All 24 new paragraphs (8 footnotes + 16 Appendix paragraphs) are complete, faithful renderings — no drops, no summarization, no invented content — verified both by full close reading of the argumentatively dense passages (Appendix paras 3, 7, 10–12; footnotes 3, 8) and by a chapter-wide sentence-count and length-ratio check across all 24 paragraphs.
- Citation register for classical references (Justin, Tacitus, Ovid, Juvenal, Isocrates) is consistent with this book's established convention of translating work titles while handling author names as the existing chapters already do.
- The specific translator claim — that "faculty of self-improvement" in the new Appendix footnote matches "evnen til selvforbedring" already used at Del 1 paragraph 16 — is verified **true**, exact wording match.
- No empty paragraphs, no leftover English anywhere in the file.

No paragraph-level defects found. No fixes required before this candidate can proceed to publication handoff.
