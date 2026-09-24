# Acceptance Record — To the Lighthouse (Virginia Woolf), modern-en

- **Book id:** `to-the-lighthouse` · **New book** (no live editions exist) · **Date:** 2026-09-24
- **Instruction revision:** book-task workflow and adding-book strategy from PR #158, branch `codex/adding-books-strategy-20260924` at `1a978c65` (not yet merged when this work started; read without merging). Repo base: `main` at `b91d4b8d` (branch point); current `main` `1bd1bfb3` touches no path in this package.
- **Fidelity anchor:** `editions/to-the-lighthouse-original-en.json`, sha256 `1662e69cd2781083e2332aeddd1e0c340446bdf2f7929c95da0d008e65b8d4f8` — Woolf's 1927 Hogarth text via Standard Ebooks (see `SOURCE.md`).
- **Candidate:** `editions/to-the-lighthouse-modern-en.json`

**Accepted sha256 (modern-en):**
```
17c56b3d069214329a1f636bc7ad0286e38576d70ebe7921affc431f90149205
```

- **Structure:** 42 chapters / 495 paragraphs. Chapter numbers, titles, `section` values, the `sections` array and per-chapter paragraph counts are identical to the original edition, so the pair is paragraph-aligned. Per-paragraph hashes: `editions/{original-en,modern-en}-paragraph-hashes.tsv`.
- **Standard:** `EDITORIAL-BRIEF.md` (written before rendering; one correction recorded below).

## How it was made

Twelve renderers each took a contiguous range (see `render/B01–B12`) and rendered it paragraph by paragraph against the brief and a lead-written calibration sample. Each batch had to pass a per-batch version of the committed similarity gate before hand-back. Several first drafts failed that gate as too close to Woolf (0.81–0.87) and were rewritten with real restructuring. The batches were merged into candidate r0 (`reviews/candidate-r0.json`, sha256 `84363ba7…a2695747`), with two lead corrections: straight apostrophes changed to ’ in three batch files, and the end of The Window restored to Woolf's “It's going to be wet tomorrow.”

## Review coverage

| Round | Scope | Reviewer | Method | Result |
|---|---|---|---|---|
| R1 fidelity ×5 | All 42 chapters, all 495 paragraphs (F1 1–8, F2 9–16, F3 17, F4 18–31, F5 32–42) | Fresh independent reviewers who did not render | Every source/modern pair read in full with its neighbours, then a whole-chapter re-read. Renderer-flagged uncertain passages were adjudicated one by one | 41 findings, 2 blocking: 27.0 (the washing given to the wrong woman) and 36.0 (the hedge “not obviously” lost). All 41 applied; 3 with adjusted wording, listed below |
| R1 accessibility ×2 | All 495 paragraphs (A1 1–19, A2 20–42) | Fresh reviewers who read the candidate only and never opened the source | First-time adult reader and listener | 115 findings (4 blocking), of which 57 are dash-style items (A1 41, A2 16). The lead screened every content finding against the source: 42 applied (4 with adjusted wording; this count includes one dash item applied directly) and 17 rejected as Woolf's own deliberate text (see below). The remaining 56 dash items were handled by one whole-book normalization |
| Normalization | Whole book | Lead | Spaced em dashes (chapters 18–24) closed up; noun “drawing-room” → “drawing room” (the hyphenated adjective kept before a noun) | 27 paragraphs; log in `reviews/R1-normalization-log.json` |
| R1 re-verification | All 98 paragraphs changed since r0 | Independent verifier | SOURCE / BEFORE / AFTER triple for each paragraph, with neighbours | 95 clean; 3 recommended defects (17.22 lost echo, 21.1 “dining-room”, 29.0 antecedent) |
| R2 fix + re-verification | 17.22, 21.1, 29.0 | Same verifier | As above | **VERIFIED CLEAN** |
| Gates | Whole book | `books/classify-modern-en.py` (unchanged code, run against the staging directory) | Similarity gate | **GATE PASS**: weighted similarity 0.612 (≤ 0.75); 0/42 light or mechanical chapters; 9/443 (2.0%) identical long paragraphs, all verbatim quoted verse; 0 wrapped; 0 truncated |
| Structure / truncation | Whole book | Lead script | Counts, titles, sections; length ratio; short paragraphs; italics, verse-line and bracket parity; straight quotes; name counts | No paragraph is below a 0.75 length ratio (whole book 1.028 × source words). No stubs. The one italics difference (19.5) is the accepted `_The Antiquary_`. 0 straight quotes |

