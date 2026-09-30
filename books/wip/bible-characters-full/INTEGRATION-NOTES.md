# Integration notes for the coding window (Codex)

Status: **content accepted / handed off — not published.** Nothing in `app/**`, the registry, live data paths, scripts or tests was changed. All checks below were run from a scratch directory outside the repo.

## What to take

- `package/bible.v1.json` — SHA-256 `4aa0071715a6018d7459268dd522f2d09b37d935426b8cd0dadcccfeeb75c541`, 9,391,089 bytes, `contentVersion` `2026-09-30.1`. Same schema as the live file (`schemaVersion` 1, `normalization` `prose-reader-v1`, `offsetUnit` `utf16`) with four editions: `kjv-en`, `web-en`, `bsb-en`, `webc-en`.
- `package/MANIFEST.json` — file hash plus SHA-256 of each edition slice (method in the file), so a per-edition split can be verified byte-for-byte.
- Everything else in this folder is review/provenance and is not needed at runtime.

## Integration steps (all yours)

1. Copy `package/bible.v1.json` over `app/public/data/characters/bible.v1.json` (the only runtime file).
2. `app/src/services/characters/characterCards.ts` `characterReleases.bible`: `editions` must include `'bsb-en'` and `'webc-en'` (`verifyCharacters` returns `null` for an edition not listed there) and `revision` has to be bumped so readers stop using the immutable old URL (`?v=`). Suggested revision string: `2026-09-30.1` to match the package.
3. Update the two Bible tests that pin the old data (below), add `bsb-en`/`webc-en` to the `describe.each` lists, and run the character validators the repo already has.
4. Decide the size question (below) before publishing.
5. Serialized release, verification and deploy per `AGENTS.md`; that is not part of this package.

## Verification already done with the app’s own verifier

`characterCards.ts` from main (`a9d3386a`) was copied to a scratch folder with **one line changed** — `characterReleases.bible.editions` extended to all four editions — and run under Node 22 against the package and the pinned edition files:

| edition | `verifyCharacters` | mentions | resolve → own card | resolve null / wrong | existing-highlight → null | snapshot reveal problems |
|---|---|---|---|---|---|---|
| kjv-en | passes | 9,948 | all | 0 / 0 | all | 0 |
| web-en | passes | 10,026 | all | 0 / 0 | all | 0 |
| bsb-en | passes | 11,034 | all | 0 / 0 | all | 0 |
| webc-en | passes | 10,914 | all | 0 / 0 | all | 0 |

Every mention resolves to its own card; there are no identical or partially overlapping spans, so the resolver’s “tied ⇒ null” rule never triggers. For every snapshot, the card body at `availableAt` equals the snapshot and one offset earlier equals the previous snapshot (the same assertion the Hamlet test makes). The verifier’s hash gates hold: `sourceSha256` equals the edition file bytes and `paragraphHashes` equal SHA-256 of `normalizeParagraph` for every paragraph. The same rules were re-implemented and run separately on the committed file (`review/structural-verification.json`).

## Tests that will fail until updated (existing expectations describe the *old* data)

- `app/src/services/characters/webRevelationRelease.test.ts` (both `kjv-en` and `web-en`): it pins five spans as conflicting (`[975,3,…]`, `[983,7,…]`, `[1019,2,…]`, `[1039,3,…]`, `[931,0,…]`) and asserts `ambiguousMentions === 10` with `resolveCharacter → null` there. In the package those are the single, correct cards (see `RULINGS.md`); the ambiguous set must become empty and the count 0. It also asserts `data.edition.mentions.filter(m => m.chapterNumber === 1189)` has length **4** for `web-en`; the package has **9** (Lamb ×2, John, Jesus ×3, David, God, Christ — all correct). Paragraph text there is unchanged.
- `app/src/services/characters/characterCards.test.ts`, “Bible Baruch”: still holds for `kjv-en`/`web-en` (all `baruch-neriah` links are in chapters 777–790, inside the asserted 746–797). BSB has 24 and WEBC 25 Baruch links (WEBC includes the Book of Baruch, chapter 1321).
- `app/scripts/check-web-revelation.cjs` and `app/scripts/prepare-web-revelation-release.py` read `bible.v1.json` and `bible-web-en.json`; I did not run or read them beyond noting the dependency.
- Any count assertions in the `characterReleases`/release tests for `bible` should be revisited.

