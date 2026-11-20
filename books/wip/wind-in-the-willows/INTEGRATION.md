# The Wind in the Willows (Grahame) — integration notes (for the separately assigned integration step)

1. Register `original-en`, `modern-en` and `modern-da` from `editions/`. Defaults after acceptance: primary `modern-en`, Compare `original-en`; Danish selectable. Paragraph correspondence is exact, so saved positions survive edition switches.
2. Id: `wind-in-the-willows`. Not present in the live registry or editions folder on origin/main at the time of packaging.
3. Danish edition label: reuse the label used for the other Danish editions; check `app/src/data/libraryTaxonomy.ts` `langs` and the edition picker.
4. Taxonomy: proposal in `taxonomy.md`; confirm the shelf.
5. Onboarding: copy `onboarding/wind-in-the-willows.json` after review; no acclaim, no cast.
6. Narration: not started; text is final only after acceptance.
7. Privacy: no personal-data change.
8. Product-scope note: `STRATEGY.md` lists “Kids editions” as out of scope. This package is the complete original book in a modern rendering for general readers, not a simplified children’s edition; Anders requested it explicitly. Confirm before publishing.
