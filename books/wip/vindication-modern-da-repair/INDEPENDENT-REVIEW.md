# Independent Review — A Vindication of the Rights of Woman, modern-da repair

Reviewer: independent session, formed judgment from the English baseline and
candidate JSON before reading `RELEASE-PACKET.md`.

## Verdict: DO NOT ACCEPT (as-is) — one confirmed defect, otherwise strong

The translation is of high quality throughout and the packaging claims are
almost entirely accurate, but the packet's claim of "scanned all translated
chapters for leftover English ... none found" is **wrong**: one paragraph of
untranslated English survived into the candidate. This is a single, easily
fixed paragraph — everything else checked out clean. Recommend: fix the one
paragraph below, re-verify, and this is a straightforward ACCEPT.

## 1. Paragraph counts — PASS

All 15 file-chapters match the English baseline paragraph count exactly, in
order:

| file-ch | Title | EN | Candidate | Live |
|---|---|---|---|---|
| 1 | Dedication | 21 | 21 | 21 |
| 2 | Introduction | 17 | 17 | 17 |
| 3 | Chapter 1 | 31 | 31 | 31 |
| 4 | Chapter 2 | 76 | 76 | 76 |
| 5 | Chapter 3 | 52 | 52 | 52 |
| 6 | Chapter 4 | 86 | 86 | 86 |
| 7 | Chapter 5 | 172 | 172 | 172 |
| 8 | Chapter 6 | 20 | 20 | 20 |
| 9 | Chapter 7 | 42 | 42 | 42 |
| 10 | Chapter 8 | 33 | 33 | 33 |
| 11 | Chapter 9 | 33 | 33 | 33 |
| 12 | Chapter 10 | 8 | 8 | 8 |
| 13 | Chapter 11 | 20 | 20 | 20 |
| 14 | Chapter 12 | 84 | 84 | 84 |
| 15 | Chapter 13 | 83 | 83 | 83 |

## 2. Chapters 7, 8, 9 (file numbering; book's own Ch. 5, 6, 7) — PASS

Programmatically diffed candidate vs. the live defective file: all three
chapters are **byte-identical**, paragraph-for-paragraph. No scope creep, no
accidental re-translation of already-correct text.

## 3. The 7 hand-assembled paragraphs — PASS

All 7 checked individually against the English baseline; all are faithful,
complete, non-invented Danish, register-consistent with the rest of the
translation.

- file-ch6 (book Chapter 4), para 6 — faithful full-sentence translation.
- file-ch6, para 13 — faithful.
- file-ch6, para 17 — faithful.
- file-ch6, para 23 — faithful, including the »fuldkommen i sig selv« quotation and OVERFLADISKE for FRIVOLOUS emphasis-caps preserved.
- file-ch6, para 25 — faithful.
- file-ch10 (book Chapter 8), para 15 — footnote, **not skipped/empty**: "(*Fodnote. Jeg sigter til forskellige biografiske skrifter, men navnlig til Boswells Life of Johnson.)" — complete and faithful, including the "Boswell's Life of Johnson" proper-noun/title reference kept in English as Wollstonecraft's original does.
- file-ch13 (book Chapter 11), para 17 — footnote, **not skipped/empty**: the servant/hair-dressing anecdote is fully and faithfully rendered, including the embedded quoted dialogue in »...« and the closing rhetorical question.

## 4. Broader sample of translated chapters, incl. the four longest — PASS

Sampled paragraphs at wide intervals (start/quarter/mid/three-quarter/end)
across file-ch4 (76 paras), file-ch6 (86 paras), file-ch14 (84 paras) and
file-ch15 (83 paras), plus file-ch1–3, 10, 11, 13 more lightly. Findings:

- Wollstonecraft's long periodic sentences are preserved as single flowing
  Danish sentences (not split or compressed) — e.g. file-ch4 para 50 (the
  "Let us eat, drink, and love, for tomorrow we die" passage) and file-ch14
  para 63 (child-rearing/horse-breeding passage) both carry every clause
  and subordinate qualification across into the Danish.
- Ran an automated length-ratio check (Danish/English character length) on
  every paragraph >40 characters outside chapters 7-9: **zero** paragraphs
  fell below a 0.55 ratio, i.e. no evidence of systematic compression or
  dropped clauses anywhere in the book.
