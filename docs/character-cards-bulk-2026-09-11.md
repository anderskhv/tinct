# Character cards — bulk release of the validated queue, 2026-09-11

38 reviewed character packages move from the authoring branch
(`claude/tinct-character-content-1n5iqq`) into the app, in both English
editions each. With the 20 already live, 58 books now have clickable characters.

## What changed

- `app/public/data/characters/{book}.v1.json` — 38 new sidecars, byte-identical
  to `books/characters/{book}/characters.v1.json` on the authoring branch.
- `app/src/services/characters/characterCards.ts` — the two hand-maintained
  lists (`supportedEditions` and the inline `?v=` revision ternary) are replaced
  by one `characterReleases` table: editions reviewed and the release revision
  that versions the sidecar URL. Existing books keep their revisions
  (`2026-09-09.2`, `2026-09-10.1`, `2026-09-11.1`); the new set is `2026-09-11.2`.
- `app/src/services/characters/characterReleases.test.ts` — for every released
  book and edition, runs the reader's own `verifyCharacters` against the asset
  and the edition bytes on disk. A package whose hashes or spans drift from the
  published edition used to fail silently in the reader (no cards); it now fails
  the build.

## Released (38)

a-little-princess, antigone, around-the-world-80-days, bacchae, beowulf,
candide, comedy-of-errors, communist-manifesto, discourse-on-inequality,
frederick-douglass, gilgamesh, heart-of-darkness, hume-enquiry, ivan-ilyich,
jekyll-and-hyde, julius-caesar, jungle-book, king-lear, medea,
merchant-of-venice, midsummer, much-ado-about-nothing, notes-from-underground,
oedipus-at-colonus, oedipus-rex, on-liberty, oresteia, othello, phaedo,
phaedrus, poetics, romeo-and-juliet, social-contract, symposium, the-prince,
twelfth-night, utilitarianism, werther.

## Held back, and why

- **iliad, odyssey** — validated on the authoring branch today (`2026-09-11.1`)
  but the reader rejects both: 165 of 750 Iliad characters and 18 of 356
  Odyssey characters carry an empty `storyRole`, and `verifyCharacters` accepts
  only central / major / supporting / reference. Source and paragraph hashes
  and every mention span are correct. Needs an authoring-lane fix, then release.
- **as-you-like-it, magna-carta, taming-of-the-shrew** — packages verify today,
  but the 2026-09-11 content audit is replacing or renumbering these texts
  (translations stream, on hold by Anders). Any release now would be invalidated
  by that change; they go out with the corrected texts.
- **the-tempest** — authoring lane's own source-review hold, unchanged.

## Verification

- `npm test`: 1,846 tests in 154 files, green — including the new release gate
  (58 books × 2 editions verified against served edition bytes).
- `CI=true npm run build` + `npm run verify-bundle`: pass, bundle
  `index-CeDHSpV0.js` locally (CI produces the deployed hash).
- Browser: Chromium 1440×950 against the local build, both English editions of
  37 of the 38 new books (74 scenarios): open the reader, click the earliest
  chapter-1 mention on the first page, expect the card to name that character;
  zero page errors. Results in
  `docs/verification/character-cards-bulk-2026-09-11/browser-results.json`.
  Social Contract has no chapter-1 mention (first is Grotius, chapter 2) and is
  covered by the unit gate only. Screenshots were inspected, not committed.
- Production serving check and a live spot check follow the CI deploy and are
  appended below.

Reading position was unchanged by opening a card in every browser scenario
(`lab-root` place before/after compared).
