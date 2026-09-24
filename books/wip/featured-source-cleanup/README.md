# Featured source-structure cleanup: Jane Eyre, Pride and Prejudice, Odyssey

**Date:** 2026-09-24 · **Branch:** `claude/admiring-brahmagupta-rb9sws` (based on `main` `b91d4b8d`)
**Scope:** structural corrections only, to the source and Modern English editions of three books whose Modern English repairs are already accepted. No prose was rewritten. No live edition, application file, character card, audio, tracker or other agent's folder was modified. Everything is in this folder.

| Book | Verdict | What changes | Paragraphs (both editions) |
|---|---|---|---|
| Jane Eyre | **VERIFIED** | 13 Gutenberg illustration captions deleted from both editions. One modern-en sentence folded into 36.52 | 4,047 → **4,034** |
| Pride and Prejudice | **VERIFIED** | 7 mid-sentence illustration splits rejoined in both editions | 2,060 → **2,053** |
| Odyssey | **VERIFIED** (splice). A separate capitalisation question is left open; see below | original-en 3.37 truncated to Butler's clause. modern-en unchanged | 1,027 → 1,027 |

The reader and coding agent should start with `INTEGRATION-SPEC.md`.

## Pinned inputs

Every input is read with `git show <commit>:<path>` and checked against its hash, so later edits to a branch cannot change what this package was built from.

| Book · edition | Pinned commit (branch) | Path | sha256 |
|---|---|---|---|
| JE original-en | `d47d80f8` (`claude/laughing-hypatia-svxsjf`) | `books/wip/green-jane-eyre/source.json` (= live `jane-eyre-original-en.json`) | `055aad5e…5f96` |
| JE modern-en | `d47d80f8` | `books/wip/green-jane-eyre/candidate.json` (accepted) | `5e270560…d7d7` |
| P&P original-en | `e004aad9` (`claude/upbeat-dirac-jw9ghg`) | `books/wip/green-pride-and-prejudice/source.json` (= live) | `5a440246…60c6` |
| P&P modern-en | `e004aad9` | `books/wip/green-pride-and-prejudice/candidate.json` (accepted) | `5ba867fe…4c77` |
| Odyssey original-en | `b91d4b8d` (`main`) | `app/public/data/editions/odyssey-original-en.json` (served) | `da03f6ac…2f07` |
| Odyssey modern-en | `0a76d6ce` (`claude/odyssey-modern-en-completion`) | `books/staged-replacements/odyssey/edition/odyssey-modern-en.candidate.json` (accepted) | `bd05c7f4…fc9c` |

**Reconciliation.** On 2026-09-24 there was no newer accepted version of any of these books. The three handoff branches are unmerged. `main` still serves the pre-repair modern-en baselines (`bbfe4c30…`, `d914bb2d…`, `813127d7…`), and no open PR touches these editions. This package therefore builds on the accepted candidates, not on live modern-en. If a newer accepted candidate appears, change the pin in `scripts/build.py` and re-run: every operation asserts its exact expected text, so any drift fails loudly instead of being edited over.

**Gutenberg sources re-checked against gutenberg.org on 2026-09-24:**
- `books/raw/jane-eyre/raw.txt` is identical to the current `pg1260.txt`, apart from BOM and line endings.
- The Odyssey package's `pg1727-butler-1900.txt` is byte-identical to the current `pg1727.txt`.
- `books/raw/pride-and-prejudice/raw.txt` differs from the current `pg1342.txt` in two upstream typo fixes only: "young-man" → "young man" and "Mr, Wickham" → "Mr. Wickham". Neither is near a break. These fixes are not applied here; they are listed under follow-ups.

## Jane Eyre: VERIFIED

- **What was listed.** The acceptance record lists 4.83, 12.46, 15.45, 18.92, 19.78, 25.83, 28.6, 28.51, 28.117, 33.92, 34.114, 36.53 and 38.17. Each was checked in `raw.txt`. Every one is a caption block: it is preceded by two blank lines, has no closing punctuation (38.17 is a question), and repeats a narrative line nearby. For 15.45, the line it repeats is 15.43, two paragraphs back, not the adjacent paragraph.
- **Completeness.** A scan of every block in `raw.txt` preceded by two blank lines, and a separate near-duplicate scan of `source.json`, found exactly this set. The fourteenth Gutenberg caption, at 37.87 ("You are altogether a human being…"), was already de-duplicated by the parser. Blocks such as "I soon forgot storm in music." are genuine narrative and were kept.
- **Captions the modern text relies on.** For 12 of the 13 captions, the retained modern neighbour already carries the line, so the modern caption paragraph is a pure duplicate. The exception is **36.53**. Modern 36.52 ended at `she yelled and gave a leap—"`, and only caption 36.53 said that Bertha died. Before 36.53 is deleted, modern 36.52's ending is changed to `…gave a leap, and the next moment she lay smashed on the pavement."`. This mirrors source 36.52 ("gave a spring, and the next minute she lay smashed on the pavement.”") and reuses the accepted modern wording of 36.53. It is the only prose touched in the package.
- **Result.** 4,047 → 4,034 paragraphs in both editions, still aligned chapter by chapter.

## Pride and Prejudice: VERIFIED