## Size and loading (needs your decision)

The live file is 1,483,305 bytes (≈0.60 MB gzip). The candidate is 9,391,089 bytes (≈2.83 MB gzip) because the cap of ~20 links per character is gone and two editions were added. `loadCharacters` fetches the whole file for whichever edition is open, so a KJV reader would download BSB and WEBC links as well. Per-edition slices are 1.7 MB (kjv-en), 1.7 MB (web-en), 3.9 MB (bsb-en) and 2.1 MB (webc-en) before gzip; their hashes are in `MANIFEST.json`. Splitting into per-edition sidecar files (or trimming the loader to read one edition) is a code change I did not make; the schema does not need to change for it.

## What moves in the reader

- **Card ids are unchanged (149) and none was removed**; 26 ids are new and only exist in `webc-en` (Catholic-only books, see `COVERAGE.md`). Saved links keyed by id keep working.
- Existing links at 1,444 (kjv) / 1,437 (web) positions: about 92% unchanged; the rest are corrected or removed (`CHANGES-TO-EXISTING-LINKS.md`). Saved *highlight* spans are unaffected — highlights are the reader’s, and the resolver returns `null` on an existing highlight by design.
- **First-mention positions moved for 70 existing cards (kjv/web pairs counted separately)**, 41 of them earlier. Full coverage finds a name before the point the sampled links first showed it. The reveal rule (`snapshots[0].availableAt == firstMention`, no spoilers before it) is preserved by construction; where the old first snapshot described a later event, an earlier one-sentence **cameo snapshot** was added (marked below). The table lists the cards whose first mention moved **earlier** (the ones where a reveal could matter); the rest moved later because a wrong early link was removed. All moves are in `review/first-mention-moves.json`. Please spot-read the cameo cards in the reader:

| Card | Edition | Old first mention | New first mention | Snapshots old→new | Early “cameo” snapshot added |
|---|---|---|---|---|---|
| `ananias-and-sapphira` | kjv-en | Acts 5:1 | Acts 5:1 | 1→1 |  |
| `ananias-and-sapphira` | web-en | Acts 5:1 | Acts 5:1 | 1→1 |  |
| `barnabas` | kjv-en | Acts 4:36 | Acts 4:36 | 1→1 |  |
| `barnabas` | web-en | Acts 4:36 | Acts 4:36 | 1→1 |  |
| `daniels-companions` | kjv-en | Daniel 1:7 | Daniel 1:6 | 1→1 |  |
| `daniels-companions` | web-en | Daniel 1:7 | Daniel 1:6 | 1→1 |  |
| `david` | kjv-en | 1 Samuel 16:13 | Ruth 4:17 | 1→2 | yes |
| `david` | web-en | 1 Samuel 16:13 | Ruth 4:17 | 1→2 | yes |
| `esther` | kjv-en | Esther 2:7 | Esther 2:7 | 1→1 |  |
| `esther` | web-en | Esther 2:7 | Esther 2:7 | 1→1 |  |
| `haggai` | kjv-en | Haggai 1:1 | Ezra 5:1 | 1→2 | yes |
| `haggai` | web-en | Haggai 1:1 | Ezra 5:1 | 1→2 | yes |
| `james-the-just` | kjv-en | Acts 1:13 | Matthew 13:55 | 1→2 | yes |
| `james-the-just` | web-en | Acts 1:13 | Matthew 13:55 | 1→2 | yes |
| `joab` | kjv-en | 2 Samuel 2:13 | 1 Samuel 26:6 | 1→2 | yes |
| `joab` | web-en | 2 Samuel 2:13 | 1 Samuel 26:6 | 1→2 | yes |
| `john-apostle` | kjv-en | Acts 1:5 | Matthew 4:21 | 1→2 | yes |
| `john-apostle` | web-en | Acts 1:5 | Matthew 4:21 | 1→2 | yes |
| `jonah` | kjv-en | Jonah 1:1 | 2 Kings 14:25 | 1→2 | yes |
| `jonah` | web-en | Jonah 1:1 | 2 Kings 14:25 | 1→2 | yes |
| `joseph-of-arimathea` | kjv-en | Mark 15:43 | Matthew 27:57 | 1→1 |  |
| `joseph-of-arimathea` | web-en | Mark 15:43 | Matthew 27:57 | 1→1 |  |
| `joshua` | kjv-en | Numbers 11:28 | Exodus 17:9 | 1→2 | yes |
| `joshua` | web-en | Numbers 11:28 | Exodus 17:9 | 1→2 | yes |
| `josiah` | kjv-en | 2 Kings 21:24 | 1 Kings 13:2 | 1→2 | yes |
| `josiah` | web-en | 2 Kings 21:24 | 1 Kings 13:2 | 1→2 | yes |
| `jude-apostle` | kjv-en | Jude:1 | Matthew 13:55 | 1→2 | yes |
| `jude-apostle` | web-en | Jude:1 | Matthew 13:55 | 1→2 | yes |
| `mark-evangelist` | kjv-en | Acts 12:12 | Acts 12:12 | 1→1 |  |
| `mark-evangelist` | web-en | Acts 12:12 | Acts 12:12 | 1→1 |  |
| `micah` | kjv-en | Micah 1:1 | Jeremiah 26:18 | 1→2 | yes |
| `micah` | web-en | Micah 1:1 | Jeremiah 26:18 | 1→2 | yes |
| `simon-peter` | kjv-en | Matthew 4:18 | Matthew 4:18 | 1→1 |  |
| `simon-peter` | web-en | Matthew 4:18 | Matthew 4:18 | 1→1 |  |
| `the-lamb` | kjv-en | Revelation 5:8 | Revelation 5:6 | 1→1 |  |
| `the-lamb` | web-en | Revelation 5:8 | Revelation 5:6 | 1→1 |  |
| `the-other-apostles` | kjv-en | Matthew 10:3 | Matthew 10:3 | 1→1 |  |
| `the-other-apostles` | web-en | Matthew 10:3 | Matthew 10:3 | 1→1 |  |
| `timothy` | kjv-en | 2 Corinthians 1:1 | Acts 16:1 | 1→2 | yes |
| `zechariah-prophet` | kjv-en | Zechariah 1:1 | Ezra 5:1 | 1→2 | yes |
| `zechariah-prophet` | web-en | Zechariah 1:1 | Ezra 5:1 | 1→2 | yes |

## Non-person cards

God/the LORD (20 links), the Ark of the Covenant (14), the Temple (12–13), Babylon (14) and Zion (8) were **not expanded**; they keep their old sampled counts, re-anchored by verse in BSB and WEBC. Holy Spirit, the Word, the Lamb and the Eden serpent are completed by exact phrase. Expanding God/LORD would add thousands of links (“God” 4,116 and “LORD” 6,649 in KJV) and is a product question (README, open question 1).

## Other things worth knowing

- Offsets are UTF-16 code units on `normalizeParagraph` text (newline → space, runs of spaces collapsed) — identical to the live convention. The verse-number superscripts are part of the text; no link touches them.
- BSB has 38,464 paragraphs; a single verse can be several paragraphs. Nothing depends on cross-edition paragraph equality: the package never maps a paragraph index between editions.
- The WEB text contains bracketed additions (“[the house of] Aaron”) and en-dash-free double hyphens (“--Jesus”); the scanner reads a name that follows “--”, which the old sampled links never reached (1 Thess 1:10).
- The optional `existingHighlight` behaviour, dash-joined selection handling and all resolver code are untouched.
- `contentVersion` is per package; each edition’s `sourceSha256` is what actually gates use, so an edition file change without a new package makes that edition’s cards silently disappear (the loader returns `null`). Any later edit to a Bible edition file needs a re-anchoring pass; `RULINGS.md` and `identity-decisions.jsonl` give the verse-level decisions to reuse.