No sampling was used at any stage. Findings, decisions and logs are all in `reviews/`: the `fid-F*.{json,md}` and `acc-A*.{json,md}` reports; the `R1-*-accepted.json`, `R1-*-rejected.json` and `*-applied-log.json` files; `R1-changed-paragraphs.txt`; and `R1-reverify.md`, which includes the R2 section.

## Conventions

- **Structure:** each of Woolf's numbered sections is one reader chapter (`The Window · 1` … `The Lighthouse · 13`), grouped by `sections` into the three parts.
- **Voice:** free indirect discourse is kept. Pronouns are replaced by names only where the reference was merely hard to track, not where Woolf withholds it deliberately (e.g. 37.10 “she had gone rigid”, 40.16–17, 32.6).
- **Refrains kept recognizable:**
  - “it won't be fine”, “Someone had blundered”, “We perished, each alone” (with Woolf's own present tense “we perish” at 33.11)
  - “Women can't paint, women can't write”, “Life stand still here”
  - “the thing is made that remains forever after” — the brief's motif list wrongly said “endures” and was corrected to Woolf's words
  - “It is finished”, “I have had my vision.” (the last sentence is word for word)
- **Quoted verse is verbatim**, with line breaks: Tennyson, Cowper, Browne, Shakespeare's Sonnet 98, “Luriana Lurilee”, the Grimm rhyme and “Damn your eyes”. Quoted prose (the Grimm tale, Scott) is modernized lightly.
- **Glosses** are brief and in narration only: Army and Navy Stores, Balliol, the Reform Bill, the Grisons, Tennyson's Light Brigade (4.0, 6.2), Cowper's “The Castaway” (33.6), Mile End Road, Sir Walter Scott / *The Antiquary* / Waverley, Michaelmas, Bœuf en Daube, *Prolegomena*, “forlorn hope”, the evening papers, the red-hot poker lily, and Maggie = Mrs. McNab.
- **Woolf's own inconsistencies are kept:**
  - eleven then ten ships (33.2)
  - “yellow bee” then “honey bee” (17.66, 19.1)
  - “Stormed at with / by shot and shell” (3.7, 6.3)
  - “You find us” and “You will find us much changed” (30.8)
  - spring light in a summer passage (25.4)
  - “the man in the drainpipe” (17.9)
- **Documented source variant:** at 14.6 the modern edition reads “power” (the US first-edition reading), where the anchor has “dower”. See `SOURCE.md`.
- **Period attitudes are kept, not softened:** e.g. Lily's “Chinese eyes”.
- **Spelling and style:** American spelling; “Mr.”/“Mrs.”; curly quotes; closed em dashes; `_italics_` in the reader's underscore convention.

## Adjusted and rejected proposals (brief)

- **Adjusted:**
  - 14.1: “by a bull” not added, since Woolf leaves it implicit.
  - 17.21: “help him find relief”, avoiding the bodily sense of “relieve himself”; 17.22 then echoes it with “relieve”.
  - 17.56: “If it was fine, they would go for a picnic.”
  - 22.3: the bracket keeps Woolf's deliberate repetition, “stretched his arms out”.
  - 28.2: “red-hot poker lily” instead of an added clause.
  - 28.5: “Maggie—Mrs. McNab herself”.
  - 40.7: “Lily had noticed her coming back.”
- **Rejected (source-faithful):**
  - A2: 25.4 spring; 30.8 changed; 32.1 “took her hand”; 32.6; 33.2 ships; 33.11 “we perish”; 37.2; 37.3 (two items); 37.10; 40.7 restructure.
  - A1: 6.3 “by”; 17.9 drainpipe; 17.24 (already consistent); 17.28 “a Lighthouse”; 17.56 motif; 19.1 bee.
  - Reasons for each are in `reviews/R1-acc-A*-rejected.json`.

## Verdict

**ACCEPTED — ready for integration handoff.**

- Two independent reviews each covered the whole book: a source-based fidelity review and a candidate-only accessibility read.
- Every blocking finding was fixed, and every changed paragraph was independently re-verified clean.
- The committed similarity gate passes, and the structure is identical to the original edition.

This is authoring-lane acceptance. It is not publication and not Anders's editorial sign-off.
