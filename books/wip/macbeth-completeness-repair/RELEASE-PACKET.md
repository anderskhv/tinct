# Release Packet — Macbeth, original-en + modern-en completeness repair

Status: **candidate, awaiting independent review** (see `ACCEPTANCE-RECORD.md`
once the independent review lands). Nothing here is published. No live
edition, character-card, audio, registry or application file was touched.
This package is content-only; the coding agent owns integration and
publication, per `books/BOOK-TASK-WORKFLOW.md` (2026-09-24).

## What this fixes

`main` `1a7d89ebd816af8a2ac18239010c34fab4bf48c5` audit
(`claude/laughing-maxwell-3d7f5l` `e24c16e8`, `reports/G01-shakespeare-a.md`,
`CONFIRMED-DEFECTS.md` items 1 and G01-macbeth-01…13) found that Macbeth's
served `original-en` drops **34 speech blocks (about 1,300 words)**, including
the dagger soliloquy, the "raven himself is hoarse" / "unsex me here"
soliloquy, "To be thus is nothing" and the "sere, the yellow leaf" speech.
The cause: every blank-line-separated speech block that lacks its own
speaker heading in Project Gutenberg #1533 was discarded at import, while
the stage directions around it were kept. `books/wip/green-macbeth/PARKED.md`
(the only prior record) caught 2 of the 34 and misattributed one line.

This package restores all 34 at the coordinates the audit verified, in both
`original-en` (the actual text) and `modern-en` (a fresh modern-English
rendering of the restored passages, following `books/AGENTS.md`'s modern-en
protocol). It does not touch `modern-da` — see "Scope note on Danish" below.

## Source

| Item | Value |
|---|---|
| Source | Project Gutenberg #1533, Macbeth (PG Shakespeare Team; updated 2025-09-19) |
| URL | https://www.gutenberg.org/cache/epub/1533/pg1533.txt |
| Retrieved | 2026-09-26 (this session) |
| sha256 | `1371a47e68246197f7f57017a83386fed75dbfebfd0ff51b4524921a3b38ff5e` |
| Matches | `books/raw/macbeth/raw.txt` (sha256 `03fa4dc2…`) byte-for-byte except a 3-byte BOM; identical to the audit's retrieval hash. Copied into this package at `source/pg1533.txt`. |

The whole play was re-checked against this source paragraph by paragraph, not
only the 34 previously-flagged gaps: every surviving served paragraph's
speaker and text were cross-read against the corresponding PG lines while
building the insertion map (see `CHAPTER-SUMMARY.json`); no further
completeness defects were found in `original-en` beyond the 34 already
confirmed by the audit. Stage directions, scene headings and the 28/28 scene
structure are unchanged and were not touched.

## Candidate

| Item | Value |
|---|---|
| `editions/macbeth-original-en.json` | sha256 `9df987bdf1a1a8c50d44e0c4c2ab6a18e2580f47114810232e8022eecca207c6` — 28 chapters, 840 paragraphs (was 806; +34) |
| `editions/macbeth-modern-en.json` | sha256 `c597a985ce096a923b03a5072e52f6d8bd5bbc44c0c11fd924ff4e0019351bec` — 28 chapters, 840 paragraphs (was 806; +34) |
| Replaces live sha256 | original-en `2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608`; modern-en `0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1` (both match the audit's reported first-16 prefixes; the live served files have not changed since the audit) |
| Alignment | Every chapter has an equal paragraph count in both editions after the repair (verified programmatically); Compare pairing for original-en/modern-en is intact |
| Similarity gate | `python3 books/classify-modern-en.py macbeth --gate` run against this candidate pair (via a scratch copy, since the live `app/public/data/editions/` path is out of scope for this task): **PASS** — weighted similarity 0.483 (≤0.75), 0% LIGHT/MECHANICAL chapters (≤5%), 2.7% identical long paragraphs (≤5%) |

16 chapters change: 2, 4, 5, 7, 8, 10, 11, 12, 13, 15, 16, 18, 19, 21, 23, 25.
Per-chapter before/after paragraph counts are in `CHAPTER-SUMMARY.json`.

## The 34 restorations

All 34 are listed with exact PG line numbers, speaker, word count and the
inserted text in `CHANGED-PARAGRAPHS.json` (38 entries: 34 new paragraphs
plus 4 bookkeeping entries for the paragraphs that were split rather than
purely inserted — see next section). Highlights:

- **Ch8 (2.1), after "[Exit Servant.]":** the dagger soliloquy ("Is this a
  dagger which I see before me…", 239 words) and its close ("I go, and it is
  done…", 27 words) — the play's most quoted passage, previously reduced to
  `[Exit Servant.] → [A bell rings.] → [Exit.]` with nothing between.
- **Ch5 (1.5):** Lady Macbeth's "Glamis thou art, and Cawdor…" (134 words,
  `original-en` only — `modern-en` already carried a version of it, merged
  into the letter paragraph) and "The raven himself is hoarse… unsex me
  here…" (129 words) plus "Great Glamis, worthy Cawdor!" (30 words), both
  fully absent from every edition.
- **Ch12 (3.1), after Banquo's exit:** "To be thus is nothing, / But to be
  safely thus…" (206 words) plus two lines to the murderers (11 + 7 words) —
  this whole group (G01-macbeth-04) was missing from every prior record,
  including the audit's own predecessor package (`green-macbeth/PARKED.md`
  caught only the dagger and raven soliloquies).
