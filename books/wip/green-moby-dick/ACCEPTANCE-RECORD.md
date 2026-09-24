# Acceptance Record — Moby-Dick (Herman Melville, 1851), modern-en

- **Book id:** `moby-dick`
- **Edition:** `modern-en`
- **Date:** 2026-09-24
- **Branch:** `claude/charming-shannon-mojaef`. It is isolated and content-only; every file is under `books/wip/green-moby-dick/`.

## Inputs and hashes

| Item | File | sha256 |
|---|---|---|
| Source (fidelity anchor) | `source.json`, byte-identical to live `app/public/data/editions/moby-dick-original-en.json` | `30974242d9ee3eae074671da0b424c0ef5d8b00258acf43cf27d92905136c952` |
| Baseline (live modern-en before this work) | `baseline-live-modern-en.json`, byte-identical to live `moby-dick-modern-en.json` | `2ab04dd727bbe5804b7acf1d05f578cfed5aef17c08d7d72b6db9101f8c1763c` |
| **Accepted candidate** | `candidate.json` | **`1a3f31bbe6bb4bea415a29b509c81f303074bc858854c7bc00a49e8b68ffd52c`** |
| Completeness reference | Project Gutenberg #2701 (`pg2701.txt`, downloaded 2026-09-24; not committed) | `907420db6c4b68c70e2988cd2ad9c8cf79138667a01b63376d18dd17fef1a18b` |

**Source completeness.** A word-sequence diff of `source.json` against the PG #2701 body, from Chapter 1 to the Epilogue, finds no missing or extra text beyond chapter-heading tokens. Two source-level defects fall outside the scope of this paragraph-aligned repair. They are documented in `STRUCTURAL-HANDOFF.md`:
- three chapter titles cut by line-wrap, leaving fragments at 56.0, 57.0 and 73.0;
- the Etymology and Extracts front matter, which is missing.

## Earlier work located and reused

- **2026-09-11 audit.** Branch `origin/claude/upbeat-brown-cuttkn` at `d2ec5cfae270`:
  - per-book note `docs/modern-english-translation-audit-2026-09-11/per-book-notes/moby-dick.md` (sha256 `cd8d66ae…8e25`)
  - defect ledger `docs/content-release-2026-09-11/defect-ledger/jane-eyre-moby-dick-henry-iv-part-2-reconciliation.md` (sha256 `836a5d5c…7053`)
  - mechanical sample `mechanical/moby-dick.json` (`7ee5326f…be17`)
  - review-packet pairs (`4113efd1…94b1`) and mapping (`cb3f711a…4766`)
  - These audited exactly the live bytes above; the source and baseline hashes match.
- **No earlier repair candidates or reviews exist.** Every remote branch was checked, and all carry the identical modern-en blob `3b99c5a6…`. There were no candidate texts to reuse. Every demonstrated defect in the audit was used as a named target and has been verified fixed:
  - 76.1 anatomy reversal
  - 44.8 and 44.11 (Season-on-the-Line; Prometheus and vulture)
  - 79.0–79.5 (Shakespeare/Melancthon, "pleated with riddles", Lavater, the crocodile)
  - 118.0–118.2 (the order arrives; the sun apostrophe; "Science! Curse thee"; the level compass and dead-reckoning)
  - the 44 find-and-replace corruptions in chs 134–135
  - the slips at 1.1 ("Indian isles"), 1.0 ("in their degree"), 9.24 ("appall"), 9.25 ("no quarter in the truth") and 42.30 ("butterfly cheeks")

## Chapter 76, "The Battering-Ram" (the starting point)

The live 76.1 reversed Melville's anatomy. The source says "this whole enormous boneless mass is as one wad"; the live text said "almost all solid bone". It also invented a fireplace simile, imported "pleated with riddles" from ch79, and deleted the swim-bladder hypothesis (76.2) and the Darien/Lais close (76.3).

The lead restored all four paragraphs from the source:
- 76.0: the "vital point … infidel" stake.
- 76.1: the full anatomy, including the vestige of bone, twenty feet to the cranium, the boneless tough envelope, and "paved with horses' hoofs".
- 76.2: the hypothesis, with every hedge.
- 76.3: Darien, "provincial and sentimentalist in Truth", salamander giants and Lais.

Review outcome:
- independent fidelity review: **CLEAN**
- accessibility review: two of three edits applied
- re-verification: **VERIFIED CLEAN**

## Method (all 136 chapters, all 2,432 paragraphs, no sampling)

