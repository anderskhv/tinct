# Sense and Sensibility — staged release assets

- Branch: `content/release-assets-ss-codex`; base and instruction revision: `8cfe39e709250a7c53942dcb6a582b360d132335` (`origin/integration/release-candidate-2`, fetched before branching).
- User-authorized content scope; Anders approved the final text. **2026-10-02: independent editorial review ACCEPTED, all findings resolved** (modern-en text, threads, onboarding and character cards corrected; see ../EDITORIAL-FIXES.md and ../qa/REVIEW.md). The hashes below are the accepted post-review values.
- STAGED, not public. No shared integration files, BOOKS, edition text, tests, cover, brand or author-image assets changed. No PR, merge, deployment, Anthropic calls or audio generation.

## Assets

- Characters: all 24 proposed identities in both editions; 3,106 original and 3,314 modern mentions (contentVersion 2026-10-02.1). UTF-16 offsets and paragraph hashes generated independently from final served edition bytes.
- Spoiler gates: full proposal descriptions at the end of their stated chapters; Fanny’s Ferrars family after chapter 3, Lucy’s engagement after chapter 22, Eliza Williams’s full name/history after chapter 31. Initial names and bodies withhold these facts. Added 2026-10-02 (zero-based gates): Willoughby after 30:42, 31:42, 44:83; Brandon after 39:23, 50:20; Miss Grey as Sophia Willoughby after 44:54; Robert married to Lucy after 48:25.
- Contextual aliases: Miss Dashwood at 9:9 = Marianne; London Mrs. Dashwood exceptions = Fanny (original-en; modern-en now names Fanny/Mrs. John Dashwood directly there); chapter 47 Mrs. Ferrars = Lucy; Anne/Nancy remain one identity; the elder Eliza and her daughter remain separate; chapter 50 Mrs. Brandon = Marianne. Coordinates are chapter:zero-based-paragraph.
- Conservative omissions: bare John, Mr. Dashwood, Mr. Ferrars; ambiguous Mrs. Ferrars in chapter 48; modern “One Miss Steele” at 21:9. These remain unlinked rather than receive an inferred identity. No claim of exhaustive pronoun/title coverage.
- Library preface: onboarding `about` verbatim plus a trailing newline; 170 whitespace-delimited words. Intro JSON uses the same paragraphs.
- Threads: 24 identities, 209 character/chapter entries, live chapter coverage 1–50, summaries supplied for both English editions. No volume-local numbering. Robert’s jeweller identity is withheld until its chapter 36 disclosure.

## Integration snippets for Claude

- `characterReleases-entry.txt` → `app/src/services/characters/characterCards.ts`, `characterReleases` (revision now `2026-10-02.1`).
- `manifest-entry.json` → `docs/design/library-prefaces/manifest.json`, `entries`; SHA-256 covers the exact UTF-8 preface file including final newline.
- `audioAvailability-entries.txt` → `app/src/data/audioAvailability.json`, `eligible_editions`; proposed Grok streaming eligibility, not prerecorded or cached audio coverage.
- `reviewedHooks-entry.txt` → `app/public/lab/library_2/reviewed-introductions.js`, `reviewedHooks`.
- Snippets have NOT been applied. Keep SENSE_AND_SENSIBILITY out of BOOKS. This packet does not authorize publication. Cover/brand/author-image work remains separately owned.

## Reproduction and verification

```sh
python3 books/characters/build_generic.py sense-and-sensibility
# Required final pass: generic alone omits contextual identities and spoiler snapshots.
python3 books/characters/entities/sense-and-sensibility.py
cp books/characters/sense-and-sensibility/characters.v1.json app/public/data/characters/sense-and-sensibility.v1.json
cd app
npx vitest run src/services/characters
```

- The entity module’s final pass calls unchanged `build_reviewed.compile_package` with the per-book `editorial.json` and reviewed binder. Shared builders were not edited.
- Generic baseline compiled and was copied first; 497/497 character-service tests passed before the reviewed pass. Final run: 505/505 tests across character services and `src/lab/labSource.test.ts`.
- 2026-10-02 rerun after independent-review fixes: generic then reviewed pass; `npx vitest run src/services/characters` 487/487 (suite size on the current worktree); in-memory `verifyCharacters` passes for both editions with every mention resolving and each new snapshot hidden before / shown after its gate.
- Direct `verifyCharacters` verification passed for both editions with registration injected only in process memory. Checked all source/paragraph hashes and UTF-16 mention spans, all snapshot boundaries immediately before/at release, and targeted identity/disclosure cases. The existing registry-driven test suite alone does not exercise an unregistered staged book.
- JSON, threads schema/identity/chapter coverage, verbatim preface, preface hash/word count and sidecar-copy equality checks passed. `git diff --check` passed.
- Node 24.13.0; local Vitest 4.1.11 after repairing the missing Darwin native dependency. No package or lockfile changes. No full app build or production acceptance in this content-only task.

## Final edition hashes

- `original-en`: `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0` — 50 chapters, 1,806 paragraphs.
- `modern-en`: `789a6dfb5025e0b96604b0cf7c258c3444792c175d1e18f62969cbbd52412928` — 50 chapters, 1,806 paragraphs. Independently ACCEPTED 2026-10-02.

The modern hash above is the ACCEPTED post-independent-review text. It supersedes the release-candidate `4b8753a6e3a3bf158d7605b88d66ee10767de782b0b3f248c74f9ed2d512378f` and the older `c86c2708…e512` in INTEGRATION.md. Modern-en chapter shards were regenerated (35 chapter files; manifest `f87d6e2227ff59797db31eb04862e8d81c83643bb88ca484297ce53918b07709` unchanged); original-en bytes and shards unchanged. 107 changed modern paragraphs are listed in ../EDITORIAL-FIXES.md; cached narration for those paragraphs must not be reused.

## Asset SHA-256

- `app/public/data/characters/sense-and-sensibility.v1.json`: `c968fe82a9cb09e0e129ba7a62e9ed85091222488e518358844c2918842d0c20` (= `books/characters/sense-and-sensibility/characters.v1.json`)
- `app/public/data/onboarding/sense-and-sensibility.json`: `d2e5e7810b9dcc7b6d6284210d135cfa3378c7d3b746a72f31ad0a0a1194c251`
- `app/src/data/prefaces/sense-and-sensibility.txt`: `895b9124e6f200f6867462fcd6dbfe4ff2f50251a705a2cde94a69a284c2f6c9`
- `app/public/lab/library_2/intro-data/sense-and-sensibility.json`: `2b35c1e9fd63568a3858aa0a94d9a5cd416454ccad093a5ce447b858a3485a8a`
- `app/public/data/editions/sense-and-sensibility-threads.json`: `212b6d4ef59e66d6aeb95089156dce373e552053994a5a37c217b213504d4305`

Preface and intro data are unchanged (onboarding `about` was not edited).
