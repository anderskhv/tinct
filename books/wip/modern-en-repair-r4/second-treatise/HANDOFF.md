# Second Treatise — modern English repair r4

Status: READY for staged repair review. Whole-book gate PASS. All 13 targeted chapters are complete; no resume point remains. This is a content-only staging package, not a publication. The protected REAL chapters retain inherited clipped endings, documented below.

Hume was completed and pushed first: `9212350f40b83ed7be8d5099ad9bc67dbc2a243e` on `content/modern-en-repair-r4`. This package is the second book on that branch.

Baseline and instruction revision: `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`. Owned path: `books/wip/modern-en-repair-r4/second-treatise/` only. The workflow was skimmed and the Modern English rules read as requested. No Anthropic API calls or spend; no generation API calls, publication, deployment, or edits to live editions, app, registry, scripts, tests, or config.

## Changed chapters and paragraphs

The staged original is a byte-identical copy of the live original. The staged modern began as a copy of the live modern. Every paragraph in each baseline LIGHT chapter received a sentence-level rendering or, for preserved Latin passages, a complete accompanying English rendering. No paragraph was merged, split, or removed. Technical terms state of nature, property, and consent remain consistent.

- Chapter 6: paragraphs 1–27 (all).
- Chapter 7: paragraphs 1–22 (all).
- Chapter 8: paragraphs 1–34 (all).
- Chapter 9: paragraphs 1–12 (all).
- Chapter 11: paragraphs 1–19 (all).
- Chapter 12: paragraphs 1–6 (all).
- Chapter 13: paragraphs 1–10 (all).
- Chapter 14: paragraphs 1–10 (all).
- Chapter 15: paragraphs 1–7 (all).
- Chapter 16: paragraphs 1–23 (all).
- Chapter 17: paragraphs 1–2 (all).
- Chapter 18: paragraphs 1–15 (all).
- Chapter 19: paragraphs 1–48 (all).

The precise one-based changed-paragraph list is in `changed-paragraphs.json` (235 changed paragraphs). REAL chapters 1–5 and 10 remain exactly unchanged. There were no original-identical paragraphs over 40 words in those protected chapters requiring the specified exception.

## Whole-book gates

Command used (absolute path resolved in this checkout):

`python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r4/second-treatise/second-treatise --gate --per-chapter`

