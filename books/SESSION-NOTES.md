# Session Notes — Translation Quality Sweep

**Started:** 2026-04-17
**Status:** In progress (Anders away, Claude working autonomously)
**Branch:** main

---

## What's been done this session

### Phase A — Infrastructure (COMPLETE)

1. **New tooling in `books/`** (all zero-permission Bash via `python3`):
   - `audit-truncation.py` — flag paragraphs < 0.75 ratio, source ≥ 20 words
   - `show-paragraph.py` — print src+tgt paragraph pair for inspection (context-cheap)
   - `write-paragraph.py` — replace paragraph by index with JSON invariant checks
   - `qa-diagnostic.py` — cross-book scan: truncation, anglicisms, quote style, encoding
   - `qa-danish-deep.py` — deeper DA scan: sentence parity, entity preservation, severity scoring
   - `migrate-quote-style.py` — chapter-state-tracked `"..."` → `»...«` conversion
   - `scan-report.md` — per-book severity ranking + 3-paragraph spot samples

2. **Translation protocol updated (`books/CLAUDE.md`)**:
   - **Locked EN house style**: preserve `!`, preserve proper-noun accents, curly quotes, ≥75% paragraph word count
   - **Locked DA house style**: `»...«` guillemets, `Mrs.`/`Mr.` stay English, preserve accents, no anglicism calques
   - **HARD RULE #15**: audit after every chapter batch, non-optional
   - **Anti-truncation generation prompt** locked as 4-bullet non-negotiable block in Step 3 and Step 5

3. **Quote style migrated** across 22 DA books:
   - 35,182 quote pairs swapped from `"..."` → `»...«`
   - 103 unbalanced chapters skipped (see "Open Issues" below)
   - Odyssey and the-manual already had guillemets, unchanged

### Phase B — Regeneration (NOT STARTED — scope too large for solo session)

Three books need full EN regeneration (the modernizer summarized instead of translated):

| Book | EN truncation rate | Est. work |
|---|---|---|
| **the-aeneid** | 89% (481/543) | 12 chapters × ~45 paras = regen the whole book |
| **meditations** | 84% (338/401) | 12 chapters × ~33 paras |
| **the-republic** | 38% (642/1694) — borderline, could patch | 10 chapters × ~170 paras |
| **ulysses DA** | Severity 110 (deep scan) | 18 episodes × ~155 paras |
| **paradise-lost** | 207 EN severe — borderline regen | 12 chapters × ~100 paras |
| **enchiridion** | 35% severe | Only 52 paragraphs total — fastest to regen |

**Recommendation:** Each of these needs its own fresh session. Aeneid is highest priority (the worst). Run one book per session per the CLAUDE.md "new conversation per book" pattern.

### Phase C — Patching (PARTIAL)

Books fixed this session:

| Book | Fixes applied | Status |
|---|---|---|
| **the-awakening** | 3 EN + 3 DA | Clean |
| **odyssey** | 0 EN + 9 DA | Clean (7 remaining DA are natural compression) |
| **frankenstein** | 1 EN | Clean |
| **gilgamesh** | 1 EN | Clean |
| **phaedo** | 1 DA (ch5 p164 — had wrong content, full rewrite) | DA clean; 16 EN still severe — deferred |

Books NOT YET touched (still have truncations):

| Book | EN severe | DA severe | Notes |
|---|---|---|---|
| apology | 3 | 0 | Compression looks natural — may be clean |
| crime-and-punishment | 5 | 19 | **ch36 has structural corruption** (see Critical Findings) |
| divine-comedy | ? | ? | Not scanned at severity-only level |
| jane-eyre | 41 | 12 | **ch34 has structural corruption** |
| symposium | 8 | 0 | Plato dialogue — likely compression |
| the-art-of-war | 4 | 0 | Aphoristic style, may be natural |
| war-and-peace | 19 | 17 | Scattered across chapters |

---

## Critical Findings

### 1. Structural corruption beyond truncation

Some chapters have paragraphs at **wrong indices** — not just shorter, but containing content from entirely different parts of the source. Paragraph-level patching CANNOT fix these; the whole chapter must be regenerated.

