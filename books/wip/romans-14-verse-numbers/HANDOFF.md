# WEB Romans 14: the doxology's verse numbers

**Status: content accepted and integrated on a branch. Not merged, not deployed.**

Approved by Anders on 27 Nov 2026, who assigned the content change and its integration together. Branch `fix/romans-14-verse-numbers`, from `origin/main` `7f9230042d`. Instructions read at that revision: `CLAUDE.md`, `AGENTS.md`, `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/AGENTS.md`, `books/CLAUDE.md`, `docs/workflow-boundaries.md`, `STRATEGY.md` (language scope).

## The defect

World English Bible (`bible`, edition `web-en`), Romans 14 (the reader's chapter 1060), last paragraph (index 4). The WEB prints the doxology "Now to him who is able to establish you…" at the end of chapter 14 and numbers it 14:24-26. The import wrote those three numbers as text, "(14:24)", "(14:25)", "(14:26)". Every other verse number in the edition is a word of superscript digits ("²³ But he who doubts…"), which the reader draws as a verse number and the narrator does not read.

## Source of truth for the numbering

The WEB's own verse numbering.

- https://ebible.org/eng-web/ROM14.htm ("World English Bible Classic Romans 14"), retrieved 2026-11-27. The page numbers the doxology as verses 24, 25 and 26 of chapter 14: "24 Now to him who is able to establish you according to my Good News and the preaching of Jesus Christ, according to the revelation of the mystery which has been kept secret through long ages, 25 but now is revealed, and by the Scriptures of the prophets, according to the commandment of the eternal God, is made known for obedience of faith to all the nations; 26 to the only wise God, through Jesus Christ, to whom be the glory forever! Amen." Its footnote at 14:26: "TR places verses 24-26 after Romans 16:24 as verses 25-27." Rights statement on the page: "The World English Bible is in the Public Domain. You may copy and share it freely."
- https://ebible.org/eng-web/ROM16.htm, retrieved 2026-11-27: chapter 16 ends at verse 24 with an empty verse 25 and the note "TR places Romans 14:24-26 at the end of Romans instead of at the end of chapter 14, and numbers these verses 16:25-27." This is why our WEB Romans 16 ends with three numbers and no text (not drawn since 27 Nov 2026).
- Our own World English Bible, Catholic Edition (`webc-en`, chapter 1060) already writes the same doxology with ²⁴ ²⁵ ²⁶; its wording is identical.

Nothing from those pages is saved in the repository.

## Is it the only place?

Searched every paragraph of the four Bible editions for `\(\d+:\d+\)`, and for the wider `[(\[]\d+:\d+[)\]]`, `\d+:\d+`, `(\d+)`, `[\d+]` and `{\d+}`:

| Edition | Chapters / paragraphs | Bracketed verse references |
|---|---|---|
| web-en | 1189 / 6,704 | 3, all in Romans 14 paragraph 4: (14:24), (14:25), (14:26) |
| webc-en | 1328 / 10,618 | 0 |
| kjv-en | 1189 / 6,704 | 0 |
| bsb-en | 1189 / 38,464 | 0 |

So the repair is those three markers and nothing else. `app/src/lab/webRomans14VerseNumbers.test.tsx` keeps all four editions free of the pattern.

Seen in the same scan, a different thing and **not changed**: the only other plain digits in the WEB text are in the superscriptions of Psalm 34 and Psalm 145, where a translators' footnote runs into the heading with no space ("…and he departed.Psalm 34 is an acrostic poem, with each verse starting with a letter of the alphabet (ordered from Alef to Tav)." and "A praise psalm by David.This is an acrostic psalm, with every verse (including the second half of verse 13) starting…"). That is note text inside the book text, not a verse number; it needs its own decision.

## The changed paragraph (chapter 1060, paragraph 4)

Before:

> ²¹ It is good to not eat meat, drink wine, nor do anything by which your brother stumbles, is offended, or is made weak. ²² Do you have faith? Have it to yourself before God. Happy is he who doesn't judge himself in that which he approves. ²³ But he who doubts is condemned if he eats, because it isn't of faith; and whatever is not of faith is sin. (14:24) Now to him who is able to establish you according to my Good News and the preaching of Jesus Christ, according to the revelation of the mystery which has been kept secret through long ages, (14:25) but now is revealed, and by the Scriptures of the prophets, according to the commandment of the eternal God, is made known for obedience of faith to all the nations; (14:26) to the only wise God, through Jesus Christ, to whom be the glory forever! Amen.

After:

> ²¹ It is good to not eat meat, drink wine, nor do anything by which your brother stumbles, is offended, or is made weak. ²² Do you have faith? Have it to yourself before God. Happy is he who doesn't judge himself in that which he approves. ²³ But he who doubts is condemned if he eats, because it isn't of faith; and whatever is not of faith is sin. ²⁴ Now to him who is able to establish you according to my Good News and the preaching of Jesus Christ, according to the revelation of the mystery which has been kept secret through long ages, ²⁵ but now is revealed, and by the Scriptures of the prophets, according to the commandment of the eternal God, is made known for obedience of faith to all the nations; ²⁶ to the only wise God, through Jesus Christ, to whom be the glory forever! Amen.

Three whitespace words replaced one for one, at word indexes 70, 106 and 137 of 153. The paragraph is 809 UTF-16 units before and 794 after (each number is 5 shorter). The chapter keeps its 5 paragraphs; no other paragraph of the edition changed.

## Hashes (SHA-256)

| File | Before | After |
|---|---|---|
| `app/public/data/editions/bible-web-en.json` | `b0f491656782257e7b20f4a80add615cb363b8f324e54a4c1c457648328762aa` (4,407,053 bytes) | `884892a850e2969989655fae0f9a8262c5e792433659d5f5504ef7f68f46c5c2` (4,407,047 bytes) |
| `app/public/data/editions-chapters/bible-web-en/ch1060.json` | `96f9b9ed06ed9397c44b6bde9e6b203cf64703e078b1dd47d49700bbe62c4c51` | `e4c819e0ad695c5ee83ddbd5d96d421cc51d684f7662f967259a72de31aa807b` |
| The paragraph's text (the character package's paragraph hash) | `4d1b5c0fca097dc1dfd36fe32d690c88de3f92b02cf3aebf551b80f852ff4c1d` | `b28a9251b5a8588ee1abc4246dd4f39343581a363476ad6a85e8889645d1fe4d` |
| `books/wip/bible-characters-full/package/bible.v1.json` | `1d9b7b21f9e4320a5cf1d00e3844a411f12d8daf55cd31c508cbb98aae3adff7` | `b2d75f2d94683648a93a96e301ac6ed6c9155fffce0783e73309ef0d9f7a173f` |
| web-en slice of the package (MANIFEST `editionSlices`) | `d5d997e5c937ee1cf3584c87e86bca13d10de995dd0a7ad34c4b94e5e5e83efa` | `9f83f645fd5c68aab4f70295981b85fc657b8794974953aec0972ba11f861fcf` |
| `app/public/data/characters/bible.v1.web-en.json` | (contentVersion 2026-10-21.1) | `b7eaa8ac713ca74abd633b1c89200ab7eaf2223f30e5acf3fc82254ef53d5a8d` |

