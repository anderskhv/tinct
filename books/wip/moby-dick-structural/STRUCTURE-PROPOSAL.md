# Structure proposal: Moby-Dick front matter and split titles

**Scope:** content only. Codex decides and implements the runtime structure. Nothing here changes code or live files.

## Runtime facts this proposal must respect

These come from a read-only survey of `app/`; the paths are relative to `app/`.

- `EditionData` has `chapters` plus an optional `sections` tree (`src/types/index.ts:36-65`). No front-matter key exists today.
- Chapters are resolved by `number` *and* by `number − 1` as an index, and the code assumes numbers run contiguously from 1 to N:
  - `App.tsx:651, 679, 687, 2772`
  - `editionLoader.ts:389`
  - `worker/routes/issueReports.ts:126,145`
  - chapter-label arrays in `Highlights.tsx:71`, `Notes.tsx:268`, `Chat.tsx:685`
  - `useHighlights.ts:36`
  - A chapter numbered 0 or negative would be rejected or misread.
- Every existing precedent for prefatory units renumbers the chapters that follow. Frankenstein's Letters 1–4 are numbers 1–4. Prologues and prefaces elsewhere take number 1.
- Positions, highlights, edition patches, narration keys, character mentions and shard files are all keyed by `(chapterNumber, paragraphIndex)`.

## Recommendation (option A): keyed front matter outside `chapters`

Add a top-level array to each English edition that carries the front matter:

```json
{
  "frontMatter": [
    {"id": "etymology", "title": "Etymology", "paragraphs": [ ... ]},
    {"id": "extracts",  "title": "Extracts",  "paragraphs": [ ... ]}
  ],
  "chapters": [ ...unchanged 1–136... ]
}
```

- **Every existing chapter keeps its identity:**
  - numbers 1 to 136
  - titles (apart from the three repaired ones)
  - paragraph indices (apart from chapters 56, 57 and 73; see the mapping)
  - positions, highlights, character anchors, narration and audio keys, thread keys and SEO URLs
- **Front-matter units get stable string ids** (`etymology`, `extracts`). Positions and annotations inside them would need a distinct key namespace, for example `highlights:moby-dick:fm:etymology`, or `chapterNumber` null with a `unitId`. They never collide with chapter numbers.
- **Reading order:** front matter displays before Chapter 1, for example as an optional "Before the voyage" group in the table of contents. The default start position can stay at Chapter 1, so no existing reader's flow changes.
- **Files to integrate:**
  - `front-matter.original-en.json`
  - `front-matter.modern-en.json`

  Both have the same shape and the same paragraph counts: Etymology 6 and Extracts 86. They are aligned paragraph for paragraph.
- **Sharding:** the front matter could be one extra shard, for example `frontmatter.json`, listed under a new manifest key. Chapter shards `ch0001`–`ch0136` stay as they are.
- **Counts that stay chapter-only:** `totalChapters`, "book complete" at chapter 136, and the similarity gate.

## Alternatives, for Codex to weigh

| Option | What it is | Cost |
|---|---|---|
| **B.** Two new chapters at the end (137 and 138) that a `sections` entry or TOC displays first | No new schema key, and existing numbers are unchanged | Reading order no longer matches number order. "Book complete" (`currentChapter === totalChapters`) and next/previous navigation break. The SEO "136 chapters" and movement ranges need edits. Not recommended |
| **C.** Renumber so that Etymology = 1, Extracts = 2 and Chapter 1 = 3 (the Frankenstein precedent) | Matches existing practice | Every chapter identity shifts by 2. That affects all reading positions, highlights and notes, edition patches, the character package (`paragraphHashes` and all 1,824 original-en and 1,779 modern-en mentions), narration and audio keys, threads (keyed by chapter number), 136 shards, SEO URLs `chapter-{n}.html` and the audio highlight timings. It needs a full, versioned migration. Not recommended unless option A is rejected |
| **D.** Keep the front matter out of the edition (a preface-style asset like `src/data/prefaces/`) | No schema change | It is outside the reading flow and has no positions, highlights or audio. It also misrepresents the text as editorial rather than Melville's own |

## The three split titles

The fragment paragraphs are removed and the titles reassembled in all three editions. This does not depend on the front-matter choice and can ship alone or with it.

