# Wuthering Heights release assets — STAGED

Base: origin/integration/release-candidate-2 at 8cfe39e70.
Branch: content/release-assets-wh-codex.

1. Character cards complete: 19 identities in each live English edition. Generic baseline followed by the per-book reviewed build; runtime sidecar equals reviewed output. Contextual family titles and paragraph-end spoiler gates included. Unresolved bare Catherine/Cathy/Linton/Earnshaw and generic titles deliberately remain unlinked.
   Verification: 497 character-service tests passed; direct runtime validation passed both source hashes, all 2,856 spans and every snapshot boundary. Registry addition used in memory only for direct checks; no shared file changed.
2. Library introduction complete: preface copied verbatim from LIVE onboarding about; introduction JSON validated. Preface SHA-256 d8dc4efc27101e12c6df65337dfc51e77f57e677109e045de4cbd8bb485da0c6; 167 whitespace-delimited words. Manifest and hook snippets prepared.
3. Threads complete: 19 identities and 172 chapter-local English entries across LIVE chapters 1–34. JSON shape, unique identities and chapter ranges verified; source spot checks completed.
4. All four integration snippets and HANDOFF.md complete. Hashes and conservative alias coverage limits recorded.

No publication, deploy, main merge, PR, API calls, narration generation or image changes.
Resume: none; assigned release-assets package complete. Book remains STAGED.
