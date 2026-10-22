# Release packet: *The Federalist Papers*, modern-en repair

**Status: content accepted / handed off to Codex. NOT published.** Integration, app verification and serialized release belong to Codex.

## Package

- **Branch:** `claude/federalist-papers-modern-en`
- **Commit:** see the handoff message. It is the commit that adds this file; every commit on the branch touches only this folder.
- **Package path:** `books/wip/federalist-papers-modern-en/`
- **Candidate:** `candidate.json`, sha256 `1f123f52d66f4f4df3c4b8e2e47dd8d561bc10fd914c7ef90bed6db51327c7fa`
- **Target live path:** `app/public/data/editions/federalist-papers-modern-en.json`. Replace it byte-for-byte with `candidate.json` (same serialization as the served file).
- **Expected live pre-image (the modern-en being replaced):** `1974574ebce6859b2c7fdde48b524360b6348e0492e425861e8259076297278d`. If main's file differs, stop and reconcile; do not overwrite someone else's newer change.
- **Fidelity anchor (unchanged):** `federalist-papers-original-en.json`, sha256 `c733011184b5b42d48ac29dc73660ee631d039df0ff0572761724c7e0509d7e8`
- **Base for this work:** `origin/main` at `791d2802`.
- **Evidence:** `ACCEPTANCE-RECORD.md`, `GATE-OUTPUT.txt`, `STYLE-NOTE.md`, `reviews/`, `changed-paragraphs.json`, `character-card-impact.json`

## Integration requirements

1. **Structure is unchanged.** 85 chapters and 1,279 paragraphs, with the same chapter numbers, titles and per-chapter counts. No position, highlight, note or reading-log migration is needed, and the `aligned: true` flags stay correct. The registry needs no change; `wordCount` stays at about 188k (the candidate has 179,331 words).
2. **Re-run the gate in place** after copying: `python3 books/classify-modern-en.py federalist-papers --gate`. The expected result is weighted similarity 0.704, light+mechanical 0/85, identical long paragraphs 32/1,232, GATE PASS.
3. **Regenerate derived runtime data** that embeds modern-en text, using the normal tooling: `app/public/data/editions-chapters/federalist-papers-modern-en/`, any `edition-migrations` entry, footnotes data and the search index and bundles, if they exist for this book.
4. **Narration (Grok streaming).** 1,218 of 1,279 modern-en paragraphs have changed text (coordinates in `changed-paragraphs.json`).
   - Cached speech for those paragraphs must not be served for modern-en. Invalidate by text, language, provider, model, voice and settings under the current cache contract.
   - The 61 unchanged paragraphs may reuse compatible cache entries.
   - Streaming continues as before. Do not queue full-audiobook generation or change voices. Keep legacy assets for rollback.
5. **modern-da is untouched** and no longer tracks modern-en. Do not mark it current against the new English. No new Danish rendering was made; Danish is out of scope.
6. **Character cards: affected.** `app/public/data/characters/federalist-papers.v1.json` has 8 reference cards (publius, faction, ambition-counteracting-ambition, the-union, republican-government, the-judiciary, the-executive-power, accumulation-of-powers) with 9 `modern-en` mentions anchored by chapter, paragraph and UTF-16 offset. The character files were **not** edited. (`books/characters/library-coverage.md` still lists the book as "not-started", which is stale.)
   - The `modern-en` block's `sourceSha256` (the live file's `1974574e…`) and `paragraphHashes` must be regenerated for every changed chapter; 85 of 85 chapters have at least one changed paragraph.
   - `original-en` cards are unaffected, since original-en is unchanged.
   - The 16 position anchors (`roleVisibleAt` / `firstMention`) sit at paragraph offset 0, so they stay valid. The paragraphs they sit in did change (all but publius ch11 p14), so card-body timing checks should be re-run.
   - Mentions to re-anchor (proposed new anchors; the card owner should confirm each against the card text):

| Card | Paragraph | Old anchor | Proposed new anchor | Offset |
|---|---|---|---|---|
| publius | ch11 p14 | "PUBLIUS" 0–7 | "PUBLIUS" 0–7 | same |
| faction | ch10 p0 | "violence of faction" 149–168 | "violence of faction" 152–171 | moved |
| faction | ch10 p1 | "By a faction, I mean" 0–20 | "By a faction, I understand" 0–26 | moved |
| ambition-counteracting-ambition | ch51 p3 | "Ambition must be made to counteract ambition" 362–406 | "Ambition must be made to counteract ambition" 334–378 | moved |
| the-union | ch1 p0 | "the survival of the UNION" 272–297 | "the existence of the UNION" 259–285 | moved |
| republican-government | ch39 p1 | "strictly republican" 79–98 | "strictly republican" 86–105 | moved |
| the-judiciary | ch78 p6 | "least dangerous" 209–224 | "least dangerous" 209–224 | same |
| the-executive-power | ch70 p0 | "a vigorous Executive" 51–71 | "a vigorous Executive" 50–70 | moved |
| accumulation-of-powers | ch47 p2 | "very definition of tyranny" 377–403 | "very definition of tyranny" 388–414 | moved |

   - **ch10 p1 note:** the live modern-en said "By a faction, I mean". The candidate keeps Madison's own "By a faction, I understand", as the style note requires for the definition. The mention text should change accordingly.
   - **ch1 p0 note:** the live text "the survival of the UNION" is now "the existence of the UNION".
7. **Onboarding, taxonomy and registry metadata:** no changes proposed. The onboarding file `app/public/data/onboarding/federalist-papers.json` was not reviewed against the new wording.

## Open issues carried to Codex / Anders

Details are in `ACCEPTANCE-RECORD.md` under "Open issues".

1. **No `books/raw/` provenance** exists for this book, and the served original-en has several probable misprints kept as served in modern-en (ch15 p5 and ch54 p0–p1 "appointment", ch37 p5 "independence", ch63 p11 "four", ch57 p15, ch84 p26 footnote 3, others). Confirm against a reliable printing and fix both editions together in a separate authorized change.
2. **Silent repairs of evident typos remain** (listed in the acceptance record, item 3).
3. **Four of the 16 per-batch gate groupings fail** for quotation-heavy or already-clear text (details in the acceptance record). The whole-book gate passes.
4. **A candidate-only accessibility read** by someone who has not seen the source was not done separately.
5. **modern-da staleness** (item 5 above).
