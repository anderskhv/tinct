# Personal shelf study

Independent concept at `/lab/library_2/shelf-study/`. Does not replace or import the current library application. All sample shelf changes are in memory only. No auth, APIs, storage, reader bridge or production reading-position writes.

- Desktop initially shows all three bays; mobile begins at Currently reading.
- Physical and navigation order is To read / Currently reading / Finished. Side arrows and horizontal scene swipes move directly between bays; desktop Left/Right does the same. Arrow keys on a book or its small book controls select books instead.
- Tap a spine or use the small book controls to select a book. Each shelf remembers its selection. Its fixed-capacity rows (3 / 6 / 4 books) never overfill the illustrated bay; up/down row controls and a paginated, searchable shelf browser reach the rest. Empty shelves are supported.
- The selected currently-reading book has a Where you left off panel. All sample positions and recap copy are reused from the existing `reading-table.js` DEMO: Frankenstein and Crime and Punishment have its recaps; Meditations and Odyssey have its saved-place headlines. No new book content is authored or generated. This remains sample data, not the user’s real history.
- Full library / Closer look buttons and scene-only two-finger pinch change the camera view. Single-finger vertical scrolling remains available.
- Add-to-shelf buttons populate the sample To read bay. Continue opens a concept preview rather than using sample progress to start the production reader.
- Reduced motion stops room effects and transitions. Background is one 1536×1024 generated painting; covers/spines reuse existing assets.

Art: built-in image generation, 2026-09-26. Original remains at `/Users/andershvelplund/.codex/generated_images/01a0cd26-5326-7281-ae96-c3ae1dd12c83/exec-bcf7ddfa-d3c3-4737-b00d-6859581980d3.png`. JPEG is a format conversion only. Prompt in `art-prompt.txt`.
