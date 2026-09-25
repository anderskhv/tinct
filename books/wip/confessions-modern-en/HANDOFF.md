# Confessions — Tinct Modern English repair: handoff to Codex

**Status: content accepted / handed off. Not published.**
Book: `confessions` (Augustine, *Confessions*, 13 books). Edition: `modern-en`.
Branch: `claude/peaceful-thompson-akn7f0`. The commit that carries this file is the
handoff commit (its hash is in the chat report; `git log -1 -- books/wip/confessions-modern-en/HANDOFF.md`).

## Instruction revision and ownership

- Instructions read from main at 0a306caf / a646f3b1 and rechecked against
  `origin/main` 56b451f7: `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`,
  `STRATEGY.md#language-scope`, `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md`,
  `docs/workflow-boundaries.md`, `books/classify-modern-en.py`. None of these
  files, and neither Confessions edition, changed across those revisions.
- Owned path: `books/wip/confessions-modern-en/` only. No app code, registry,
  live edition, character, onboarding, `modern-da`, audio, script or tooling
  file was modified.

## Deliverables

| File | What |
|---|---|
| `confessions-modern-en.json` | **Candidate** replacement for `app/public/data/editions/confessions-modern-en.json`. sha256 **`949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7`** |
| `characters-modern-en.proposed.json` | Proposed replacement for `editions["modern-en"]` in `app/public/data/characters/confessions.v1.json` (sha256 `10673704fa0c9b246b5b4583f7f8895d75db35137b86df46e4ccb2e3b9ab299e`) |
| `STYLE-NOTE.md` | Editorial decisions (§1 How God is addressed: **You**, capitalized; §8 decisions made during the work) |
| `GATE-OUTPUT.md` | Gate before/after, per batch and whole book |
| `CHANGED-PARAGRAPHS.md` | Changed paragraph coordinates vs the served modern-en |
| `reviews/REVIEW-book-NN.md` | Independent fidelity review, all 13 books |
| `reviews/FIXLOG-book-NN.md` | Disposition of every finding (applied/rejected/kept) |
| `reviews/RECHECK-books-01-07.md`, `RECHECK-books-08-13.md` | Independent recheck of all 86 fix-pass changes |
| `reviews/QUOTE-MARK-DIFFS-pre-fix.txt` | Quotation-mark audit input for the fix pass |
| `parts/book-NN/*.txt`, `NOTES-*.md` | Working source the JSON is assembled from, plus each renderer's notes: "Pusey kept on purpose", "Latin consulted", open issues |
| `source/SOURCE.md` | Baseline and Latin provenance and hashes |

## Structure (1:1, no migration)

13 chapters titled `Book 1` … `Book 13`, with numbers and titles identical to the
served editions. Paragraph counts per book (38, 18, 21, 31, 25, 27, 27, 31, 38,
70, 41, 42, 53; total 462) are identical to `original-en` and to the served
`modern-en`. Paragraph i renders Pusey's paragraph i, and no paragraph was merged,
split or moved. Saved positions, highlights and notes keyed by
(chapter, paragraph) carry over, but any highlight or note stored as a
character-offset range inside a modern-en paragraph now points into different
wording. Integration should treat those per its existing text-change handling.

## Gate (blocking): PASS

`books/classify-modern-en.py` reads only `app/public/data/editions/`, which this
task may not write. It was run **unmodified** from a scratch copy whose editions
dir symlinks the served `original-en` and this candidate. Codex should rerun it
in place after copying the candidate in:
`python3 books/classify-modern-en.py confessions --gate`.

| | served (before) | candidate |
|---|---|---|
| weighted similarity | 0.926 | **0.477** |
| light + mechanical chapters | 9/13 | **0/13** |
| identical long paragraphs | 340/459 | **0/459** |
| wrapped scaffolding / truncated quotations | 0 / 0 | 0 / 0 |

Per-batch runs (1-2, 3-6, 7-9, 10, 11-13) all PASS; see `GATE-OUTPUT.md`. There are
no paragraphs under 75% of Pusey's word count (per-paragraph ratio range about
0.93–1.25), no stubs apart from the colophon, and JSON validates.

## Review record

