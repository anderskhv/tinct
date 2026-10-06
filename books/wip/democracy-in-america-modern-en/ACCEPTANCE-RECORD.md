# Acceptance Record: *Democracy in America* (Tocqueville), modern-en repair

- **Book id / edition:** `democracy-in-america` / `modern-en`
- **Date:** 2026-10-06
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/inspiring-ritchie-zi00fu` (the handoff commit is given in the handoff message and RELEASE-PACKET.md).
- **Instruction revision used:** `origin/main` at `4a11ebf7f84334212233f69e1fb2575958648592` (includes `books/BOOK-TASK-WORKFLOW.md`; the style note and gate are the ones on that revision).
- **Owned path:** `books/wip/democracy-in-america-modern-en/` only. No app, registry, live-edition, character-file, modern-da, audio or tooling file was touched.
- **Provenance of the work:** the first rendering and round-1 review were done by an earlier repair session on `claude/democracy-in-america-modern-en` (117 renderer batches, 54 round-1 fidelity reviews). That session stalled before assembling a candidate. This package continues from its `batches/` and `reviews/` and finishes the verification here.

## Problem and result

The served modern-en was the Reeve/Bowen 1862 English with spelling and a few word swaps.

| Measure (unmodified `books/classify-modern-en.py --gate`) | Before | After | Limit |
|---|---|---|---|
| Weighted similarity | 0.897 | **0.726** | <= 0.75 |
| Light + mechanical chapters | 57/96 | **0/96** | <= 5% |
| Identical long paragraphs | 194/2112 | **73/2112 = 3.5%** | <= 5% |
| Truncated quotations / scaffolding | | 0 / 0 | 0 |
| Words per sentence (paragraphs over 25 words) | | 29.4 (live) -> **23.4**, source 33.4 | |

The margin on similarity is smaller than in the other packages in this series (0.726 against 0.75). That is by design: the style note keeps quotations of laws, constitutions and other authors recognizable, so a share of the book is verbatim.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `4a11ebf7` | `9fbec200460aebc0c454ac87814dd7c13d93a1eff0c4c467078591c3bd5f35a4` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `4a11ebf7` | `347cc8f0729f7fe0520163d153554a78e36d82e87b8c59777f4745a74e545662` |

## Accepted candidate

**`candidate.json`, sha256:**
```
3d9feeb1806b7c463ba243ffd575c9e4888d4f23c991d415cac8aee5fd79981b
```

- **Serialization:** identical to the live file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline). Drop-in for `app/public/data/editions/democracy-in-america-modern-en.json`.
- **Structure:** 96 chapters and 2,258 paragraphs. Chapter numbers, titles, `sections` and per-chapter paragraph counts are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Length:** 294,945 words (source 308,203, live 303,372). No paragraph falls below the 0.75 length ratio (`audit-truncation.py` run from a local-path copy: 0 hits).
- **Changed against the live modern-en:** 2,109 of 2,258 paragraphs (`changed-paragraphs.json`). The 149 unchanged are mostly headings, citations and quotation-only paragraphs kept verbatim by rule.
- **Batch sources:** `batches/chNNN_pAAA-BBB.json` (117 files). `candidate.json` is their exact assembly over the live structure (in these files the filename's last index is inclusive and `start` plus the paragraph count gives the extent).

## How it was made

1. **Rendering (earlier session):** 117 chapter batches, rendered in parallel against `STYLE-NOTE.md`.
2. **Round 1 (earlier session):** 54 independent fidelity reviews, together covering every paragraph (`reviews/FNN-fidelity.md`, `FNN-fixes.json`). 239 paragraphs were corrected (`reviews/fixes-applied-R1.json`).
3. **Round 2 (earlier session):** the first verification groups: group 2 (31 of 31 pass) and group 7 (31 checked, 2 failed and were fixed). Group 4's 10 corrections were written but not applied; they are applied here.
4. **Round 3 (this package, `reviews/round3/`):**
   - The 239 round-1 fixes were split into 8 groups of 31 (the last 22). Groups 1, 3, 4, 5, 6, 7 and 8 (208 fixes) were verified by seven fresh independent verifiers against the source; **193 passed and 15 failed** (lost intensifiers such as "very unexpected" and "most alarming", a sharpened hedge, 'State' for the political body, restored em dashes, a grammar defect, and "manners" used in the mœurs sense). Group 2 was already verified.
   - A separate terminology pass resolved the 63 paragraphs that still carried "manners" (4 editors; 24 changed, the rest justified), under the style-note rule that Tocqueville's *mœurs* is rendered "customs", "habits" or "mores" and "manners" is kept only for etiquette, the defining passage, headings and Book Three.
   - 39 paragraphs were changed (15 verifier corrections plus 24 terminology changes; where both touched one paragraph the verifier's version was used). **All 39 were re-checked by two fresh reviewers: 39 of 39 pass**, with no unrelated edits. A third fresh reviewer gave a second opinion on the 36 paragraphs that keep "manners": **36 of 36 justified**.
5. **One further one-word edit, not separately reviewed:** ch18 p28 "happiness of the State" to "happiness of the state" (style-note rule for the political body; a non-blocking observation of the second-pass reviewer).
6. **Checks run on the final candidate:** whole-book gate (above), truncation audit, structure comparison against both served editions, hash comparison of the pinned inputs against `origin/main`.

## Editorial decisions

All in `STYLE-NOTE.md`. Two calls were made while finishing:
- The three in-text headings in ch18 that name "Manners" (p40, p118, p136) were **kept as the source has them**, because the defining passage that follows (p41) deliberately uses the word "manners" in the sense of the ancient *mores*. A helper had proposed changing them to "Customs"; that was rejected so the headings and the definition agree.
- Where the source uses "State" for the political body (as against a member State), the rule is lowercase "state". Verifiers caught and fixed the instances they were shown (14:5, 14:80, 14:136, 15:29, 18:28); the check was not an exhaustive scan.

## Open issues (recorded, not blocking acceptance)

1. **Review depth.** Every paragraph was fidelity-reviewed once in round 1 by reviewers other than the renderers, and every correction made afterwards was independently re-verified. I did not re-read the full 2,258 paragraphs myself; my own checks were the gate, structure and truncation checks and a spot read.
2. **Per-batch gating** was not re-run in this package. Only the whole-book gate was run on the final candidate.
3. **Possible remaining 'State' capitalization** for the political body outside the paragraphs the reviewers were shown.
4. **Character package impact.** All 11 modern-en mentions sit in changed paragraphs, so `paragraphHashes` must be regenerated; 9 mentions moved and 2 are unchanged. Proposed re-anchors are in `character-card-impact.json` (each proposed slice verified to equal the candidate text). The snapshot and reveal-point coordinates of the 10 characters were not re-derived.
5. **modern-da is stale** relative to the new modern-en. It was not touched, and no new Danish was made (Danish is withdrawn).
6. **Source provenance.** There is no `books/raw/democracy-in-america/` folder; the served original-en was used as the anchor and was not re-sourced.
7. **Onboarding** (`app/public/data/onboarding/democracy-in-america.json`) exists on main and was not edited. A check for any onboarding string of 8 or more words, or quoted phrase of 25+ characters, that appears verbatim in the live modern-en found none, so it does not depend on the old wording. (An earlier draft of this record wrongly said no onboarding file existed.)
8. **Tool note.** `books/audit-truncation.py` hard-codes a Mac path for the editions directory; it was run from a local-path copy. `books/classify-modern-en.py` crashes with a NameError (line 131) when the two editions have different paragraph counts; that does not affect this book.
