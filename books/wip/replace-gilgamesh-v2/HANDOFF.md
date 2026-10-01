# Handoff - Gilgamesh replacement v2 (rights-clean, repaired)

Branch: `content/replace-gilgamesh-sonnet` (owned folder `books/wip/replace-gilgamesh-v2/` only). Baseline instructions read: `CLAUDE.md`, `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/AGENTS.md`, `books/CLAUDE.md` at `origin/main` 36deee6aa (2026-10-01). The Codex package `origin/content/replace-gilgamesh-codex` was used as a starting point only (nothing merged). No code, registry, app, deploy, API call, PR or merge. Content status: **accepted by gates, not published**.

## Deliverables

- `editions/gilgamesh-original-en.json` (sha256 `401ec8b6381c0d0b421fd26ccaaa993acf4774b0a01da91f663d822434d0953c`) - free historical translations kept as printed, no embedded newlines.
- `editions/gilgamesh-modern-en.json` (sha256 `89e005afd6d4093f29191c0ac432674b6b3a7a6060a0f7d27c32928bb3b2d03f`) - fresh paragraph-by-paragraph rendering, same 12 chapters and 152 paragraphs, titles "Tablet I" ... "Tablet XII".
- `provenance-map.json` (every paragraph -> source, pages, notes), `structure-map.json` (old live -> new, count-based, low confidence), `SOURCE.md` (rights evidence), `extracts/` (OCR excerpts + hashes), `overlap-check.py` (copied from `origin/claude/busy-fermi-111knc:books/tools/overlap-check.py`), `STATUS.md`.

## Gates (run on the final files; outputs in this commit's `gates-last-run.txt`)

| Gate | Result |
|---|---|
| `classify-modern-en.py <abs>/editions/gilgamesh --gate`, native and typography-folded copy | PASS both. Weighted similarity 0.479 (limit 0.75); 0 light/mechanical chapters; 0 identical long paragraphs |
| `overlap-check.py modern-en <old live original> <old live modern> --n 10 --allow original-en` | 0/152 flagged |
| same at `--n 8` | 0/152 flagged (limit <1%) |
| JSON shape `{"chapters":[{number,title,paragraphs}],"sections":[]}`, 12 chapters, alignment | pass; 152 = 152 paragraphs, chapter by chapter |
| No embedded newlines, original or modern | pass |
| modern-en: no `[ ]`, no `*`, no `(?)` | 0 paragraphs |
| `!` count per paragraph equal to original-en | pass for all 152 |
| each modern paragraph >= 75% of source word count (asterisks counted as words) | pass for all 152 |

The old live files were read only through `git show` into a scratch directory outside the repo and were used only as inputs to `overlap-check.py`; wording was not read for rewriting. Where the gate flagged shared runs, my own modern sentence was rephrased.

## Coverage versus the Codex v1 package and the old live text

Modern-en words (v1 = Codex, v2 = this package, live = old Colavito text, 16,439 words, 253 paragraphs). Original-en words in last column.

| Tablet | v1 paras / words | v2 paras / words | v2 original words | v2 sources |
|---|---|---|---|---|
| I | 2 / 254 | 6 / 246 | 275 | MA 235, Rogers 11 |
| II | 11 / 991 | 37 / 2,202 | 2,232 | MA 1,096, Penn 1,106 |
| III | 2 / 183 | 10 / 465 | 500 | MA 165, Yale 300 |
| IV | 5 / 304 | 17 / 941 | 940 | MA 341, Yale 600 |
| V | 2 / 78 | 2 / 91 | 86 | MA 91 |
| VI | 8 / 893 | 16 / 969 | 1,027 | MA |
| VII | 1 / 11 | 4 / 224 | 256 | MA 198, Rogers 26 |
| VIII | 2 / 100 | 5 / 195 | 212 | MA 94, Rogers 101 |
| IX | 5 / 324 | 7 / 369 | 387 | MA |
| X | 7 / 569 | 10 / 654 | 720 | MA |
| XI | 22 / 2,262 | 29 / 2,699 | 2,897 | MA |
| XII | 8 / 608 | 9 / 708 | 760 | MA |
| **Total** | **75 / 6,577** | **152 / 9,763** | **10,292** | MA 7,619 + Penn 1,106 + Yale 900 + Rogers 138 |

v2 is +48% words and +103% paragraphs over v1, but still about 59% of the live word count and 60% of its paragraph count.

