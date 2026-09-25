# Othello — Tinct Modern English repair (Shakespeare calibration pilot)

**Status: content accepted / handed off, not published.** This is a content-only package. No app code,
registry entry, live edition, character file, modern-da or audio was touched.

- **Instruction revision:** `origin/main` at `56b451f7`. The instructions read were
  `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `STRATEGY.md`, `AGENTS.md`, `books/AGENTS.md`,
  `books/CLAUDE.md` and `docs/workflow-boundaries.md`.
- **Owned path:** `books/wip/othello-modern-en/` only.
- **Branch:** `claude/cool-galileo-tyen9m`. The commit is the one that adds this folder; the exact hash is
  reported in the hand-off message.

## Pinned inputs

| Input | SHA-256 |
|---|---|
| Gutenberg #1531 source (`source/pg1531.txt`) | `340a08eb95d6404c0834906eb7b899ec6503c609ca76eb5b7430bb100cd1e462` |
| Served `othello-original-en.json` (baseline) | `a8e8ae40b054bce1b60dcba35fcd194f08e74829fcc0faa6665456f962b5d1df` |
| Live `othello-modern-en.json` (being replaced) | `5beb0f0093ef10f1d725b797c3eef7cdfe370b3d74be8738f4fd01431dbdb04d` |
| Live `characters/othello.v1.json` | `ebc79f97f2c03040e648bfe98056f028c303e5b314ea78ad62dc9d5bec131ddc` |

## Deliverables

| File | What it is | SHA-256 |
|---|---|---|
| `othello-modern-en.candidate.json` | Full re-render with 15 chapters and 1,391 paragraphs, 1:1 with the served editions. It is a drop-in replacement for `app/public/data/editions/othello-modern-en.json`, in the same key order and format (`json.dumps(indent=2, ensure_ascii=False)`, no trailing newline). | `012ede1e45c1d3b0c51c791212971892b345092c658b06e4712aa69a1dd2083c` |
| `othello-modern-en-lines.proposed.json` | **Proposed** line-break sidecar, described in the next section. | `bd67ab0b264f85c97063802049309000fb9c3955fa6f1d6ecbb688d399e38f88` |
| `othello-characters-modern-en.proposed.json` | Proposed replacement for `editions["modern-en"]` in `characters/othello.v1.json`. It contains `sourceSha256`, `paragraphHashes`, `characters` and `mentions`, all re-anchored. | `770c3fc31c0337395648c9586aab5e8cbf9bb440a10e23b9318d61f3b2e8ad52` |
| `CHARACTER-CARD-IMPACT.md` | Mention and anchor impact, with every editorial decision listed. | |
| `CHANGED-PARAGRAPHS.json` | Changed paragraph coordinates for audio invalidation. | |
| `SAMPLES.md` | 10 before/after speeches for Anders. | |
| `review/` | Render brief, review brief, the four full-read reviews, editor fixes, re-check, gate output and `REVIEW-RECORD.md`. | |
| `alignment/original-line-units.json` | For every speech paragraph, the Gutenberg lines it was built from. This is the line-order template, and it can also produce an `original-en` sidecar. | |
| `source/` | The source text and `SOURCE.md` (provenance). | |

## Standard applied

The target was the approach of No Fear Shakespeare, but no copyrighted modernization was consulted or
imitated. The rendering is plain, natural present-day English. It follows the original line by line,
omits nothing and adds nothing, and makes every image, pun and piece of bawdy understandable inside
the line.

- **Clear lines kept:** famous lines that are already clear stay recognizable, for example "I am not
  what I am", "Put money in your purse", "the green-eyed monster", "Put out the light, and then put
  out the light", "loved not wisely, but too well".
- **Calibration line:** "His bed shall seem a school, his board a shrift" is now "his bed will feel like
  a classroom and his dinner table like a confessional". In the same speech, "I'll watch him tame"
  becomes "I'll keep him awake till he's tame, like a hawk being trained".
- **Speaker prefixes:** every prefix is verbatim.
- **Stage directions:** all 171 stage-direction paragraphs are byte-identical to the live modern-en.
  This follows the house convention in Hamlet and Macbeth ("Exeunt" etc. unchanged).
- **Verse order:** every verse speech is rendered unit by unit against the original verse lines, so its
  sentences follow the original line order.

## Similarity gate

The gate was run as `python3 books/classify-modern-en.py othello --gate`, using the unmodified
committed script against a scratch copy of the repo layout. That copy held the served original-en and
the candidate as `othello-modern-en.json`. No live files were touched.

```
othello original-en -> modern-en  (15 chapters)
  weighted similarity : 0.481   (gate: <= 0.75)
  light+mechanical    : 0/15 = 0.0%   (gate: <= 5%)
  identical long paras: 1/473 = 0.2%   (gate: <= 5%)
  buckets: REAL-HEAVY 6  REAL 9  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS
