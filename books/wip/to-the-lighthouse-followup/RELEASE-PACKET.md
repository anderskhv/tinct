# Release Packet — To the Lighthouse, narrow follow-up (successor to 175a90f0)

**Status: content accepted and handed off. Not published.**

- This follow-up supersedes four artifacts of the accepted package at `claude/beautiful-allen-5llaf8` commit `175a90f02db376a18a994856903a1b21e36f92a3` (`books/wip/to-the-lighthouse/`). Everything else in that package stands unchanged.
- No file under `app/**`, the registry, live data paths, character releases, audio or shared tooling was changed. Integration, app verification and serialized release belong to the coding agent.
- Change ledger: `CHANGES.md`. Machine-readable edits: `edits.json`. Independent verification: `reviews/independent-verification.md`.
- **Instruction revision:** main `1a7d89ebd816af8a2ac18239010c34fab4bf48c5`. The book-task workflow, adding-book strategy, AGENTS files and workflow boundaries were last changed at `ec11086e` (2026-09-24). They were read on the current main without merging anything.
- **Owned path:** `books/wip/to-the-lighthouse-followup/` only. The branch is `claude/friendly-davinci-9ti52c`, based on main `1a7d89eb`.

## Artifacts and destinations (copy byte for byte)

"Here" means this folder, `books/wip/to-the-lighthouse-followup/`. "Base" means `books/wip/to-the-lighthouse/` at `175a90f0`.

| Artifact | Take from | Destination | sha256 | vs base |
|---|---|---|---|---|
| modern-en edition | here: `editions/to-the-lighthouse-modern-en.json` | `app/public/data/editions/to-the-lighthouse-modern-en.json` | `346726748c9a5e1ea0f070d0f911d55c53d0c50893e67c57d1cac328d1475574` | **changed** (was `17c56b3d…`) |
| original-en edition | base: `editions/to-the-lighthouse-original-en.json` | `app/public/data/editions/to-the-lighthouse-original-en.json` | `1662e69cd2781083e2332aeddd1e0c340446bdf2f7929c95da0d008e65b8d4f8` | unchanged |
| onboarding | base: `onboarding/to-the-lighthouse.json` | `app/public/data/onboarding/to-the-lighthouse.json` | `d8d8cfdb46ee8de601a77af3d226d1c277720dfa809563e5dcee4ad20917523e` | unchanged |
| threads | here: `characters/to-the-lighthouse-threads.json` | `app/public/data/editions/to-the-lighthouse-threads.json` | `18ed4848cb41e0a72ec34070ded6329df19b341a4b0d1fa7accb9db34f5e92b0` | **changed** (was `ad8b1fe5…`) |
| compiled character sidecar | here: `characters/characters.v1.json` | `app/public/data/characters/to-the-lighthouse.v1.json` | `1bec0bf5e7362a35b9ba150e29303d8319d01fc31aaba613e51b85d7eb322e84` | **changed** (was `13d6c324…`) |
| card editorial source | here: `characters/editorial.json` | suggested `books/characters/to-the-lighthouse/editorial.json` | `3d50beb78965806928ba466bb7cef955101994ae0ac22909b9ee0e1f9dbc0eb1` | **changed** (was `e8c2b2f6…`) |
| validation report | here: `characters/validation-report.json` | alongside the editorial source | `274c8f3037fdf247a67a03815862b0ad16d1d61368801d4ceb81bddfddc8b91d` | **changed** (was `fef2f3a9…`) |

Per-paragraph hashes of the new modern-en are in `editions/modern-en-paragraph-hashes.tsv`: the first 16 hex digits of sha256 of the raw paragraph, keyed `chapter.index`. Original-en hashes stay as in the base (`editions/original-en-paragraph-hashes.tsv`, `3ac09465…`).

## Changed paragraphs (modern-en only)

Four of 495, with old → new paragraph hash (sha256, first 16 hex digits):

| ¶ | old | new |
|---|---|---|
| 25.3 | `2d507bca6446e0b7` | `530a166864c479e1` |
| 26.1 | `4fefca6b41df15e3` | `4183c276838dcfdb` |
| 27.0 | `6d9b06c2cda847fd` | `63240eeb0f657139` |
| 40.10 | `81f7b9246d4d114e` | `485fb4500671991f` |

Structure is unchanged: 42 chapters and 495 paragraphs; titles, `section` values, the `sections` array and per-chapter counts are identical. The pair stays aligned with original-en.

## Character-card impact

- **Compilation.** The sidecar was recompiled with the unchanged `books/characters/build_reviewed.compile_package` (main `f2064e2d`) and a plain, case-sensitive word-boundary alias binder with resolution `reviewed-name`.
  - Before recompiling, the same harness was run on the base inputs. It reproduced the accepted sidecar `13d6c324…` and report `fef2f3a9…` byte for byte.
  - The harness is a scratchpad script and is not committed. Its binder, in full: for each entity, for each alias, every match of `(?<!\w)ALIAS(?!\w)` in the normalized paragraph yields `(start, end, entityId, 'reviewed-name')`.
- **Counts.** Unchanged: modern-en has 78 entities and 1,429 mentions; original-en has 76 entities and 1,356 mentions.
- **Identities.** Every mention keeps its character. The mention in 25.3 ("Prue Ramsay") is unchanged. 26.1 and 40.10 contain no names.
- **Re-anchored offsets.** Three modern-en mentions in 27.0 move:

| characterId | old UTF-16 span | new UTF-16 span | text |
|---|---|---|---|
| mrs-mcnab | 151–161 | 151–161 | Mrs. McNab (unchanged) |
| mrs-ramsay | 1198–1209 | 1186–1197 | Mrs. Ramsay |
| mrs-mcnab | 1367–1377 | 1348–1358 | Mrs. McNab |
| mrs-ramsay | 2237–2248 | 2228–2239 | Mrs. Ramsay |

- **Snapshots.**
  - `prue-2` has the new body text in both editions (LH-FU-5).
  - In modern-en, its release gate (end of 25.3) moves from UTF-16 offset 155 to 157.
  - In original-en, the gate is unchanged at offset 156.
- **Other anchors.** No other firstMention, roleVisibleAt or snapshot anchor moves.
- **Version.** `contentVersion` is `2026-09-25.1`. Register the book as `'to-the-lighthouse': { editions: EN, revision: '2026-09-25.1' }` (registry revisions equal the card `contentVersion` library-wide).
- **Gate.** Please run the app's own `verifyCharacters` release test after registration; it is the authoritative gate.

## Integration requirements

All requirements in the base `RELEASE-PACKET.md` stand: registry, reader defaults (modern-en primary, original-en Compare), taxonomy (Novels → Modernism; resolve the Columbia Core and Bloom placeholders), parts, onboarding and Grok narration. The exceptions are the artifact hashes above and the card revision `2026-09-25.1`.

## Verify after publication

- Served bytes equal the sha256 values in the artifact table.
- 42 chapters / 495 paragraphs per edition.
- The modern-en paragraphs 25.3, 26.1, 27.0 and 40.10 read as in `CHANGES.md`.
- Prue's card, after reaching 25.3, reads: "…she died that summer, within months of her May wedding, of some illness connected with childbirth."
- `python3 books/classify-modern-en.py to-the-lighthouse --gate` → **GATE PASS** (content lane result: weighted similarity 0.612; 0/42 light or mechanical; 9/443 identical long paragraphs, all verbatim quoted verse).

## Narration

No audio was generated. The book is new and has no cached narration, so nothing is stale. Narration follows the current Grok streaming contract against the hashes above.
