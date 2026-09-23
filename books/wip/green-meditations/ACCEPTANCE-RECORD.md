# Acceptance Record — Meditations (Marcus Aurelius), modern-en

- **Book id:** `meditations` · **Edition:** `modern-en`
- **Date:** 2026-09-23
- **Status:** **ACCEPTED — ready for release handoff** (verdict at the end)

## Source and starting point

| Item | File | sha256 |
|---|---|---|
| Fidelity anchor (source) | `source.json` = served `app/public/data/editions/meditations-original-en.json`, byte-identical | `7798607dc6d8af0a25845b025405873c8a2597d44ed1f61eb5d803ba585e2830` |
| Starting point (live modern-en) | `baseline-live-modern-en.json` = served `app/public/data/editions/meditations-modern-en.json`, byte-identical | `e2cc6090b4cde62db3f991dd5f6714c5d194232c499de3bbe8ddd04915803d10` |
| **Accepted candidate** | `candidate.json` | **`4623d1191fbd1c09f9257acf7e73b49d5467e35fa0d9979e35c910bb24b9cc9f`** |

**Source identity verified.** The served `original-en` is George Long's 1862 translation (Project Gutenberg #15877, "Thoughts of Marcus Aurelius Antoninus"). A word-sequence diff of the whole served text against a fresh download of #15877 (Long's indented footnotes excluded) shows no missing body text. The only differences are:

- section numerals: Long heads each book with "I." and leaves section 1 unnumbered; the served text numbers it "1.";
- Long's illustration captions, and one footnote ("see Aristophanes…") that is not body text;
- verse lines Long sets as indented blocks, which the served text carries inline with their citations.

The earlier Casaubon→Long re-basing (2026-09-12) is therefore confirmed and was not repeated.

- **Stale repository record.** `books/raw/meditations/raw.txt` and `SOURCE.md` still describe Gutenberg #2680, which is Casaubon's translation, although `SOURCE.md` says Long. They are not the source of the served text.
- **Why they were left.** Correcting them is outside this content task, and they were not modified. They are listed in the release packet as a documentation item.

**Starting point assessment.** The live modern-en followed Long closely. The repository's own similarity classifier scores it at weighted similarity 0.879, with 9/12 books LIGHT and 38 long paragraphs identical to Long: **GATE FAIL**. It kept Long's obstacles, for example "no one can fix on me what is ugly", "ruling part" and "unsocial impulses" in Book II.1–2. The candidate is a fresh sentence-by-sentence rendering from Long. It keeps the live wording only where that was already plain and faithful; 5 paragraphs are unchanged.

## Structure

- 12 chapters ("Book 1"–"Book 12") and 487 paragraphs.
- Per-book paragraph counts: 17, 17, 16, 51, 36, 59, 75, 61, 42, 38, 39, 36. These are identical to the source and to the live edition.
- Every paragraph opens with the same section number as its source section.
- No merges, splits, reorders or deletions.
- JSON format matches the live file: `indent=1`, UTF-8 not escaped, and the same top-level keys.

## Standard

`STYLE-AND-TERMINOLOGY.md` was set during the Book II pilot and refined through review. It records:

- **Stable renderings:** ruling faculty, divine spirit within, nature of the universe, providence, impulse, impression, opinion/judgment, noble/shameful, fortune, makeup, and neither good nor bad.
- **Glosses once, at first use in reading order:**
  - I.7 sophist
  - I.8 living in keeping with nature, passion
  - II.2 ruling faculty
  - II.3 providence
  - II.13 divine spirit within
  - II.15 opinion
  - II.16 the oldest city = the universe
  - III.11 indifferent
- **Apparatus:** Long's editorial cross-references are omitted and his supplements absorbed; attributions of quoted authors are kept in words.
- **Proper names:** Long's spellings are kept. Obvious misprints in Long's printed names are corrected and logged.
- **Typography:** straight ASCII quotes and "..." ellipses, as in the live edition.

## Review coverage (no sampling at any stage)

Ids are `book.index`; the index is 0-based.