1. **Rendering.** Fifteen slices were rendered sentence by sentence from Pusey,
   with the Latin (O'Donnell) checked wherever Pusey is unclear or wrong. Books 1, 2,
   7 and 11 had partial earlier drafts; these were re-rendered and corrected,
   and the old drafts' errors are logged in their NOTES.
2. **Independent fidelity review** (reviewers were not the renderers) of a
   sample from **every** book: 175 paragraphs, about 48k of the book's 112k Pusey words (~43%). The sample took in
   each opening and closing, the three longest paragraphs, doctrinally dense
   and famous passages, random picks and every logged departure toward the Latin,
   and each reviewer also skimmed conventions across the whole book. Checks
   focused on omissions, reversals, doctrinal terms, additions and scripture.
   Result: **0 BLOCKER, 1 MAJOR, ~55 MINOR.**
   - MAJOR: Book 4 ¶16. The flesh, not the soul, was made to turn back
     (Latin *perversa … conversam* both refer to the soul). Fixed: "Why, then,
     turned the wrong way, do you follow your flesh? Let it follow you instead,
     once you have turned back."
3. **Fix pass.** Every finding was dispositioned (FIXLOGs). The quotation-mark
   drift, where marks had been added or dropped relative to Pusey in 50
   paragraphs, was normalized to Pusey, and the caritas rule was applied.
   86 paragraphs changed.
4. **Independent recheck** of all 86 changed paragraphs against Pusey and the
   Latin: **ALL OK, 0 problems.**

## Editorial choices to know

- **How God is addressed:** You / Your / Yours / Yourself, capitalized
  everywhere; He / Him / His for God. There are no Thou forms anywhere. Where
  Pusey capitalizes a human addressee, the capitals were dropped.
- **Pusey kept on purpose** (recognizable scripture and formulas, verbs
  modernized only), for example: "Take up and read; take up and read";
  Rom 13:13–14 with "chambering and wantonness"; "Give me chastity and
  continence, but not yet"; "Great is the Lord, and greatly to be praised";
  "door of safe keeping" (Ps 141, Book 5 ¶17); "in a glass darkly". The full
  lists are under "Pusey kept on purpose" in each `parts/book-NN/NOTES-*.md`.
- **Latin followed over Pusey** where Pusey misprints, garbles, reverses or
  drops words (e.g. "malicious mirth", Book 3; the reversed long/short syllables,
  Book 11 ¶28; "John" restored, Book 10 ¶45; "to open Your hand", Book 6 ¶23;
  "divinely inspired", Book 12 ¶32). Each case is logged under "Latin consulted".
- *caritas* is "love", with "charity" kept only as a named principle
  (1 Tim 1:5 "end … is charity", "two precepts of charity", "mother Charity",
  "O Love … O Charity, my God"). Seven places were kept this way and verified in recheck.
- Spelling is American, matching other Tinct modern-en editions. "Holy Ghost"
  becomes "Holy Spirit". "Concubine" is kept. *concubitus* becomes "sexual union".

## Integration requirements (Codex)

1. Copy the candidate to `app/public/data/editions/confessions-modern-en.json`
   (verify sha256 `949e4f77…ef78add7`) and rerun the gate in place.
2. **Character cards:** the served `modern-en` block in
   `app/public/data/characters/confessions.v1.json` pins mentions by UTF-16
   offsets and per-paragraph sha256, so it is invalidated. Apply
   `characters-modern-en.proposed.json` → `editions["modern-en"]`, and bump
   `contentVersion` per your convention. Character ids, kinds, roles and
   snapshot text are unchanged. Every anchor was remapped to the same (k-th)
   occurrence in the same paragraph, and all firstMention anchors are still the
   earliest mention. Mentions go from 114 to 122: the new text names a person
   where Pusey had an ambiguous "he"/"them" (Book 5 ¶9 Manichees, ¶12 Faustus;
   Book 6 ¶15 Alypius; Book 8 ¶2 Ambrose, ¶5 Simplicianus ×3, ¶11 Victorinus).
   Validate with the production tooling. The `original-en` block is unaffected.
3. **Audio:** text only changed. Every `modern-en` paragraph except Book 13 ¶52
   (461 of 462) has new text, so all cached modern-en Grok speech for Confessions
   is stale and must not be selected. Grok streaming continues. The `original-en`
   cache is unaffected. No generation or voice change is part of this handoff.
4. **Other surfaces:** SEO pages under `app/public/read/confessions/` and
   `app/scripts/seo/confessions.cjs`, and any excerpt caches, may quote the old
   modern-en. Check before publishing.
5. Publication goes through the serialized release owner. This package does not
   authorize a merge or deploy.

## Open issues

1. **Colophon, Book 13 ¶52 `GRATIAS TIBI DOMINE`:** kept byte-identical, as the
   served original carries it. It is Latin ("Thanks to You, Lord") and not part
   of O'Donnell's text. Anders or Codex may keep it, translate it, or leave it to
   the original only. The gate counts it as neither long nor identical (<80 chars).
2. **`modern-da`** (untouched, out of scope) was historically derived from the
   old `modern-en`. Its source dependency is now stale, which matters only if
   Danish is ever reopened.
3. **Review coverage** is a structured sample (175 of 462 paragraphs, ~43% of words, all 13
   books) plus whole-book convention skims and automated checks. It was not a
   paragraph-by-paragraph second read of the whole book.
4. **Sentences split across Pusey paragraphs** are preserved as split (Book 1
   ¶25→26, ¶28→29, ¶31→32; Book 8 ¶2–4 around the Virgil verse; Book 9 ¶31→32
   into Ambrose's hymn, which is rendered unrhymed).
5. **Process note:** in the fix pass, Book 1's six reviewed replacements were
   applied by an exact single-occurrence string-replace script rather than
   by hand edits. The wording was hand-chosen. No text anywhere was generated
   by regex or bulk transformation.
6. Similarity (0.42–0.60 per book) is lower than the 0.65–0.75 that the gate's
   notes cite for Victorian translations. This comes from rewording, not loss:
   no paragraph falls below 0.93× Pusey's length.
