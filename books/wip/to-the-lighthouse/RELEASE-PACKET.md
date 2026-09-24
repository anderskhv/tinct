# Release Packet — To the Lighthouse (new book)

**Status: content accepted and handed off to Codex. Not published.**

- No file under `app/**`, the registry, live data paths, character releases, audio or shared tooling was changed.
- Integration, app verification and serialized release belong to the coding agent.
- Evidence: `ACCEPTANCE-RECORD.md` (text review), `SOURCE.md` (provenance and rights), `METADATA-PROPOSAL.md` (registry and taxonomy), and `reviews/` (all review reports and decisions).

- **Instruction revision:** PR #158, `codex/adding-books-strategy-20260924` at `1a978c65` (book-task workflow and adding-book strategy, read without merging).
- **Branched from:** `main` `b91d4b8d`. Current `main` `1bd1bfb3` does not touch any path this package targets.

## Artifacts and destinations (copy byte for byte)

| Package file | Destination | sha256 |
|---|---|---|
| `editions/to-the-lighthouse-original-en.json` | `app/public/data/editions/to-the-lighthouse-original-en.json` | `1662e69cd2781083e2332aeddd1e0c340446bdf2f7929c95da0d008e65b8d4f8` |
| `editions/to-the-lighthouse-modern-en.json` | `app/public/data/editions/to-the-lighthouse-modern-en.json` | `17c56b3d069214329a1f636bc7ad0286e38576d70ebe7921affc431f90149205` |
| `onboarding/to-the-lighthouse.json` | `app/public/data/onboarding/to-the-lighthouse.json` | `d8d8cfdb46ee8de601a77af3d226d1c277720dfa809563e5dcee4ad20917523e` |
| `characters/to-the-lighthouse-threads.json` | `app/public/data/editions/to-the-lighthouse-threads.json` (the convention loader needs no code) | `ad8b1fe535fcbc9c67701e74b9ade896da7c85d24106382b3f2ba5fb3a66a2df` |
| `characters/characters.v1.json` | `app/public/data/characters/to-the-lighthouse.v1.json` | `13d6c32488d59ef9ff9187971e1bab9a4931672ea310b18afaf11eb911fbf7cb` |
| `characters/editorial.json` | authoring source; suggested home `books/characters/to-the-lighthouse/editorial.json` | `e8c2b2f6068eaa1c2cef0c532505f44141c4542723a3071c160bf5fb08ef29b9` |
| `characters/validation-report.json` | alongside the editorial source | `fef2f3a9de246630e9302f135a7f57b3550f6d4439537c7047d45e39e6673752` |

- **Editions:** 42 chapters and 495 paragraphs in both editions; identical titles, `section` values, `sections` array and per-chapter counts, so the pair is aligned. Per-paragraph hashes: `editions/{original-en,modern-en}-paragraph-hashes.tsv` (first 16 hex digits, keyed `chapter.index`).
- **Changed paragraphs:** not applicable. This is a new book with no live baseline; all 495 paragraphs of each edition are new.

## Integration requirements for the coding agent

1. **Registry.** Add a `TO_THE_LIGHTHOUSE` `Book` with the two editions only (`original-en`, `modern-en`, both `aligned: true`), per `METADATA-PROPOSAL.md`. Add it to `BOOKS` only after app verification.
2. **Reader defaults (approved policy, 2026-09-24).**
   - Primary edition: `modern-en`. Compare edition: `original-en`. Woolf wrote in English, so the original is the comparison text.
   - These are initial defaults only. Do not overwrite saved reader choices.
   - If the current reader cannot express per-book defaults yet, that is an app change owned by Codex.
3. **Taxonomy.**
   - On the existing `to-the-lighthouse` entry in `libraryTaxonomy.ts`: remove `stub` and set `langs` to `["EN"]`.
   - Resolve the `missing` placeholders in the Columbia Core and Bloom canon lists to `{ "id": "to-the-lighthouse" }`.
   - House: Novels. Shelf: Modernism.
4. **Parts.**
   - The editions carry `section` and top-level `sections` (three parts), like `crime-and-punishment`.
   - Chapter titles are self-explanatory (`The Window · 1` … `The Lighthouse · 13`). Confirm the TOC and chapter labels render well, including the one-paragraph chapters 15, 24, 35 and 38.
5. **Character cards.**
   - Register `'to-the-lighthouse': { editions: EN, revision: '<new revision>' }` in `characterReleases`.
   - The sidecar binds to the exact edition hashes above (`normalization: prose-reader-v1`, UTF-16 offsets).
   - Coverage:
     - original-en: 76 entities, 1,356 mentions.
     - modern-en: 78 entities, 1,429 mentions. The extra two are `tennyson` and `cowper`, named only in modern glosses. The compiler omits them from the original, where they have no mention.
     - Snapshots, including first-encounter ones: 105 in original-en, 107 in modern-en.
   - The sidecar was compiled with `books/characters/build_reviewed.compile_package` unchanged, using a plain word-boundary alias binder. Paths were redirected to the staging folder by a throwaway scratchpad script, which is not committed.
   - The lead verified every mention span against both editions (0 bad spans) and the source hashes.
   - Please run the app's own `verifyCharacters` release test after registration; that is the authoritative gate.
   - Review status: `authoring-agent-reviewed`, plus an independent review (`reviews/characters-review.md`) whose R2 re-verification ended VERIFIED CLEAN.
6. **Onboarding.**
   - Current schema: `about`, 4 `angleCards` with `angleObjective`, 6 `cast`, 3 `whyItMatters`, 1 verified `acclaim`.
   - `openingText` is contiguous text from the accepted modern 1.0–1.1.
   - The Vanessa Bell quote was verified against *The Letters of Virginia Woolf*, vol. III, Appendix, p. 572 (see `reviews/onboarding-factcheck.md`).
   - After the fact-check, the lead rewrote the prose of `whyItMatters` items 2–3 to remove parallelism flagged by the style rules. The rewrite uses only the verified facts.
7. **Narration.**
   - English narration follows the current Grok streaming contract.
   - No audio was generated, and no prerecorded audiobook, legacy manifest or timing file is a prerequisite.
   - This book does not join the featured-ten opening preparation automatically.
   - Verify runtime narration eligibility and text/cache identity against the hashes above.
8. **Verify after publication.**
   - Served bytes (build-versioned URLs) equal the sha256 values above.
   - Counts are 42 / 495 per edition.
   - Onboarding loads for all entry points.
   - Compare alignment works.
   - Character cards appear in both editions.
   - The book shows under Novels → Modernism.

## Known limits (honest)

- **Structure decision.** The books rules ask for structure to be discussed with Anders before parsing. The request had already fixed the edition pair, so the natural structure was taken as the default: Woolf's own 42 numbered sections in three parts. If Anders wants the three parts as the reading units instead, only chapter grouping changes and the text stays the same; bindings and threads would need re-keying.
- **Acceptance scope.** Acceptance is authoring-lane review by independent agents, not Anders's editorial sign-off.
- **Source family.** The text is the UK Hogarth text. US-edition readings are not used, except "power" at 14.6 (see `SOURCE.md`).
- **Card uncertainty.** Some character-card identity facts are inferences the text implies but never states (Maggie = Mrs. McNab; Sorley as the Lighthouse keeper; Badger as a dog). The cards hedge them; see `characters/source-review.md` (it contains spoilers and is not reader-facing).
- **Not committed.** Scratchpad scripts (parser, batch gate, merge, apply, compiler) are not part of the package. Their behavior is described in `SOURCE.md` and above.
