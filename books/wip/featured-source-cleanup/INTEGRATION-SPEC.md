# Integration specification: featured source-structure cleanup

This is for the coding agent that owns publication. It covers live editions, character anchors, reader positions and the other runtime dependencies. This package changed none of them.

Coordinates below are `chapter.index`: the chapter number is 1-based and the paragraph index is 0-based, matching the reader's `chapterNumber`/`paragraphIndex`. Offsets are in UTF-16 code units, the character cards' `offsetUnit`.

## 1. Ordering and supersession (read first)

- **The package supersedes the accepted modern-en candidates.** The package's modern-en files are the accepted Modern English candidates with the structural operations applied, so they **supersede** the accepted candidate hashes for publication. Do not publish the accepted candidate and then this package as separate steps unless each step also re-anchors the cards. The cleanest route is one release per book with both editions and the card together.
- **A book's two editions ship together.** Jane Eyre and Pride and Prejudice change paragraph counts. original-en and modern-en of the same book **must go out in the same deploy**, or split view and card anchors misalign.
- **Odyssey: ship both files together.** Publishing only the truncated original-en would leave today's live modern-en 3.37, which is the 207-word spliced prose, beside 12 words. Ship `odyssey-original-en.json` from this package **together with** the accepted modern candidate (`bd05c7f4…`, byte-identical copy here), or after it.

## 2. Edition files

Copy these byte for byte. Do not re-serialize.

| Destination (`app/public/data/editions/`) | Package file | sha256 | Replaces live | Paragraphs |
|---|---|---|---|---|
| `jane-eyre-original-en.json` | `jane-eyre/jane-eyre-original-en.json` | `d05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257` | `055aad5e…5f96` | 4,047 → 4,034 |
| `jane-eyre-modern-en.json` | `jane-eyre/jane-eyre-modern-en.json` | `bfd5ace3b7803b4d31773148fdaf244ab6da0fd91db329a6077ae88d351a9749` | `bbfe4c30…` (live) / accepted `5e270560…` | 4,047 → 4,034 |
| `pride-and-prejudice-original-en.json` | `pride-and-prejudice/pride-and-prejudice-original-en.json` | `6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c` | `5a440246…60c6` | 2,060 → 2,053 |
| `pride-and-prejudice-modern-en.json` | `pride-and-prejudice/pride-and-prejudice-modern-en.json` | `6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463` | `d914bb2d…` (live) / accepted `5ba867fe…` | 2,060 → 2,053 |
| `odyssey-original-en.json` | `odyssey/odyssey-original-en.json` | `0cc76350232962d4c4f1cf1eb7216f14515fc1910f94f666695d2a595d4e6980` | `da03f6ac…2f07` | 1,027 (unchanged) |
| `odyssey-modern-en.json` | `odyssey/odyssey-modern-en.json` (= accepted candidate) | `bd05c7f43da64bfe4ad9908531f2a1434e79acc8635ca54cb1ad39942e9afc9c` | `813127d7…` (live) | 1,027 (unchanged) |

Per-chapter count changes, which are identical in both editions of a book:

- **Jane Eyre.** Ch 4: 124→123 · 12: 69→68 · 15: 78→77 · 18: 103→102 · 19: 147→146 · 25: 110→109 · 28: 147→144 · 33: 143→142 · 34: 161→160 · 36: 80→79 · 38: 24→23.
- **Pride and Prejudice.** Ch 3: 21→20 · 14: 18→17 · 22: 20→19 · 30: 13→12 · 36: 14→13 · 46: 32→31 · 48: 35→34.
- **Odyssey.** No count changes; the text of original-en 3.37 changes.

## 3. The paragraph map, and how to apply it to anything indexed by paragraph

`<book>/paragraph-map.tsv` lists every paragraph of every touched chapter, as old → new, with an operation:

| op | Meaning | Coordinate rule |
|---|---|---|
| `keep` | Same index, same text | Unchanged |
| `renumber` | Same text, lower index | `paragraphIndex` becomes `new_index`; offsets unchanged |
| `delete` | JE caption removed | A mention or anchor inside it is **dropped**. It duplicates the paragraph named `duplicates` in `CHANGES.md`, which keeps its own mention. A **reader position, highlight or note** inside it moves to that duplicated paragraph's new index at offset 0. Do not reset the position. |
| `merge-head` | P&P first half of a rejoined pair | `paragraphIndex` becomes `new_index`; offsets unchanged |
| `merge-tail` | P&P second half | `paragraphIndex` becomes `new_index`; **add** `offset_shift_<edition>` to every character offset (the UTF-16 length of the old head plus 1). The shift differs per edition. |

Chapters not in the map are identical, and so are all chapters of the Odyssey.

The JE 36.52 modern-en edit appends text at the **end** of the paragraph, so offsets 0–715 in modern 36.52 stay valid. The old closing `—"` (UTF-16 offsets 716–717) is replaced, so a modern-en annotation that starts there, or ends after offset 716, must be clamped to 716 or re-anchored. No card mention does. The Odyssey 3.37 original-en truncation keeps its first 56 UTF-16 units, so offsets below 56 are valid and anything at or beyond 56 must be dropped.

## 4. Other affected editions and runtime dependencies

### 4.1 Character cards (required)

These are `app/public/data/characters/{jane-eyre,pride-and-prejudice,odyssey}.v1.json`, all at contentVersion `2026-09-12.1`. `<book>/downstream-impact.json` lists **every** moved, shifted or dropped coordinate, giving its JSON path, old and new values, and the mention text.

**original-en.** The card is pinned to exactly this package's input, so the moves apply directly:

| Book | Mentions | Anchors |
|---|---|---|
| JE | 113 renumber, 1 drop (`mentions[163]` "Mrs. Reed" at 4.83, inside the caption) | 4 renumber: `characters[17]` roleVisibleAt/firstMention/snapshot availableAt/evidence, 28.67 → 28.65 |
| P&P | 174 renumber, 30 merge-shift, 12 merge-head (index only) | 16 renumber (characters 1, 11, 12, 13 in ch 3) and 4 merge-shift: `characters[21]` 30.7@319 → 30.6@481, including `evidence[].throughOffset` 319 → 481 |
| Odyssey | 1 drop (`mentions[473]` "Nestor" at 3.37 offset 57, inside the splice) | None |

`scripts/impact.py` confirms that every surviving original-en mention re-resolves to its exact text in the corrected file. Then:

- Set `sourceSha256` to the new hash and `paragraphCount` to the new count.
- Recompute `paragraphHashes` (the full sha256 of the raw paragraph text) for the chapters listed in `paragraphHashes_chapters_to_recompute`.
- Bump the release revision.

**modern-en.** The card is pinned to the **pre-repair live baseline**, not the accepted candidate. Two steps are needed:

1. Perform the accepted Modern English packet's own re-anchoring to the candidate. That is JE 330 mentions and 9 anchors, and P&P 665 mentions and 20 anchors; see those packets.
2. Apply this package's map. The `merge-tail` shifts in `paragraph-map.tsv` are computed from the **candidate** text.

The modern-en `moves` in `downstream-impact.json` are computed against the baseline card. They are exact for index moves and indicative for merge-shift offsets.

- In JE, the modern-en card anchor that moves is `characters[16]`, 28.80 → 28.78.
- For the Odyssey modern-en card, only the accepted packet's re-anchor applies (632 of 662 mentions re-anchor and 30 drop, per that packet). This package adds nothing.

### 4.2 Chapter shards

`app/public/data/editions-chapters/jane-eyre-original-en/` and `…/jane-eyre-modern-da/` exist.

- Regenerate them with `app/scripts/split-edition-chapters.cjs` after the edition swap. The manifest `paragraphCount` changes for the 11 JE chapters above.
- No P&P or Odyssey shard directories exist today.
- If shards are produced for other editions, regenerate them from the new files.

### 4.3 modern-da (decision needed; not prepared)

Danish is no longer a delivery requirement, so no Danish copies were prepared. The Danish editions are still served and paragraph-aligned, so a book whose English count changes leaves its `modern-da` misaligned unless one of two things happens: da receives the same structural operation, or da is withdrawn from split view and alignment. `downstream-impact.json → modern_da_report_only` shows the da text at every coordinate.

- **P&P da.** All 7 pairs join cleanly with one space: the head ends without terminal punctuation and the tail starts lower-case. The fix is mechanical.
- **JE da.**
  - 11 of the 13 caption paragraphs are Danish duplicates of their neighbour and can be deleted mechanically.
  - **da 36.52 needs the same fold as English.** It ends `…var hun over kanten —«`, and only da 36.53 carries "I næste øjeblik lå hun knust på brostenene."
  - **da 34.114 is not a caption translation.** It reads "Han fo'r sammen. Knap nok — men jeg fangede det.", which is different content, and da 34.113 does not match source 34.113 either. The Danish chapter 34 appears to be locally misaligned. **Do not delete da 34.114 blindly**; that is for the Danish owner.
- **Odyssey da.** 3.37 carries a 193-word translation of the splice. The paragraph count is unaffected, so alignment holds. The Danish text beside Butler's 12 words is the same class of defect the English splice was.

### 4.4 Paragraph-indexed user data

Reading positions, highlights, notes, reading log/progress, chat history anchors, bookmarks and issue reports all hold `(bookId, chapterNumber, paragraphIndex[, offset])`.

- Migrate them with §3 for JE chapters 4, 12, 15, 18, 19, 25, 28, 33, 34, 36 and 38, and for P&P chapters 3, 14, 22, 30, 36, 46 and 48.
- Without a migration, positions after a touched paragraph drift by one to three paragraphs in those chapters. A position at an old last index becomes out of range, and the Invariant 6 validator **resets** it and deletes its key. That is lost reading position, the worst UX failure named in `CLAUDE.md`.
- Implement the migration as an index remap keyed on the edition's content version. Keep invariants 1–9 in place. Do not loosen `canPersistLocation()`, `shouldBlockRegression` or the bounds validation.
- Odyssey user data needs no migration, except an offset ≥ 56 on original-en 3.37, which should clamp to 0.

### 4.5 Audio

**Do not regenerate audio or invoke Kokoro.** Legacy paragraph-indexed narration and timings for the touched chapters become stale, so treat them as invalid cache under the approved narration architecture (`docs/audiobook-architecture-2026-09-21.md`). They are not a release prerequisite.

### 4.6 Checked and unaffected

- Onboarding JSON.
- `*-threads.json`, which has no paragraph coordinates.
- SEO pages `app/public/read/{book}/`: chapter summaries that quote none of the changed paragraphs.
- `app/scripts/seo/`.

## 5. Post-publication verification

- The served sha256 of each edition must equal the §2 hashes. Check the reader's build-versioned edition URL, not only the bare URL.
- Counts must match §2, chapter by chapter.
- Each card's `sourceSha256` must equal the served edition hash, and each card's release revision must be bumped.
- In the browser:
  - Split view, JE ch 36: 36.52 ends with the fall, and the next paragraph is "Dead?".
  - Split view, P&P ch 3: no paragraph ends mid-sentence.
  - Odyssey Book 3: the last paragraph is Butler's single clause in both columns.
- A reader positioned at JE 28.120 before migration lands on the same sentence after it (at 28.117).
