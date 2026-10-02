# Handoff: replacement editions for `discourse-on-inequality`

Branch `content/replace-discourse-sonnet`; owned folder `books/wip/replace-discourse-on-inequality-v2/`. Content only: no app, registry, live-data, deploy, merge or PR work; no API calls; generate-editions.cjs not run. Supersedes the Codex package `books/wip/replace-discourse-on-inequality/` (not merged; only its extraction and manifest were reused, src/codex-*).

## Deliverables

- `editions/discourse-on-inequality-original-en.json` SHA-256 `40b3be90144b7034628dc96f89287c2617a9b56b9319b40b5ad6f32cc59cb150`
- `editions/discourse-on-inequality-modern-en.json` SHA-256 `6ff604f58429149c4655b40c8bc2cd105bbfc96d14ba810c3ab1723c65e62ab4`
- `structure-map.json` (old -> new coordinates, low confidence, count-based), `SOURCE.md`, `STATUS.md`
- `qa/` gate logs, `validate.py`, `overlap-check.py` (copied from origin/claude/busy-fermi-111knc), `src/` (witnesses, build and edit scripts, edit logs)

## Structure and counts

Identical chapters and paragraph counts in both editions: 5 chapters, 154 paragraphs.

| # | Chapter | Paragraphs | original words | modern words |
|---|---------|-----------:|---------------:|-------------:|
| 1 | Dedication: To the Republic of Geneva | 23 | 4,335 | 3,964 |
| 2 | Preface | 13 | 2,351 | 2,083 |
| 3 | Exordium (paragraph 1 = Academy of Dijon question) | 8 | 1,161 | 1,041 |
| 4 | First Part | 51 | 12,388 | 11,315 |
| 5 | Second Part | 59 | 12,687 | 11,886 |

Totals 32,922 vs 30,289 words (modern 92%); smallest paragraph ratio 0.813 (gate 0.75). Exclamation marks equal paragraph by paragraph. No brackets, ellipses, embedded newlines, empty or mid-sentence paragraph ends; no paragraph identical to its original.

## Gates (all PASS)

- Overlap, modern-en vs old live original-en and old live modern-en (`origin/main` 7569e91), `--allow` own original-en: N=10 **0/154** flagged; N=8 **0/154** (logs `qa/overlap-n10.txt`, `qa/overlap-n8.txt`). The old live files were used only through the coordinate-only tool and counts; their wording was never printed or read. (A helper, src/runs.py, prints only runs of MY OWN candidate text that coincide with references.)
- Classifier `python3 books/classify-modern-en.py <abs>/editions/discourse-on-inequality --gate`: PASS native and on the typography-folded copy (`qa/typography-folded/`): weighted similarity 0.436 (gate <= 0.75), 0 light/mechanical chapters, 0/153 identical long paragraphs, 0 wrapped scaffolding, 0 truncated quotations (`qa/classifier-native.txt`, `qa/classifier-folded.txt`).
- `validate.py`: JSON shape {"chapters":[{number,title,paragraphs}],"sections":[]}, alignment, >=75% words, "!" parity, no bracketed notes (`qa/validation.json`: pass true, 0 problems).
- original-en is exempt from the overlap gate by instruction and was not rewritten.

## Rights summary (details in SOURCE.md)

Anonymous 1761 Dodsley translation; Rousseau d. 1778; no translator/editor/adapter credited in Wikisource, ESTC (via Grub Street), Internet Archive metadata, Open Library, or the Gutenberg/Harvard reprint's own note. Nothing from Cole or any later translation was read.

## Decisions

- Notes: Rousseau's 19 Notes and the Advertisement Concerning the Notes are excluded (apparatus); note-call markers (1)-(19) removed from original-en. Chapter 8 of src/codex-original-en.json holds them if a later batch wants them.
- Question of the Academy is paragraph 1 of Exordium rather than a one-line chapter.
- Latin: kept in modern-en where it did not overlap (Preface 13, First Part 34 phrase, Second Part 40/56 short phrases); Second Part 30 (Ovid) and the closing Lucan lines of Second Part 54 are rendered in English in modern-en because the verbatim Latin matched the protected editions at N>=8. original-en keeps all Latin.
- Modern spelling is American ("honor") by house style of this rendering; the surgical rewrites of overlapping passages were applied in src/edits/e*.txt (reproducible with src/applyedits.py).

## Gaps / for the integrator

- structure-map.json is count-based and low confidence: the live structure is 4 chapters x [26, 25, 52, 67] paragraphs in all four live editions (inherited from the French original), which does not match the 1761 English paragraphing (new: 23/13/8/51/59). Do not auto-migrate highlights, notes or chat anchors; the same old counts apply to modern-da and original-fr, so those editions will NOT align to the new English pair.
- Onboarding, threads, character cards and any audio cache keyed to old paragraph text are affected; every paragraph text changes.
- No human fidelity review of modern-en beyond the author's own paragraph-by-paragraph writing and spot reads; recommend an independent read before publication (QA standard in CLAUDE.md requires page-by-page visual QA after integration).
- Overlap-driven rewording: after the first full draft, ~400 phrase-level rewrites broke runs shared with the protected editions (listed in src/edits). Some of these substitutions favor distinct synonyms over the most natural phrasing; an editorial polish pass is advisable but must re-run the overlap gate.

## Rights doubts

1. The reading text comes via Wikisource's transcription (CC BY-SA label on the contributions). The 1761 text is public domain and the transcription was checked against an independent IA OCR (no omissions) and Gutenberg #11136 (spelling differences only), but if the integrator wants zero reliance on the share-alike label, re-key from the IA scan/OCR. Attribution is recorded in SOURCE.md.
2. The old live editions share long word runs with the 1761 text itself (the earlier Codex run saw 111/216 paragraphs of the authentic 1761 text flagged at N=10), which is consistent with the live text being a light revision of an older English translation; I did not inspect it, so I make no claim about its origin.
3. ESTC was reached via the Grub Street mirror, not the CERL/ESTC site; absence of a translator credit is corroborated by several independent catalogues but is absence of evidence, not a positive statement. Practical risk is nil because any 1761 translator died long before 1954.