| Measure | Before | After |
|---|---:|---:|
| Weighted similarity | 0.865 | 0.461 |
| LIGHT + MECHANICAL | 13/19 (68.4%) | 0/19 (0.0%) |
| Identical long paragraphs (gate definition: at least 80 characters) | 3/291 (1.0%) | 1/291 (0.3%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations detected by gate | 0 | 0 |
| Result | FAIL | PASS |

Full before/after chapter classifications are saved in `gate-before.txt` and `gate-after.txt`. The final buckets are 13 REAL-HEAVY and 6 REAL.

Independent structural checks passed: 19 chapters, 301 paragraphs, each chapter's paragraph count equals the original; all edition and chapter metadata match the live modern; protected REAL chapters are exactly unchanged; every paragraph is at least 75% of source whitespace-delimited words (minimum 0.751773); no source paragraph loses an exclamation mark. These checks complement the rendering review; the similarity gate alone does not certify semantic fidelity or catch all inherited source defects.

## Spot reads — first three paragraphs of three chapters

- Chapter 6, paragraphs 1–3: compared source and candidate. The objection to “paternal” naming, mother's equal claim, all four Biblical references, the two-person objection to patriarchal monarchy, and equality of jurisdiction distinguished from age, virtue, merit, birth, gratitude and alliance are preserved.
- Chapter 13, paragraphs 1–3: compared source and candidate. Preserves legislative supremacy during government, the people's retained power upon breach of trust and dissolution, the inalienability of self-preservation, executive supremacy in its qualified sense, joint lawmaking, allegiance to public law and loss of authority when the ruler acts by private will.
- Chapter 19, paragraphs 1–3: compared source and candidate. Preserves the distinction between society and government dissolving, foreign conquest and return to personal safety-seeking, whirlwind/earthquake and house imagery, internal dissolution, the legislature as the living body's soul and single will, appointment by consent, and resistance to unauthorized replacement lawmakers.

Additional attention: the repeated argument in 17:2 remains repeated; 16:22 retains its exclamation; the full Algiers analogy in 18:15 remains; chapter 19 retains Ulysses, Polyphemus, Barclay, Buchanan, Juvenal, Winzerus, Nero, Caligula, Alexandria, Bilson, Bracton, Fortescue, Mirrour, Hooker, Jeptha, the Egyptian under-taskmasters allusion, and the final return of power to society. Latin quotations in 19:28, 19:35, 19:38–39 remain intact. English renderings accompany the Latin-only paragraphs in-place; the author's later English repetitions also remain rather than being merged or dropped. The one identical long paragraph is the complete Hooker quotation at 6:25, intentionally retained verbatim.

## Source-ending verification and known issues

The supplied source ends chapters 1–18 with clipped words or citations. Complete endings were verified against [Project Gutenberg ebook 7370](https://www.gutenberg.org/files/7370/7370-h/7370-h.htm), retrieved 2026-09-30. The HTML and extracted reference text are included as `source-gutenberg-7370.html` and `.txt`. They were used to verify source continuation, not as an automated modernization pass. The staged original remains untouched.

Verified continuations restored in rewritten chapters: 6:27 “own houshold”; 7:22 “Hooker, ibid.)”; 8:34 “commonwealth”; 9:12 “of the people”; 11:19 “people have”; 12:6 “disorder and ruin”; 13:10 “so to do”; 14:10 “most perilous”; 15:7 “property at all”; 16:23 “all this time”; 17:2 “then usurped”; 18:15 “would let him?”. These complete source meanings are rendered naturally in modern English.

The explicit instruction to leave REAL chapters unchanged means the following inherited endings remain clipped in the staged modern: 1:8 “public g” (source continuation “public good”); 2:16 “very cl” (“very clear”); 3:6 “judge of all” (“judge of all men”); 4:4 “Exod.” (“Exod. xxi.”); 5:30 “he nee” (“he needed”); 10:2 “for a bet” (“for a better”). These are known source-quality limitations despite GATE PASS, and should be resolved in a separately authorized scope before publication. Existing chapter titles and other metadata are also preserved exactly, including clipped headings. No new quotation was shortened with ellipses.

Source spellings inside quotations such as “reddest out” and “lure Divino” were retained rather than silently emended. The Latin quotation and its translation appearing in separate original paragraphs remain separately represented; the in-place English aids therefore repeat content intentionally.

`books/characters/second-treatise/` does not exist. No character files were edited. Later integration must independently check character-reference compatibility and any narration or cache keyed to the exact text.

## SHA-256

- `second-treatise-original-en.json`: `efbd7cabd14ed99f98aabae7a95f48e8102db75f0b7aaae0054d0ffe4675b0d0`
- `second-treatise-modern-en.json`: `9f723d2999243b190b48dada332f1573df679c7129defc8b0ab97fcc8dd01888`
- `changed-paragraphs.json`: `7bd5876866555fce9c73ee7ce841faa9da52fe7fa454a4b43b09d1034a03d5c3`
- `source-gutenberg-7370.html`: `37e7e03f179b720dfb50aca62551a66f4ae9edbee39eac1daa724f1661c9e3d1`
- `source-gutenberg-7370.txt`: `7b7acb1ade90bc3346b06f174ca6101ad5ab37301e538b3b90fa088211963773`

`SHA256SUMS.txt` records hashes for the complete package except itself. No external API-generated rendering, helper script, or temporary Git index is included.

## Commit scope

Because this checkout is shared with unrelated work, the content commit is built using a temporary isolated Git index, parented directly to the verified repair-branch Hume commit. Only this book's staging package is included. Unrelated local commits and working files are preserved; there is no force push.
