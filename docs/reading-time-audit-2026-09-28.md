# Reading-time audit — 28 September 2026

The public library already uses 170 words/minute and build-measured counts from the published default edition. The registry contains older round estimates, but the catalogue build replaces them. No blanket slowdown is justified by this audit: reading pace, rereading and pauses vary greatly.

The remaining defect was returning-reader metadata using the default edition's count and paragraph structure even when Continue targets a different edition. Publish available non-Danish edition counts/structures separately and choose the saved edition for that estimate. Sharded counts now read only chapter paths declared in the manifest, avoiding accidental extra JSON files. No source text or saved reading coordinates are changed.

## Evidence

Read-only source sampling at main 37b8dde (whitespace counts, before punctuation-normalized production counting):
- Frankenstein: original 74,919; modern 65,020.
- Odyssey: original 117,228; modern 104,916.
- Hamlet: original 31,621; modern 30,903.
- Meditations: original 46,058; modern 45,498.
- War and Peace: original 561,695; modern 534,552.
- The Prince: original 32,405; modern 28,830.
- To the Lighthouse: original 69,323; modern 71,238.

These demonstrate why book-level counts cannot substitute for selected-edition counts. Production uses its existing Unicode word-count rule, so these sampling numbers are not copied into product metadata.

Brysbaert's 2019 meta-analysis reports adult English silent-reading averages of 238 wpm for nonfiction and 260 for fiction; these are population averages, not a promise for difficult literature or any individual. Tinct's 170 wpm is deliberately more cautious. Source: https://biblio.ugent.be/publication/8647789 .

## Limits

Times remain approximate, exclude breaks and discussion, and are separate from narration length. Remaining percentage is based on the selected edition's paragraph structure, not a personal reading-speed model; varying paragraph length can still affect that estimate. Keep the approximation marker and avoid claiming precise completion times. No paid inference or audio generation was used.
