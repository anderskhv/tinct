# Generation, QA, and safe integration plan

## Production sequence

1. Freeze the current 100-row manifest snapshot; any later publication gets a new row rather than silently changing this batch.
2. For each title, write one concrete motif brief from the text's central tension—not a cover search result—and record it in the manifest.
3. Generate text-free 1024×1536 artwork with prompt template `tinct-cover-v1` and deterministic filename `{id}--artwork-v1.png`.
4. Review at full size and at 108×162. Reject pseudo-text, cliché, weak silhouette, cultural shorthand, accidental similarity to another title, and poor type-safe space.
5. Iterate narrowly as `{id}--artwork-v2.png`, retaining rejected work under `iterations/` with a reason.
6. Apply deterministic EB Garamond title/author overlay. Export master PNG plus production WebP/AVIF derivatives after the app's supported format is confirmed.
7. Record generator, prompt version, date, reviewer, rights basis, SHA-256, selected version, and approval in the manifest.
8. Integrate only approved titles. The CSS placeholder remains the fallback for every book without an approved asset.

## QA gates per cover

- 2:3 aspect ratio; master 1024×1536 or larger.
- Title and author match registry exactly, including diacritics and punctuation.
- Thumbnail legibility at 108×162; distinct silhouette at 58×86.
- No embedded/generated typography, watermarks, signatures, or recognizable third-party art.
- Contrast is acceptable in light and dark library surfaces.
- Artwork does not crop unexpectedly in card, detail, onboarding, and social-preview contexts.
- Human editorial approval is explicit; generation alone never changes production.

## Integration shape (future change, not performed here)

- Add an optional cover asset field or a separate `bookCoverManifest` keyed by `book.id`; do not alter edition/reader state.
- `BookCover` uses approved image when present and the existing CSS cover otherwise.
- Keep title/author accessible outside the image and use descriptive alt text; do not make bitmap text the only label.
- Land assets in small reviewed batches (for example 8–12), test the library grid/detail/onboarding routes, then deploy via the repository's normal verified path.
- A missing, failed, or unapproved image must resolve to today's CSS placeholder, never a broken image.

## Remaining-work estimate after this eight-cover pilot

There are 92 published titles left. Plan for about 1.35 generations per accepted cover (roughly 124 generation calls), plus a deliberate editorial/typesetting pass:

- Briefing and motif selection: 6–9 hours.
- Generation wall time: roughly 2–4 hours when responsibly batched; longer if serial.
- Visual review and targeted iteration: 8–12 hours.
- Typesetting, thumbnail QA, provenance, and export: 4–6 hours.
- Integration and multi-surface QA: 4–6 hours.

Practical total: **24–37 focused hours**, or about **3–5 working days**, before final product approval. The built-in image tool does not expose a reliable marginal per-image charge in this task, so the defensible monetary estimate is **no separately observable cost here**. If production switches to API/CLI generation, price it only after choosing the current model, quality, and resolution; those rates are time-sensitive.