Confirmed cases:
- **jane-eyre ch34**: paragraphs 0–9 aligned, then diverges badly by p80+. Original `p107` is St. John's "Humility, Jane" speech; modern `p107` is the invented line "Why must we be married?". The "Humility" speech has been moved to modern `p92`. Contains invented dialogue not in the original.
- **crime-and-punishment ch36**: paragraph 92 in original is Svidrigailov's manipulative speech; in modern it's Dunia pulling a revolver. Same pattern of misalignment.

This likely affects more chapters I haven't inspected. Any "catastrophic" severity count (ratio <0.20) is a likely marker.

### 2. Hallucinated content in existing translations

Odyssey ch16 p27 (DA) had a trailing phrase `»ung som du er.«` ("young as you are") that doesn't exist in the English source. This appears to be the model padding a truncated translation with plausible-sounding content. I removed it during the fix.

Similar may exist elsewhere — the entity-loss detection in qa-danish-deep.py is partially designed to catch this but likely misses hallucinations that use already-existing proper nouns.

### 3. Deep DA scan results

- **Severity ≥ 100** (regenerate): **ulysses** only (severity 110). 136 severely compressed paragraphs, 142 sentence mismatches, 17 chapters with entity loss.
- **Severity 50–99** (investigate): war-and-peace (83), crime-and-punishment (68), bible (57). High entity-loss mostly false positive from Russian/biblical name transliteration.
- **Severity < 50**: 22 books likely clean at deep-quality level.

Full scan with spot-samples at `books/scan-report.md`.

---

## Open Issues

### Quote migration unbalanced chapters (103 total)

These chapters have an odd `"` count at chapter level — the migration script skipped them to avoid corrupting content. They remain in straight-quote style (inconsistent with the rest of the book). Worst offenders:

| Book | Unbalanced chapters |
|---|---|
| bible | 62 |
| jane-eyre | 3 (ch10, ch16, ch19 — 133/159/277 quotes each) |
| crime-and-punishment | 7 (ch3/4/5/30/31/etc) |
| divine-comedy | 5 |
| frankenstein | 6 |
| paradise-lost | 4 |
| pride-and-prejudice | 6 |
| war-and-peace | 6 (large chapters) |

These need manual inspection — typically an orphan `"` at the start/end of a multi-paragraph quoted passage. Fix approach: find the orphan, either add partner or convert to `»`/`«` based on context.

### Natural-compression skip threshold

`audit-truncation.py` flags everything below 0.75. Many 0.70–0.75 paragraphs are natural compression (Victorian → modern, or English → Danish genitive compounds). The human judgment call is still required. Consider: is it worth building a "content-aware" filter that skips these automatically? Probably not — the false-positive rate is OK and the human inspection is fast.

---

## Recommended sequencing for next sessions

1. **Regenerate enchiridion** — smallest (52 paragraphs), fastest to validate the regen workflow end-to-end.
2. **Regenerate the-aeneid** — highest priority, worst quality. Chapter-by-chapter with fresh session per chapter if needed.
3. **Regenerate meditations** — similar scope to aeneid.
4. **Regenerate ulysses DA** (not EN — EN is fine, DA is the problem).
5. **Regenerate paradise-lost** — verse text, tricky.
6. **Regenerate the-republic** — borderline, possibly patching if enchiridion/aeneid workflow is smooth.
7. **Jane-eyre + crime-and-punishment chapter rescues** (ch34 + ch36 respectively) — same corruption pattern.
8. **Finish patching** remaining books (war-and-peace, symposium, apology, etc.).

---

## What's safe to run unattended

All scripts in `books/` are idempotent and safe:
- `python3 books/audit-truncation.py <book-id>`
- `python3 books/qa-diagnostic.py <book-id>`
- `python3 books/qa-danish-deep.py <book-id>`
- `python3 books/show-paragraph.py <book-id> <src-key> <tgt-key> <ch> <pi>`

The `write-paragraph.py` script validates invariants before writing. Can be resumed from any state.

---

## Commits this session

1. `4fbf314` — Fix truncated paragraphs in The Awakening (3 EN + 3 DA) + audit tooling
2. `<checkpoint>` — Translation QA infrastructure + quote style migration to »…« (22 books)
3. `e70f097` — Fix 9 truncated paragraphs in odyssey modern-da
4. `c198400` — Fix severe truncations in frankenstein, gilgamesh, phaedo
