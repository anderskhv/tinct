# Feature: "Echoes" tab on the book introduction screen

Status: ready for implementation. Product owner: Anders. Spec written 2026-10-01.
Scope: five books only for launch: `frankenstein`, `odyssey`, `crime-and-punishment`, `the-prince`, `meditations`. (`pride-and-prejudice` was dropped from the featured pill library; do not include it.)

## 1. What it is
A fourth tab on the library_2 book introduction screen (`app/public/lab/library_2/`), shown between the characters tab and "Pick edition":

`Preface | People and ideas | Echoes | Pick edition`

It lists a small, hand-curated set of outside reactions to the book: a featured quote from a well-known reader, short videos (TikTok, YouTube, YouTube Shorts), essays, and a Reddit thread. Each item is a preview card that **links out**; nothing is embedded.

The tab appears only for books that have an echoes data file. All other books look exactly as today.

## 2. Hard rules (product decisions already made)
1. **No embeds, no third-party scripts or iframes, no trackers.** Cards are our own markup: thumbnail image (self-hosted), text, and a link. No TikTok/X/YouTube/Reddit widgets. No runtime calls to those sites (no oEmbed at runtime, no hotlinked images or avatars).
2. **Links open outside the book.** Web: new tab (`target="_blank" rel="noopener noreferrer"`). Android APK (Capacitor): use the in-app browser sheet (`@capacitor/browser`, already a dependency and used in `app/src/utils/nativeAuth.ts`); the Back button returns to the intro. Find out how library_2 currently opens external links / how it can reach Capacitor, and match that. Do not navigate the intro away.
3. **Never lose the reader's place.** Switching tabs must not reset anything outside the intro; keep the existing `renderIntro()` behaviour (scroll reset, tab state, arrow-key navigation).
4. **Spoiler safety by data, not by guess.** Every item carries `spoiler: "free" | "anchored" | "full"`. v1 data is all `free`. Implement the gate function and tests (see section 6) but build no "Spoilers" section UI yet.
5. **Curated only.** No user submissions, no "Suggest a link" button, no counts or filters in v1 (4 items max per book).
6. **Credits are legal requirements.** Photos under CC BY / CC BY-SA must credit author, licence and source (see section 5).
7. English only. Do not add Danish.

## 3. Design
Source of truth for look and feel: the mockups in `docs/echoes/mockups/` (`*.dc.html`, plus `canvas.json`). They are static design-canvas files (images use `/_blob/…` URLs that will not resolve here); read them for exact layout, spacing, type sizes and copy. The live canvas is private to Anders. Boards, per book: wide (651px) and phone (390px): `Main`/`Mobile` = Frankenstein, `Odyssey*`, `Crime*`, `Prince*`, `Meditations*`.

Use the existing intro CSS variables and fonts from `intro-review.css` (e.g. `--page-ink`, `--page-rule`, `--page-soft`) rather than the mockup's hex values (mockup palette was sampled from the live screen: paper `#ece6d1`, ink `#2b3426`, soft `#66705a`, rule `#d2cdb8`, dark button `#2d3626`; headings Georgia). Match, do not duplicate.

Components (all in the intro body, vertical stack, 12-20px gaps):
- **quote_featured** (Deutsch on Frankenstein, Tobi on Meditations): rounded panel (16px radius) on a darker paper tone; the quote in large Georgia (about 30px wide / 23px phone; 52/40px for the very short Tobi quote), then a row with a 44-52px round portrait and "Name ↗". Whole panel is one link.
- **quote_card** (Naval, Rogan, DHH): bordered card, round 44px portrait on the left, italic Georgia quote (about 20px / 17px), line "Name · Platform ↗". Whole card is one link.
- **video_vertical** (TikTok, YouTube Short): bordered card; 9:16 thumbnail (124x220 wide layout, 96x170 phone) with a centred round play badge (CSS only); right column: the quote(s) in italic Georgia or the caption text in regular Georgia, then a footer row: handle + outlined pill ("TikTok ↗" / "YouTube Short ↗").
- **video_wide** (YouTube): on wide layout either a 16:9 hero card (thumbnail full width) when it is the only video, or the compact row (220px 16:9 thumb left, text right; phone 124px) when there are several videos. Mockups: Odyssey = hero; Prince = compact rows. Rule: 1 video in the list = hero, 2+ = compact. If `quotes[0]` exists, show it in italic in place of the title (Sugrue).
- **text_card** (article, thread): bordered card, title (Georgia 21/18px), footer row: byline + outlined pill ("Article ↗" / "Reddit ↗" / "Essay ↗").
- **Photo credits**: only when any item has an avatar: a small underlined "Photo credits" text button after the list that toggles a dark panel listing `Name: Author, Licence` (licence linked to `licenceUrl`, name linked to `sourceUrl`). `aria-expanded`, closes on Escape and second tap. Where only one avatar exists (Frankenstein), the mockup used an "i" badge on the avatar; use the same single "Photo credits" control for consistency instead.
- Tab label: constant `Echoes` (keep it in one place; alternatives were Elsewhere/Around/Beyond).
- Tab row must not wrap or clip at 390px (four tabs; "People and ideas" is long). Allow horizontal scroll without a visible scrollbar and keep the selected tab in view, or tighten gaps. Verify at 360, 390 and desktop.
- Pills use real text (not images). Interactive targets are at least 44px tall (the pill itself is decorative inside the card link).

Order inside each book follows the data file order (curated).

