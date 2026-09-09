# Optional prefaces — implementation and verification

Approved scope: [preface handoff](design/preface-handoff-2026-09-09.md).

The Odyssey, The Awakening, Niels Lyhne, War and Peace, Symposium and the Bible use the exact approved
English text from `docs/design/approved-prefaces/`. Runtime `.txt` files are
byte-for-byte copies; tests validate their wording and paragraph boundaries
against those sources. Canonical Odyssey ID is `odyssey`, not `the-odyssey`.
The final Symposium and Bible revisions were added after explicit approval in the source task. Other books have no preface entry.

The fresh cover shows an opening-sentence excerpt, Read preface (English), and
Begin reading. Reopened covers show Continue reading. Readers can reopen a
supported cover through “Cover and preface” in the existing contents panel without
navigating away from their current chapter. The desktop excerpt sits beside the
actual cover image; phones stack it below. The dedicated “Before you begin” view
uses the reading font, text size, line spacing and theme, with Tinct attribution,
Back to cover and a final Begin/Continue button. Native modal focus containment
keeps its scrolling and keys outside the source reader; browser Back and Escape
return through the cover. Reload opens the saved reader, never the essay.

The document receives no source location setters, Chat hook, or audio source.
Opening from the reader pauses existing audio and keeps its playback position.
The reader stays mounted; preface visibility suspends position/library-boot writes,
reading-memory tracking and keyboard page turns. Fresh Begin uses the existing
cover exit; reopening/Continue only closes the document and retains the tuple and
Compare state. No new storage schema, dependency, content generation or LLM call.

Local tests: 148 files / 1,596 tests pass. Browser checks cover all six books on
WebKit phone 390×844, small phone 360×640 with 1.8 text scaling and dark theme,
and Chromium desktop 1440×950. Fresh entry, optional preface, browser Back,
Begin, resumed cover, Continue and reload passed. Both engines also passed
Compare with explicit saved chapter 2 / paragraph 1 / word 5, browser Back from
preface through cover, unchanged persisted progress while scrolling, and absence
on unsupported Democracy in America. A saved library handoff from Odyssey to The
Awakening restored the new book/chapter and loaded only its approved preface. Production evidence follows after deployment.
