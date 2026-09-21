# BSB independent staging

Reviewed: 2026-09-21

## Authorization and status

Anders authorized independent import, validation and verse mapping for the Berean Standard Bible, keeping KJV and WEB unchanged. Audio/word-sync and reader integration are deferred. This package does not register BSB, change defaults or mutate highlights, positions, reader code or live editions. PR #131 is staging only, not publication authority.

Status: source inspection and importer preparation underway; no completed-import claim yet.

## Source

Import the official third-printing BSB unchanged. Official download index: https://berean.bible/downloads.htm . USJ archive: https://bereanbible.com/bsb_usj.zip . Independent verse text export: https://bereanbible.com/bsb.txt . Rights: https://berean.bible/terms.htm (public-domain dedication, commercial reuse permitted; preserve verbatim text under the BSB name). Raw downloads, acquisition timestamps and hashes belong in the generated validation artifact.

## Scope and integration contract

- One 66-book BSB edition, 1,189 biblical chapters, separate edition key proposed as bsb-en.
- Preserve source USJ structure, paragraph/poetry markers, notes and headings. Derive a plain reader projection without modifying the source.
- Stable passage key: USFM book code + biblical chapter + verse. Global Tinct chapter number is a separate derived location, not the canonical identity.
- Compare by verse identifiers, not equal paragraph counts. Same verse identifier indicates a reference correspondence, not identical wording or guaranteed identical textual extent.
- Keep source highlights and their exact quotations unchanged. Target-edition projection is derived display information, never a destructive migration.
- Partial-verse selections must not reuse word or character offsets across translations. Candidate behavior: a unique exact quote within the mapped verses, otherwise a corresponding whole-verse display with explicit approximation. Missing/ambiguous references must return unmapped, not the nearest verse. The reader owner implements and tests that behavior later.
- Legacy highlights lacking edition/source revision need explicit resolution; do not guess from the current edition. Mapping is pinned to input hashes and must be rebuilt if source text changes.
- Do not use whole-chapter global quote search to relocate repeated quotations. Constrain any later quote search to verified source/target reference spans.
- Existing KJV/WEB paragraph groups are not BSB source paragraphs. Preserve BSB grouping independently and supply a crosswalk.
- No BSB audio is claimed; do not borrow KJV/WEB narration. Audio/word-sync consume the eventual frozen text version.

## Reader owner handoff (deferred)

Register the accepted edition only after import QA; set the default for new Bible readers, never overwrite saved choices. Use verse anchors to preserve saved positions and project annotations. Validate old-edition text hashes, preserve original highlight text/id/note/color, and avoid persisting projected offsets as source data. Keep KJV/WEB available. Test chapter boundaries, poetry, multi-verse/multi-paragraph selections, partial-verse fallback, missing verses, repeated wording, legacy unscoped marks and source revision changes.

Current reference implementations were inspected read-only at base commit 0cd12bc06850ee85a1ac5dd7749cc8153062d50c: app/src/lab/labHighlightProjection.ts, labHighlights.ts and labBibleTree.ts. Their schemas/interfaces are not changed by this package. A staged verse crosswalk is not a working reader integration.

## Deferred work

App/registry/default changes, live highlight projection, production verification, audio/word-sync, and the separate 73-book WEB Catholic collection. Do not present this 66-book BSB as a Catholic Bible or mix translations under its name.
