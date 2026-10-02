# Wuthering Heights — release-assets handoff

Status: **STAGED, not public**. All four assigned items complete.
Branch: `content/release-assets-wh-codex`.
Base: `origin/integration/release-candidate-2`, `8cfe39e70`.
Instruction revision: fetched `origin/main`, `c268646674fed34ef73cf8ecf32d7c54ebabce40`; explicit Anders assignment authorizes these per-book runtime/content paths and supersedes generic role/path restrictions. No shared integration files changed.

## Commits

- `f751db246` — cards and first STATUS checkpoint; pushed.
- `5ee54f893` — introduction and preface snippets; pushed.
- `366f13e88` — Threads, live chapters 1–34; pushed.
- Final handoff: this commit.

## Integration snippets for Claude

- `characterReleases-entry.txt`: add to `characterReleases` in `app/src/services/characters/characterCards.ts` when integration is assigned. Until then, the staged sidecar is not registered.
- `manifest-entry.json`: entry for `docs/design/library-prefaces/manifest.json`. SHA-256 covers the exact UTF-8 preface bytes, including final newline. Word count: 167, whitespace-delimited. Preface is the LIVE onboarding `about` verbatim, plus final newline.
- `audioAvailability-entries.txt`: proposed `eligible_editions` strings for `app/src/data/audioAvailability.json`. Verify current streaming eligibility and exact text/cache identity at integration; no recordings or provider checks were performed. No narration spend or prewarming is authorized by this package.
- `reviewedHooks-entry.txt`: add to `reviewedHooks` in `app/public/lab/library_2/reviewed-introductions.js` when integration is assigned; text exactly matches intro JSON.
- Do not add the book to `BOOKS` or infer publication approval. Cover, brand and author images are outside this package.

## Character build and gates

Nineteen proposal identities are present in each edition. Both LIVE editions have 34 chapters and 1,931 paragraphs. Raw edition bytes and source paragraph numbering are unchanged.

The requested `python3 books/characters/build_generic.py wuthering-heights` ran and its baseline was copied to the served path. The generic matcher cannot handle the family-title contexts: its baseline contains only 15 identities and is **not the final release artifact**. Final assembly uses the existing shared reviewed compiler through the authorized per-book entity module:

```sh
python3 books/characters/entities/wuthering-heights.py
python3 books/characters/entities/wuthering-heights.py --check
cp books/characters/wuthering-heights/characters.v1.json app/public/data/characters/wuthering-heights.v1.json
cd app && npx vitest run src/services/characters
```

`books/characters/wuthering-heights/editorial.json` contains copy, exact contextual aliases and spoiler gates; the entity module contains conservative binding rules. Generic regeneration alone must not replace the reviewed sidecar.

- Two Catherines remain separate. The opening young woman is named only Mrs. Heathcliff until Nelly identifies her. The scratched Catherine Heathcliff is not a marriage claim.
- Isabella’s marriage and Linton’s birth/parentage are gated to their disclosure paragraphs. Linton is not introduced in the opening frame.
- The elder Earnshaws/Lintons, Hindley, Hareton, Edgar and Linton remain distinct. Nelly/Ellen/Nell/Dean resolve to one identity; Zillah and Lockwood are separate.
- The 1500 Hareton carving and Lockwood’s mistaken “Heathcliff junior” do not bind to the living Hareton or Heathcliff respectively. No identity is created for the dream preacher or the deceased Earnshaw child.
- Dream and spectral reports retain their narrator’s uncertainty. No ancestry is invented for Heathcliff.
- Gates use one-based chapter numbers and **zero-based paragraph indices**, released at the paragraph’s UTF-16 end offset separately for each edition.

Coverage limit: bare Catherine/Cathy/Linton/Earnshaw, many shared married titles and generic references are intentionally not matched globally. Only the individually reviewed contexts are bound. This is conservative named coverage, not an exhaustive coreference system. All authored relationship gates passed; no failed-gate fallback is being shipped.

## Verification

- Character services: **6 files, 497 tests passed**, including a final run with the reviewed sidecar present.
- Direct runtime verification: both source SHA-256 values, paragraph hashes, 19 identities per edition, every one of 1,397 original and 1,459 modern spans, all snapshot boundaries and selected alias exclusions passed. The release entry was supplied in memory only; no shared registry/test edits.
- Reviewed deterministic rebuild `--check` passed; generated package and public sidecar are byte-identical.
- Threads: 19 identities, 172 chapter-local English entries; unique IDs, valid schema fields and complete union of chapters 1–34. Original/live-modern source passages spot-checked; no later events imported into earlier chapter summaries.
- Preface/intro/snippet JSON validated; hook matches; preface matches LIVE onboarding and its manifest hash/count.
- No app-wide build, publication or production acceptance performed. Shared registration and staged/public decisions remain with the separate integration assignment.
- No API calls, Anthropic spend, narration generation or `generate-editions.cjs` execution. No deploy, main merge or PR.

## Pinned hashes

| Path | SHA-256 |
|---|---|
| `app/public/data/editions/wuthering-heights-original-en.json` | `cd6c024bd4b0f1fc773ac0b4129b0ff50635099a372a4bf5f1501c06dd293d96` |
| `app/public/data/editions/wuthering-heights-modern-en.json` | `4f53fd00781213c8f1c7e44f15f2b0488cfc4a2e684f8d54d5968d4e4a5d882e` |
| `app/public/data/characters/wuthering-heights.v1.json` | `36b9e34505e53fbc55676c4e33892828a3d41e7123928dbe93c3f4dfa2a106e7` |
| `app/src/data/prefaces/wuthering-heights.txt` | `d8dc4efc27101e12c6df65337dfc51e77f57e677109e045de4cbd8bb485da0c6` |
| `app/public/lab/library_2/intro-data/wuthering-heights.json` | `f30948ba4580ab31ff4e1e88670f9983443549637df7064449e1159136c7d907` |
| `app/public/data/editions/wuthering-heights-threads.json` | `815bb57d9f59944982aab62412934328cdea11a47d5fa420899224be081b408b` |

## Owned paths

- `books/characters/entities/wuthering-heights.py`
- `books/characters/wuthering-heights/` (editorial source and compiler outputs)
- `app/public/data/characters/wuthering-heights.v1.json`
- `app/src/data/prefaces/wuthering-heights.txt`
- `app/public/lab/library_2/intro-data/wuthering-heights.json`
- `app/public/data/editions/wuthering-heights-threads.json`
- `books/wip/wuthering-heights/release/`

Resume point: none within this assignment. Shared-file integration remains unperformed by design.