- **The seven breaks.** Each of the seven, 3.3/3.4, 14.12/14.13, 22.3/22.4, 30.6/30.7, 36.3/36.4, 46.10/46.11 and 48.11/48.12 (all 0-based), sits exactly where Gutenberg inserts a George Allen illustration inside a single paragraph. 48.11/48.12 is inside Mr. Collins's indented letter.
- **Completeness.** A scan of both `source.json` (a paragraph ending mid-word followed by a paragraph starting lower-case) and `raw.txt` (an illustration preceded by an unterminated line) finds exactly these seven.
- **The fix.** Each pair is rejoined as `head + " " + tail` in both editions, and every modern-en pair joins cleanly. The book's word sequence is identical before and after in both editions.
- **Left alone.** Darcy's letter (35.4) and all other structure are untouched.
- **Result.** 2,060 → 2,053 paragraphs.

## Odyssey: VERIFIED for the splice; capitalisation is a separate owner question

- **Indexing convention.** The packet's "Book 3 ¶38" / `B03-P038` is **1-based**. Book 3 has 38 paragraphs, and ¶38 is the last one: **index 37, 0-based**, which this package writes as `3.37`.
- **The splice.** The served paragraph has 208 words: Butler's final clause of Book III, then an invented Nestor speech ("It is getting late; it is time we were all in bed…", which appears nowhere in PG #1727), then a modern paraphrase of 3.36. The live modern-en 3.37 is that same text, so the modern prose was spliced into the original.
- **The fix.** Truncate original-en 3.37 to exactly `Now when the sun had set and darkness was over the land,` (PG #1727, the last line of Book III). This removes no Butler text. The output hash `0cc76350…6980` independently reproduces the hash recorded for A3 option A in the Odyssey ledger.
- **Modern English.** The accepted modern candidate already renders 3.37 as Butler's clause (`…darkness lay over the land,`). No defect was demonstrated, so the candidate is carried byte for byte.
- **Owner decision, not blocking.** The ledger's A7 records a separate, owner-level question: Book III's and Book IV's initial capitals, and Book II's terminal comma (options B, B+ and C). That is a typographic-policy decision, not the splice, and this package does not take it. The truncation is correct under every option. After it, both columns print the same half-sentence followed by Book IV's `They reached…`, which is the state the accepted modern candidate already has.

## Independent verification

- **Mechanical.** `scripts/verify.py` deliberately shares no code with `build.py`, and every check passes:
  - Inputs match their pinned hashes.
  - Untouched chapters are identical.
  - Every paragraph in a touched chapter is either verbatim input or a recorded change.
  - Word conservation holds per book and edition. P&P's word sequence is identical. JE lost exactly the caption words and gained exactly the folded sentence plus "and". The Odyssey lost exactly the splice tail.
  - Each deleted caption is still carried by a retained neighbour.
  - original-en and modern-en stay aligned.
  - The Odyssey 3.37 text equals the PG line.
- **Card mentions.** `scripts/impact.py` confirms that every surviving original-en card mention (JE 1,498, P&P 3,105, Odyssey 663) re-resolves to its exact text in the corrected file.
- **Human-style review.** Two independent reviewers were given the claims to test but not the reasoning behind them. Their reports are in `verification/`.

## Contents

| Path | What |
|---|---|
| `INTEGRATION-SPEC.md` | What the coding agent must do, in order, and what must not be done |
| `<book>/<book>-original-en.json`, `<book>/<book>-modern-en.json` | Corrected copies. Same serialization as live (`indent=2`, UTF-8, no trailing newline) |
| `<book>/CHANGES.md` / `CHANGES.json` | Exact before/after text of every change, with the Gutenberg evidence excerpt |
| `<book>/paragraph-map.tsv` | Explicit old → new paragraph map for every touched chapter, including UTF-16 offset shifts for merges |
| `<book>/downstream-impact.json` | Card coordinates (every moved, shifted or dropped mention and anchor, with its new coordinate), paragraph-hash chapters, chapter shards, and a modern-da feasibility report |
| `build-summary.json`, `HASHES.sha256` | Input and output hashes and counts, and a hash of every package file |
| `scripts/` | `build.py` (build), `verify.py` (independent checks), `impact.py` (downstream coordinates), `render.py` (CHANGES.md) |
| `verification/` | Independent reviewer reports |

Reproduce from the repo root: `python3 books/wip/featured-source-cleanup/scripts/build.py && python3 books/wip/featured-source-cleanup/scripts/impact.py && python3 books/wip/featured-source-cleanup/scripts/render.py && python3 books/wip/featured-source-cleanup/scripts/verify.py`, then `sha256sum -c HASHES.sha256` from this folder.

## Follow-ups noticed, not acted on (outside this brief)

- **P&P source typos.** Two Gutenberg typo fixes made upstream since the raw text was downloaded: "young-man" and "Mr, Wickham".
- **JE modern-en: 11 source-identical paragraphs.** The accepted candidate contains 11 paragraphs longer than 120 characters that are byte-identical to the source: 3.26, 24.160, 24.163, 24.165, and 34.86, 34.93, 34.100, 34.113, 34.138, 34.140 and 34.144. A cluster in chapter 34 looks unmodernized, and some of those paragraphs use spaced ` — ` dashes. This belongs to the Jane Eyre owner, and this package carries those paragraphs verbatim.
- **modern-da.** The Danish editions share the affected coordinates. See `INTEGRATION-SPEC.md` §4. They were not prepared here, because Danish is no longer a delivery requirement.
