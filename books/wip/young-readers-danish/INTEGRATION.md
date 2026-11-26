# Integration notes: `modern-da` for The Secret Garden and King Arthur

For the separately assigned integration step. Both books are live with `original-en` and `modern-en`; this adds one edition to each.

1. Copy `{book}/editions/{id}-modern-da.json` to `app/public/data/editions/`. Paragraph correspondence with `modern-en` and `original-en` is exact in every chapter, so the edition is `aligned: true` and saved places survive an edition switch.
2. `app/src/data/bookRegistry.ts`: add to each book's `editions`
   `{ key: 'modern-da', language: 'da', style: 'modern', label: 'Moderne Dansk', aligned: true, hasAudio: false }`,
   as the six other young readers books have it.
3. `app/src/data/editionAvailability.ts`: add `'the-secret-garden/modern-da'` and `'story-of-king-arthur-and-his-knights/modern-da'` to `OFFERED_DANISH_EDITIONS`. This is the publication switch, and it is Anders's authorisation that puts an identity there (his message of 26 Nov 2026 names the whole shelf).
4. Chapter shards and their registry: `node scripts/split-edition-chapters.cjs --write-registry` for the two new edition ids (`app/public/data/editions-chapters/`, `app/src/data/editionShardRegistry.ts`).
5. `app/scripts/check-book-publication.cjs`: add the two books to `NARRATED_EDITIONS` with `['modern-en','original-en','modern-da']`, as for the other six, and update its comment ("The two without a Danish edition…").
6. Generated files that list editions or languages: the library catalogue, `app/public/read/{id}/book.html`, `chapterPages.generated.json`, sitemap and the `/nudansk` list if it is on main by then. Run the build and let the generators decide; restore sitemap files that change only by date.
7. Danish titles for search (`localTitles`): "Den hemmelige have"; "Historien om kong Arthur og hans riddere" and "Kong Arthur og hans riddere". Check how the other six carry theirs.
8. Narration: no recorded audio; Play streams, as for every offered Danish edition.
9. Onboarding, cover, taxonomy and characters are unchanged: the books already have them.
10. Privacy: no personal-data change.
11. QA before release: open both books in Danish on a phone and on desktop; Compare with Modern English and with the original in chapters 1, a middle chapter and the last; the verse paragraphs (The Secret Garden 2:¶6, 11:¶64, 26:¶33; King Arthur 2:¶11, 7:¶17, 8:¶8, 12:¶38); a reader with Dansk as reading language gets the Danish edition on first open.
