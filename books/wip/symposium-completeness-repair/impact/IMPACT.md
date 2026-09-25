# Downstream impact of the Symposium repair

Everything below was checked against `main` at `38a97c63` (2026-09-25). This package changes none of these files. Proposed content corrections are staged in this folder, and application work belongs to the coding agent.

Coordinates are written `chapter.index`: the chapter is 1-based and the paragraph index is 0-based.

## 1. Paragraph-indexed user data (required; the coding agent owns this)

Reading positions, the heartbeat position tuple, highlights, notes, bookmarks, `reading-log:*`, `progress:*`, audio/listening positions and any paragraph-anchored chat records use `(bookId, chapterNumber, paragraphIndex[, offset])` for `symposium` `original-en` and `modern-en`.

- Apply `mapping/paragraph-map.tsv`. Its only operations are `keep`, `renumber` and `move`, and it shifts no offsets.
- **Every old paragraph's text is byte-identical in the candidate except modern-en 3.3, 3.7 and 3.8** (C-06). Elsewhere, character, word and UTF-16 offsets carry over exactly, and every highlight or note range maps exactly to its new coordinate.
- **Modern-en 3.3, 3.7 and 3.8** keep their coordinates, but offsets inside them must be projected through `mapping/changed-paragraph-ops.json`. Equal spans are exact. A point inside a changed span is approximate and keeps its recovery tuple. No precise annotation may be moved to a paragraph start or truncated.
- The inserted paragraphs 1.0–1.8 are new. No existing user coordinate can point into them.
- **Do not let the Invariant 6 validator run on unmigrated data.** New chapter 7 has 69 paragraphs, so any old 7.69–7.114 position is out of range there. The validator would reset it and delete its storage key, losing the reader's place. Old 8.0 remains in range but refers to the wrong paragraph (new 8.0 is Alcibiades's entrance), and old chapter 1 positions land nine paragraphs early. The remap must run before validation and be keyed to the edition content version (candidate sha256). The recovery tuple of any unresolved record must be kept, never discarded.
- **Page numbers are derived and must be recomputed.** Chapters 1, 7 and 8 change length (40→49, 115→69, 1→47), so a stored page or scroll fraction in those chapters is meaningless under the new layout. Restore from the migrated paragraph index and offset.
- **Chapter-level records.** Records keyed only by chapter, such as a completed chapter or chapter-scoped chat context, keep their chapter number. Some chapter-7 records concern text that now sits in chapter 8. Keep them and do not delete them. `book-completed:symposium` is unaffected.
- **modern-da.** No Danish data migration is needed unless the Danish edition is restructured; see §7.

## 2. Character cards (`app/public/data/characters/symposium.v1.json`)

**Required in the same release as the editions.** The loader (`app/src/services/characters/characterCards.ts`, `verifyCharacters`) rejects a card unless both of these match:

- `sha256(edition bytes)` equals `sourceSha256`.
- Every chapter's `paragraphHashes` match.

`loadCharacters` fetches the card and the edition with `?v=<characterReleases.symposium.revision>`, currently `2026-09-11.2`. If the editions ship without a re-anchored card, or without a revision bump, character links silently disappear or a stale cached edition is verified.

`impact/character-card-impact.json` records, per edition:

- **Moves.** Every coordinate that changes, with its JSON path, old coordinate, new coordinate and mention text.

  | Edition | Mentions moved | Mentions unmoved | Anchor coordinates moved |
  |---|---|---|---|
  | original-en | 222 | 288 | 176 |
  | modern-en | 220 | 286 | 172 |

  In modern-en, the Aristogeiton and Harmodius mentions in 3.3 and their eight anchor offsets also change offset (C-06) and are listed under `offsetChanges`. They project exactly through equal spans.

  All 510 and 506 existing mentions were verified to re-resolve to their exact recorded text in the candidates after the move, using UTF-16 offsets. No anchor offset exceeds its paragraph. No offset changes.
- **Derived fields to recompute.**
  - `sourceSha256` becomes the candidate sha256.
  - `paragraphCount` goes 217→226, and `chapterCount` stays 8.
  - `paragraphHashes` must be recomputed for chapters 1, 7 and 8. `hashes/paragraph-hashes-*.tsv` lists every candidate paragraph hash.
  - Bump `characterReleases.symposium.revision` and the card `contentVersion`.
