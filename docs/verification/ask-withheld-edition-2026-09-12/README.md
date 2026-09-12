# Verification — Ask in the Bible, 2026-09-12

Built with `CI=true npm run build`, served from `app/dist`, driven with Playwright
(chromium at `/opt/pw-browsers`). Two viewports: 1440×900 and 393×852.

**Seeded state** — exactly what a reader who picked a now-withdrawn edition has in
storage: `tinct-lab-prefs` with `primaryEdition: modern-en`, `compareEdition:
modern-da`, and a position pin at sequential chapter 794 (Jeremiah 49).

`/api/lab-chat` is intercepted: the first round is failed deliberately, the retry
is answered. No Anthropic API call is made by this harness.

| Shot | What it shows |
| --- | --- |
| `*-1-reader.png` | The reader at Jeremiah 49 |
| `*-2-editions.png` | Reading settings → Main version / Compare edition |
| `*-3-ask-failed.png` | Ask after one failed round |
| `*-4-ask-recovered.png` | After pressing "Try again" |

## Before (origin/main)

- **Editions**: Main version reads `modern-en`, Compare reads `modern-da` — the
  withdrawn editions, shown by raw key because they are no longer in the registry
  to be labelled. The text on the page is the KJV, which nothing says.
- **Ask**: `Ask is unavailable right now.` `Try again` does nothing; the account
  sheet appears instead, because the failed round already spent a free AI action.
  `assistantTurns: 0` at both viewports.

## After (this branch)

- **Editions**: both read `World English Bible`, the successor named in
  `withheldEditions.ts`, and the page text matches it ("Of the children of Ammon.
  Thus says Yahweh" rather than "Concerning the Ammonites, thus saith the LORD").
- **Ask**: the retry reaches the network and the answer arrives. `notice: null`,
  `assistantTurns: 1` at both viewports.

`*-summary.json` holds the asserted state for each run.

## Measured, not inferred

- One `find_in_book` over the shipped Bible with no hits near the reader cost
  **81 asset subrequests** before this branch and **25** after
  (`RETRIEVAL_ASSET_BUDGET`, `FIND_SCAN_CAP`).
- The 4.4 MB `bible-web-en.json` is **never** fetched: the shard manifest branch
  always wins for a sharded edition. Pinned by test.
- `read_chapter(794)` is Jeremiah 49 and `read_chapter(1189)` is Revelation 22
  against the real shipped shards; the manifest is contiguous 1..1189 and every
  section's chapter list agrees with the chapter titles. No off-by-N exists in
  this path.
- The captured request body carries `book: {bookId: "bible", editionKey: "web-en",
  chapterNumber: 794}` and a system prompt reading `Now: Jeremiah 49 (chapter 794
  of 1189)` — the client sends the chapter the reader is on.