## 4. Data
One file per book: `app/public/lab/library_2/echoes-data/<book-id>.json`, loaded lazily when the book opens (same pattern as `loadReviewedIntroduction` in `reviewed-introductions.js`, including a cache-busting `?v=` and a fetch-failure that simply hides the tab; the intro must still work if the file is missing or the fetch fails).

Ready-to-use content for all five books is in `docs/echoes/data/*.json` (copy these; fix the typo'd id `reddit-toafraidtoask-odyssey` only if you rename consistently). Schema (per item):

```
id            string, unique within the book
layout        quote_featured | quote_card | video_vertical | video_wide | text_card
platform      x | tiktok | youtube | youtube_short | reddit | spotify | web
url           https only; opened as an external link
title?        string (card title); titleIncomplete? true when the real title is not yet known
quote? / quotes? / text?   display text (quotes are rendered with typographic quotes by the renderer; data stores the words only)
person?       attributed speaker for quote layouts
byline?       "Name · Publisher" or "@handle" or "r/subreddit"
publisher?, channelNote?   extra attribution, not shown in v1 unless noted
thumbnail?    path under echoes-assets/ (self-hosted)
avatar?       { src, alt, credit { author, licence, licenceUrl, sourceUrl } }
spoiler       free | anchored | full   (+ revealAfterChapter? integer for anchored)
source        { status, note }   QA metadata, never rendered
```

Assets: copy `docs/echoes/assets/*` to `app/public/lab/library_2/echoes-assets/` (14 files, 1.8 MB: thumbnails and portraits). They were downloaded once on 2026-10-01 because TikTok thumbnail URLs expire; do not hotlink. Consider re-encoding to modern, smaller files (about 600 px tall max for vertical thumbs, 640 px wide for 16:9, 160 px square portraits) as long as the visual result is unchanged; keep the originals' crop notes in the data (`thumbnailCrop`).

## 5. Legal and rights (build now, Anders reviews before launch)
- Portraits come from Wikimedia Commons under CC BY / CC BY-SA; credit data is in each avatar. Rogan's author field is unconfirmed: keep the string "UNCONFIRMED" out of the UI by failing the data test until it is resolved, or render the credit as "Wikimedia Commons, CC BY 2.0" and leave a TODO, but flag it in the report.
- Thumbnails of TikTok / YouTube videos and one tweet-derived quote are used as link previews with credit to the creator. Confirm platform terms; this is a launch decision for Anders, not a code blocker.
- Do not add third-party-cookie, analytics or tracking calls.

## 6. Spoiler gate (implement, test, but no UI beyond hiding)
Add a pure function, e.g. `visibleEchoes(items, progress)`:
- `free` always visible.
- `anchored`: visible only if `progress.completed` or `progress.chapterNumber >= item.revealAfterChapter` (reuse how `reviewedCast` handles `hold_until_revealed` and `introProgress` / `readingApi().introductionProgress(book.id)`).
- `full`: visible only if `progress.completed`.
Unit-test all branches. v1 data has none of the non-free kinds.

## 7. Tests (vitest, `app/src`, follow `reviewedIntroductions.test.ts` and the `libraryTwo*.test.ts` patterns)
1. Data contract test over all `echoes-data/*.json`: every file's `id` matches a book in the catalogue; item ids unique; `url` is https; platform/hostname consistent (x.com, tiktok.com, youtube.com, reddit.com, open.spotify.com, others `web`); required fields per layout present; every `thumbnail`/`avatar.src` file exists on disk; every avatar has complete credit fields (no "UNCONFIRMED"); `spoiler` valid.
2. Renderer tests (jsdom if the project already uses it for library_2; else test the pure helpers): tab only appears for books with data; each layout renders text, link `href`, `rel`, and accessible names; credits toggle works and closes on Escape; empty/failed fetch hides the tab.
3. `visibleEchoes` gate tests.
4. Existing suites stay green (`npm test`), including `reviewedIntroductions.test.ts`.

## 8. Accessibility
Real `<a>` elements for cards (no click handlers on divs), meaningful `alt` on portraits (name) and empty `alt` on decorative thumbnails with the card's text carrying the meaning, `aria-label` such as "Open on YouTube (opens in a new tab)" where the visible text is only a pill, visible focus ring, 44px targets, text contrast at least 4.5:1 on the paper background, tab row keeps arrow-key navigation.

## 9. Acceptance (do on the real app at /lab/library_2, not just localhost)
For each of the five books at 390x844 and desktop: open the book, open the Echoes tab, screenshot; confirm order, thumbnails, quotes, credits popup, link targets; confirm Preface/People/Edition tabs still work and "Begin reading →" still works; confirm a book without data shows no Echoes tab; confirm the tab row does not clip at 360/390. In the APK, confirm a link opens the in-app browser and Back returns to the intro. Follow `AGENTS.md` for build, deploy and production verification.

## 10. Known open items (report these, they are not blockers)
- Reddit thread title is incomplete (`titleIncomplete: true`); Anders will supply it.
- Tobi Lütke video clip: link not yet supplied; add as an extra Meditations item when it arrives.
- Quotes marked `aggregator_cited`, `read_via_summary`, `machine_transcript` in `source.status` need a human check against the original before launch; the renderer must not show these notes.
- Thumbnails: Hanson's carries loud headline text; Sugrue's is an old 4:3 letterboxed frame (crop in data).
- Joe Rogan's portrait is an old stand-up photo and DHH's shows him in his twenties; Anders may swap them.