- Proper-noun counts (Rousseau, Johnson, Chesterfield, Smith, Locke,
  Leibniz, Hume, Milton, Bacon, Sappho, Eloisa, Macaulay) were compared
  paragraph-corpus-wide between English and Danish for the four longest
  chapters: **exact 1:1 count match** for every name that appears — no
  names dropped, none duplicated.

## 5. Residual English / empty / duplicate paragraphs — ONE DEFECT FOUND

- **Empty paragraphs:** none, anywhere.
- **Duplicate paragraphs:** none introduced by the repair. (Chapters 7-9,
  which are untouched pre-existing content, contain one internal duplicate
  pair — file-ch7/book-Ch.5 paragraphs 9 and 11 are identical to each other
  and to English — but this is pre-existing, out of this repair's scope,
  and already present in the live file untouched.)
- **Residual English — CONFIRMED DEFECT:**

  > **file-ch15 (book's own "Chapter 13"), paragraph index 61**
  > - English: `Besides, how can women be just or generous, when they are the slaves of injustice?`
  > - Candidate (Danish file): `Besides, how can women be just or generous, when they are the slaves of injustice.`

  This paragraph was left completely untranslated — copied verbatim from
  the English source, with only the terminal `?` silently changed to a
  `.` (so it is not even byte-identical to the English baseline, which
  would at least have been an honest "untouched" marker — it reads as a
  transcription/typo on top of being untranslated). It sits between two
  fully-translated Danish paragraphs (60 and 62), so it is an isolated
  miss, not evidence of a larger untranslated block.

  I ran an automated sweep (English-function-word density heuristic) over
  every non-Danish-character-containing paragraph in the whole book,
  excluding chapters 7-9 and the legitimate "M. W." signature line in the
  Dedication (paragraph 20, correctly left untranslated as a signature).
  This paragraph was the **only** hit. No other residual English exists
  anywhere else in the 13 repaired chapters.

## 6. Prose register vs. chapters 7-9 reference — PASS

Danish throughout the repaired chapters reads as genuine idiomatic literary
Danish, consistent in register with the accepted chapters 7-9:

- `»...«` guillemets used consistently for quotations (110 paragraphs use
  them); zero straight double-quotes (`"`) survive anywhere in the file.
- Formal/literary register maintained ("stræbe," "fornedret," "sindsstyrke,"
  "gemyt," "forsynet," etc.) — not a colloquial or flattened register.
- Long subordinate-clause chains and semicolon-linked periodic sentences
  are preserved rather than broken into short simple sentences — matches
  the style of the accepted Chapter 5 reference.
- All sampled proper nouns (Rousseau, Pope, Cato, Mahomet, Boswell,
  Johnson, etc.) are correctly preserved un-Danished, as in the reference
  chapters.
- No calque or machine-translation tells detected (no literal English word
  order, no untranslated idioms, no mistranslated false friends spotted in
  the sampled passages).

## Comparison with the release packet

Read after forming the above independently. The packet's structure,
per-chapter counts, and byte-identical claim for chapters 7-9 all check out
exactly as stated, and its account of the 7 hand-assembled paragraphs
matches what I found (all faithful, footnotes present and complete).

The one place the packet is wrong: it states "Scanned all translated
chapters for leftover English (heuristic: paragraphs >40 characters
containing 3+ common English function words) — none found." The
undetected paragraph (file-ch15 para 61) is only 84 characters and
contains just one clear match against a "the/and/which/shall/..." style
word list — it likely fell under whatever threshold or word list the
packet's scan used. This is worth noting for future release packets: the
detection heuristic needs a lower threshold or a Danish-character-absence
check (i.e., flag any paragraph with zero å/æ/ø/» characters for manual
review, regardless of function-word count) — that check alone catches this
one instantly and produces no other false positives in this book.

## Action required before ACCEPT

Translate file-ch15 (book's own "Chapter 13") paragraph index 61 into
Danish, in the established register, e.g. along the lines of:

> "Desuden, hvordan kan kvinder være retfærdige eller gavmilde, når de er uretfærdighedens slaver?"

(Illustrative — the fixing translator should render it directly in context
with paragraphs 60/62, not copy this suggestion verbatim without checking
fit.) Re-run the residual-English sweep after the fix to confirm no other
instance was missed, then this package is ready to accept.