## Integration steps taken

1. **Edition text.** The three markers replaced in `bible-web-en.json` as a byte-level replacement (each marker occurs once in the file); the parsed before and after differ in exactly one paragraph.
2. **Chapter files.** `node scripts/split-edition-chapters.cjs bible-web-en` (from `app/`). Of the 1,189 chapter files only `ch1060.json` differs. The script as it stands today would also add a `wordCount` to every chapter of `bible-web-en/manifest.json` (none of the four Bible manifests carries one; the reader then weighs page estimates by words instead of paragraphs). That is a change to the reader's page figures for one Bible edition and no part of this repair, so the committed manifest is kept; it still agrees with the edition (numbers, titles, paragraph counts).
3. **Character cards.** The Bible package pins the edition file's hash, every paragraph's hash and every link's UTF-16 offsets, so an edition change without a re-anchoring pass makes all WEB cards disappear (`verifyCharacters` fails closed; `characterReleases.test.ts` turns that red). `app/scripts/reanchor-bible-web-romans-14.py` re-pins web-en and moves the six links after the first number by exact projection: Jesus 445→440, Christ 451→446, God 660→650, God 747→732, Jesus 760→745, Christ 766→751. No reveal point lies in the paragraph; no card, identity or other link changed; the other three edition slices are byte-identical. `python3 app/scripts/split-bible-characters.py` rewrote the four sidecars (all four carry the package's `contentVersion` in their header). Package `contentVersion` and `characterReleases.bible.revision` are `2026-11-27.1`, which also versions the URL of the whole edition the cards are checked against, so no reader verifies new links against a cached old text.
4. **Content-release mechanism (`CONTENT_RELEASES`, coordinate maps): not used, on purpose.** See the next section.
5. **Test.** `app/src/lab/webRomans14VerseNumbers.test.tsx`.

## Saved places and highlights

The content-release mechanism (`app/src/data/editionContentRevisions.ts`, `app/scripts/build-text-change-migration.py`, `app/public/data/edition-migrations/`) is not registered for the Bible, and this repair does not add it:

- **Places.** A Bible place is kept per biblical book (`bookId: 'romans'`, running chapter 1060, paragraph index, word index) and is never stamped with a content revision (`placeFromLabBook` in `useLabPositionSync.ts` stamps only non-Bible books; `placeNeedsMigration` looks up `CONTENT_RELEASES['romans']`). A `bible` entry would never be consulted for a place.
- **Highlights** carry `bookId: 'bible'`, so an entry would apply to them, and would do harm: every WEB highlight in the whole Bible made before the release would stop being painted until the map and its chapter had loaded, and a highlight that includes one of the three numbers would be marked unresolved and hidden for good (its quote no longer matches word for word).
- **What protects them instead:** nothing moved. The chapter has 5 paragraphs before and after; the paragraph has 153 words before and after; the reader's word split is whitespace, and each number is one word replaced by one word. A place or highlight saved as (chapter 1060, paragraph 4, word n) names the same word. A highlight that spans a number keeps its range; its stored quote still says "(14:24)" in lists until it is next edited.

One visible consequence: the doxology is now verse 24-26 to the reader, not a tail of verse 23. A highlight made in the WEB doxology no longer carries across to verse 23 of the King James or Berean chapter 14 (they have no 24-26 there; their doxology is 16:25-27); it still carries to the Catholic WEB by exact wording.

## Narration

- **Streamed narration (production, Grok).** Recordings are addressed by the exact spoken text of each sentence group; a paragraph's map entry is tied to the paragraph's text hash. The paragraph has four groups before and after. Groups 1 and 2 (verses 21-23, words 0-47 and 47-70) are spoken identically and keep their recordings. Groups 3 and 4 (the doxology) are new: before, the narrator was sent "(14:24) Now to him…", "(14:25) but now…", "(14:26) to the only wise God…", so the numbers were read aloud; now they are silent verse numbers and the groups run words 70-126 and 126-153. Those two groups are recorded again, per voice, the next time a signed-in reader presses Play there (about 435 characters a voice); a signed-out reader plays cached audio only, so has no audio for the doxology in a voice until then. Nothing was generated or requested for this repair.
- **The old recording (Kokoro, on R2: `bible/web-en/ch1060`, `p4.mp3` 49.5 s, word timings by faster-whisper).** Exists; production does not select it while Grok narrates. It speaks the three references (its timing file has a word "(14:24)" at 19.71-21.19 s). With the repair its 150 timed words face 147 spoken words, so if it were ever played again (a provider rollback) the last paragraph of Romans 14 would follow by paragraph instead of by word. The November batches held old recordings in chapters whose text changed (`held_chapters` in `audioAvailability.json`); **no hold is added here**, because a hold shows "Audio is temporarily unavailable for this chapter" in the fallback path and that is a product choice, not part of the approved text change. Say so if Romans 14 should be held.
- No stored reader correction overrides the text: `edition_patches` for `bible`/`web-en` is empty (public read, 2026-11-27).

## Verification

Run on the final tree (main `7f9230042d` plus this change), 27 Nov 2026:

- `npm test` from `app/`: 775 test files passed, 1 skipped; 9,751 tests passed, 6 skipped. No existing test or check was changed.
- `SKIP_ENV_CHECK=1 npm run build` and `npm run verify-bundle`: passed. The built `dist/` holds no "(14:24)", "(14:25)" or "(14:26)" in any file.
- The built reader, served locally with every `/api` call answered 404, with the build's default reader and with the shared reader production turns on (`sharedReader=1`), 43 checks, all passed:
  - Phone (WebKit, iPhone 13) and desktop Two-page and Compare with the King James (Chromium 1440×900): the chapter walked page by page; every word drawn at its own paragraph and word index; verse numbers 1 to 26 drawn; 24, 25 and 26 drawn exactly as 23 (same element, class, size, raise, colour, face, weight); no "(14:" on any page. Desktop Margin: the last paragraph's 153 words in place with 21-26 as numbers.
  - The same reader served the chapter as it was: "(14:24)" on the page and only 1-23 as numbers.
  - A place the reader itself saved while reading the old text (Romans, chapter 1060, paragraph 4, word 107, "but") reopened after the repair from the same browser storage: same chapter, paragraph and word, the page opens on the same first word (paragraph 4, word 49), the saved word reads the same, and the only words on the page that differ are the three numbers. The page now ends two words earlier (word 144 instead of 146) because the lines break differently around the narrower numbers.
  - Compare beside the King James pairs the pages as it did before the repair (the King James column was already cut inside verse 23 at that page turn).
- Character links in the doxology (Jesus, Christ, God, God, Jesus, Christ) each open their card in the built reader, with the sidecar and edition asked for under `?v=2026-11-27.1`, the place unchanged and no highlight made.

## Not done

- No merge, no deploy, no pull request.
- No narration generated; no recording hold added (above).
- The Bible shard manifests still carry no per-chapter word counts (step 2).
- Psalm 34 and 145 superscriptions (above).
