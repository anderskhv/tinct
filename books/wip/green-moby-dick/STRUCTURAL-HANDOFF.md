# Structural handoff — source defects outside this repair's scope

These are defects in `moby-dick-original-en.json` itself (the source, sha256 `30974242…`). They affect every edition equally. Fixing any of them changes chapter titles and/or paragraph counts, so they must be done as one coordinated structural change across original-en, modern-en, modern-da, character cards and the audio/timing indexes. **This modern-en repair keeps paragraph alignment with the current source and does not apply them.**

## 1. Chapter titles cut in two by the Gutenberg line wrap (3 chapters)

Project Gutenberg #2701 wraps three long chapter headings onto a second line. The ingestion parser took the second line as the chapter's first paragraph.

| Chapter | Current title (source) | Current paragraph 0 | Full title per PG #2701 |
|---|---|---|---|
| 56 | `Of the Less Erroneous Pictures of Whales, and the True` | `Pictures of Whaling Scenes.` | Of the Less Erroneous Pictures of Whales, and the True Pictures of Whaling Scenes. |
| 57 | `Of Whales in Paint; in Teeth; in Wood; in Sheet-Iron; in` | `Stone; in Mountains; in Stars.` | Of Whales in Paint; in Teeth; in Wood; in Sheet-Iron; in Stone; in Mountains; in Stars. |
| 73 | `Stubb and Flask kill a Right Whale; and Then Have a Talk` | `over Him.` | Stubb and Flask kill a Right Whale; and Then Have a Talk over Him. |

Verified against PG #2701 (sha256 `907420db…fef1a18b`). There, both the table of contents and the chapter heading show the wrap.

**Proposed fix (not applied):**
- Join each fragment onto the title.
- Delete paragraph 0 in all editions. That shifts every later paragraph index in these three chapters by −1.

In this candidate, 56.0, 57.0 and 73.0 carry a faithful modern rendering of the fragment, so alignment holds.

Checked and *not* defects: 39.0 "Fore-Top.", 108.0 "The Deck—First Night Watch." (Melville's own scene headings), and 36.0, 38.0, 40.0, 54.0 (stage directions and headings belonging to the chapter).

## 2. Front matter absent (inherited, recorded by the 2026-09-11 audit)

"Etymology" (Supplied by a Late Consumptive Usher to a Grammar School) and "Extracts" (Supplied by a Sub-Sub-Librarian) are absent from all editions. Restoring them means inserting new units before Chapter 1, which renumbers every chapter. That needs the same coordinated migration: reading positions, threads and cast chapter keys, audio indexes. It is out of scope here.

## Source completeness otherwise

A word-sequence comparison of `source.json` against the PG #2701 body (Chapter 1 through the Epilogue) found no missing or extra text, apart from chapter-heading tokens.