- **Proposed content additions (character-content decisions, staged, not applied).**
  - **New mentions in 1.0–1.8, covering every personal name there, each with exact UTF-16 offsets:**
    - original-en has 23: Apollodorus ×4, Socrates ×7, Alcibiades, Agathon ×4, Aristodemus, Glaucon ×2, Phoenix ×2, Philip, and the `COMPANION` label.
    - modern-en has 25: the same, plus one more Socrates ("No, not Socrates") and one more Aristodemus ("Aristodemus's account") in 1.7.
  - **Three new identities:**
    - `glaucon-questioner` is the prologue's Glaucon. The existing card id `glaucon` is *Charmides's father*, named in Alcibiades's speech (new 8.38), and is a different person. Following the `ptolemy-king`/`ptolemy-son` and `joseph-patriarch`/`joseph-husband-of-mary` precedents, the new person gets a new id. A subtitle, "Apollodorus's acquaintance", is proposed, with an optional "Charmides' father" subtitle for the existing `glaucon` entry.
    - `phoenix` is a reference character: "Philip's son, who heard about the banquet from Aristodemus and passed the story on; it reached Glaucon only as a vague second-hand account". This wording follows Review 1 F3: the vagueness belongs to the go-between, not to Phoenix.
    - `philip` is Phoenix's father, following the card's patronymic convention (`acumenus`, `oeagrus`, `pelias`).
  - **Optional (Review 1 F11).** An unnamed `glaucon-informant` with context mentions: "another person" and "Your informant" in original-en; "Someone" and "your informant" in modern-en. This follows the card's treatment of unnamed figures who act in the narrative.
  - **Anchor re-selection** for `apollodorus`, `socrates`, `alcibiades`, `agathon`, `aristodemus` and `listener`. The card places `firstMention`, `roleVisibleAt` and the identity snapshot at a character's first named mention, and the restored opening names these people earlier. The existing snapshot bodies remain true at the new anchors under the card's stated basis ("trigger is not a claim that every identity fact precedes the selected name").
    - The conservative alternative is to add the mentions but keep these anchors at their moved coordinates.
    - Alcibiades is the one case where the choice is visible to readers. Under the proposal his card becomes available from the prologue, where he is named as one of the speakers.

## 3. Cast threads (`app/public/data/editions/symposium-threads.json`)

- Threads are keyed by chapter number and hold no paragraph coordinates. The Cast tab finds mentions at runtime by name search over the edition (`app/src/hooks/useThreads.ts`), so there is nothing to re-anchor.
- **The regroup fixes an existing mismatch.** The threads already file Alcibiades's arrival and speech under chapter `8`, and Socrates's and Diotima's ladder under chapter `7`. The current edition has the Alcibiades material in chapter 7, so a chapter-7 reader was shown nothing about Alcibiades while reading his speech. After the regroup the thread chapter keys match the text.
- **Content error exposed by the restored opening (proposed correction staged: `impact/proposed-threads-corrections.json`).**
  - The `glaucon` thread says "Glaucon is the unnamed companion at the dialogue's opening who asks Apollodorus to repeat the conversation". The restored text shows two different people. Glaucon questioned Apollodorus on the road two days earlier, and the companion who asks now is unnamed.
  - An English correction is staged. The Danish string repeats the same error. It is flagged and **not** rewritten, because no new Danish text is written under the language scope.
- **Name-search limitation (pre-existing, note only).** `searchNames: ["Glaucon"]` matches the prologue's Glaucon (1.1, 1.7) and also Charmides's father (8.38). The Cast view will list 8.38 under the prologue's Glaucon. Fixing that needs thread-level disambiguation in code and is outside this package.
- Socrates's and Agathon's chapter-`6` threads describe Socrates's cross-examination of Agathon, which the edition places at the start of chapter 7 (7.0 onward). This is pre-existing, is not changed by this repair, and is a note only.

## 4. Onboarding (`app/public/data/onboarding/symposium.json`)

- **Unaffected by the repair; no change required.** `about` already describes the frame ("Apollodorus tells a friend what Aristodemus told him"), which the restored opening now actually contains. `cast`, `angleCards`, `acclaim` and `whyItMatters` do not depend on paragraph coordinates or chapter numbers.
- **Pre-existing, optional.** `openingText`, labelled "The Speech of Aristophanes", is not verbatim Jowett. It reads "And now I will tell you the reason why…" and "…is now lost, though a word of ill omen". The actual Jowett text at candidate 5.0 (source paragraph 65) is:

  > In the first place, let me treat of the nature of man and what has happened to it; for the original human nature was not like the present, but different. The sexes were not two as they are now, but originally three in number; there was man, woman, and the union of the two, having a name corresponding to this double nature, which had once a real existence, but is now lost, and the word 'Androgynous' is only preserved as a term of reproach.

  If the onboarding owner wants the excerpt to be the edition's own words, this is the verbatim replacement. It is staged in `impact/proposed-threads-corrections.json` under `onboardingOptional`. `symposium.da.json` is Danish: noted, not touched.

## 5. SEO and generated pages