What changed beyond adding sources: all of Muss-Arnolt's printed translated lines that v1 skipped were recovered (the Uchat seduction scene, Eabani's reply to Uchat, Gilgamesh's dream opening, Gilgamesh/Enkidu dream-journey lines in Tablet IV, Ishtar's lament over the bull and the horns scene, Tablet XI preliminary lines, Ishtar's necklace, Ea's last lines, the "alternate recension" netherworld speech p.367-368 now placed in Tablet VII), every paragraph was cut into verse-block-sized paragraphs with no embedded newlines, and every bracketed restoration, `(?)` and asterisk gap was removed from modern-en by rewriting around the gap, ending a passage at it, or - for a handful of short fragments - a trailing dash.

## Honest remaining gaps

1. **Tablet V is a stub** (2 paragraphs, 91 words): the forest approach and one line. No source in the allowed set translates the fight with Humbaba or its aftermath. Tablet VII (224 words) and VIII (195 words) are also thin; Tablet I is only the opening, a line, and the siege fragment (no Aruru/Eabani creation text beyond Tablet II). These are real gaps in the pre-1955 translations, not extraction omissions; I did not paraphrase or invent text. No Siduri "life that you seek" speech, no Humbaba combat, no Enkidu curse of the trapper, no funeral, no flood-tablet details beyond Muss-Arnolt.
2. **Two recensions are combined across tablets.** Tablet II (Penn tablet), III and IV (Yale tablet) include Old Babylonian passages beside the Nineveh text. They are separate paragraphs, never mixed inside a paragraph, but they retell overlapping scenes (Enkidu's seduction and arrival, the dreams, Gilgamesh's resolve) so the reader meets some episodes twice, and the order inside a tablet is "Nineveh text first, then Old Babylonian". I recommend a one-line book note ("Tablets II-IV also include passages from the older Old Babylonian version") in app copy, which is for Codex/Claude integration, not edited here.
3. **Naming.** original-en prints each source's own forms (Eabani/Gish/Uchat/Humbaba in Muss-Arnolt; Enkidu/Gish/Huwawa in Jastrow-Clay; Engidu/Khumbaba in Rogers), so the compare view shows a "Gish"/"Enkidu" switch inside Tablets II-IV and VII-VIII. modern-en uses Gilgamesh and Enkidu throughout.
4. Many Muss-Arnolt lines are the translators' conjectures; modern-en renders them as plain statements where the original had a bracket or `(?)` (for example "Mother donkeys", "Irnini"), and drops very short fragment-only clauses beside a gap (e.g. "His face became like unto [the distant * * * (?)]" is rendered "His face was like the face of one who has come a long way", which is a mild gloss). Passages left as bare fragments end with a dash.
5. The original-en still contains translator gap marks (`* * *`, `[ ]`, `(?)`, `[. . .]`); this is allowed for original-en but reads roughly in places. Jastrow-Clay footnote glosses were inlined in parentheses in five places.
6. Paragraph content and numbering do not correspond to the old live text. Threads, highlights, audio cache entries, onboarding and character cards keyed to old paragraph content must be reset or manually remapped; `structure-map.json` is only positional.
7. Rights doubt: four Rogers paragraphs (Tablet I para 2; VII para 1; VIII paras 4-5) rest on a translation that acknowledges "a word or suggestion" from Paul Dhorme (d.1966). See SOURCE.md. Dropping them is a clean edit if Anders wants a strict reading; Tablets VII and VIII would get slightly thinner. Some second-source evidence for Harper's series committee was carried, not re-fetched.

## Recommendation

As a rights-clean replacement for Colavito's text, this package is **good enough to replace the live Gilgamesh text** if the rights risk of the living-translator text is the priority: it is complete in the sense that every tablet has text, reads as modern English without apparatus, and passes all gates. It is **not equal to the live edition in completeness or narrative smoothness**: about 60% of the word count, a Tablet V stub, two overlapping recensions, and sentences that end mid-thought at lacunae. If Anders accepts a shorter, fragmentary-but-honest Gilgamesh, publish it with the book note above and reset keyed derived content. If he needs a full-length epic, more source material than the pre-1955 translations I could verify is not available; the only way to fill Tablet V is to commission an original translation or accept a post-1954 translator.

## Integration requirements for Codex / the integration step

1. Replace `app/public/data/editions/gilgamesh-original-en.json` and `gilgamesh-modern-en.json` with these two files; chapter titles change from "Tablet N - subtitle" to "Tablet N".
2. Regenerate anything keyed to chapters/paragraphs (`app/public/data/editions/gilgamesh-threads.json`, `app/public/data/characters/gilgamesh.v1.json`, onboarding, SEO pages, audio/Grok caches). Do not reuse cached narration for changed text.
3. Remove the old live files' dependency on Colavito text in prefaces/intro data (`app/src/data/prefaces/gilgamesh.txt`, onboarding) after review; they were not touched here.
4. Release only on Anders' instruction under `AGENTS.md`.