```

This compares with the current Othello at 0.692, Hamlet at 0.425 and Macbeth at 0.483. Per-chapter
figures are in `review/gate-output.txt`: 1.1–2.1 and 3.4 score 0.42–0.46, and the rest score 0.47–0.58.
The highest are 4.3 and 2.2, which are short plain lines, songs with refrains, and the proclamation.
The one identical long paragraph is 13.29 (`[Sings.] Sing all a green willow…`). The parser treated it
as a stage direction, so its bytes are kept.

## Proposed line-break sidecar

The sidecar uses the same shape as `hamlet-lines.json`: `bookId`, `edition`, `source`, `sourceSha256`,
`editionSha256`, and `chapters → paragraphIndex → [offsets]`. Each offset is the UTF-16/char offset in
the **modern** paragraph text where the counterpart of an original verse line begins. The first line
and the speaker prefix are implicit, as in Hamlet.

- `"edition": "modern-en"`, `"status": "proposed"`.
- `editionSha256` equals the candidate hash.
- It covers **457 paragraphs with 1,929 breaks**, and every offset passes the reader's `offsetsFit` rule
  (a space before, a non-space at the offset, strictly increasing).
- **Verse versus prose:** a Gutenberg line is treated as a prose wrap, not a verse break, when the
  previous line is at least 60 characters or the line starts with a lowercase letter. The length data
  shows a clean gap between 58 and 61 characters. There is one manual override, 1.8, a 61-character
  verse line. Mixed prose-then-verse speeches such as 13.48 break only at their verse lines. Pure prose
  and single-line speeches have no entry.
- **Integration note for Codex:** the current loader fetches a single `/data/editions/{bookId}-lines.json`
  with one `edition`. No `othello-lines.json` exists yet. Serving modern-en lineation needs a file or
  schema decision, for example a per-edition filename or merged chapters. Lookup is by paragraph text,
  so modern and original entries cannot collide. Codex decides whether and how to render it.

## Character-card impact (modern-en offsets change)

Details are in `CHARACTER-CARD-IMPACT.md`.

- 1,032 of 1,391 paragraphs changed. Every modern-en mention in those paragraphs has a new offset.
- Of the 1,833 old mentions:
  - 379 are in unchanged paragraphs.
  - 1,430 were re-anchored by ordinal text match.
  - 21 were re-anchored editorially. For example, "Duke" became "duke", "sibyl" became "prophetess",
    "Promethean" became "Prometheus", and "Diablo" became "devil".
  - **3 were dropped** because the new text no longer names the referent there: 1.4 "Othello" and "God",
    which were inventions of the old edition, and 3.95 the third "Cassio".
  - That leaves **1,830 mentions**.
- **Anchor points:** 226 in total. Most followed their mention. Othello's and God's `firstMention`,
  `roleVisibleAt`, identity snapshot and evidence moved to the end of their first surviving mention
  (both are still 1.4). Three snapshot points that sat at a paragraph end (9.176, 6.93, 11.137) moved to
  the new paragraph end.
- **Validation:** the proposal was checked against the reader's `verifyCharacters` rules. The source hash
  and all paragraph hashes match. Every mention's `text` equals its slice, every point is in range, and no
  snapshot comes before its `firstMention`.
- **Release requirement:** the modern-en character block must ship in the same release as the new text.
  Otherwise `verifyCharacters` rejects the package on `sourceSha256` and modern-en cards disappear, though
  nothing breaks. Bump `characterReleases.othello.revision`.
- **Not done:** names the new text introduces in paragraphs that had none (for example "Moor" where the
  old text said "him") were not added as new mentions. Coverage is additive and optional.
- `othello-threads.json` holds chapter-level summaries with no offsets, so it is unaffected.

## Audio

Only the text changed. Codex must invalidate cached Grok speech for the **1,032 changed paragraphs**
listed in `CHANGED-PARAGRAPHS.json`. The 359 unchanged paragraphs (171 stage directions and 188 short
speeches) remain cache-compatible. Grok streaming continues, and no generation, voice or provider change
is prescribed. modern-da and legacy audio are untouched.

## Open issues

1. **Parser defect in original-en:** 43 speech continuations are wrapped in `[...]` with the speaker
   prefix lost, because the parser split speeches at inline stage directions. The ids are 3.4, 3.28, 3.43,
   4.31, 4.37, 4.47, 4.79, 6.29, 6.30, 6.39, 6.40, 6.76, 6.78, 6.95, 6.99, 6.126, 6.130, 7.23, 7.29, 9.109,
   9.130, 9.132, 10.68, 10.78, 10.93, 11.28, 11.34, 11.46, 11.48, 11.157, 12.15, 12.47, 12.88, 12.91,
   13.26, 13.28, 13.30, 13.33, 14.80, 14.84, 15.4, 15.66 and 15.146. The reader may style them as stage
   directions. The candidate modernizes their content but keeps the bracket shape, for 1:1 parity.
   Unwrapping and restoring prefixes is a structural repair to both editions together, needing mappings
   for character cards; it was not done here. 13.29 (`[Sings.] …` song line) is a related case.
2. **Sidecar serving** needs the Codex file or schema decision described above.
3. **Contested glosses** are listed under "Renderer self-flags" in `review/REVIEW-RECORD.md`. Reviewers
   accepted them, but Anders may want to spot-read them.
4. **The 1.33 gloss** ("the beast with two backs — having sex") was added after the independent re-check
   and has had only an editor check.
5. **Stage directions are not modernized** (for example "Exeunt"), matching Hamlet and Macbeth. If the
   house style changes, it should change across all plays.
6. **Character mention coverage** for newly named referents is optional follow-up work.
7. **modern-da** was derived from the old modern-en and is now out of step with it. Danish is out of
   scope, so this is recorded only.
