# Tinct QA — Full Report (2026-04-08)

## Executive Summary

20 books checked across 3 QA layers: structural checks, Danish spot-checks, and Danish watchlist pattern scans.

- **15 books launch-ready** (no blocking issues)
- **3 books need re-generation** (structural defects — not fixable with word-level edits)
- **2 books need targeted fixes** (specific paragraphs)
- **~40 items flagged for human review** across all books (word-level, takes ~30 min total)

---

## Blocking Issues (must fix before launch)

### 1. Paradise Lost — Paragraph misalignment (modern-da)
The verse→prose conversion redistributed content across paragraph boundaries inconsistently. In chapters 1 and 6, the Danish paragraphs are ~7 paragraphs ahead of the English original. Split-pane will show completely different scenes side by side.
**Action:** Re-generate paradise-lost-modern-da.json with strict paragraph-by-paragraph correspondence. All 12 chapters need verification.

### 2. Divine Comedy — Paragraph content bleed (modern-da)
Three confirmed cases where Danish paragraphs absorbed content from adjacent paragraphs:
- Ch23/p49-50: merged content
- Ch49/p1-2: content redistribution, p2 is a stub
- Ch97/p43-44: content bleed, p44 is a 29-char stub
**Action:** Re-generate at minimum these 3 chapter pairs. Consider full re-generation for safety.

### 3. Ulysses ch9 — Fabricated content (modern-da)
Episode 9 (Scylla and Charybdis) p15: the original's Synge allusion and Latin phrase were replaced with an invented Kathleen quote. This is a hallucination.
**Action:** Re-generate ulysses ch9 modern-da. Audit other episodes for similar fabrication.

### 4. Meditations ch10/p7 — Truncated (both modern-en and modern-da)
Both translations are 29% of original length. A 7-step philosophical argument was compressed to 3-4 steps. Missing: river metaphor, fire/renewal cosmology, personal identity argument.
**Action:** Re-translate this paragraph in both EN and DA at full length via CLI.

---

## Scores by Book

| Book | Tier | Structural | Danish Score | Verdict | Notes |
|------|------|-----------|-------------|---------|-------|
| Bible | Flagship | WARN (38) | 5.0/5 | PASS | Outstanding. Theological terms correct. |
| Odyssey | Flagship | PASS | 4.2/5 | PASS | Typo fixed. Minor calques. |
| Hamlet | Flagship | WARN (140) | 4.1/5 | PASS | Typo fixed. Long speeches slightly stiff. |
| Pride & Prejudice | Flagship | WARN (5) | 4.4/5 | PASS | Wit preserved. Minor calque. |
| Meditations | Flagship | WARN (2) | 4.7/5 | **FIX ch10/p7** | Excellent except truncation. |
| Frankenstein | Library | WARN (9) | 5.0/5 | PASS | Best Danish in the library. |
| War and Peace | Library | WARN (111) | 4.6/5 | PASS | 90x "rykkede" overuse. |
| Crime & Punishment | Library | WARN (191) | 4.5/5 | PASS | Off-by-one fixed. |
| Jane Eyre | Library | WARN (270) | 4.1/5 | PASS | Duplicate fixed. |
| The Republic | Library | WARN (1283) | 4.6/5 | PASS | Socratic dialogue, short paras expected. |
| Art of War | Library | PASS | 4.75/5 | PASS | One accuracy issue in opening line. |
| Gilgamesh | Library | PASS | 4.75/5 | PASS | Slightly flat epic register. |
| The Aeneid | Library | WARN (333) | 4.4/5 | PASS | Verse compression expected. |
| Macbeth | Library | WARN (61) | 4.9/5 | PASS | Clean, sharp translations. |
| Romeo & Juliet | Library | WARN (125) | 4.8/5 | PASS | Mercutio's death excellent. |
| The Tempest | Library | WARN (71) | 4.7/5 | PASS | Minor translationese. |
| Midsummer | Library | WARN (72) | 4.6/5 | PASS | Good voice differentiation. |
| Paradise Lost | Library | WARN (124) | Quality good | **RE-GENERATE** | Paragraph misalignment. |
| Divine Comedy | Library | WARN (5) | 4.2/5 | **RE-GENERATE** (3 chapters) | Content bleed. |
| Ulysses | Library | WARN (479) | 4.25/5 | **AUDIT ch9** | Hallucinated content. |

---

## Danish Watchlist Pattern Scan — 584 Hits

### False Cognates (17 hits — highest priority)
- **"eventuelt"** (1 hit, Bible ch1069): Almost certainly wrong. Should be "til sidst" or "med tiden".
- **"realisere"** (7 hits): Bible ch369 and Jane Eyre ch13 likely errors. Republic 4 hits borderline (philosophical "make real").
- **"aktuel/aktuelle"** (8 hits): Mostly correct usage meaning "current". Low priority.
- **"gilder"** (5 hits): All correct (feasts/parties). No action.

### Deflated Verbs: "rykkede" (200 hits)
War and Peace (90) and Bible (65) are the worst. Not wrong per se, but deadening repetition. Danish has "drog frem," "marcherede," "brød frem," "stormede," "trak" etc.

### English Article Interference: "den mand" etc. (384 hits)
Bible (124) and War and Peace (70) dominate. Many are legitimate relative clause constructions ("den mand, der..."), but the volume suggests systematic translationese. Needs sampling.

---

## Bugs Fixed During This QA Run

| # | Book | Issue | Fix |
|---|------|-------|-----|
| 1 | Jane Eyre | ch37/p88 duplicate paragraph (all editions) | Removed duplicate, 263→262 paras |
| 2-5 | Crime & Punishment | ch8 off-by-one cascade idx 121-127 (EN+DA) | Re-translated 8 paragraphs |
| 6 | Hamlet | ch10/p11 "broderbord" → "broderblod" | Typo fixed |
| 7 | Odyssey | ch24 "Derpfå" → "Derpå" | Typo fixed |

---

## What Needs Your Review

See individual `{bookId}-review-queue.md` files. Estimated total: ~30 minutes across all books.
