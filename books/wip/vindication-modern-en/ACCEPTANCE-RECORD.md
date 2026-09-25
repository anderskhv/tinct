# Acceptance Record: *A Vindication of the Rights of Woman* (Wollstonecraft), modern-en repair

- **Book id / edition:** `vindication-rights-of-woman` / `modern-en`
- **Date:** 2026-09-25
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/sleepy-hamilton-0f1kqi` (the commit is given in RELEASE-PACKET.md)
- **Instruction revision used:** `origin/main` at `8a50db7d`, which includes the assigned base `0a306caf`. `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `STRATEGY.md`, `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md` and `docs/workflow-boundaries.md` were read before any editing.
- **Owned path:** `books/wip/vindication-modern-en/` only. No app, registry, live-edition, modern-da, audio or tooling file was touched.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `0a306caf` and at `8a50db7d` (Wollstonecraft 1792) | `3e168f00ba7901f8a31cc36902f0046e9555d6fd5245566c437b029331e91aac` |
| `baseline-live-modern-en.json` | Starting point. Byte-identical to the served `modern-en` at `0a306caf` and at `8a50db7d` | `4e7e6143670a4ca29fa6f004587578e56102ac7b2f1b00814ddefb303084ba63` |

The served original-en has no `books/raw/vindication-rights-of-woman/` provenance folder in the repository. This repair used the served text as the anchor and did not re-source it (see open issue 3).

## Accepted candidate

**`candidate.json`, sha256:**
```
6a398f5b8be7c85ad6fafa8d1e414674bcd7f193daf129844b83ada8f9cb056a
```

- **Structure:** 15 chapters and 778 paragraphs. Chapter numbers, titles, per-chapter paragraph counts and `sections: []` are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration.
- **Paragraphs changed against the live modern-en:** 752 of 778. The coordinates are in `changed-paragraphs.json`.
  - The 26 unchanged paragraphs are:
    - the fixed Dedication forms ("Sir,", "I am, sir,", "Yours respectfully,", "M. W.")
    - verse and quotation paragraphs that are kept verbatim by rule
    - 11 SECTION markers and 2 star separators
    - one citation footnote (ch7 p171)
- **Batch sources:** `batches/chNN_pAAA-BBB.json`, 49 files. `candidate.json` is their exact assembly over the pinned structure.

## Similarity gate: PASS (full output in `GATE-OUTPUT.txt`)

| Scope | Weighted similarity | Light + mechanical | Identical long paragraphs | Result |
|---|---|---|---|---|
| Whole book | **0.698** (was 0.932) | **0/15** (was 12/15) | **1/747 = 0.1%** (was 249/747) | **GATE PASS** |
| ch 1–3 | 0.710 | 0/3 | — | PASS |
| ch 4–7 | 0.709 | 0/4 | — | PASS |
| ch 8–11 | 0.681 | 0/4 | — | PASS |
| ch 12–15 | 0.685 | 0/4 | — | PASS |

Every chapter falls between 0.614 and 0.723 and is REAL. The wrapped-scaffolding and truncated-quotation counts are both 0. The one identical long paragraph is the ch7 p171 citation footnote (Barbauld), which has nothing to modernize.

**How the gate was run:** the unmodified `books/classify-modern-en.py` (byte-identical copy, sha256 `95070028…`) was run on a scratch mirror. The mirror holds the served original-en plus `candidate.json` in place of the live modern-en. The tool reads only `app/public/data/editions/`, and live files may not be edited under this workflow. The mirror reproduces the assigned failure exactly on the live file: 0.932, 12/15, 249/747, GATE FAIL.

**Screening:**
- **`books/audit-truncation.py` (en):** run from a scratch copy with the path changed to local. 0 paragraphs fell below the 0.75 length ratio.
- **`books/content-verify.py`:** 11 flags. All are false positives on sentence-initial words ("Besides", "Whilst", …). The single real name involved, "Egyptian" (ch8 p6), is rendered "Egypt's".
- **Consistency sweep:** these counts are identical between source and candidate:
  - `(*Footnote. ` prefixes: 21/21
  - `(Footnote.`: 1/1
  - SECTION markers: 11/11
  - Emilius 8/8, Sophia 5/5, Mahomet* 3/3, **mankind 51/51 (humankind 0)**
  - Rousseau 51, Gregory 10, Macaulay 6, Fordyce 4
  - every CAPS emphasis word
- **Remaining source straight quotes and `--`:** none. Four paragraphs (ch5 p8, ch7 p7, p46, p49) keep a quotation that is left unclosed, as the source prints it.

## Editorial decisions

All decisions are recorded in `STYLE-NOTE.md`.

- **Quotations** from Rousseau (the *Emilius* translation), Gregory, Fordyce, Chesterfield, Piozzi, Staël, Genlis, Smith, Macaulay, Knox, Forster and the verse writers stay **recognizable**. The wording is kept, with spelling normalization only. Her own lead-ins, interjections, asides and commentary are fully modernized. The reasons: her argument seizes on their exact words and mocks their style, and the quotations stand as evidence of what those men wrote. The rule was applied book-wide. One renderer confirmed by script that every quoted span in ch7 p109–171 survives word for word.
  - The live edition had paraphrased the Day quotation (ch5 p8–9); the source wording is restored.
  - The live edition had also put quotation marks the source lacks around ch4 p50; these were removed.
