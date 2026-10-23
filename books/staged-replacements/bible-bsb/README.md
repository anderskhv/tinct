# BSB independent staging

Reviewed: 2026-09-21

## Authorization and status

Anders authorized independent import, validation and verse mapping for the Berean Standard Bible, keeping KJV and WEB unchanged. Audio/word-sync and reader integration are deferred. This package does not register BSB, change defaults or mutate highlights, positions, reader code or live editions. PR #131 is staging only, not publication authority.

Status: independent staging complete and technically validated on 2026-09-21. Not registered, merged, deployed or tested in the reader. No user highlights have been copied or changed.

## Source

Import the official third-printing BSB unchanged. Official download index: https://berean.bible/downloads.htm . USJ archive: https://bereanbible.com/bsb_usj.zip . Independent verse text export: https://bereanbible.com/bsb.txt . Rights: https://berean.bible/terms.htm (public-domain dedication, commercial reuse permitted; preserve verbatim text under the BSB name). Raw downloads, acquisition timestamps and hashes belong in the generated validation artifact.

## Scope and integration contract

- One 66-book BSB edition, 1,189 biblical chapters, separate edition key proposed as bsb-en.
- Preserve the raw USJ structure, paragraph/poetry markers, notes and headings separately. The official TXT export is the sole reading-wording anchor: the USJ export has conversion discrepancies. Transfer verified layout without changing words or punctuation; explicitly record fallback where layout cannot be transferred safely.
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

## Verified delivery — 2026-09-21

Code revision: `db6b1975ef4a1cc6d9bd04120053120add918edb`.
[Cloud validation run](https://github.com/anderskhv/tinct/actions/runs/35611959342) passed: 15 unit tests, project documentation checker, full import, independent emitted-artifact readback, and unchanged checkout/input check.
[Download the complete staged package](https://github.com/anderskhv/tinct/actions/runs/35611959342/artifacts/10644337757). Artifact retention is 90 days; archive it before expiry. The hash-pinned importer can reproduce it while those exact source downloads remain available; changed downloads fail closed.

- 66 books; 1,189 chapters; 31,086 nonempty official verses; 38,464 reader paragraphs.
- All nonempty verses independently reconstructed from the candidate's UTF-16 spans and matched against official TXT words and punctuation, allowing display whitespace only. Complete span coverage verified; no extra reading text.
- The TXT contains 31,102 reference slots, including 16 deliberately empty entries. They remain unmapped in BSB, never filled from another translation.
- 1,392 raw export differences are documented. These are differences between official exports, not changes made to the canonical wording.
- 76 verses require whole-verse layout fallback rather than transferring unreliable USJ fragment boundaries. Complete wording survives; rich layout needs reader-owner verification.
- KJV maps all 31,102 references. Existing WEB Revelation 22 contains appended Gutenberg boilerplate: its 21 verse mappings are flagged unsafe; the other 31,081 are reference matches. WEB is unchanged. Repair/revalidate that source before enabling projection into that chapter.
- Technical acceptance means a verified import and mapping artifact, not literary approval, release approval, or verified runtime highlight behavior.

### Pinned hashes (SHA-256)

- Official TXT: `2ac3af1de52d4e68261cba91d85c320b7eadc6560e830d99e591767b8ff5ca96`
- Official USJ ZIP: `53acad65d590f5bc8cded3e14b37b7b02916f6a365211bcf60ea733ecd800e8f`
- Candidate: `8da0bc1ae32d9c2e05ba5811d953e24bdff8351913ad8f2199142ca0081c61d9`
- Verse crosswalk: `28ca56a02b18113bde9fd6abbd1cdd1b837bb1560ccbf3c1ad7d0a79f8727030`

### Package use

Use `bible-bsb-en.candidate.json` for the proposed reading edition, `bsb-verse-text.json` for canonical verse text, `verse-crosswalk.json` for reference/spans, and `chapter-crosswalk.json` for biblical-to-Tinct chapter locations. Offsets are UTF-16, end-exclusive, not reader word indices; use the reader's actual tokenizer during integration.

Read `validation.json`, `provenance.json`, `official-empty-references.json`, `legacy-mapping-issues.json` and `layout-transfer.json` before integration. Provenance pins all generated outputs and both existing edition inputs.

`source-structure.json` and the raw archive preserve headings, poetry structure, superscriptions, notes and original conversion evidence. They also contain the uncorrected USJ body strings: do not render them as canonical reading text. `usj-reading-projection.UNACCEPTED.json` is diagnostic only and must not be published. Consult `source-export-differences.json` for the reconciliation evidence.

### Next action and verification limits

Reader owner: integrate the staged edition and verse-aware positions/highlight projection in their own workstream, retaining KJV/WEB and saved edition choices. Test the deferred integration cases above before any default change. Do not assume equal paragraph indices across editions, copy old offsets, or claim highlights have migrated merely because references map. No reader, registry, storage schema, audio or production files changed in this package. Audio/word-sync remains deferred to the new audio procedure.