- **Ch23 (5.3):** "…my way of life / Is fall'n into the sere, the yellow
  leaf…" (82 words).
- 17 short continuation lines (1–17 words each) that answer or complete an
  adjacent line — for example Duncan's "Who comes here?" (ch2), which
  currently leaves `[Enter Ross and Angus.]` followed directly by Malcolm's
  unprompted "The worthy Thane of Ross," and Macbeth's dismissal of the
  murderer's answer ("It was, so please your Highness") which currently
  responds to a question ("Was it not yesterday we spoke together?") the
  served text never asks.

Every restoration was re-verified against `source/pg1533.txt` at the cited
line numbers as this package was built (not copied from the audit's summary
text), and against the surrounding served paragraphs to confirm the
insertion point reads correctly in context (see the chapter walk-throughs
below).

## Re-segmentation (3 of the 34)

The audit found that `modern-en` already carried 3 of the 34 passages, merged
into a neighbouring paragraph rather than dropped outright (`original-en` was
missing all 3). Restoring `original-en` as new paragraphs required splitting
the corresponding `modern-en` paragraph at the matching point, so paragraph
alignment holds:

- **5.1** — the merged `modern-en` paragraph (letter + soliloquy) is split at
  "...and farewell." / "Glamis you are, and Cawdor...". No modern-en prose was
  rewritten; the existing accepted rendering was cut at the sentence boundary
  and a speaker tag (`LADY MACBETH.`) added to the second half, matching how
  every other paragraph in this edition is tagged.
- **15.6** — split at "...I'll sit here in the middle." / "Be free and easy...".
- **15.40/15.41** — the trailing sentence "To all, and to him, we drink. And
  our duty to all." is moved out of paragraph 40 into a new paragraph after
  the "[Ghost rises again.]" stage direction (41), matching the audit's
  verified coordinate for the missing original-en line ("after 15.41") and
  Shakespeare's actual sequence (the toast is completed after, not before,
  the stage direction, in this served text's ordering).

`CHANGED-PARAGRAPHS.json` records each split explicitly (`old_index` +
"split:" / "trimmed:" change notes) alongside the 31 pure insertions.

## Paragraph map and reading-position migration

