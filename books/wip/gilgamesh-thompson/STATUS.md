# Status: gilgamesh-thompson

**STATUS: content accepted with Anders's decisions of 17 Nov 2026; integrated on branch `integrate/gilgamesh-thompson` (18 Nov 2026), not yet released.**

Decisions applied at integration (Anders, 17 Nov 2026):
- **Friedrich paragraphs dropped.** Tablet V paragraphs 6 and 7 (the Sun-god's winds; Humbaba's surrender and plea) and Tablet VII paragraph 2 (the gods' council: "Enkidu shall die"), Thompson's English of the Hittite version credited to J. Friedrich (d. 1972) and A. Ungnad, are removed from original-en, modern-en and modern-da at the same index. 161 -> 158 paragraphs; Tablet V 8 -> 6, Tablet VII 9 -> 8. Recorded in `provenance-map.json` under `droppedParagraphs`. Gates rerun on the final files: classify gate PASS (0.328), structure, alignment and `!` parity pass; VII.2 (formerly VII.3, a printed note) is still the only paragraph under 75%.
- **modern-da published without a native-speaker read** (explicit owner waiver). The independent fidelity spot-check is also not done. Both remain open quality steps, not release blockers.
- `structure-map.json`: counts-only proportional map from the old 253-paragraph text, input to `app/scripts/build-replacement-migration.py`.

Verse lines restored (Anders, 18 Nov 2026):
- **original-en is set in Thompson's printed lines.** 1,139 single spaces became newlines (1,293 text lines in the 154 verse paragraphs); no word, character count or paragraph slot changed, so the 17 Nov text is the 18 Nov text with every newline read as a space. The reader sets the lines through the registry flag `newlineVerse` (the convention of Pope's `style: 'verse'` Odyssey, without changing the edition's role as the book's original).
- Method: the line starts were read from the PDF text layer of the hashed archive.org scan (`extracts/download-manifest.json`, `Thompson_1928_Gilgamesh.pdf`, sha256 `aa17040e…f7584b9`), using each printed line's position on the page: an indented short line that continues a word group is Thompson's wrap of an over-long hexameter and is rejoined; his right-set half-lines (e.g. "Of Erech, the high-wall'd,") stay lines; gap dots go with the printed line they stand on. Each edition word was aligned to the scan (99%+ of words matched per tablet). Three places were set by hand from the page images: IV.1 keeps the printed wrap before "and thy shutter (?)," (the joined line would pass the reader's 100-character verse limit); XI.4 ". . . causing a plentiful rainfall"; XII.12 ". . . he hath spoken". Spot-checked against the page images of pp. 9-10, 27 and 60.
- Thompson's four prose notes (V.5, VII.2, VIII.1, IX.5) stay one flowing paragraph.
- **modern-en and modern-da stay prose.** They are sentence-by-sentence prose renderings (90% of Thompson's words, reordered), not line-for-line versions, so there is no line to break on; the repo sets every other verse original's modern edition as prose too (Odyssey, Aeneid, Paradise Lost, Divine Comedy, Oresteia; Beowulf alone was rendered line by line).
- `books/raw/gilgamesh/raw.txt` (the old Colavito page) is deleted; `books/raw/gilgamesh/SOURCE.md` records its hash and where the Thompson provenance lives.

Final sha256 (18 Nov, with verse lines): original-en `2a91b1e1f3c7180dbb1d02360dceda6c3c7f0ca836685dc40a91fb82c6125b38`. Before the verse lines (17 Nov): original-en `13a06194f842eece71b770b4557bbcf6eca5c251610c5a83140b36c1a5c769ce`; unchanged: modern-en `1641d807941a9480512f1324869e8abcb635fb31aaff0d2d659eb88985d896d0`, modern-da `3469ed8fc8cc6ccc3f832e01bcf9fa81dfaaa9edac39ddc16c40983535d3aa56`.

Original package status (16 Nov):

| Edition | State |
|---|---|
| original-en (Thompson 1928, as printed) | Complete: 12 tablets, 161 paragraphs. Transcribed from the page images; 99.0% OCR trigram agreement. |
| modern-en | Complete. classify gate PASS (0.329). Overlap vs old live text: 0/161 at both n=10 and n=8. |
| modern-da | Complete; published 18 Nov 2026 on the owner's waiver. Structural checks, danish-lint (0 findings) and the overlap check vs the old live Danish (0/161) all pass. Native Danish read and independent review are pending. |
| Threads / characters / onboarding / SEO / narration | Not touched. These are for the integration step (see HANDOFF.md). |

Decisions (settled 17 Nov 2026):
- The three Friedrich-derived Hittite paragraphs (V.6, V.7, VII.2) are dropped.
- The recension mix and the missing Humbaba fight are explained in the onboarding "about" text (English and Danish).

No TODO passages: nothing was blocked, and every paragraph is rendered in both modern editions.

History: the session's original worktree was removed mid-task. The package was rebuilt from scratch-pad working files into a new worktree on the same branch. Nothing was lost; all gates were rerun on the final files.
