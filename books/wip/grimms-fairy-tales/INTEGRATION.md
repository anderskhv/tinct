# Grimms’ Fairy Tales — integration notes (for the separately assigned integration step)

1. Register `original-en`, `modern-en` and `modern-da` from `editions/`. Defaults after acceptance: primary `modern-en`, Compare `original-en`; Danish selectable. Paragraph correspondence is exact, so saved positions survive edition switches.
2. Danish edition label: reuse the existing label used for the other Danish editions (“Moderne Dansk”); check `app/src/data/libraryTaxonomy.ts` `langs` and the edition picker.
3. Taxonomy: proposal in `taxonomy.md`; a new shelf `folk-and-fairy-tales` needs approval (fallback `adventure`).
4. Onboarding: copy `onboarding/grimms-fairy-tales.json` after review; no acclaim, no cast.
5. Catalogue/search: the Gutenberg catalogue lists this work; once registered, the “Not yet in Tinct” entry should disappear. Danish hits in search depend on app search settings and are outside this package.
6. Narration: not started; text is final only after acceptance.
7. Privacy: no personal-data change.
