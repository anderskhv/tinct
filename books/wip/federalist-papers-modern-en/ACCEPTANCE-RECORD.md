# Acceptance Record: *The Federalist Papers*, modern-en repair

- **Book id / edition:** `federalist-papers` / `modern-en`
- **Date:** 2026-10-05
- **Status:** **CONTENT ACCEPTED / HANDED OFF.** Not published.
- **Branch:** `claude/federalist-papers-modern-en` (the exact commit is given in RELEASE-PACKET.md and the handoff message)
- **Instruction revision used:** `origin/main` at `791d2802` (the assigned base). `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `STRATEGY.md`, `AGENTS.md`, `books/AGENTS.md`, `books/CLAUDE.md` and `docs/workflow-boundaries.md` were read before any editing. The reference package pattern was `books/wip/vindication-modern-en/` on `origin/claude/sleepy-hamilton-0f1kqi`.
- **Owned path:** `books/wip/federalist-papers-modern-en/` only. No app, registry, live-edition, character, modern-da, audio, script or test file was touched. `git diff --name-only origin/main` lists only files in this folder.

## Pinned inputs

| File | Role | sha256 |
|---|---|---|
| `source-original-en.json` | Fidelity anchor. Byte-identical to the served `original-en` at `791d2802` | `c733011184b5b42d48ac29dc73660ee631d039df0ff0572761724c7e0509d7e8` |
| `baseline-live-modern-en.json` | The live modern-en being replaced. Byte-identical to the served file at `791d2802` | `1974574ebce6859b2c7fdde48b524360b6348e0492e425861e8259076297278d` |

The served original-en has no `books/raw/federalist-papers/` provenance folder. This repair used the served text as the anchor and did not re-source it (open issue 1).

## Accepted candidate

**`candidate.json`, sha256:**
```
1f123f52d66f4f4df3c4b8e2e47dd8d561bc10fd914c7ef90bed6db51327c7fa
```

- **Serialization:** identical to the served file (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline, keys `chapters` only, each chapter `number`, `title`, `paragraphs`). The candidate is a drop-in for `app/public/data/editions/federalist-papers-modern-en.json`.
- **Structure:** 85 chapters (papers) and 1,279 paragraphs. Chapter numbers, titles (including each authorship heading as served), per-chapter paragraph counts and footnote paragraphs and markers are identical to both served editions, so saved places, highlights and notes map 1:1 with no migration. The served text carries no "To the People of the State of New York" lines and one signature ("PUBLIUS" inside ch11 p14); both are kept as served and none were added.
- **Paragraphs changed against the live modern-en:** 1,218 of 1,279. Coordinates are in `changed-paragraphs.json`. The 61 unchanged paragraphs are the footnote and citation paragraphs, verbatim Constitution clauses and other quoted matter that the style note keeps word for word (58 are byte-identical to the original-en; the other 3 are ch44 p9 and ch84 p24 and p27, which differ from the original only by spelling or typography already present in the live file).

## Similarity gate: whole book PASS (full output in `GATE-OUTPUT.txt`)

| Scope | Weighted similarity | Light + mechanical | Identical long paragraphs | Result |
|---|---|---|---|---|
| Whole book | **0.704** (was 0.833) | **0/85** (was 44/85) | **32/1,232 = 2.6%** (was 55) | **GATE PASS** |

All 85 papers fall between 0.598 and 0.791 and are REAL. Wrapped-scaffolding and truncated-quotation counts are 0.

**Per-batch gate runs (`--chapters`), reported as run.** The 16 batch groupings are the renderers' work units. Twelve pass. Four fail, none for a reason that is fixable without breaking the style note:

| Group | Result | Why |
|---|---|---|
| 8–12 | FAIL (0.756; 6/80 = 7.5% identical) | Six Montesquieu quotations and the footnotes in No. 9 are kept word for word by the style note |
| 24–29 | FAIL (0.754) | Marginal; Hamilton's No. 28–29 prose is already close to plain English and the Constitution's militia clause is quoted |
| 40–43 | FAIL (11/94 = 11.7% identical, similarity 0.644) | Verbatim Constitution clauses and the Congress resolution (Nos. 40–43) |
| 78–82 | FAIL (0.759) | Marginal; long Constitution quotations and quoted objections in Nos. 81–82 |

I did not reword clear sentences or quotations to move these numbers (the brief and `books/CLAUDE.md` forbid it). The whole-book gate is the handoff gate and it passes; the per-batch results are recorded so Codex and Anders can see them.

**How the gate was run:** the unmodified `books/classify-modern-en.py` on a scratch mirror holding the served original-en plus `candidate.json` in place of the live modern-en. The tool reads only `app/public/data/editions/`, which this workflow forbids editing. The mirror reproduces the assigned failure exactly on the live file (0.833, 44/85, 55/1,232).

**Screening:**
- **`books/audit-truncation.py` (en):** run from a scratch copy pointed at the mirror (the committed script has a hard-coded Mac path). 0 paragraphs fell below the 0.75 length ratio.
- **Sweeps over source vs candidate:** 85 chapters, 1,279 paragraphs; titles identical; 0 curly quotes; 0 remaining `--`; 0 paragraphs under 75% of source length (for 20+ word sources); every figure, date and sum present; "judicial review" appears nowhere; "emolument" appears only inside quoted Constitution clauses (4 occurrences, all quotations); "magistrate" appears twice, both in Publius's own sense of a civil officer or judge of a city (ch9 p15, the Lycian common council; ch40 p9, "a civil magistrate").
- **Term sweeps** (source vs candidate counts): democracy 17/17, Confederation 82/82, energy 26/26, energetic 5/5, departments 74/74, requisition 21/21. Counts that differ (faction 61/72, federal 325/335, national 340/338, republic 166/170) were checked paragraph by paragraph by the reviewers: the differences are "former/latter" and "it" resolved to the noun, the "factious" → "factional" form, and a few restored or corrected renderings (see the fidelity reports).

## Editorial decisions

All are in `STYLE-NOTE.md` (term table, quotations, typography, period language).

- **Quotations.** Constitutional and legal text, other authors (Montesquieu, Hume, Blackstone, Mably, Scripture, verse), quoted opponents, and Latin and French tags keep their source wording with spelling and typography normalized. Publius's own lead-ins and commentary are modernized. Where Publius paraphrases inside quotation marks, he is modernized as his own prose.
- **Madison's democracy / republic distinction (Nos. 10, 14, 39, 48)** survives word for word. R02 and R03 confirmed the definitions in No. 10 (faction, pure democracy "in person", republic "scheme of representation") and No. 14; R07 confirmed No. 39's republican definition and the federal / national analysis, and no federal/national unification occurs.
- **Courts' power to void unconstitutional acts (No. 78)** is in Hamilton's own words ("declare all acts contrary to the manifest tenor of the Constitution void"). No modern label was added (R15).
- **"Energy in the executive"** keeps "energy", "energetic" and "vigor" throughout Nos. 23 and 70 (R13).
- **"Magistrate":** "chief magistrate" → "chief executive"; "magistrate" → "public official"; "emoluments" → "pay" or "compensation" outside quotations.
- **Period terms for people** ("negroes" in Nos. 54 and 55 inside the reported speech and census passage) are kept as printed per `books/AGENTS.md`.
- **Source misprints.** Word-level misprints stay as served (for example ch15 p5 "appointment", ch54 p0–p1 "appointment", ch37 p5 "independence", ch63 p11 "four", ch3 p7 "town or country", ch57 p15 repeated "the ambitious"). Pure typographic glitches (missing periods, doubled words, one-letter slips) are repaired silently and listed in the open issues. A few silent word-level repairs survive review because they read as the evident sense (ch64 p5 "Few will deny" for "There are a few who will not admit"; ch37 p7 "kingdoms") and are listed too.

## Review record

**Renderers** (16 batches, hand-rendered paragraph by paragraph, no scripted text): papers 1–7, 8–12, 13–18, 19–23, 24–29, 30–35, 36–39, 40–43, 44–48, 49–55, 56–61, 62–66, 67–71, 72–77, 78–82, 83–85. Each self-checked with a per-paper similarity, length and typography checker and reported its uncertain readings; those were routed to the reviewers.

| Round | Scope | Reviewer (≠ renderer) | Result |
|---|---|---|---|
| R1 fidelity R01–R16 | **Every paragraph, 1,279 of 1,279**, one reviewer per batch, each a fresh agent that did not render it | independent | 7 BLOCKING, 97 MINOR, 44 NIT fix entries (148 replacements applied) |
| R2 changed-passage verification V1–V4 | The 148 changed paragraphs and the two ch54 lead edits (150) | four fresh agents, none the renderer or reviewer of that text | 139 verified, 11 defects, all corrected |
| R3 final check V5 | The 11 corrected paragraphs | fresh agent | 10 verified, 1 minor defect (ch46 p1 "therefore" dropped), corrected |

| Reviewer | Papers | Paragraphs | BLOCKING | MINOR | NIT |
|---|---|---|---|---|---|
| R01 | 1–7 | 111 | 0 | 9 | 5 |
| R02 | 8–12 | 83 | 1 | 5 | 11 |
| R03 | 13–18 | 79 | 0 | 5 | 1 |
| R04 | 19–23 | 92 | 0 | 4 | 2 (+6 notes) |
| R05 | 24–29 | 70 | 0 | 6 | 4 |
| R06 | 30–35 | 58 | 0 | 3 | 3 (+2 notes) |
| R07 | 36–39 | 62 | 1 | 4 | 7 |
| R08 | 40–43 | 97 | 0 | 7 | 3 |
| R09 | 44–48 | 86 | 1 | 12 | 8 |
| R10 | 49–55 | 71 | 1 | 10 | 6 |
| R11 | 56–61 | 78 | 0 | 3 | 2 |
| R12 | 62–66 | 78 | 1 | 6 | 3 |
| R13 | 67–71 | 76 | 1 | 7 | 2 |
| R14 | 72–77 | 63 | 0 | 4 | 4 |
| R15 | 78–82 | 90 | 0 | 6 | ~8 |
| R16 | 83–85 | 85 | 1 | 7 | 7 |

- **Checked:** omissions, additions, reversals, softened or sharpened claims, dropped qualifiers, wrong figures, referents, term drift, quotation drift, truncation, typography, emphasis capitals, and accessibility (residual 1788 syntax and stilted or ungrammatical rewriting).
- **Examples of real defects fixed:**

| Paragraph | Defect fixed |
|---|---|
| ch10 p2 | "curing the mischiefs of faction" had become "faction can be cured" |
| ch53 p1 | A comparative reversed: "will NOT BE MORE secure" became "will be less secure" |
| ch64 p3 | Conditional ("If the observation be well founded…") flattened into an assertion |
| ch83 p17 | "more or at least as much" had lost "more" |
| ch69 p10 | "denizens of aliens" had become "citizens of foreigners" |
| ch46 p1 | "emoluments" in Madison's own prose |
| ch37 p5 | The misprint "independence" had been silently repaired (restored as served) |
| ch1 p5 | "consciousness of good intentions" had been changed |

- **Reports:** `reviews/R01…R16-fidelity.md` with `R01…R16-fixes.json`; `reviews/V1…V4-changed-passage-verification.md`; `reviews/V5-final-corrections-verification.md`.
- **Accessibility read.** Folded into each fidelity review (item 7 in the brief) rather than a separate candidate-only read. A separate accessibility pass by someone who has not seen the source was not done.

## Open issues (recorded, not blocking acceptance)

1. **No raw-source provenance.** There is no `books/raw/federalist-papers/` folder; the served original-en was not re-validated against Gutenberg or a facsimile. The served original-en carries several likely misprints (items 2–4) that, if confirmed, should be fixed in original-en and modern-en together in a separate authorized change.
2. **Probable source misprints kept as served** (word-level): ch15 p5 and ch54 p0–p1 "appointment" (for "apportionment"); ch37 p5 "independence on the people" (for "dependence"); ch63 p11 "first of four, and afterwards of six hundred" (a dropped "hundred"); ch3 p7 "town or country"; ch26 p12 "latter"; ch27 p6 "will, in its will, in its proper place"; ch28 p1 "national presumption"; ch57 p15 "the ambitious or the ambitious or the bribes of the rich"; ch84 p26 footnote 3 (corrupt clause); ch68 p8 Pope verse "That which is best administered" (Pope has "Whate'er"); ch78 p20 "no great option between fit character"; ch82 p4 "national governments"; ch46 p7 final period on a question (rendered "?").
3. **Silent repairs that remain** (reviewers accepted them as the evident sense): ch64 p5 "Few will deny" (for "There are a few who will not admit"); ch37 p7 "kingdoms" (for "kingdom"); ch40 p7 "produce" (for "affected", probably "effected"); ch47 p17 "elective by"; ch44 p16 "their own" (for "irrespective"); ch11 p3 "and elsewhere" (for "islands elsewhere"); ch20 p18 "formally" (for "formerly"); ch22 p13 "same court" (for "came court"); ch22 p17 "force and energy"; ch10 p1 "adverse" (for "adversed"); ch55 p3 "safety"; ch11 p13 and ch34 p9 doubled words rendered once; missing-period repairs at ch30 p4, ch39 p4, ch52 p6, ch55 p6, ch56 p9, ch72 p0; ch39 p14 repeated fragment rendered once.
4. **Structural quirks kept as served:** ch6 footnotes 2 and 3 are absent in the source (markers (2),(3) have no note); ch36 p16–17, ch56 p6–7 and ch77 p3 carry alternate endings with "(E1)" markers; ch70 p14–16 repeats the "weightiest objection" passage; ch18 p0 is only the byline "MADISON, with HAMILTON"; "Abbe" and "AEtolians" are unaccented as printed.
5. **Per-batch gates:** four of the 16 working groupings exceed a gate limit (table above); the whole-book gate passes.
6. **Review accessibility pass:** see above; not done as a separate candidate-only read.
7. **modern-da is stale relative to modern-en.** It was not touched. Codex should make sure it is not presented as tracking the new English text. No new Danish rendering was made (Danish is out of scope).
8. **Character cards are affected** (see RELEASE-PACKET.md and `character-card-impact.json`).

## Integration (2026-10-21, release text-2026-10-21.3)

Integrated on branch `claude/modern-en-integrate-2`. Method, checks and the card rulings for this book are in
`books/wip/modern-en-release-20261021/RELEASE-3.md`. The package was verified against `origin/main`: candidate and
pre-image hashes equal the packet, the structure is 1:1, and the card pin equals live. The gate was re-run on the
integrated file and passes with the packet's numbers. Coordinate maps and a `CONTENT_RELEASES` entry carry saved places
and highlights. Narration re-prepares changed paragraphs by text hash on the next Play; nothing was generated.
Status: integrated, PR open, not yet published.