| Ch | Reassembled title (original-en and modern-en) |
|---|---|
| 56 | `Chapter 56 — Of the Less Erroneous Pictures of Whales, and the True Pictures of Whaling Scenes` |
| 57 | `Chapter 57 — Of Whales in Paint; in Teeth; in Wood; in Sheet-Iron; in Stone; in Mountains; in Stars` |
| 73 | `Chapter 73 — Stubb and Flask kill a Right Whale; and Then Have a Talk over Him` |

In these three chapters every later paragraph moves down one index (`PARAGRAPH-MAPPING.tsv`). All other chapters are identical.

## Compatibility requirements for existing editions

1. **original-en and modern-en** must receive the structural change together, so they stay paragraph-aligned. Use `original-en.structural.json` and `modern-en.structural.json`. The modern-en file is built on the frozen accepted repair (sha `1a3f31bb…`). If Codex publishes the accepted repair first, applying the structural file afterwards is exactly equivalent to the three-chapter change described here.
2. **modern-da** (live, sha `208eb395…`) has the same split in the same places. To stay aligned it needs the identical mechanical change. **No new translation is needed or provided**, because the Danish fragment text already exists and simply moves into the Danish title:
   - 56: `Kapitel 56 — Om de Mindre Fejlagtige Billeder af Hvaler, og de Sande` + `Billeder af Hvalfangerscener.` → `Kapitel 56 — Om de Mindre Fejlagtige Billeder af Hvaler, og de Sande Billeder af Hvalfangerscener`
   - 57: `Kapitel 57 — Om Hvaler i Maleri; i Tænder; i Træ; i Plademetal; i` + `Sten; i Bjerge; i Stjerner.` → `Kapitel 57 — Om Hvaler i Maleri; i Tænder; i Træ; i Plademetal; i Sten; i Bjerge; i Stjerner`
   - 73: `Kapitel 73 — Stubb og Flask dræber en rethval; og fører så en samtale` + `over Ham.` → `Kapitel 73 — Stubb og Flask dræber en rethval; og fører så en samtale over Ham`
   - Then drop paragraph 0 in each of these chapters.
   - Danish front matter is **out of scope** (English-only strategy, 2026-09-21). If option A is taken, modern-da simply has no `frontMatter`, and the UI should hide the unit for that edition or fall back to original-en.
3. **Character package** (`moby-dick.v1.json`): see `character-annotation-impact.json`.
   - In chapters 56, 57 and 73, shift every mention's `paragraphIndex` down by 1. That is 38 original-en and 36 modern-en mentions (the modern-en count is indicative until the re-anchoring for the accepted repair).
   - Offsets are unchanged.
   - Drop `paragraphHashes[ch][0]`.
   - Set `paragraphCount` to 2,429.
   - Recompute `sourceSha256` and bump the revision.
   - No mention or anchor sits in a removed fragment.
   - Front matter needs no character data for release.
4. **User data** keyed by `(chapter, paragraphIndex)`: reading positions, highlights, notes, edition patches, and cloud `commit_user_data` rows.
   - For chapters 56, 57 and 73 only: map `p ≥ 1 → p − 1`.
   - A position on a fragment (`p = 0`) maps to paragraph 0.
   - A highlight inside a fragment's text has no paragraph left to attach to: drop it, or attach it to paragraph 0 of the new numbering, at Codex's discretion.
5. **Narration and audio:**
   - R2 narration maps are keyed `ch{N}/…/p{i}.json` but validated by a text hash. In chapters 56, 57 and 73, indices from 1 up shift, so either remap by hash or let them regenerate under the current audio architecture.
   - Audio-highlight timing artifacts for these three chapters shift in the same way.
   - No audio is generated or required for this package.
6. **Shards and SEO:**
   - Regenerate `editions-chapters/moby-dick-*/ch0056.json`, `ch0057.json`, `ch0073.json` and `manifest.json` (titles and `paragraphCount`) with the existing `scripts/split-edition-chapters.cjs`.
   - SEO pages `read/moby-dick/chapter-56|57|73.html` carry chapter titles; regenerate them if titles are shown.
   - Threads are chapter-level and unaffected.
7. **Independence from the accepted repair:** this package **does not supersede or block** the accepted modern-en text repair (`books/wip/green-moby-dick/`, sha `1a3f31bb…`). That package is frozen and untouched. Codex can publish it alone, and apply this package later.