| Round | Scope | Who | Result |
|---|---|---|---|
| R1 repair | 22 batches covering every chapter | Repair editors (the lead did ch76), each reading every paragraph pair | 1,224 repaired paragraphs, each with its reason (omission, invention, meaning, hedge, technical, voice, unmodernized or corruption) |
| R2 fidelity | Every paragraph, with R1 changes scrutinized hardest | A **separate** independent source-based reviewer per batch | 205 fixes applied. Name-only items superseded by lead decision 7 were set aside (listed in `round2/SCREENING-LOG.md`) |
| R2 accessibility | Every paragraph | Separate **candidate-only** reviewers, who never saw the source | 240 edits applied after lead screening; 8 rejected and 3 applied with adjusted wording, each with its reason (`round2/SCREENING-LOG.md`, `round2/b76-acc-screening.md`) |
| R3 re-verification | Every paragraph changed in R2 | A fresh independent source-based verifier per batch | 37 residual defects found and fixed |
| Sweeps | Book-wide | Lead | Decision 7 name spellings (23 paragraphs); "quarter-deck" (2); species capitalization following the source paragraph (27) |
| R4 modernization | 435 paragraphs still at least 85% word-identical to 1851 English (the committed similarity gate failed at 0.775) | 5 editors | 416 re-rendered, 19 kept with stated reasons (verbatim quotation, song, dialect, plain dialogue) |
| R4 fidelity | Every R4 paragraph | 5 fresh source-based reviewers | 22 fixes applied (including 2 blocking: 73.31 and 96.6); 1 not applied (45.11, lead ruling) |
| R4 accessibility | Every R4 paragraph, with its neighbours | 5 fresh candidate-only reviewers | 23 edits applied, 2 rejected (91.1 and 54.3 are Melville's own wording) (`round4/SCREENING-R4.md`) |
| R5 final verification | All 126 paragraphs changed since their last independent source check (R3 fixes, sweeps, R4 fixes and edits) | 4 fresh source-based verifiers | 6 residual defects fixed (27.0, 55.1, 58.6, 81.46, 113.15, 118.0) |
| R5 micro-check | Those 6 paragraphs | A fresh verifier | **ALL VERIFIED CLEAN** |

Every applied change is logged in `ledger.jsonl`, with its round, source file, old and new paragraph hash, reason and category. The reviewers' reports and proposals are in `round1/` through `round5/`. The shared briefs are in `STYLE-BRIEF.md` and `prompts/`.

## Whole-book checks on the accepted candidate

- **Structure:**
  - 136 chapters and 2,432 paragraphs.
  - Chapter numbers, titles and per-chapter paragraph counts are identical to the source and the baseline.
  - `content_edit_helpers.validate_structure` and `assert_only_changed` passed on every apply.
- **Similarity gate** (`books/classify-modern-en.py --gate`, run on the staged files): **PASS**.
  - Weighted similarity 0.727 (limit 0.75).
  - LIGHT+MECHANICAL chapters: 0 of 136.
  - Identical long paragraphs: 0.1%.
  - Baseline, for comparison: 0.701, with 17.6% LIGHT+MECHANICAL.
- **Truncation audit** (`books/audit-truncation.py`): 0.
- **Short-paragraph screen** (source ≥40 words, ratio <0.75): 141 at baseline, 1 now. The one is 7.0 (42→31 words), which is complete; its phrasing is simply tighter.
- **Word count:** source 207,804; baseline 191,004; candidate 212,354.
- **`books/content-verify.py`:** 6 flags, all false positives. Each is either a sentence-initial word treated as a noun ("Hitherto", "Whereupon", "Hast") or a capitalization-only difference ("gamming", "carpenter").
- **Corruption and convention scans:** zero of each of the following:
  - `…before` corruptions and `eyou`
  - curly quotes and underscores
  - "harpooneer" and unspaced em-dashes
  - double spaces and empty paragraphs
- **Doubled words (8):** all legitimate ("that that", "had had", Fleece's "dat dat").
- **Archaic pronouns remain only where deliberate:**
  - 16.49 (the Quaker "Does thee?" joke)
  - 32.9 (Job) and 35.9 (Byron), which are verbatim quotations
  - 99.13–99.19 (Pip's grammar-book conjugation)
  - 123.4 (a shanty)
  - 16.42, where "thee" and "thou" are mentioned as words, not used
  - 72.9 ("ye gods!", a living idiom)
- **Cross-chapter consistency:**
  - One convention for quotes, dashes and spelling.
  - "Have you seen the White Whale?" is used in every gam.
  - Species capitalization follows the source paragraph.
  - Geographic spelling follows decision 7.
  - Period terms follow decision 1.
  - Footnote asterisks follow decision 2.

## Conventions and lead decisions

See `STYLE-BRIEF.md`, "Lead decisions" 1–8. In brief:
1. Period language is kept as printed.
2. Melville's footnote asterisks are kept.
3. Personal names and titles stay as printed.
4. The æ and œ ligatures are modernized.
5. Dialect is kept light and readable.
6. The gam hail is uniform.
7. Geographic names and names of peoples take their modern spelling (spelling variants only, never renamings; quoted documents keep theirs).
8. Verbatim quotations of scripture and verse keep archaic pronouns.

Italics: the edition's existing no-underscore convention is kept, and load-bearing emphasis is expressed in wording.

## Open or source-level items (none blocks acceptance)

- The structural handoff in `STRUCTURAL-HANDOFF.md`: three title-wrap fragments, and the missing front matter.
- Melville's own inconsistencies are deliberately kept:
  - New Zealand Jack vs Tom (45.4 and 45.5)
  - the stepmother/mother slip (4.1)
  - Archy vs Cabaco (48.19 and 50.5)
  - the date arithmetic in 101.0
  - "Lais" for Sais (76.3)
  - "guilt and guiltiness" (134.10)

## Verdict

**ACCEPTED — ready for release handoff.** Every paragraph has had an independent source-based fidelity review and a separate candidate-only accessibility review. Every change after those reviews was independently re-verified against the source, and the last round came back clean. Structure and alignment match the source. The committed similarity gate passes. Nothing has been published.
