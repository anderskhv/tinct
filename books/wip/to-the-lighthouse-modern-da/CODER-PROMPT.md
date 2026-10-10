# Prompt for the coding window: publish To the Lighthouse in Danish (modern-da)

Paste everything below the line into the coding session. Prepared 2026-10-10 against `origin/main` 6381594cb; re-check the file and line references against current main before editing.

---

## Task

Publish **one** Danish edition, `to-the-lighthouse/modern-da`, as a deliberate, narrow exception to the "Danish editions are no longer offered" policy. Anders's decision: this is, for now, the **only Danish edition Tinct offers, and that is on purpose.** Every other `-da` edition stays withdrawn exactly as it is today. This is an explicitly assigned coding and release task; follow `AGENTS.md` release ownership and publication rules (serialized release owner, verify before deploy, never raw Wrangler). Do not touch the English editions, their characters, audio or saved data.

## The content package (already reviewed, on branch `claude/inspiring-ritchie-zi00fu`)

`books/wip/to-the-lighthouse-modern-da/` (read `ACCEPTANCE-RECORD.md` and `RELEASE-PACKET.md` first):
- `candidate.json`, sha256 `adea2203ed23857a8e12c9566f0e2a340cb44f4e52a231c880ac49ec2283ed06`. Drop it in byte for byte as `app/public/data/editions/to-the-lighthouse-modern-da.json` (new file, nothing replaced). Serialization is `json.dumps(indent=2, ensure_ascii=False)` with no trailing newline, like the other `*-modern-da.json`.
- Translated from the served `modern-en` (sha256 `3b20ae3172ec...`, unchanged on main). Structure is 1:1 with it: 42 chapters, 495 paragraphs, same chapter numbers, same three-part `sections` map. Danish titles: `Del I — Vinduet`, `Del II — Tiden går`, `Del III — Fyret`; chapters `Vinduet · n`, `Tiden går · n`, `Fyret · n`.
- Quality: every paragraph reviewed twice independently (two full rounds), every correction verified by a fresh verifier (reviewer scores: fluency about 4.3/5, fidelity about 4.8/5). **Not** read by a native speaker, and 11 final replacements (6 + 5, listed in `final-report.json`) were written by a verifier and not re-verified. Say so in the release notes; do not claim "native-verified".

## What to change in code (verified on main, confirm before editing)

1. **`app/src/data/editionAvailability.ts` `editionHold()`**: it returns a hold for any key ending `-da`. Add an explicit allowlist (for example `OFFERED_DANISH_EDITIONS = new Set(['to-the-lighthouse/modern-da'])`) checked before the blanket `-da` rule, so only this key is released. Do not remove the general rule and do not infer the exception from language. This single function drives the reader (`LabApp.tsx`), edition defaults, preferences (`labPrefs.ts`), the worker audio/narration/SEO/share routes and the migration guards, so it is the main gate.
2. **`app/src/data/audioAvailability.ts` `isEditionDiscoverable()`** and **`app/src/libraryTwoReading.ts` (~line 230)**: both filter `edition.language !== 'da'`. Route them through the same allowlist so the Danish edition is discoverable and selectable for this book only (library, edition picker, compare). Check `app/src/preReader/catalogue.ts` (uses `isEditionDiscoverable`) and `app/src/utils/onboardingData.ts` (has a `da` branch) for how a Danish primary edition behaves.
3. **`app/src/data/bookRegistry.ts` `TO_THE_LIGHTHOUSE.editions`**: add `{ key: 'modern-da', language: 'da', style: 'modern', label: 'Moderne Dansk', aligned: true, hasAudio: false }` (match the shape of the other `modern-da` entries). Audio: this edition has no recorded audio; set `hasAudio` according to what streaming narration actually supports for Danish (verify, see below), and do not add it to recorded-audio manifests. If Danish streaming narration is not supported or not approved, keep audio off for this edition and make the UI say nothing misleading.
4. **Chapter shards**: Lighthouse editions are chapter-sharded (`app/public/data/editions-chapters/to-the-lighthouse-modern-en/chNNNN.json`, ids in the generated `app/src/data/editionShardRegistry.ts`). Generate the matching `to-the-lighthouse-modern-da` shards and registry entry with `app/scripts/split-edition-chapters.cjs --write-registry` (do not hand-edit the registry). Confirm the shard text equals the whole-book file.
5. **Package scripts and checks that special-case Danish**:
   - `app/scripts/check-edition-holds.cjs` asserts every `-da` edition shows the hold (`'Danish editions are no longer offered'`); keep that for all other books and add a positive case proving `to-the-lighthouse/modern-da` is NOT held and opens. Same for `app/scripts/check-edition-holds-production.cjs`, `app/src/worker.editionAudioHolds.test.ts`, and any `editionAvailability`/`audioAvailability` unit tests.
   - `app/scripts/android/prepare-assets.mjs` skips every `-da` edition as "withdrawn recovery assets": include `to-the-lighthouse-modern-da` in the Android asset set, or document why not.
   - `app/scripts/check-book-publication.cjs` (`PUBLICATION_BOOKS` includes `to-the-lighthouse`): extend the publication asset list to the new edition and shard files; run it.
   - Sitemap/SEO (`generate-sitemap.cjs`, worker `routes/seo.ts`, `share.ts`): English-first discovery stays; decide, and state, whether the Danish edition gets its own page. Default: no new Danish landing/SEO pages (Danish SEO is not in scope).
6. **Characters**: `app/public/data/characters/to-the-lighthouse.v1.json` only has `original-en` and `modern-en`. Do **not** author Danish character cards. Make sure the reader degrades cleanly for the Danish edition (no cards, no mismatched anchors, no console errors) and that `app/scripts/check-lighthouse-characters.cjs` still passes for the English editions.

## Things to verify, not assume

- With the Danish edition as the primary edition, check that these either work or are cleanly unavailable (no wrong-language silent failures, no English reply to a Danish passage without saying so): reader chat/librarian, Talk (voice), Listen/narration (Grok streaming; language/voice mapping must stay explicit, interface locale, edition language and narration language are distinct), highlights and notes, reading position, split/compare with `modern-en` (aligned: 1:1 chapters and paragraphs), chapter-end prompts, offline/Android.
- Reading position is sacred: switching between `modern-en` and `modern-da` must not lose the reader's place (chapters and paragraph counts are identical, so coordinates map 1:1; confirm `labContentMigration`/`labHighlightContentMigration` do not treat this switch as a withdrawal).
- Existing Danish assets and the withdrawal notice for every other book must be unchanged. Run the edition-hold check and show it still holds `jane-eyre/modern-da`, `odyssey/modern-da` and the manifest holds.
- Privacy: this adds no new data category or provider (the text was translated offline in the content workflow, no external API); if any change you make alters what is collected or sent, follow the Privacy rules in `AGENTS.md`.

## Done means

Unit tests and the relevant browser checks pass; the edition loads on phone and desktop in the real reader (screenshots of the first page, a chapter title, the dinner chapter 17, and the end of chapter 42); `modern-da` is selectable only for To the Lighthouse; production verification of exactly this asset (hash match on the deployed JSON and shards) per `AGENTS.md`. Report back with the hash check, which gates you changed, anything unsupported for Danish (audio, chat, Talk), and the open points above.

## Out of scope

Other Danish editions, Danish audio recordings, Danish character cards, Danish onboarding/SEO/marketing, translating the interface, editing the English text. Also do not edit `candidate.json`; if you find a translation defect, report it with coordinates (chapter number, 0-based paragraph index) for the content window.
