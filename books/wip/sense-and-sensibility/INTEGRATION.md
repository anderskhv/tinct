# Sense and Sensibility — integration notes (2026-10-01)

Branch `integration/new-book-sense-and-sensibility`, stacked on `integration/new-books-alice-wh-middlemarch`. Staged only: the `SENSE_AND_SENSIBILITY` constant is in `app/src/data/bookRegistry.ts` but not in `BOOKS`.

## What was integrated

- Live editions `app/public/data/editions/sense-and-sensibility-{original,modern}-en.json`, byte-identical to the package files (SHA-256 original `26ccda95…d4c0`, modern `c86c2708…e512`, matching `HANDOFF.md`). 50 chapters numbered 1–50, 1,806 aligned paragraphs; no renumbering needed.
- Chapter shards under `app/public/data/editions-chapters/` via `node scripts/split-edition-chapters.cjs sense-and-sensibility-original-en sense-and-sensibility-modern-en --write-registry` (adds both ids to `editionShardRegistry.ts`).
- Onboarding `app/public/data/onboarding/sense-and-sensibility.json` (unchanged; acclaim intentionally omitted by the package).
- Taxonomy entry in `libraryTaxonomy.ts` (house novel, shelf `english-novels`, form novel, era modern, no named list memberships) and composition year 1811 in `public/lab/library_2/browse-groups.js`.
- Registry constant uses the package's `metadata-proposal.json` (description, word count 118,639, cover colours `#263c38` / `#c6ad7b`, original label "Austen (Original)").

## Choices the package did not specify

- Hue `265`: the shared `english-novels` shelf hue used by Middlemarch (Pride and Prejudice has 310, a per-book value; the package gave none).
- Themes: the first three of the eight proposed (marriage, money, judgment), matching the three-theme convention of the other entries.
- `hasAudio: true` on both editions follows the other staged books; no audio availability entry exists, so nothing plays until one is added.

## Not done

Character sidecar and `characterReleases` entry (24-identity proposal in `characters/sense-and-sensibility.proposal.json`, no mention offsets, spoiler gates need exact verification), cover art, SEO pages, `audioAvailability.json` entries, reading-list membership (none proposed), independent editorial review (the package's `STATUS.md` still says NOT READY: no independent semantic or character/spoiler reviewer), review by Anders. Trimmed from the package for size: per-batch QA slices, paragraph-level QA tables and the raw Gutenberg archive remain on `origin/content/sense-and-sensibility-codex`.