`PARAGRAPH-MAP.json` gives the complete old→new paragraph-index map for
every surviving paragraph in all 16 touched chapters (508 entries, keyed
`"chapter.old_index"` → `"chapter.new_index"`), covering D-1 (reading
position / highlights / notes / chat-anchor migration per
`docs/two-month-project-pipeline-2026-06-17.md`-referenced invariants and
the audit `HANDOFF.md` §4 D-1). New paragraphs (no old counterpart) are not
in the map; they only ever needed a forward-migration rule ("map to the
nearest surviving paragraph"), which the existing `useReadingPosition`
guards already provide for structural changes. No paragraph was removed, so
every old position has a valid new home.

## Character-card impact

`macbeth` is in `characterReleases` (`app/public/data/characters/macbeth.v1.json`,
pinned to the live `sourceSha256` for both `original-en` and `modern-en`).
`CHARACTER-CARD-IMPACT.json` gives the exact re-anchoring needed:

- **614 mentions (original-en) / 623 mentions (modern-en)** in the 16 touched
  chapters need only their `paragraphIndex` bumped per `PARAGRAPH-MAP.json`;
  `startOffset`/`endOffset` are unchanged because the paragraph text they sit
  in is unchanged.
- **7 (original-en) / 9 (modern-en) mentions** sit in the 3 split paragraphs
  and need both a new `paragraphIndex` and a recomputed offset. All are
  computed and verified against the actual candidate text in this package
  (for example modern-en's "Glamis" mention moves from 5.1[717:723] to
  5.2[14:20], verified by slicing the candidate JSON directly — see the
  script output preserved in this package's build; the two Cawdor-title
  mentions and both bare `MACBETH`/`LADY MACBETH` speaker-tag mentions in the
  unmoved halves keep their exact offsets, just a new `paragraphIndex`).
- No mention's cited text ceases to exist; nothing needs re-resolution
  against a changed epithet (unlike the Frankenstein package's "the
  creature" repointing).
- **Bump the release revision** (`contentVersion`) once applied, per the
  existing `characterReleases` convention.

## Threads / onboarding

Macbeth has no `macbeth-threads.json` in `app/public/data/editions/` and its
onboarding (`app/public/data/onboarding/macbeth.json`) does not quote or
reference specific paragraph coordinates from the affected passages (checked
by reading the onboarding file; it discusses the play in general terms only).
No changes needed there.

## Audio

Per `books/AGENTS.md` and the current audio policy, this is a text repair
only: no audio generation, no manifest/timing regeneration. Any cached
narration keyed to the 16 changed chapters' old text becomes stale once this
repair is integrated (the Grok streaming cache keys on exact text); Codex
should not carry old-text cache entries forward for those chapters'
paragraphs. No audio asset needs deleting as a result of *this* repair
specifically (nothing was previously mis-served as complete audio for a
speech that never existed in the reading text — the gap was symmetric across
text and any audio derived from it). Anders separately asked that audio
belonging to defective editions be removed; Codex owns identifying and
removing those assets. This package changes 34 paragraphs' worth of text
across 16 chapters, which is the exact set any narration-cache invalidation
needs to key on.

## Scope note on Danish (modern-da) — needs Anders' decision

The assignment (2026-09-26) asks for a Macbeth `modern-da` repair "from the
accepted complete original," in addition to `original-en` and `modern-en`.
`STRATEGY.md` §Language scope (2026-09-21, checked into `main`) and
`books/AGENTS.md`/`books/CLAUDE.md` (2026-09-24) both currently read: English
is the delivery strategy; "Danish is no longer a launch, publication,
translation, audio, QA or marketing requirement... Keep future localization
straightforward without starting another language rollout." The assignment's
own explicit-authorization line ("I explicitly authorize these existing
Danish-edition repairs despite the general English-first strategy") is
scoped in the assignment text to the five Danish-only items (Confessions,
Paradise Lost, Heart of Darkness, Discourse on Inequality, Vindication) and
does not name Macbeth, As You Like It, Faust or Jerusalem.

Given that conflict, this package does **not** generate new Danish text for
Macbeth. What it does do, per the audit's D-9 ("Inserting paragraphs into
original-en and modern-en misaligns modern-da... Never pair misaligned
paragraphs silently"): flag that once this repair is integrated, `modern-da`
(806 paragraphs live vs. this package's 840 for the other two editions) is
paragraph-misaligned with the repaired editions in the 16 changed chapters,
and Compare must not pair `modern-da` paragraphs against them there until
either (a) Anders confirms Danish is in scope for Macbeth specifically and a
Danish repair is produced, or (b) Codex hides `modern-da` from Compare
pairing for the affected chapters, per the audit's own recommendation for
exactly this situation. **Needs your decision:** which of (a) or (b), or
leave `modern-da` unpaired but still readable standalone.

## Verification performed

- `python3 -m json.tool` on both candidate files: valid.
- Chapter count (28) and per-chapter paragraph-count equality between
  `original-en` and `modern-en`: verified programmatically for all 28
  chapters, before and after the repair.
- All 16 touched chapters' full paragraph sequences were printed and read in
  order after the repair to confirm each restoration reads correctly in
  dramatic context (right speaker, right cue, right response) — not only
  that a paragraph was inserted at the stated index. Three coordinates in the
  audit's own "after N.M" notation were caught and corrected during this
  read-through against direct source re-verification (10.11 and 10.39 had
  been transcribed as 10.10/10.38 in an intermediate build; both were fixed
  and re-verified against `source/pg1533.txt` lines 1320 and 1432 before this
  candidate was finalized).
- Similarity gate: PASS (above).
- Untouched chapters (12 of 28) are byte-identical to the live served
  editions: verified programmatically.

## What independent review should check

1. Re-derive the 34 gaps from `source/pg1533.txt` independently (do not start
   from this package's `CHANGED-PARAGRAPHS.json`) and confirm the same 34,
   same coordinates, same word counts.
2. Confirm every insertion's speaker attribution and its placement between
   the correct neighbours (this is where the three coordinate errors were
   caught in this package's own build; an independent pass with fresh source
   line lookups is the check that catches transcription slips like that one).
2. Read all 16 changed chapters end to end in the candidate JSON for
   dramatic coherence.
4. Spot-check the modern-en renderings against the restored original-en text
   for fidelity (meaning, imagery, register) — not scored by the similarity
   gate alone, per `books/AGENTS.md`'s "a prose claim... does not substitute
   for a passing gate."
5. Re-verify the 3 re-segmentations and the character-card impact
   computation against the actual candidate JSON (offsets, not just the
   claim).
6. Confirm the Danish scope note above and flag it in the acceptance record
   as an open Anders decision, not a silent omission.