| Stage | Scope | Who | Result |
|---|---|---|---|
| Book II pilot | 2.0–2.16 (17) | Drafted by the lead editor. Independent source-based fidelity reviewer, plus a separate candidate-only accessibility reviewer | Fidelity 0 blocking, 7 minor, 2 ambiguities. Accessibility 1 blocking (2.15), 11 minor. The standard was updated from the pilot. |
| Drafting | Books I and III–XII | Book I drafted by the lead editor. Books III–XII each drafted by a separate drafter to the standard, with the Book II exemplar | Drafters' notes in `drafts/NOTES-bookNN.md` |
| Lead source comparison | All 487 sections | Lead editor, side by side with Long | `reviews/LEAD-SOURCE-COMPARISON.md`. Findings (3.5, 12.26) were referred to the reviewers. |
| R1 fidelity | All 487 sections, one fresh reviewer per book | Independent, source-based | Per book, blocking/minor/ambiguity: I 1/6/4 · II 0/7/2 · III 0/7/1 · IV 0/11/2 · V 0/12/2 · VI 0/4/3 · VII 0/11/3 · VIII 0/4/5 · IX 0/5/2 · X 0/5/3 · XI 1/5/4 · XII 1/7/3 |
| R1 accessibility | All 487 sections, one fresh reviewer per book | Candidate only (source never seen); first-time listener test | Per book, blocking/minor sections: I 1/12 · II 1/11 · III 1/13 · IV 7/23 · V 7/15 · VI 3/25 · VII 5/24 · VIII 3/26 · IX 4/14 · X 5/22 · XI 5/14 · XII 2/11 |
| R1 dispositions | Every finding in both reports | Books I–III by the lead editor. Books IV–XII by one editor per book, under a written policy with the I–III dispositions as worked examples | `reviews/R1-applied-bookNN.md`: each finding applied, rejected with a reason, or logged. Every fidelity blocking finding applied. Each accessibility blocking finding either fixed faithfully (the editor's own rewrite where the reviewer's added meaning) or rejected with a reason and then independently judged by the re-verifier (see below). |
| R1 re-verification | Every changed paragraph in every book (I 14, II 13, III 14, IV 31, V 21, VI 24, VII 29, VIII 26, IX 15, X 19, XI 18, XII 10) | Fresh independent verifier per book, with source and neighbouring sections | Also judged whether each rejected accessibility finding still left a listener lost. Defects found and fixed with the verifier's text: I 2 · II 4 (then R2: 1) · III 3 · IV 2 · V 4 · VI 1 · VII 2 · VIII 1 · IX 0 · X 2 · XI 1 · XII 0 |
| Cross-book consistency | Lead editor, programmatic, whole book | — | "constitution" unified to "makeup" (6.15, 6.43, 10.32). Ellipses normalised. |
| Final re-verification | The 24 paragraphs changed after their last independent check | Independent verifier | **VERIFIED CLEAN** (`reviews/FINAL-reverify.md`) |
| Final cross-book review | Books I–VI (196) and VII–XII (291), whole-book read against Long | Two fresh reviewers | Both **PASS**, 0 blocking. 8 minor findings: 7 applied, 1 declined with a reason (10.25). See `reviews/FINAL-crossbook-*.md` |
| Cross-book fix re-verification | The 7 paragraphs changed | Independent verifier | **VERIFIED CLEAN** (`reviews/FINAL-crossbook-reverify.md`) |

**Closure check.** For each final paragraph, the edition was compared with the last text an independent reviewer or verifier saw. **0 of 487 paragraphs** differ. Every paragraph of the accepted candidate has been independently checked in its final form.

## Screening tools (aids, not proof)

- **`books/classify-modern-en.py`**, run against the staged files through a temporary editions directory; no tool was modified:
  - candidate: weighted similarity **0.515**; LIGHT+MECHANICAL 0/12; identical long paragraphs 0/471 — **GATE PASS**
  - live baseline: 0.879 — **GATE FAIL**
- **Length:** 45,247 source words against 45,273 candidate words (ratio 1.001) after removing Long's cross-references. Nine paragraphs fall below 0.85 (9.19, 9.4, 11.22, 4.34, 10.36, 5.10, 6.31, 10.3, 7.36). Each was read against Long: the difference is Long's periphrasis, and nothing is missing. The cross-book reviewers also checked all sections below 0.90 clause by clause.
- **Structure and text:** section-number match, no archaic forms or banned renderings, no curly quotes, no stray whitespace — all clean.

## Principal decisions (documented)

- **Book II obstacles** (the brief's named examples):
  - 2.0: "no one can fix on me what is ugly" → "none of them can drag me into anything shameful", with the noble/shameful sense of Long's beautiful/ugly.
  - 2.1: "the ruling part" → "the ruling faculty—the reasoning mind that governs the rest of me".
  - 2.1: "pulled by the strings … to unsocial movements" → "jerked on strings like a puppet by impulses that set you against others".
- **Place notes.** "Written" is kept before "among the Quadi" (1.16) and "at Carnuntum" (2.16), so a listener does not hear the note as part of the list.
- **Long misprints** corrected in the modern text and logged in `AMBIGUITIES.md`:
  - 6.40 "wilt not blame the gods" is rendered "will blame". Long's argument and the Greek both require it.
  - 8.36 Fergamus → Pergamus.
  - 10.14 "Let me see" → "Let people see".
  - 12.26 Briae → Baiae.
  - 5.x small print slips.

  `original-en` is unchanged.
- **Alternatives Long offers are preserved**, for example:
  - 12.26 "Velius Rufus (or Rufus at Velia)";
  - 12.35 "five years or … three".

  Where only Long's main reading is kept (3.5 "[or, practically]"), the case is logged.
- **Fragments stay fragments.** Examples: 5.27 "... Neither a tragic actor nor a prostitute"; 7.57 "And remember..."; 11.17 "and if others are present ..."; 12.16 "For let your effort be—".
- **134 source ambiguities and readings** are recorded in `AMBIGUITIES.md`.

## Declined review findings (brief; full reasons in each disposition file)

- **"Unexplained term" findings** from per-book accessibility reviewers, who saw one book at a time. These terms are glossed once at first use in reading order, and adding more glosses would break the standard.
- **Accessibility rewrites that supplied content Long lacks.** Examples:
  - naming who speaks in bare dialogue;
  - explaining detached fragments;
  - adding historical background;
  - pairing 7.3's "the one / the other" against Long's order;
  - supplying the link in 7.23.

  In each case a faithful clarification was used where the English could be made plainer without adding meaning. Each re-verifier independently confirmed that none of the rejected findings leaves a first-time listener unable to follow the thought, and fixed the two places where one did (7.23, 7.50).
- **10.25 "movement" → "impulse":** declined. Long has "motion", and the Greek was not confirmed.
- **Optional polish** proposed by verifiers was not applied where the text was already clear and faithful.

## Verdict

**ACCEPTED — ready for release handoff.** Every book received:

- a lead paragraph-by-paragraph source comparison;
- a full independent source-based fidelity review;
- a fresh candidate-only accessibility review;
- dispositions for every finding;
- independent re-verification of every changed passage.

Final whole-book cross-book reviews pass. The last round of changes was re-verified clean, and every paragraph of the accepted candidate has been independently checked in its final form. Structure matches the source exactly.