- **`app/public/read/symposium/book.html` must be regenerated.** It embeds the first ~650 words of original-en chapter 1, which currently start at the defective "APOLLODORUS: Yes, friend…". It also embeds the chapter list, including the chapter-5 title. Regenerate it with `app/scripts/generate-sitemap.cjs` (`buildBookIndexPage`) after the editions are swapped. `app/public/sitemap.xml` `lastmod` for `/read/symposium` follows the edition file.
- **Chapter summaries now agree with the text.** The summaries in `app/public/read/symposium/chapter-*.html` come from `app/scripts/seo/symposium.cjs`. They already describe the restored frame: "Apollodorus is on his way into Athens when a friend stops him…". They end chapter 7 with Socrates ("Then there is a great noise outside the door") and give chapter 8 to Alcibiades's arrival and speech. No change is required.
- **Pre-existing inaccuracies (notes only).**
  - The chapter-6 summary includes Socrates's questioning of Agathon, which the edition places in chapter 7.
  - The chapter-4 summary's "induce a sneeze with a feather" is not in the text, which reads "tickle your nose with something".
- `app/src/data/bookMetaGenerated.ts`, `libraryTaxonomy.ts` and `app/public/lab/library_2/taxonomy.js` hold metadata only and are unaffected. The registry `wordCount: 23000` remains a fair approximation: the complete dialogue has 22,077 words.

## 6. Narration, audio and caches

No audio generation is proposed or authorised by this package.

- **Grok streaming (current provider).**
  - Chunk audio is content-addressed by the exact displayed text, provider, model, voice and settings (`docs/grok-narration-2026-09-23.md`). All 217 old paragraphs per edition are unchanged, so their cached chunks stay valid and reusable. The nine new paragraphs per edition are uncached and would be prepared on Play under the existing contract.
  - **Modern-en 3.3, 3.7 and 3.8 have new text** (C-06), so any cached chunk containing their old text is invalid for the new text and they will be prepared on Play. Original-en chapter 3 is unchanged.
  - **Edition/sparse seek maps** for chapters 1, 7 and 8 of both English editions were built against the old paragraph sequence and must be invalidated or rebuilt. A chunk that spans an old paragraph boundary now adjacent to new text also needs invalidating.
  - If chapter titles are narrated, the original-en chapter-5 heading text changes (C-04).
  - Symposium is not in the featured-ten opening prewarm set.
- **Retained Bella (legacy female original-English path).** `symposium` is in `RETAINED_BELLA_ORIGINAL_BOOKS` (`app/src/narration/bellaRetention.ts`), and `usesRetainedBella()` selects it when the provider is not Grok.
  - The retained whole-edition recording, manifests (8/8) and word timings for `symposium/original-en` are keyed to the old chapter and paragraph sequence (`docs/bella-edition-inventory-2026-09-21.md`; the chapter 1 and 7 sidecars were published in audio-highlight run 1).
  - After the repair, chapters 1, 7 and 8 no longer match the recordings. Chapter 1 lacks the nine opening paragraphs. Chapter 7 now ends at Socrates's closing words. Chapter 8 recordings cover only the closing paragraph.
  - Before publication, the coding agent must remove `symposium` from the retained set or block chapters 1, 7 and 8 of it. Chapters 2–6 are unchanged. Mismatched recordings must not play against the new text.
- **Legacy R2 per-paragraph audio** (`tinct-audio` bucket, per-chapter `manifest.json` and paragraph MP3s written by `app/tts/regen-symposium-en.py`). For `symposium/original-en` and `symposium/modern-en`, chapters 1, 7 and 8 are stale by coordinate, the chapter-5 title clip (if present) is stale for original-en, and modern-en 3.3, 3.7 and 3.8 are stale by text. Keep the assets for rollback and do not select them. The Danish (`modern-da`) R2 audio is unaffected unless Danish is restructured.
- `app/tts/regen-symposium*.{sh,py}` are retired Kokoro/Chirp tools. Do not run them.
- The `artifacts/audio-highlight-*` files that mention Symposium are historical evidence. Do not edit them.

## 7. Danish edition (`symposium-modern-da.json`)

See `impact/modern-da-report.md`. In short, the Danish edition has the same missing opening and the same misplaced chapter-7/8 boundary, plus structural problems of its own. It is registered as `aligned: true`. After the English repair, chapter 1 would be misaligned by nine paragraphs unless Anders decides how Danish should be handled; the options are in the report.

## 8. Other references checked (unaffected)

- `app/src/data/prefaces/symposium.txt`: thematic prose with no textual claims about the opening or chapter structure. `bookPrefaces.test.ts` pins its exact prose, which is unchanged.
- `app/src/lab/editionDifficulty.ts`, `labChapterChat.test.ts` (synthetic paragraph), `preReader/libraryCompletion.test.ts`, `app/scripts/check-prefaces.cjs`, `app/public/about.html`: none depend on Symposium paragraph text or coordinates.
- `app/public/data/editions-chapters/`: no Symposium chapter shards exist. If shards are generated later, generate them from the new files.
- `app/public/data/dict/s.json`: a dictionary entry for the word "symposium", unrelated.