- **Existing REAL work:** ch1, ch2 and ch4 were revised rather than discarded.
  - Restored: "Mahometan" (live had "Islam") and "mankind" (live had "humankind").
  - Brought to British spelling and to the book's typography.
- **Period vocabulary:** handled per the table in the style note. This covers sensibility, manners, virtue, understanding, delicacy, cunning, fond, vulgar, consequence, establishment, man/mankind and others.
- **Names as printed:** "Lewis the Fourteenth" (ch6 p14) was restored from a renderer's "Louis".
- **Source artifacts normalized in modern-en only:** the stray `>` of ">From" (ch6 p82, ch9 p4, ch10 p1, ch11 p0, ch13 p9, ch15 p18, ch15 p79), the stray ")" at ch9 p21, and the unbalanced Knox quote at ch9 p16, which was closed. The served original-en is unchanged.

## Review record

**Renderers** (13 batches, hand-rendered paragraph by paragraph): R01–R13, one per batch. Each self-checked with a per-paragraph similarity, length, typography and CAPS checker, and listed its uncertain readings for routing.

| Round | Scope | Reviewer (≠ renderer) | Result |
|---|---|---|---|
| R1 fidelity V1 | ch1–3: 34 paragraphs | Fresh independent agent | 0 BLOCKING, 3 MINOR, 3 NIT |
| R1 fidelity V2 | ch4, ch12: 35 | Fresh independent agent | 0 BLOCKING, 0 MINOR, 5 NIT |
| R1 fidelity V3 | ch5–6: 58 | Fresh independent agent | 0 BLOCKING, 2 MINOR, 3 NIT |
| R1 fidelity V4 | ch7: 70 | Fresh independent agent | 0 BLOCKING, 2 MINOR, 3 NIT |
| R1 fidelity V5 | ch8–10, ch13: 57 | Fresh independent agent | 0 BLOCKING, 4 MINOR, 4 NIT |
| R1 fidelity V6 | ch11, ch14, ch15: 80 | Fresh independent agent | 0 BLOCKING, 5 MINOR, 8 NIT |
| R2 changed-passage verification | The 38 paragraphs edited after R1 | Fresh independent agent | **VERIFIED CLEAN.** Diffs are exact, every other paragraph is byte-identical, and all 38 are faithful |

- **Sample:** 334 of 778 paragraphs (43%) across **every chapter**. It comprised every third paragraph, the footnotes, and **every passage a renderer flagged as uncertain** (91 flags), each of which received an explicit verdict.
- **Checks:** omissions, additions, reversals, softened or sharpened claims, misread period vocabulary, quotation drift, voice, and unmodernized residue.
- **Reports:** `reviews/V1…V6-fidelity.md` and `reviews/R2-changed-passage-verification.md`.

**Findings disposition:** 40 replacements were applied across 38 paragraphs. They cover all 16 MINOR findings apart from the ch7 p138 "season" emendation, plus most NITs; one NIT's wording was adjusted by the lead (ch12 p0). Examples of real defects fixed:

| Paragraph | Defect fixed |
|---|---|
| ch7 p138 | Wrong referent (habits/principles) |
| ch9 p21 | Heloisa's sensibility had been misattributed |
| ch12 p0 | "Relative duty" had been misread |
| ch14 p21 | "Selfish" had been added |
| ch8 p6 | Her irony in "professedly" had been lost |
| ch11 p17 | "Necessarily" had been dropped |
| ch1 p15 | Claim had been sharpened ("ruin" for "weaken") |

**Declined:**
- ch7 p138 "season" (see open issue 1).
- ch5 p36 "viceroys": "deputies" is kept for *viceregents*. The R2 verifier concurred on both.

## Open issues (recorded, not blocking acceptance)

1. **ch7 p138, "For every thing … there is reason".** The following clause about autumn fruit in spring implies Ecclesiastes' "season"; this is probably a transcription error in the served source. The candidate follows the served text ("There is a reason for everything"). Verify against a 1792 or 1796 printing. If it is confirmed, fix original-en and modern-en together in a separate, authorized change. Similar possible misprints are also kept as printed: ch6 p44 "attached from" (rendered by sense as "drawn away from"), ch5 p24 "intrinsic", ch12 p2 "now", and ch14 p72 "justice".
2. **Review coverage was a sample, not a whole-book read.** 43% of paragraphs were independently reviewed, all chapters were covered, and every flagged passage was checked. The brief asked for this scope. The fuller protocol in `books/README.md` step 5, an every-paragraph source comparison plus a candidate-only accessibility read, was **not** performed. If Anders wants the Frankenstein-level standard, the remaining 444 paragraphs and an accessibility pass are the next content step.
3. **No raw-source provenance folder** exists for this book (`books/raw/vindication-rights-of-woman/`). The served original-en was not re-validated against a Gutenberg or facsimile source in this task.
4. **modern-da is now stale relative to modern-en.** It was not touched, per the brief and the language strategy. Codex should make sure it is not presented as tracking the new English text.
